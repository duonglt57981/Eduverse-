using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.DanhSachYeuThichService.Dto;
using Eduverse.Service.DanhSachYeuThichService.Request;

namespace Eduverse.IService.DanhSachYeuThichService
{
    public interface IDanhSachYeuThichService : IService<Model.Entities.DanhSachYeuThich>
    {
        Task<PagedList<DanhSachYeuThichResponse>> GetData(DanhSachYeuThichSearch search);
        Task<DanhSachYeuThich> ThemYeuThich(Guid userId, Guid khoaHocId);
        Task<DanhSachYeuThich> XoaYeuThich(Guid id);
    }
}