using Eduverse.Model.Entities;
using Eduverse.Service.ChungChiService.Dto;
using Eduverse.Service.ChungChiService.Request;
using Eduverse.Service.Common;

namespace Eduverse.IService.ChungChiService
{
    public interface IChungChiService : IService<ChungChi>
    {
        Task<PagedList<ChungChiResponse>> GetPaged(ChungChiSearch search);

        Task<ChungChiResponse> GetDetail(Guid id);

        Task<ChungChi> CreateChungChi(ChungChi entity);

        Task<ChungChi> UpdateChungChi(Guid id, ChungChi entity);

        Task<bool> DeleteChungChi(Guid id);
    }
}