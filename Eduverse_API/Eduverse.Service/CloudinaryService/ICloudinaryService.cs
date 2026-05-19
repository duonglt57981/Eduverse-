using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

namespace Eduverse.Service.CloudinaryService
{
    public interface ICloudinaryService
    {
        Task<ImageUploadResult> UploadImage(IFormFile file);
    }
}
