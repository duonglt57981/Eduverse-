using Eduverse.Service.BunnyService.Dto;
using Eduverse.Service.BunnyService.Request;
using Eduverse.Service.BunnyService.Response;
using Xabe.FFmpeg;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace Eduverse.Service.BunnyService
{
    public class BunnyService : IBunnyService
    {
        private readonly HttpClient _httpClient;
        private readonly BunnyStreamSettings _settings;
        private readonly ILogger<BunnyService> _logger;
        private static readonly string[] AllowedExtensions = { ".mp4", ".mov" };
        private const string GenericOctetStreamContentType = "application/octet-stream";

        private static readonly Dictionary<string, string[]> AllowedContentTypes = new()
        {
            [".mp4"] = new[] { "video/mp4" },
            [".mov"] = new[] { "video/quicktime", "video/x-quicktime" }
        };

        public BunnyService(
            IHttpClientFactory httpClientFactory,
            IOptions<BunnyStreamSettings> settings,
            ILogger<BunnyService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
            _httpClient = httpClientFactory.CreateClient("BunnyStream");
        }

        #region ── Upload ──

        /// <summary>
        /// Upload video lên Bunny Stream và trả về NGAY id/url/duration sau khi upload xong,
        /// KHÔNG chờ Bunny encode/transcode hoàn tất (việc này có thể mất vài phút đến hàng chục
        /// phút tùy độ dài video và tải hàng đợi encode của Bunny, dễ gây timeout nếu chờ trong
        /// cùng 1 request HTTP). Video sẽ tiếp tục được Bunny xử lý ở background sau khi hàm này
        /// trả về; muốn biết khi nào video encode xong, dùng CheckVideoStatusAsync/GetVideoInfoAsync
        /// để poll riêng, hoặc cấu hình Webhook URL trên Bunny Dashboard để nhận thông báo bất đồng bộ.
        /// </summary>
        public async Task<BunnyDto> UploadVideoAsync( IFormFile file,string? title = null,CancellationToken cancellationToken = default)
        {
            // 1-4. Validate toàn diện + ghi file tạm + lấy duration thật từ ffmpeg local
            var (tempFilePath, durationSeconds) = await PrepareValidatedTempFileAsync(file, cancellationToken);

            try
            {
                // 5. Xác định tiêu đề
                var finalTitle = string.IsNullOrEmpty(title)
                    ? Path.GetFileNameWithoutExtension(file.FileName)
                    : title;

                // 6. Tạo video object mới trên Bunny.net
                var videoId = await CreateVideoAsync(finalTitle);

                // 7. Upload video (đọc từ file tạm đã lưu)
                await using (var stream = File.OpenRead(tempFilePath))
                {
                    var uploadSuccess = await UploadFileToVideoAsync(videoId, stream, file.FileName);

                    if (!uploadSuccess)
                        throw new Exception("Upload video thất bại");
                }

                // 8. Trả về ngay - KHÔNG chờ encode. Url dùng HLS playlist chuẩn của Bunny Stream,
                // sẽ khả dụng ngay khi ít nhất 1 resolution encode xong (không cần đợi toàn bộ).
                return new BunnyDto
                {
                    Id = videoId,
                    Title = finalTitle,
                    Url = $"https://{_settings.CDNHostname}/{videoId}/playlist.m3u8",
                    Mp4Url = string.Empty,
                    ThumbnailUrl = $"https://{_settings.CDNHostname}/{videoId}/thumbnail.jpg",
                    Duration = durationSeconds,
                    Size = file.Length,
                    Status = 0,
                    AvailableResolutions = new List<string>(),
                    DateUploaded = DateTime.UtcNow,
                    Message = "Video đã upload thành công, đang được Bunny xử lý encode ở nền",
                    Success = true
                };
            }
            finally
            {
                // 9. Luôn dọn file tạm dù thành công hay lỗi
                TryDeleteTempFile(tempFilePath);
            }
        }

        #endregion

        #region ── Update (Ghi đè) ──

        /// <summary>
        /// Update video đã tồn tại - GHI ĐÈ nội dung file lên đúng videoId hiện có
        /// (giữ nguyên GUID/URL cũ, Bunny sẽ tự động re-encode lại video sau khi ghi đè).
        /// Validate toàn diện giống hàm upload (dung lượng, đuôi file, MIME type,
        /// magic bytes, độ phân giải tối thiểu).
        /// </summary>
        public async Task<BunnyDto> UpdateVideoAsync(
            string videoId,
            IFormFile file,
            string? title = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(videoId))
                throw new Exception("videoId không hợp lệ");

            // 1. Đảm bảo video cần update thực sự tồn tại trên Bunny.net
            var existingInfo = await GetVideoInfoAsync(videoId);
            if (existingInfo == null)
                throw new Exception($"Video không tồn tại: {videoId}");

            // 2-5. Validate toàn diện + ghi file tạm + lấy duration thật từ ffmpeg local
            var (tempFilePath, durationSeconds) = await PrepareValidatedTempFileAsync(file, cancellationToken);

            try
            {
                // 6. Nếu có title mới thì cập nhật title trước khi ghi đè nội dung
                var finalTitle = string.IsNullOrEmpty(title) ? existingInfo.Title : title;
                if (!string.IsNullOrEmpty(title))
                    await UpdateVideoTitleAsync(videoId, title);

                // 7. Ghi đè nội dung video lên đúng videoId cũ (PUT lại vào cùng GUID)
                await using (var stream = File.OpenRead(tempFilePath))
                {
                    var uploadSuccess = await UploadFileToVideoAsync(videoId, stream, file.FileName);

                    if (!uploadSuccess)
                        throw new Exception("Ghi đè video thất bại");
                }

                // 8. Trả về ngay - KHÔNG chờ Bunny re-encode xong (xem ghi chú ở UploadVideoAsync).
                return new BunnyDto
                {
                    Id = videoId,
                    Title = finalTitle,
                    Url = $"https://{_settings.CDNHostname}/{videoId}/playlist.m3u8",
                    Mp4Url = string.Empty,
                    ThumbnailUrl = $"https://{_settings.CDNHostname}/{videoId}/thumbnail.jpg",
                    Duration = durationSeconds,
                    Size = file.Length,
                    Status = 0,
                    AvailableResolutions = new List<string>(),
                    DateUploaded = DateTime.UtcNow,
                    Message = "Video đã ghi đè thành công, đang được Bunny xử lý re-encode ở nền",
                    Success = true
                };
            }
            finally
            {
                // 9. Luôn dọn file tạm dù thành công hay lỗi
                TryDeleteTempFile(tempFilePath);
            }
        }

        #endregion

        #region ── Get Info ──

        /// <summary>
        /// Lấy thông tin video
        /// </summary>
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public async Task<VideoInfoResponse> GetVideoInfoAsync(string videoId)
        {
            try
            {
                var url = $"/library/{_settings.LibraryId}/videos/{videoId}";

                var response = await _httpClient.GetAsync(url);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        $"Get video info failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Body: {responseContent}");
                    return null;
                }

                // Log raw JSON ở mức Debug để đối chiếu tên field thực tế Bunny trả về
                // (hữu ích khi nghi ngờ lệch tên property / lệch giá trị Status).
                _logger.LogDebug($"Video info raw response for {videoId}: {responseContent}");

                return JsonSerializer.Deserialize<VideoInfoResponse>(responseContent, JsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting video info: {videoId}");
                return null;
            }
        }

        /// <summary>
        /// Lấy URL phát video
        /// </summary>
        public async Task<string> GetVideoPlayUrl(string videoId)
        {
            try
            {
                var info = await GetVideoInfoAsync(videoId);
                if (info != null && !string.IsNullOrEmpty(info.PlayUrl))
                    return info.PlayUrl;

                // Fallback: tạo URL từ CDN
                if (!string.IsNullOrEmpty(_settings.CDNHostname))
                    return $"https://{_settings.CDNHostname}/{videoId}/video.mp4";

                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Lấy URL MP4 fallback
        /// </summary>
        public async Task<string> GetVideoMp4Url(string videoId)
        {
            try
            {
                var info = await GetVideoInfoAsync(videoId);
                if (info != null && !string.IsNullOrEmpty(info.MP4FallbackUrl))
                    return info.MP4FallbackUrl;

                return await GetVideoPlayUrl(videoId);
            }
            catch
            {
                return string.Empty;
            }
        }

        #endregion

        #region ── Delete ──

        /// <summary>
        /// Xóa video
        /// </summary>
        public async Task<bool> DeleteVideoAsync(string videoId)
        {
            try
            {
                var url = $"/library/{_settings.LibraryId}/videos/{videoId}";

                var response = await _httpClient.DeleteAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Delete video failed: {response.StatusCode}");
                    return false;
                }

                _logger.LogInformation($"Video deleted: {videoId}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting video: {videoId}");
                return false;
            }
        }

        /// <summary>
        /// Kiểm tra trạng thái video
        /// </summary>
        public async Task<bool> CheckVideoStatusAsync(string videoId)
        {
            try
            {
                var info = await GetVideoInfoAsync(videoId);
                return info != null &&
                       (info.Status == 3 || info.Status == 4) &&
                       !string.IsNullOrEmpty(info.PlayUrl);
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region ── Private Methods ──

        /// <summary>
        /// Chạy toàn bộ validate (cơ bản + magic bytes + độ phân giải) và trả về đường dẫn
        /// file tạm đã được xác minh cùng thời lượng video (giây), dùng chung cho cả
        /// UploadVideoAsync và UpdateVideoAsync.
        /// Duration được đọc trực tiếp từ ffmpeg local (không phụ thuộc Bunny encode xong hay chưa),
        /// nhờ đó có thể trả kết quả cho client ngay sau khi upload xong, không cần polling chờ Bunny.
        /// Nếu validate thất bại, file tạm (nếu đã tạo) sẽ tự dọn trước khi throw.
        /// </summary>
        private async Task<(string TempFilePath, int DurationSeconds)> PrepareValidatedTempFileAsync(IFormFile file, CancellationToken cancellationToken)
        {
            // 1. Validate cơ bản: null, dung lượng, đuôi file, content-type
            ValidateFile(file);

            // 2. Validate magic bytes để chống giả mạo đuôi file (đổi tên .exe -> .mp4 chẳng hạn)
            await ValidateFileSignatureAsync(file, cancellationToken);

            // 3. Ghi ra file tạm để probe metadata thật (resolution, duration, codec...)
            var tempFilePath = await SaveToTempFileAsync(file, cancellationToken);

            try
            {
                // 4. Validate độ phân giải tối thiểu (mặc định 480p) + lấy duration, trong 1 lần probe ffmpeg
                var durationSeconds = await ValidateVideoResolutionAsync(tempFilePath);
                return (tempFilePath, durationSeconds);
            }
            catch
            {
                TryDeleteTempFile(tempFilePath);
                throw;
            }
        }

        /// <summary>
        /// Validate file cơ bản: null/rỗng, dung lượng tối đa, đuôi file, content-type.
        ///
        /// Lưu ý về Content-Type: nhiều client (Postman, một số trình duyệt, app mobile)
        /// không xác định được MIME type thật của .mp4/.mov và mặc định gửi giá trị generic
        /// "application/octet-stream". Vì vậy giá trị này luôn được CHẤP NHẬN cho mọi đuôi
        /// file hợp lệ - việc chống giả mạo định dạng thật sự nằm ở bước tiếp theo
        /// (ValidateFileSignatureAsync đọc magic bytes thật của file), không dựa vào
        /// Content-Type do client tự khai báo (vốn có thể thiếu hoặc sai).
        /// </summary>
        private void ValidateFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            // Chặn tên file chứa ký tự path traversal
            var fileName = Path.GetFileName(file.FileName);
            if (string.IsNullOrWhiteSpace(fileName) || fileName != file.FileName)
                throw new Exception("Tên file không hợp lệ");

            var maxSize = _settings.MaxFileSizeMB * 1024L * 1024L;
            if (file.Length > maxSize)
                throw new Exception($"Video không được vượt quá {_settings.MaxFileSizeMB}MB");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", AllowedExtensions)}");

            // Validate content-type khớp với đuôi file đã khai báo.
            // "application/octet-stream" luôn được chấp nhận (xem ghi chú ở summary).
            var contentType = file.ContentType?.ToLowerInvariant() ?? string.Empty;

            var isGenericContentType = contentType == GenericOctetStreamContentType;
            var isKnownValidContentType =
                AllowedContentTypes.TryGetValue(extension, out var validTypes) &&
                validTypes.Contains(contentType);

            if (!isGenericContentType && !isKnownValidContentType)
            {
                throw new Exception($"Content-Type '{file.ContentType}' không khớp với định dạng file '{extension}'");
            }
        }

        /// <summary>
        /// Validate magic bytes (file signature) để chống giả mạo đuôi file.
        /// Cả .mp4 và .mov đều dựa trên chuẩn ISO Base Media File Format (box "ftyp"
        /// thường nằm ở offset 4-8, một số file .mov cũ bắt đầu bằng "moov"/"mdat"/"free"/"wide"/"skip").
        /// </summary>
        private async Task ValidateFileSignatureAsync(IFormFile file, CancellationToken cancellationToken)
        {
            var validBoxTypes = new[] { "ftyp", "moov", "mdat", "free", "skip", "wide" };

            var buffer = new byte[12];
            await using var stream = file.OpenReadStream();
            var bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);

            if (bytesRead < 8)
                throw new Exception("File không hợp lệ hoặc bị hỏng");

            var boxType = Encoding.ASCII.GetString(buffer, 4, 4);

            if (!validBoxTypes.Contains(boxType))
                throw new Exception("File không đúng định dạng video MP4/MOV (sai chữ ký file)");
        }

        /// <summary>
        /// Lưu IFormFile ra file tạm trên đĩa để probe metadata và upload từ đó
        /// (tránh giữ nguyên stream gốc, hạn chế lỗi khi đọc lại nhiều lần)
        /// </summary>
        private async Task<string> SaveToTempFileAsync(IFormFile file, CancellationToken cancellationToken)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var tempPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            await using (var fileStream = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(fileStream, cancellationToken);
            }

            return tempPath;
        }

        /// <summary>
        /// Validate độ phân giải tối thiểu của video (mặc định 480p chiều cao) bằng Xabe.FFmpeg,
        /// đồng thời trả về thời lượng video (giây) đọc được từ chính file gốc.
        /// Yêu cầu package Xabe.FFmpeg + Xabe.FFmpeg.Downloader (binary được tải sẵn lúc app khởi động,
        /// xem ghi chú cấu hình ở Program.cs).
        /// </summary>
        private async Task<int> ValidateVideoResolutionAsync(string tempFilePath)
        {
            IMediaInfo mediaInfo;

            try
            {
                mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error probing video metadata");
                throw new Exception("Không thể đọc thông tin video. File có thể bị hỏng hoặc không đúng định dạng");
            }

            var videoStream = mediaInfo.VideoStreams.FirstOrDefault();
            if (videoStream == null)
                throw new Exception("File không chứa video stream hợp lệ");

            if (videoStream.Height < _settings.MinResolutionHeight)
            {
                throw new Exception(
                    $"Độ phân giải video quá thấp ({videoStream.Width}x{videoStream.Height}). " +
                    $"Yêu cầu tối thiểu {_settings.MinResolutionHeight}p");
            }

            return (int)mediaInfo.Duration.TotalSeconds;
        }

        /// <summary>
        /// Xóa file tạm, không throw nếu lỗi (chỉ log cảnh báo)
        /// </summary>
        private void TryDeleteTempFile(string tempFilePath)
        {
            try
            {
                if (!string.IsNullOrEmpty(tempFilePath) && File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Could not delete temp file: {tempFilePath}");
            }
        }

        /// <summary>
        /// Tạo video object trên Bunny.net
        /// </summary>
        private async Task<string> CreateVideoAsync(string title)
        {
            try
            {
                var url = $"/library/{_settings.LibraryId}/videos";

                var request = new CreateVideoRequest
                {
                    Title = title,
                    ThumbnailTime = 5000,
                    EnabledResolutions = _settings.EnabledResolutions,
                    OutputCodecs = _settings.OutputCodecs,
                    JitEncodingEnabled = _settings.JitEncoding,
                    EnableMP4Fallback = _settings.EnableMP4Fallback
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        $"Create video failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Body: {responseContent}");
                    throw new Exception(
                        $"Create video failed ({(int)response.StatusCode} {response.ReasonPhrase}): " +
                        (string.IsNullOrEmpty(responseContent) ? "(empty response body)" : responseContent));
                }

                var result = JsonSerializer.Deserialize<CreateVideoResponse>(responseContent, JsonOptions);

                if (result == null || string.IsNullOrEmpty(result.Guid))
                    throw new Exception("Invalid response from Bunny.net API");

                _logger.LogInformation($"Video created: {result.Guid} - {title}");
                return result.Guid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating video");
                throw;
            }
        }

        /// <summary>
        /// Cập nhật title cho video đã tồn tại trên Bunny.net (POST /library/{id}/videos/{videoId})
        /// </summary>
        private async Task UpdateVideoTitleAsync(string videoId, string title)
        {
            try
            {
                var url = $"/library/{_settings.LibraryId}/videos/{videoId}";

                var payload = JsonSerializer.Serialize(new { title });
                var content = new StringContent(payload, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        $"Update video title failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Body: {responseContent}");
                    throw new Exception(
                        $"Cập nhật tiêu đề video thất bại ({(int)response.StatusCode} {response.ReasonPhrase}): " +
                        (string.IsNullOrEmpty(responseContent) ? "(empty response body)" : responseContent));
                }

                _logger.LogInformation($"Video title updated: {videoId} - {title}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating video title: {videoId}");
                throw;
            }
        }

        /// <summary>
        /// Upload file lên video object
        /// </summary>
        private async Task<bool> UploadFileToVideoAsync(string videoId, Stream videoStream, string fileName)
        {
            try
            {
                var url = $"/library/{_settings.LibraryId}/videos/{videoId}";

                // Reset stream position nếu có thể
                if (videoStream.CanSeek)
                    videoStream.Position = 0;

                var content = new StreamContent(videoStream);
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");

                var response = await _httpClient.PutAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        $"Upload failed. Status: {(int)response.StatusCode} {response.ReasonPhrase}. Body: {responseContent}");
                    return false;
                }

                _logger.LogInformation($"Video uploaded: {videoId} - {fileName}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading video: {videoId}");
                return false;
            }
        }

        /// <summary>
        /// Map từ VideoInfoResponse (lấy từ GetVideoInfoAsync) sang BunnyDto.
        /// Dùng khi cần lấy trạng thái encode MỚI NHẤT của 1 video đã tồn tại (ví dụ: endpoint
        /// riêng để FE poll tiến độ, hoặc trong handler xử lý Webhook từ Bunny) - KHÔNG dùng trong
        /// luồng upload/update chính vì luồng đó đã trả kết quả ngay, không chờ encode.
        /// </summary>
        private BunnyDto MapToBunnyDto(VideoInfoResponse info, string videoId, string title)
        {
            // Lấy danh sách resolutions từ transformation
            var resolutions = new List<string>();
            if (!string.IsNullOrEmpty(_settings.EnabledResolutions))
            {
                resolutions = _settings.EnabledResolutions.Split(',')
                    .Select(r => r.Trim())
                    .Where(r => !string.IsNullOrEmpty(r))
                    .ToList();
            }

            return new BunnyDto
            {
                Id = videoId,
                Title = title,
                Url = info?.PlayUrl ?? $"https://{_settings.CDNHostname}/{videoId}/playlist.m3u8",
                Mp4Url = info?.MP4FallbackUrl ?? string.Empty,
                ThumbnailUrl = info?.ThumbnailUrl ?? string.Empty,
                Duration = info?.Length != null ? (int)(info.Length / 1000) : 0,
                Size = info?.Size ?? 0,
                Status = info?.Status ?? 0,
                AvailableResolutions = resolutions,
                DateUploaded = info?.DateUploaded != null
                    ? DateTime.Parse(info.DateUploaded)
                    : DateTime.UtcNow,
                Message = (info?.Status == 3 || info?.Status == 4) ? "Video đã sẵn sàng" : "Đang xử lý...",
                Success = info?.Status == 3 || info?.Status == 4
            };
        }

        #endregion
    }
}