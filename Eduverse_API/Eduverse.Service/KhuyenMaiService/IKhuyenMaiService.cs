using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhuyenMaiService.Dto;
using Eduverse.Service.KhuyenMaiService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhuyenMaiService
{
    public interface IKhuyenMaiService : IService<KhuyenMai>
    {
        Task<List<KhuyenMaiDto>> GetListAll();
        Task<KhuyenMaiDto> CreateKhuyenMai(CreateKhuyenMaiRequest request);
        Task<KhuyenMaiDto> UpdateKhuyenMai(UpdateKhuyenMaiRequest request);
        Task<bool> DeleteKhuyenMai(Guid id);
        Task<List<KhoaHocMiniDto>> GetAllApprovedKhoaHocAsync();
        Task<List<KhuyenMaiKhaDungDto>> GetKhaDungTheoKhoaHoc(List<Guid> khoaHocIds);
    }
}
