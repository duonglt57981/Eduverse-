using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.DapAnService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Request
{
    public class CauHoiRequest
    {
        public string TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }

        public List<DapAnRequest> DanhSachDapAns { get; set; }
    }
}
