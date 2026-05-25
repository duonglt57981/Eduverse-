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
                // Validate file
                if (file == null || file.Length == 0)
                    throw new Exception("File không hợp lệ");

                // Validate dung lượng (500MB)
                const long maxSize = 500 * 1024 * 1024;

                if (file.Length > maxSize)
                    throw new Exception("Video không được vượt quá 500MB");

                // Validate định dạng
                var allowedExtensions = new[] { ".mp4", ".mov", ".avi", ".mkv" };

                var extension = Path.GetExtension(file.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                    throw new Exception("Định dạng video không hỗ trợ");

                await using var stream = file.OpenReadStream();

                var uploadParams = new VideoUploadParams
                {
                    File = new FileDescription(file.FileName, stream),

                    Folder = "eduverse/bai-giang",

                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false
                };

                var uploadResult = await _cloudinary
                    .UploadAsync(uploadParams);


                // Check lỗi cloudinary
                if (uploadResult == null)
                    throw new Exception("Upload video thất bại");

                if (uploadResult.Error != null)
                    throw new Exception(uploadResult.Error.Message);

                if (uploadResult.SecureUrl == null)
                    throw new Exception("Không lấy được URL video");

                return new CloudinaryDto
                {
                    URLBaiGiang = uploadResult.SecureUrl.ToString(),

                    IdVideoBaiGiang = uploadResult.PublicId,

                    ThoiLuong = uploadResult.Duration != null? (int)Math.Round(uploadResult.Duration) : 0
                };
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
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
