using Eduverse.Service.CauHoiService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Request
{
    public class CreateBaiKiemTraRequest
    {
        public Guid? IdPhan { get; set; }
        public string? TenBaiKiemTra { get; set; }
        public string? MoTa { get; set; }
        public int? ThuTuSapXep { get; set; }
    }
}
