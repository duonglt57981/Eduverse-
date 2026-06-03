using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Service.Common;
using Microsoft.AspNetCore.Http;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Eduverse.Service.CloudinaryService.Dto;
using System.IO;               
using CloudinaryDotNet.Actions;

namespace Eduverse.Service.CloudinaryService
{

    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }


        public async Task<CloudinaryVideoDto> UploadVideoBaiGiangAsync(IFormFile file,CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 2L * 1024 * 1024 * 1024;
            if (file.Length > maxSize)
                throw new Exception("Video không được vượt quá 2GB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

            // ── 2. Upload ────────────────────────────────────────────────
            await using var inputStream = file.OpenReadStream();

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
                EagerAsync = true, // xử lý ngầm, không chờ — tránh timeout
                EagerTransforms = new List<Transformation>
        {
            new Transformation().RawTransformation("sp_sd/vc_h264,ac_aac,f_m3u8"),
            new Transformation().RawTransformation("sp_hd/vc_h264,ac_aac,f_m3u8"),
            new Transformation().RawTransformation("sp_full_hd/vc_h264,ac_aac,f_m3u8"),
        },
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                bufferSize: 100 * 1024 * 1024,
                cancellationToken: cancellationToken
            );

            // ── 3. Kiểm tra kết quả upload ──────────────────────────────
            if (uploadResult == null)
                throw new Exception("Upload thất bại: Không nhận được phản hồi");

            if (uploadResult.Error != null)
                throw new Exception($"Upload thất bại: {uploadResult.Error.Message}");

            if (string.IsNullOrEmpty(uploadResult.PublicId))
                throw new Exception("Upload thất bại: Không lấy được PublicId");

            var publicId = uploadResult.PublicId;
            var thoiLuong = uploadResult.Duration > 0
                ? (int)Math.Round(uploadResult.Duration)
                : 0;

            // ── 4. Polling chờ Cloudinary xử lý HLS xong ────────────────
            var (hlsReady, hlsUrl) = await WaitForHlsReadyAsync(publicId, cancellationToken);
            if (!hlsReady || string.IsNullOrEmpty(hlsUrl))
                throw new Exception("Cloudinary xử lý HLS quá lâu. Vui lòng thử lại sau.");

            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = publicId,
                URLBaiGiang = hlsUrl,
                ThoiLuong = thoiLuong,
            };
        }


        // ── Polling: chờ derived có m3u8 ────────────────────────────────
        private async Task<(bool ready, string? hlsUrl)> WaitForHlsReadyAsync(string publicId,CancellationToken cancellationToken,int maxRetry = 60,int delaySeconds = 5)
        {
            for (int i = 0; i < maxRetry; i++)
            {
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds), cancellationToken);

                try
                {
                    var resource = await _cloudinary.GetResourceAsync(
                        new GetResourceParams(publicId)
                        {
                            ResourceType = ResourceType.Video,
                        }
                    );

                    if (resource == null || resource.Error != null) continue;

                    var json = Newtonsoft.Json.JsonConvert.SerializeObject(resource);
                    var doc = System.Text.Json.JsonDocument.Parse(json);

                    if (!doc.RootElement.TryGetProperty("derived", out var derivedArr)
                        || derivedArr.ValueKind != System.Text.Json.JsonValueKind.Array
                        || derivedArr.GetArrayLength() == 0)
                        continue;

                    // Ưu tiên sp_full_hd → sp_hd → bất kỳ m3u8 nào
                    string? masterUrl = null;
                    string? hdUrl = null;
                    string? fallbackUrl = null;

                    foreach (var item in derivedArr.EnumerateArray())
                    {
                        var format = item.TryGetProperty("format", out var fmt)
                            ? fmt.GetString() : null;
                        var transformation = item.TryGetProperty("transformation", out var tf)
                            ? tf.GetString() : null;
                        var secureUrl = item.TryGetProperty("secure_url", out var su)
                            ? su.GetString() : null;

                        if (format != "m3u8" || string.IsNullOrEmpty(secureUrl)) continue;

                        if (transformation?.StartsWith("sp_full_hd") == true)
                            masterUrl = secureUrl;
                        else if (transformation?.StartsWith("sp_hd") == true)
                            hdUrl ??= secureUrl;
                        else
                            fallbackUrl ??= secureUrl;
                    }

                    var hlsUrl = masterUrl ?? hdUrl ?? fallbackUrl;
                    if (!string.IsNullOrEmpty(hlsUrl))
                    {
                        Console.WriteLine($"[HLS] Xử lý xong sau {i + 1} lần retry. URL: {hlsUrl}");
                        return (true, hlsUrl);
                    }
                }
                catch (Exception ex) when (!ex.Message.Contains("thất bại"))
                {
                    Console.WriteLine($"[HLS] Retry {i + 1} exception: {ex.Message}");
                    continue;
                }
            }

            Console.WriteLine($"[HLS] Timeout sau {maxRetry} lần retry.");
            return (false, null);
        }




        public async Task<CloudinaryImgDto> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 10L * 1024 * 1024; // 10MB
            if (file.Length > maxSize)
                throw new Exception("Ảnh không được vượt quá 10MB");

            var extension = Path.GetExtension(file.FileName).ToLower();
            string[] allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
            if (!allowedExtensions.Contains(extension))
                throw new Exception($"Định dạng không hỗ trợ. Chấp nhận: {string.Join(", ", allowedExtensions)}");

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
            };
        }

        public async Task DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId)) return;

            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Image
            };

            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
                throw new Exception($"Xóa ảnh thất bại: {result.Error.Message}");
        }


        public async Task<CloudinaryDocumentDto> UploadDocumentAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            const long maxSize = 50L * 1024 * 1024; // 50MB

            if (file.Length > maxSize)
                throw new Exception("Tài liệu không được vượt quá 50MB");

            var extension = Path.GetExtension(file.FileName).ToLower();

            string[] allowedExtensions =
            {
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".txt",
        ".zip",
        ".rar"
    };

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
                DownloadUrl = uploadResult.SecureUrl
                .ToString()
                .Replace("/upload/", "/upload/fl_attachment/")
            };
        }
    }
}
