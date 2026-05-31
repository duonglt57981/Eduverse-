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


        public async Task<CloudinaryVideoDto> UploadVideoBaiGiangAsync(IFormFile file, CancellationToken cancellationToken = default)
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

            await using var inputStream = file.OpenReadStream();

            // 4. Thiết lập cấu hình Upload lên Cloudinary
            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,

                EagerTransforms = new List<Transformation>
                {
                    // 360p
                    new Transformation()
                        .Height(360)
                        .VideoCodec("h264")
                        .AudioCodec("aac")
                        .FetchFormat("m3u8"),

                    // 480p
                    new Transformation()
                        .Height(480)
                        .VideoCodec("h264")
                        .AudioCodec("aac")
                        .FetchFormat("m3u8"),

                    // 720p HD
                    new Transformation()
                        .Height(720)
                        .VideoCodec("h264")
                        .AudioCodec("aac")
                        .FetchFormat("m3u8"),

                    // 1080p Full HD
                    new Transformation()
                        .Height(1080)
                        .VideoCodec("h264")
                        .AudioCodec("aac")
                        .FetchFormat("m3u8"),

                    // 1440p 2K
                    new Transformation()
                        .Height(1440)
                        .VideoCodec("h264")
                        .AudioCodec("aac")
                        .FetchFormat("m3u8"),

                    // 2160p 4K
                    new Transformation()
                        .Height(2160)
                        .VideoCodec("h264")
                        .AudioCodec("aac")
                        .FetchFormat("m3u8")
                },
                // Chạy ngầm tiến trình băm nhỏ video (HLS) để tránh bị Timeout API
                EagerAsync = true
            };

            // 5. Tiến hành upload theo cơ chế phân đoạn (Chunk) phù hợp cho file lớn
            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                bufferSize: 100 * 1024 * 1024, // 100MB cho mỗi phân đoạn upload
                cancellationToken: cancellationToken
            );

            // 6. Kiểm tra và xử lý kết quả phản hồi
            if (uploadResult == null)
                throw new Exception("Upload video thất bại: Không nhận được phản hồi từ Cloudinary");
            if (uploadResult.Error != null)
                throw new Exception($"Upload video thất bại: {uploadResult.Error.Message}");
            if (uploadResult.SecureUrl == null)
                throw new Exception("Upload video thất bại: Không lấy được URL video");

            // 7. Xử lý lấy URL phát luồng HLS (.m3u8) chuẩn Udemy
            string hlsUrl = string.Empty;
            if (uploadResult.SecureUrl != null)
            {
                string rawUrl = uploadResult.SecureUrl.ToString();

                // Chèn tag profile phát stream '/sp_hd/' ngay sau cụm '/upload/' 
                // và cắt bỏ đuôi mở rộng gốc (.mp4/.mov...) để thay bằng đuôi '.m3u8'
                hlsUrl = rawUrl.Replace("/upload/", "/upload/sp_hd/").Substring(0, rawUrl.LastIndexOf('.')) + ".m3u8";
            }
            else
            {
                throw new Exception("Upload video thất bại: Không lấy được SecureUrl từ Cloudinary");
            }
            return new CloudinaryVideoDto
            {
                IdVideoBaiGiang = uploadResult.PublicId,
                URLBaiGiang = hlsUrl,
                ThoiLuong = uploadResult.Duration > 0 ? (int)Math.Round(uploadResult.Duration) : 0
            };
        }





        public async Task DeleteVideoAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId)) return;

            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Video
            };

            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Error != null)
                throw new Exception($"Xóa video thất bại: {result.Error.Message}");
        }

    

        public async Task<(string newPublicId, string newUrl, int thoiLuong)> UpdateVideoAsync(IFormFile videoMoi, string oldPublicId)
        {
            var uploadResult = await UploadVideoBaiGiangAsync(videoMoi);

            if (!string.IsNullOrEmpty(oldPublicId))
                await DeleteVideoAsync(oldPublicId);

            return (uploadResult.IdVideoBaiGiang, uploadResult.URLBaiGiang, (int)uploadResult.ThoiLuong);
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
