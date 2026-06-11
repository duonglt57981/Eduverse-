using Eduverse.Service.DapAnService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Request
{
    public class CreateCauHoiRequest
    {
        public Guid Id { get; set; }
        public Guid idBaiKiemTra { get; set; }
        public string TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public double? Diem { get; set; }

        public List<DapAnRequest> DanhSachDapAns { get; set; }
    }
}
