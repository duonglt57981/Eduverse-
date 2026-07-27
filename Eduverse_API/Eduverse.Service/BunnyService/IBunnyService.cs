using Eduverse.Service.BunnyService.Dto;
using Eduverse.Service.BunnyService.Response;
using Microsoft.AspNetCore.Http;

namespace Eduverse.Service.BunnyService
{
    public interface IBunnyService
    {
        // ── Upload Video ──
        Task<BunnyDto> UploadVideoAsync(IFormFile file, string? title = null, CancellationToken cancellationToken = default);

        // ── Update Video (ghi đè nội dung lên videoId đã tồn tại) ──
        Task<BunnyDto> UpdateVideoAsync(string videoId, IFormFile file, string? title = null, CancellationToken cancellationToken = default);
    }
}