using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LanLamBaiKiemTraService.Dto
{
    public class LichSuLamBaiDto
    {
        public Guid IdLanLamBaiKiemTra { get; set; }

        public int? LamLanThu { get; set; }

        public bool? Dat { get; set; }
        public double? TongDiem { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }

        public DateTime? ThoiGianNop { get; set; }
    }
}
