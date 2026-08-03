using Eduverse.Service.Common;
using Eduverse.Service.DanhGiaService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhGiaService
{
    public interface IDanhGiaService : IService<Model.Entities.DanhGia>
    {
        Task<bool> KiemTraDaMuaAsync(Guid userId, Guid idKhoaHoc);
        Task<bool> KiemTraDaDanhGiaAsync(Guid userId, Guid idKhoaHoc);
        Task TaoDanhGiaAsync(Guid userId, TaoDanhGiaDto dto);
        Task<DanhGiaKhoaHocDto> GetDanhGiaByKhoaHocAsync(Guid idKhoaHoc);
    }
}
