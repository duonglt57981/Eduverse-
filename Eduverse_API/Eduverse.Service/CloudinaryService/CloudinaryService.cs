using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Eduverse.Service.CloudinaryService.Dto;
using Microsoft.AspNetCore.Http;
using Xabe.FFmpeg;
using Xabe.FFmpeg.Downloader;


namespace Eduverse.Service.CloudinaryService
{

    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }


        #region uploadvideo

        public async Task<CloudinaryVideoDto> UploadVideoBaiGiangAsync(IFormFile file, CancellationToken cancellationToken = default)
        {
            // ── 1. Validate ──
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 100L * 1024 * 1024;
            if (file.Length > maxSize)
                throw new Exception("Video không được vượt quá 100MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = { ".mp4", ".mov" };
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            // ── 2. Kiểm tra độ phân giải ──
            const int minResolution = 480;
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try
            {
                await using (var tempStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await using var probeStream = file.OpenReadStream();
                    await probeStream.CopyToAsync(tempStream, cancellationToken);
                }

                var mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath, cancellationToken);
                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();

                if (videoStream == null)
                    throw new Exception("Không đọc được thông tin video.");

                var canhNho = Math.Min(videoStream.Width, videoStream.Height);
                if (canhNho < minResolution)
                    throw new Exception(
                        $"Độ phân giải video quá thấp ({videoStream.Width}x{videoStream.Height}). Yêu cầu tối thiểu 480p.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }

            // ── 3. Tối ưu credit: 1 TRANSFORM adaptive streaming ──
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                EagerAsync = true,
                // 🎯 CHỈ 1 TRANSFORM - Adaptive Streaming (tiết kiệm credit tối đa)
                EagerTransforms = new List<Transformation>
        {
            new Transformation().RawTransformation("c_limit,w_1280,h_720/vc_h264,ac_aac,f_m3u8"),
        },
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                cancellationToken: cancellationToken
            );

            // ── 4. Kiểm tra kết quả ──
            if (uploadResult == null || uploadResult.Error != null ||
                string.IsNullOrEmpty(uploadResult.PublicId))
            {
                var errorMsg = uploadResult?.Error?.Message ?? "Unknown error";
                throw new Exception($"Upload thất bại: {errorMsg}");
            }

            var publicId = uploadResult.PublicId;
            var thoiLuong = uploadResult.Duration > 0
                ? (int)Math.Round(uploadResult.Duration)
                : 0;

            var fileSizeMB = file.Length / (1024.0 * 1024.0);
            Console.WriteLine($"[Upload] Success: {publicId}, Duration: {thoiLuong}s, Size: {fileSizeMB:F2}MB");

            // ── 5. Lấy HLS URL ──
            var (hlsReady, hlsUrl) = await WaitForHlsReadyAsync(publicId, cancellationToken);
            if (!hlsReady || string.IsNullOrEmpty(hlsUrl))
            {
                Console.WriteLine($"[Warning] HLS chưa ready, fallback to original URL");
                return new CloudinaryVideoDto
                {
                    IdVideoBaiGiang = publicId,
                    URLBaiGiang = GetVideoUrl(publicId),
                    ThoiLuong = thoiLuong,
                };
            }

            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = publicId,
                URLBaiGiang = hlsUrl,
                ThoiLuong = thoiLuong,
            };
        }

        public async Task<CloudinaryVideoDto> UpdateVideoBaiGiangAsync(string publicId, IFormFile file, CancellationToken cancellationToken = default)
        {
            // ── 1. Validate ──────────────────────────────────────────────
            if (string.IsNullOrWhiteSpace(publicId))
                throw new ArgumentException("PublicId không được để trống", nameof(publicId));

            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 100L * 1024 * 1024;
            if (file.Length > maxSize)
                throw new Exception("Video không được vượt quá 100MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = { ".mp4", ".mov" };
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            // ── 2. Kiểm tra độ phân giải ──────────────────────────────────
            const int minResolution = 480;
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try
            {
                await using (var tempStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await using var uploadStreamForProbe = file.OpenReadStream();
                    await uploadStreamForProbe.CopyToAsync(tempStream, cancellationToken);
                }

                var mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath, cancellationToken);
                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();

                if (videoStream == null)
                    throw new Exception("Không đọc được thông tin video.");

                var canhNho = Math.Min(videoStream.Width, videoStream.Height);
                if (canhNho < minResolution)
                    throw new Exception(
                        $"Độ phân giải video quá thấp ({videoStream.Width}x{videoStream.Height}). Yêu cầu tối thiểu 480p.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }

            // ── 3. Kiểm tra video cũ ──────────────────────────────────────
            try
            {
                var existingResource = await _cloudinary.GetResourceAsync(
                    new GetResourceParams(publicId) { ResourceType = ResourceType.Video },
                    cancellationToken
                );

                if (existingResource == null || string.IsNullOrEmpty(existingResource.PublicId))
                    throw new Exception($"Không tìm thấy video với PublicId: {publicId}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Không thể xác minh video cũ: {ex.Message}");
            }

            // ── 4. Update video ───────────────────────────────────────────
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                PublicId = publicId,
                Folder = "eduverse/bai-giang",
                UseFilename = false,
                UniqueFilename = false,
                Overwrite = true,
                EagerAsync = true,
                EagerTransforms = new List<Transformation>
        {
            new Transformation().RawTransformation("c_limit,w_1280,h_720/vc_h264,ac_aac,f_m3u8"),
        },
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                cancellationToken: cancellationToken
            );

            if (uploadResult == null || uploadResult.Error != null ||
                string.IsNullOrEmpty(uploadResult.PublicId))
            {
                var errorMsg = uploadResult?.Error?.Message ?? "Unknown error";
                throw new Exception($"Upload thất bại: {errorMsg}");
            }

            var thoiLuong = uploadResult.Duration > 0
                ? (int)Math.Round(uploadResult.Duration)
                : 0;

            var fileSizeMB = file.Length / (1024.0 * 1024.0);
            Console.WriteLine($"[Update] Success: {publicId}, Duration: {thoiLuong}s, Size: {fileSizeMB:F2}MB");

            // ── 5. Lấy HLS URL ────────────────────────────────────────────
            var (hlsReady, hlsUrl) = await WaitForHlsReadyAsync(publicId, cancellationToken);
            if (!hlsReady || string.IsNullOrEmpty(hlsUrl))
            {
                Console.WriteLine($"[Warning] HLS chưa ready, fallback to original URL");
                return new CloudinaryVideoDto
                {
                    IdVideoBaiGiang = publicId,
                    URLBaiGiang = GetVideoUrl(publicId),
                    ThoiLuong = thoiLuong,
                };
            }

            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = publicId,
                URLBaiGiang = hlsUrl,
                ThoiLuong = thoiLuong,
            };
        }

        // ── Upload với 2 qualities (480p + 720p) - KHÔNG HLS ──────────
        public async Task<CloudinaryVideoDto> UploadVideoWithTwoQualitiesAsync(
            IFormFile file,
            CancellationToken cancellationToken = default)
        {
            // Validate...
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 100L * 1024 * 1024;
            if (file.Length > maxSize)
                throw new Exception("Video không được vượt quá 100MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = { ".mp4", ".mov" };
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            const int minResolution = 480;
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try
            {
                await using (var tempStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await using var probeStream = file.OpenReadStream();
                    await probeStream.CopyToAsync(tempStream, cancellationToken);
                }

                var mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath, cancellationToken);
                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();

                if (videoStream == null)
                    throw new Exception("Không đọc được thông tin video.");

                var canhNho = Math.Min(videoStream.Width, videoStream.Height);
                if (canhNho < minResolution)
                    throw new Exception(
                        $"Độ phân giải video quá thấp ({videoStream.Width}x{videoStream.Height}). Yêu cầu tối thiểu 480p.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }

            // 🎯 Tạo 2 transforms (480p + 720p) - KHÔNG HLS
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                EagerAsync = true,
                EagerTransforms = new List<Transformation>
        {
            // 480p - SD
            new Transformation().RawTransformation("c_limit,w_854,h_480,q_auto/f_mp4"),
            // 720p - HD
            new Transformation().RawTransformation("c_limit,w_1280,h_720,q_auto/f_mp4"),
        },
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                cancellationToken: cancellationToken
            );

            if (uploadResult == null || uploadResult.Error != null ||
                string.IsNullOrEmpty(uploadResult.PublicId))
            {
                var errorMsg = uploadResult?.Error?.Message ?? "Unknown error";
                throw new Exception($"Upload thất bại: {errorMsg}");
            }

            var publicId = uploadResult.PublicId;
            var thoiLuong = uploadResult.Duration > 0
                ? (int)Math.Round(uploadResult.Duration)
                : 0;

            // ── Lấy URL cho từng quality ──
            var url480p = GetTransformedVideoUrl(publicId, 854, 480);
            var url720p = GetTransformedVideoUrl(publicId, 1280, 720);

            Console.WriteLine($"[Upload] Success: {publicId}, 480p: {url480p}, 720p: {url720p}");

            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = publicId,
                URLBaiGiang = url720p,
                ThoiLuong = thoiLuong,
            };
        }

        // ── Upload với HLS + 1 quality MP4 (cân bằng) ──────────────────
        public async Task<CloudinaryVideoDto> UploadVideoWithHLSAndMP4Async(
            IFormFile file,
            CancellationToken cancellationToken = default)
        {
            // Validate...
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 100L * 1024 * 1024;
            if (file.Length > maxSize)
                throw new Exception("Video không được vượt quá 100MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = { ".mp4", ".mov" };
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            const int minResolution = 480;
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try
            {
                await using (var tempStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await using var probeStream = file.OpenReadStream();
                    await probeStream.CopyToAsync(tempStream, cancellationToken);
                }

                var mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath, cancellationToken);
                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();

                if (videoStream == null)
                    throw new Exception("Không đọc được thông tin video.");

                var canhNho = Math.Min(videoStream.Width, videoStream.Height);
                if (canhNho < minResolution)
                    throw new Exception(
                        $"Độ phân giải video quá thấp ({videoStream.Width}x{videoStream.Height}). Yêu cầu tối thiểu 480p.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }

            // 🎯 HLS + 1 quality MP4 (fallback)
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                EagerAsync = true,
                EagerTransforms = new List<Transformation>
        {
            // HLS adaptive streaming
            new Transformation().RawTransformation("c_limit,w_1280,h_720/vc_h264,ac_aac,f_m3u8"),
            // 480p MP4 (fallback)
            new Transformation().RawTransformation("c_limit,w_854,h_480,q_auto/f_mp4"),
        },
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                cancellationToken: cancellationToken
            );

            if (uploadResult == null || uploadResult.Error != null ||
                string.IsNullOrEmpty(uploadResult.PublicId))
            {
                var errorMsg = uploadResult?.Error?.Message ?? "Unknown error";
                throw new Exception($"Upload thất bại: {errorMsg}");
            }

            var publicId = uploadResult.PublicId;
            var thoiLuong = uploadResult.Duration > 0
                ? (int)Math.Round(uploadResult.Duration)
                : 0;

            // ── Lấy HLS URL ──
            var (hlsReady, hlsUrl) = await WaitForHlsReadyAsync(publicId, cancellationToken);
            if (!hlsReady || string.IsNullOrEmpty(hlsUrl))
            {
                Console.WriteLine($"[Warning] HLS chưa ready, fallback to 480p URL");
                var url480p = GetTransformedVideoUrl(publicId, 854, 480);
                return new CloudinaryVideoDto
                {
                    IdVideoBaiGiang = publicId,
                    URLBaiGiang = url480p,
                    ThoiLuong = thoiLuong,
                };
            }

            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = publicId,
                URLBaiGiang = hlsUrl,
                ThoiLuong = thoiLuong,
            };
        }

        // ── Upload KHÔNG transform (tiết kiệm nhất) ────────────────────
        public async Task<CloudinaryVideoDto> UploadVideoOriginalAsync(
            IFormFile file,
            CancellationToken cancellationToken = default)
        {
            // Validate...
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 100L * 1024 * 1024;
            if (file.Length > maxSize)
                throw new Exception("Video không được vượt quá 100MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = { ".mp4", ".mov" };
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            const int minResolution = 480;
            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try
            {
                await using (var tempStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await using var probeStream = file.OpenReadStream();
                    await probeStream.CopyToAsync(tempStream, cancellationToken);
                }

                var mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath, cancellationToken);
                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();

                if (videoStream == null)
                    throw new Exception("Không đọc được thông tin video.");

                var canhNho = Math.Min(videoStream.Width, videoStream.Height);
                if (canhNho < minResolution)
                    throw new Exception(
                        $"Độ phân giải video quá thấp ({videoStream.Width}x{videoStream.Height}). Yêu cầu tối thiểu 480p.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }

            // 🎯 Upload KHÔNG transform - tiết kiệm credit tối đa
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                EagerAsync = false,
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                cancellationToken: cancellationToken
            );

            if (uploadResult == null || uploadResult.Error != null ||
                string.IsNullOrEmpty(uploadResult.PublicId))
            {
                var errorMsg = uploadResult?.Error?.Message ?? "Unknown error";
                throw new Exception($"Upload thất bại: {errorMsg}");
            }

            var publicId = uploadResult.PublicId;
            var thoiLuong = uploadResult.Duration > 0
                ? (int)Math.Round(uploadResult.Duration)
                : 0;

            var videoUrl = GetVideoUrl(publicId);

            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = publicId,
                URLBaiGiang = videoUrl,
                ThoiLuong = thoiLuong,
            };
        }

        // ── Lấy URL video gốc ────────────────────────────────────────────
        private string GetVideoUrl(string publicId)
        {
            var cloudName = "your-cloud-name";
            return $"https://res.cloudinary.com/{cloudName}/video/upload/{publicId}.mp4";
        }

        // ── Lấy URL video đã transform ───────────────────────────────────
        private string GetTransformedVideoUrl(string publicId, int width, int height)
        {
            var cloudName = "your-cloud-name";
            return $"https://res.cloudinary.com/{cloudName}/video/upload/c_limit,w_{width},h_{height},q_auto/{publicId}.mp4";
        }

        // ── Lấy HLS URL từ derived resources ─────────────────────────────
        private async Task<string?> GetHlsUrlAsync(string publicId)
        {
            try
            {
                var resource = await _cloudinary.GetResourceAsync(
                    new GetResourceParams(publicId)
                    {
                        ResourceType = ResourceType.Video,
                    }
                );

                if (resource == null || resource.Error != null)
                    return null;

                var json = Newtonsoft.Json.JsonConvert.SerializeObject(resource);
                var doc = System.Text.Json.JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("derived", out var derivedArr)
                    || derivedArr.ValueKind != System.Text.Json.JsonValueKind.Array
                    || derivedArr.GetArrayLength() == 0)
                    return null;

                string? urlHd = null;
                string? urlSd = null;
                string? fallbackUrl = null;

                foreach (var item in derivedArr.EnumerateArray())
                {
                    var format = item.TryGetProperty("format", out var fmt) ? fmt.GetString() : null;
                    var transformation = item.TryGetProperty("transformation", out var tf) ? tf.GetString() : null;
                    var secureUrl = item.TryGetProperty("secure_url", out var su) ? su.GetString() : null;

                    if (format != "m3u8" || string.IsNullOrEmpty(secureUrl)) continue;

                    if (transformation?.Contains("w_1280") == true)
                        urlHd ??= secureUrl;
                    else if (transformation?.Contains("w_854") == true)
                        urlSd ??= secureUrl;
                    else
                        fallbackUrl ??= secureUrl;
                }

                return urlHd ?? urlSd ?? fallbackUrl;
            }
            catch
            {
                return null;
            }
        }

        // ── Polling: chờ HLS ready ──────────────────────────────────────
        private async Task<(bool ready, string? hlsUrl)> WaitForHlsReadyAsync(
            string publicId,
            CancellationToken cancellationToken,
            int maxRetry = 60,
            int delaySeconds = 5)
        {
            Console.WriteLine($"[HLS] Chờ xử lý HLS cho: {publicId}");

            for (int i = 0; i < maxRetry; i++)
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), cancellationToken);

                try
                {
                    var hlsUrl = await GetHlsUrlAsync(publicId);
                    if (!string.IsNullOrEmpty(hlsUrl))
                    {
                        Console.WriteLine($"[HLS] ✅ Xử lý xong sau {i + 1} lần retry");
                        return (true, hlsUrl);
                    }

                    if (i % 6 == 0 && i > 0)
                    {
                        Console.WriteLine($"[HLS] Đang xử lý... ({i + 1}/{maxRetry})");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[HLS] Lỗi retry {i + 1}: {ex.Message}");
                    continue;
                }
            }

            Console.WriteLine($"[HLS] ❌ Timeout sau {maxRetry} lần retry");
            return (false, null);
        }

        #endregion


        #region Logic upload image, delete image
        private const int MIN_IMG_WIDTH = 200;
        private const int MIN_IMG_HEIGHT = 200;

        private static async Task DamBaoFFmpegSanSangAsync()
        {
            string ffmpegPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ffmpeg");
            if (!Directory.Exists(ffmpegPath))
                Directory.CreateDirectory(ffmpegPath);

            string ffmpegExe = Path.Combine(ffmpegPath, "ffmpeg.exe");
            if (!File.Exists(ffmpegExe))
            {
                await FFmpegDownloader.GetLatestVersion(FFmpegVersion.Official, ffmpegPath);
            }
            FFmpeg.SetExecutablesPath(ffmpegPath);
        }

        private static async Task KiemTraKichThuocAnhAsync(IFormFile file, string extension, CancellationToken cancellationToken = default)
        {
            await DamBaoFFmpegSanSangAsync();

            var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}{extension}");

            try
            {
                await using (var tempStream = new FileStream(tempFilePath, FileMode.Create))
                {
                    await using var probeStream = file.OpenReadStream();
                    await probeStream.CopyToAsync(tempStream, cancellationToken);
                }

                var mediaInfo = await FFmpeg.GetMediaInfo(tempFilePath, cancellationToken);
                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();

                if (videoStream == null)
                    throw new Exception("Không đọc được thông tin ảnh. File có thể bị lỗi hoặc không đúng định dạng.");

                var width = videoStream.Width;
                var height = videoStream.Height;

                if (width < MIN_IMG_WIDTH || height < MIN_IMG_HEIGHT)
                    throw new Exception(
                        $"Độ phân giải ảnh quá thấp ({width}x{height}). Yêu cầu tối thiểu {MIN_IMG_WIDTH}x{MIN_IMG_HEIGHT}.");
            }
            finally
            {
                if (File.Exists(tempFilePath))
                    File.Delete(tempFilePath);
            }
        }

        public async Task<CloudinaryImgDto> UploadImageAsync(IFormFile file, CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 10L * 1024 * 1024; // 10MB
            if (file.Length > maxSize)
                throw new Exception("Ảnh không được vượt quá 10MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = [".jpg", ".jpeg", ".png"];
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            // ── Kiểm tra độ phân giải TRƯỚC KHI upload lên Cloudinary ──
            await KiemTraKichThuocAnhAsync(file, extension, cancellationToken);

            // ── Upload (chỉ chạy tới đây khi đã chắc chắn đạt chuẩn) ──
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/images",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                Transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult == null)
                throw new Exception("Upload ảnh thất bại: Không nhận được phản hồi từ Cloudinary");
            if (uploadResult.Error != null)
                throw new Exception($"Upload ảnh thất bại: {uploadResult.Error.Message}");
            if (uploadResult.SecureUrl == null)
                throw new Exception("Upload ảnh thất bại: Không lấy được URL ảnh");

            return new CloudinaryImgDto
            {
                UrlImg = uploadResult.SecureUrl.ToString(),
                PublicId = uploadResult.PublicId,
            };
        }

        public async Task<CloudinaryImgDto> UpdateImageAsync(string publicId, IFormFile newFile, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrEmpty(publicId))
                throw new Exception("publicId không được để trống");

            if (newFile == null || newFile.Length == 0)
                throw new Exception("File mới không hợp lệ");

            const long maxSize = 10L * 1024 * 1024;
            if (newFile.Length > maxSize)
                throw new Exception("Ảnh không được vượt quá 10MB");

            var extension = Path.GetExtension(newFile.FileName).ToLower();
            string[] allowedExtensions = [".jpg", ".jpeg", ".png"];
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            await KiemTraKichThuocAnhAsync(newFile, extension, cancellationToken);

            await using var inputStream = newFile.OpenReadStream();

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(newFile.FileName, inputStream),
                PublicId = publicId,          // chỉ định publicId trùng với ảnh cũ
                Folder = "eduverse/images",   // có thể giữ hoặc lấy từ publicId cũ
                Overwrite = true,             // quan trọng: ghi đè
                UniqueFilename = false,       // để không tạo tên unique mới
                Transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult == null)
                throw new Exception("Upload thất bại: Không nhận được phản hồi từ Cloudinary");
            if (uploadResult.Error != null)
                throw new Exception($"Upload thất bại: {uploadResult.Error.Message}");
            if (uploadResult.SecureUrl == null)
                throw new Exception("Upload thất bại: Không lấy được URL ảnh");

            return new CloudinaryImgDto
            {
                PublicId = uploadResult.PublicId,
                UrlImg = uploadResult.SecureUrl.ToString()
            };
        }
        #endregion


        #region Logic upload DOC, delete DOC

        public async Task<CloudinaryDocumentDto> UploadDocumentAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 50L * 1024 * 1024; // 50MB

            if (file.Length > maxSize)
                throw new Exception("Tài liệu không được vượt quá 50MB");

            var extension = Path.GetExtension(file.FileName).ToLower();

            // Giao diện đang cho người dùng chọn .pdf/.doc/.docx nên máy chủ
            // phải chấp nhận cả ba, tránh trường hợp chọn được nhưng gửi lên bị lỗi.
            string[] allowedExtensions = { ".pdf", ".doc", ".docx" };

            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            await using var inputStream = file.OpenReadStream();

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/documents",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult == null)
                throw new Exception("Upload tài liệu thất bại");

            if (uploadResult.Error != null)
                throw new Exception($"Upload tài liệu thất bại: {uploadResult.Error.Message}");

            if (uploadResult.SecureUrl == null)
                throw new Exception("Không lấy được URL tài liệu");

            return new CloudinaryDocumentDto
            {
                UrlDoc = uploadResult.SecureUrl.ToString(),
                IdDocument = uploadResult.PublicId,
                DownloadUrl = uploadResult.SecureUrl
                


                .ToString()
                .Replace("/upload/", "/upload/fl_attachment/")
            };

        }
        public async Task DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                throw new Exception("PublicId không được để trống");

            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Image
            };

            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
                throw new Exception($"Xóa ảnh thất bại: {result.Error.Message}");
        }


        public async Task<CloudinaryDocumentDto> UpdateDocumentAsync(IFormFile file, string? oldPublicId)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 50L * 1024 * 1024; // 50MB

            if (file.Length > maxSize)
                throw new Exception("Tài liệu không được vượt quá 50MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = { ".pdf", ".doc", ".docx" };

            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            await using var inputStream = file.OpenReadStream();

            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/documents",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            
            if (!string.IsNullOrEmpty(oldPublicId))
            {
                uploadParams.PublicId = oldPublicId;
                uploadParams.UseFilename = false;
                uploadParams.UniqueFilename = false;
                uploadParams.Overwrite = true;
                uploadParams.Invalidate = true; 
            }

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult == null)
                throw new Exception("Upload tài liệu thất bại");

            if (uploadResult.Error != null)
                throw new Exception($"Upload tài liệu thất bại: {uploadResult.Error.Message}");

            if (uploadResult.SecureUrl == null)
                throw new Exception("Không lấy được URL tài liệu");

            return new CloudinaryDocumentDto
            {
                UrlDoc = uploadResult.SecureUrl.ToString(),
                IdDocument = uploadResult.PublicId,
                DownloadUrl = uploadResult.SecureUrl
                    .ToString()
                    .Replace("/upload/", "/upload/fl_attachment/")
            };
        }

        #endregion


        public async Task DeleteImageNganHangAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                throw new Exception("PublicId không được để trống");

            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Image
            };

            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
                throw new Exception($"Xóa ảnh thất bại: {result.Error.Message}");
        }
    }
}
