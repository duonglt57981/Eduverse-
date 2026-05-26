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


        public async Task<CloudinaryDto> UploadVideoBaiGiangAsync(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    throw new Exception("File không hợp lệ");

                const long maxSize = 2L * 1024 * 1024 * 1024;
                if (file.Length > maxSize)
                    throw new Exception("Video không được vượt quá 2GB");

                var allowedExtensions = new[] { ".mp4", ".mov", ".avi", ".mkv", ".webm" };
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                    throw new Exception("Định dạng video không hỗ trợ. Các định dạng hỗ trợ: mp4, mov, avi, mkv, webm");

                // 4. Upload video
                await using var stream = file.OpenReadStream();

                var uploadParams = new VideoUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "eduverse/bai-giang",
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false
                };

                var uploadResult = await _cloudinary.UploadLargeAsync(uploadParams);

                // 5. Kiểm tra kết quả upload
                if (uploadResult == null)
                    throw new Exception("Upload video thất bại: Không nhận được phản hồi từ Cloudinary");

                if (uploadResult.Error != null)
                    throw new Exception($"Upload video thất bại: {uploadResult.Error.Message}");

                if (uploadResult.SecureUrl == null)
                    throw new Exception("Upload video thất bại: Không lấy được URL video");

                // 6. Tính thời lượng video
                var thoiLuong = 0;
                if (uploadResult.Duration > 0)
                {
                    thoiLuong = (int)Math.Round(uploadResult.Duration);
                }

                return new CloudinaryDto
                {
                    URLBaiGiang = uploadResult.SecureUrl.ToString(),
                    IdVideoBaiGiang = uploadResult.PublicId,
                    ThoiLuong = thoiLuong
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Upload video thất bại: {ex.Message}");
            }
        }


        public async Task DeleteVideoAsync(string publicId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(publicId))
                    return;

                var deleteParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Video
                };

                var result = await _cloudinary.DestroyAsync(deleteParams);

                if (result.Result != "ok")
                    throw new Exception("Xóa video thất bại");
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
