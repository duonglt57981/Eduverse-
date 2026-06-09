using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LanLamBaiKiemTraService.Dto
{
    public class KetQuaLanKiemTraDto
    {
        public Guid IdLanLamBaiKiemTra { get; set; }

        public bool Dat { get; set; }

        public double TongDiem { get; set; }

        public int SoCauDung { get; set; }

        public int TongSoCau { get; set; }

        public DateTime? ThoiGianNop { get; set; }
    }
}
