using Eduverse.Service.ThongKeKhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThongKeKhoaHocService
{
    public interface IThongKeKhoaHocService
    {
        Task<ThongKeDoanhThuDto> GetThongKeDoanhThu(Guid idKhoaHoc);
        Task<ThongKeHocVienDto> GetThongKeHocVien(Guid idKhoaHoc, int? nam = null);
    }
}
