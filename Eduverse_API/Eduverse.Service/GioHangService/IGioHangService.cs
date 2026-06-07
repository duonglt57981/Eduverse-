using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.GioHangService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.GioHangService
{
    public interface IGioHangService : IService<GioHang>
    {
        Task<GioHangDto> GetGioHangAsync(Guid userId);
        Task<GioHangDto> ThemVaoGioHangAsync(GioHangRequest gioHangRequest);
        Task<GioHangDto> XoaKhoiGioHangAsync(Guid userId, Guid khoaHocId);
        Task<GioHangDto> ToggleChonAsync(Guid userId, Guid khoaHocId);
    }
}
