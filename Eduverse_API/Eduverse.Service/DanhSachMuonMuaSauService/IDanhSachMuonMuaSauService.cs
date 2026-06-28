using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.DanhSachMuonMuaSauService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhSachMuonMuaSauService
{
    public interface IDanhSachMuonMuaSauService : IService<DanhSachMuonMuaSau>
    {
        Task<List<DanhSachMuonMuaSauDto>> GetDanhSachAsync(Guid userId);
        Task LuuMuaSauAsync(Guid userId, Guid khoaHocId);
        Task XoaKhoiMuaSauAsync(Guid userId, Guid khoaHocId);
        Task ChuyenVaoGioHangAsync(Guid userId, Guid khoaHocId);
    }
}
