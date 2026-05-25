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
        Task<CloudinaryDto> UploadVideoBaiGiangAsync(IFormFile file);

        Task DeleteVideoAsync(string publicId);
    }
}
