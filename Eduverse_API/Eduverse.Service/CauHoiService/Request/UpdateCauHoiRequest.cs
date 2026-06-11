using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Request
{
    public class UpdateCauHoiRequest
    {
        public Guid Id { get; set; }

        public string? TenCauHoi { get; set; }

        public string? NoiDungCauHoi { get; set; }

        public string? LoaiCauHoi { get; set; }

        public double? Diem { get; set; }

        public int? ThuTuSapXep { get; set; }

        public List<UpdateDapAnRequest> DanhSachDapAns { get; set; }= new();
    }
}
