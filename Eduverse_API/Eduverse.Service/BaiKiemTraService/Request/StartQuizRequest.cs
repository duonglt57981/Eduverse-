using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Request
{
    public class StartQuizRequest
    {
        public Guid IdBaiKiemTra { get; set; }

        public Guid IdNguoiDung { get; set; }
    }
}
