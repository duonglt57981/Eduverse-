using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class CreateBaiKiemTraDto
    {
        public string? TenBaiKiemTra { get; set; }

        public string? MoTa { get; set; }

        public double? DiemDat { get; set; }

        public int? GioiHanThoiGian { get; set; }

        public bool? ChoLamLai { get; set; }

        public int? SoLanLamToiDa { get; set; }

        public Guid? IdPhan { get; set; }
    }
}
