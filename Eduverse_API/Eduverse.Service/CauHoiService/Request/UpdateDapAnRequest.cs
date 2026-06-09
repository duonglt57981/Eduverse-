using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Request
{
    public class UpdateDapAnRequest
    {
        public Guid? Id { get; set; }

        public string? NoiDungDapAn { get; set; }

        public bool LaDapAnDung { get; set; }

        public int? ThuTuSapXep { get; set; }
    }
}
