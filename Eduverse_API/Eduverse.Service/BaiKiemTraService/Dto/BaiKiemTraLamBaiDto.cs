using Eduverse.Service.CauHoiService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class BaiKiemTraLamBaiDto
    {
        public Guid Id { get; set; }
        public string? TenBaiKiemTra { get; set; }
        public string? MoTa { get; set; }
        public int? GioiHanThoiGian { get; set; }

        public List<CauHoiLamBaiDto> CauHois { get; set; } = new();
    }
}
