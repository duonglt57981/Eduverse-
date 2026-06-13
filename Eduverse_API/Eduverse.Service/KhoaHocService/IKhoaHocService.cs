using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService
{
    public interface IKhoaHocService : IService<KhoaHoc>
    {
        Task<PagedList<KhoaHocDto>> GetDataAsync(KhoaHocSearch search, Guid? userId);
        Task<KhoaHocDetailDto?> GetChiTietAsync(Guid id, Guid? userId);
        Task<KhoaHocDto> TaoKhoaHocAsync(CreateKhoaHocDto dto, Guid userId);
        Task<KhoaHocDto> CapNhatKhoaHocAsync(Guid id, UpdateKhoaHocDto dto, Guid userId);
        Task<List<DanhMucDto>> GetAllDanhMucAsync();
        Task ToggleYeuThichAsync(Guid userId, Guid khoaHocId);
        Task<PagedList<KhoaHocDto>> GetYeuThichAsync(Guid userId, KhoaHocSearch search);
        Task<PagedList<KhoaHocDto>> GetKhoaHocDaDangKyAsync(Guid userId, KhoaHocSearch search);
        Task<PagedList<KhoaHocDto>> GetPagedAsync(KhoaHocQueryDto query);
        Task<KhoaHocDto?> GetByIdAsync(Guid id, Guid? userId);
    }
}
