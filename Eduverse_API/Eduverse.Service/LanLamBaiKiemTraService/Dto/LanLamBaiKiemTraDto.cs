using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LanLamBaiKiemTraService.Dto
{
    public class LanLamBaiKiemTraDto
    {
        public Guid Id { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianNop { get; set; }

        public bool? Dat { get; set; }
        public int? LamLanThu { get; set; }
        public Guid? IdBaiKiemTra { get; set; }
        public Guid? IdNguoiDung { get; set; }
    }
}
