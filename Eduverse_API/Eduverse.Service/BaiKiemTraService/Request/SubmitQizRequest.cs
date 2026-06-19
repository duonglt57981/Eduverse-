using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Request
{
    public class SubmitQizRequest
    {
        public Guid IdLanLamBaiKiemTra { get; set; }

        public List<CauTraLoiRequest> CauTraLois { get; set; } = new();
    }
}