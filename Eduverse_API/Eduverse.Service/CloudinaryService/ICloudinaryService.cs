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
        Task<CloudinaryVideoDto> UpdateVideoBaiGiangAsync(string publicId, IFormFile file, CancellationToken cancellationToken = default);
        Task<CloudinaryImgDto> UploadImageAsync(IFormFile file, CancellationToken cancellationToken = default);
        Task<CloudinaryImgDto> UpdateImageAsync(string publicId, IFormFile newFile, CancellationToken cancellationToken = default);
        Task<CloudinaryDocumentDto> UploadDocumentAsync(IFormFile file);
        Task<CloudinaryDocumentDto> UpdateDocumentAsync(IFormFile file, string? oldPublicId);
        Task DeleteImageNganHangAsync(string publicId);
    }
}
