using Eduverse.Service.CauHoiService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class BaiKiemTraDto
    {
        public Guid Id { get; set; }
        public string TenBaiKiemTra { get; set; } = string.Empty;
        public string? MoTa { get; set; }

        public double? DiemDat { get; set; }

        public int? GioiHanThoiGian { get; set; }

        public List<CauHoiDto> DanhSachCauHoi { get; set; } = [];
    }
}
