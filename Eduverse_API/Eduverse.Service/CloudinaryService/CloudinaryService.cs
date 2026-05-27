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

namespace Eduverse.Service.CloudinaryService
{

    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }


        public async Task<CloudinaryDto> UploadVideoBaiGiangAsync(IFormFile file, CancellationToken cancellationToken = default)
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

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(file.FileName, inputStream),
                Folder = "eduverse/bai-giang",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
            };

            var uploadResult = await _cloudinary.UploadLargeAsync(
                uploadParams,
                bufferSize: 100 * 1024 * 1024
            );

            if (uploadResult == null)
                throw new Exception("Upload video thất bại: Không nhận được phản hồi từ Cloudinary");
            if (uploadResult.Error != null)
                throw new Exception($"Upload video thất bại: {uploadResult.Error.Message}");
            if (uploadResult.SecureUrl == null)
                throw new Exception("Upload video thất bại: Không lấy được URL video");

            return new CloudinaryDto
            {
                URLBaiGiang = uploadResult.SecureUrl.ToString(),
                IdVideoBaiGiang = uploadResult.PublicId,
                ThoiLuong = uploadResult.Duration > 0
                    ? (int)Math.Round(uploadResult.Duration): 0
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







        public async Task<CloudinaryDto> UploadImageAsync(IFormFile file)
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

            return new CloudinaryDto
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
    }
}
