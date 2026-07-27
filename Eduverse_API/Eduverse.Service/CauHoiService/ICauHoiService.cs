using Eduverse.Service.Common;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;

namespace Eduverse.Service.CauHoiService
{
    public interface ICauHoiService : IService<Model.Entities.CauHoi>
    {
        Task<CauHoiDto> CreateCauHoiAsync(CreateCauHoiRequest request);
        Task<CauHoiDto> UpdateCauHoiAsync(UpdateCauHoiRequest request);
        Task<bool> DeleteCauHoiAsync(Guid idCauHoi);
    }
}
