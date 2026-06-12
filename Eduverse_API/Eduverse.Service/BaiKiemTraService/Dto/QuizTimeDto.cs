using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class QuizTimeDto
    {
        public DateTime ThoiGianBatDau { get; set; }
        public double ThoiGianDaLam { get; set; }
        public double ThoiGianConLai { get; set; }
        public int GioiHanThoiGian { get; set; }
        public bool CoGioiHan { get; set; }
    }
}
