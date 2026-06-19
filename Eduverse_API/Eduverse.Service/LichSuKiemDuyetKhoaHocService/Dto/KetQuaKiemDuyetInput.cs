using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KetQuaKiemDuyetInput
    {
        public bool HopLe { get; set; }
        public string ThongBao { get; set; }
        public string Loai { get; set; }
        public List<string> TuViPham { get; set; }
        public string GoiYSua { get; set; }
    }
}
