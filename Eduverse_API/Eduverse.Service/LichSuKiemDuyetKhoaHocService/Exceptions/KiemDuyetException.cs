using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions
{
    public class KiemDuyetException : Exception
    {
        public string Loai { get; }
        public List<string> TuViPham { get; }
        public string GoiYSua { get; }

        public KiemDuyetException(string thongBao, string loai, List<string> tuViPham, string goiYSua = null)
            : base(thongBao)
        {
            Loai = loai;
            TuViPham = tuViPham;
            GoiYSua = goiYSua;
        }
    }
}
