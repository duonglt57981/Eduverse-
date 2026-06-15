using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class AutoSaveDapAnDto
    {
        public bool Success { get; set; }
        public int SoCauDaLam { get; set; }
        public int TongSoCau { get; set; }
        public bool DaHoanThanh { get; set; }
        public Guid? NextQuestionId { get; set; }
        public double ThoiGianConLai { get; set; }
        public bool CoGioiHan { get; set; }
        public string Message { get; set; }
    }
}
