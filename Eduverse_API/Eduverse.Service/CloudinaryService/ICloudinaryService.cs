using CloudinaryDotNet.Actions;
using Eduverse.Service.CloudinaryService.Dto;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CloudinaryService
{
    public interface ICloudinaryService
    {
        Task<CloudinaryVideoDto> UploadVideoBaiGiangAsync(IFormFile file, CancellationToken cancellationToken = default);
        Task<CloudinaryImgDto> UploadImageAsync(IFormFile file);
        Task DeleteVideoAsync(string publicId);
        Task<(string newPublicId, string newUrl, int thoiLuong)> UpdateVideoAsync(IFormFile videoMoi, string oldPublicId);
        Task DeleteImageAsync(string publicId);
    }
}
