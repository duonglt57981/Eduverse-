using Eduverse.Service.CauHoiService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class CreateBaiKiemTraDto
    {
        public Guid Id { get; set; }
        public Guid? IdPhan { get; set; }
        public string? TenBaiKiemTra { get; set; }
        public string? MoTa { get; set; }
        public double? DiemDat { get; set; }
        public int? GioiHanThoiGian { get; set; }
        public bool? ChoLamLai { get; set; }
        public int? SoLanLamLai { get; set; }
        public int? SoLanLamToiDa { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }

        public List<CauHoiDto> DanhSachCauHoi { get; set; } = new();
    }
}
