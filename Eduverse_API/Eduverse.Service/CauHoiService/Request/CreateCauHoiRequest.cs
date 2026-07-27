using Eduverse.Model.Entities;
using Eduverse.Service.DapAnService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Request
{
    public class CreateCauHoiRequest : CauHoi
    {
        public Guid IdBaiKiemTra { get; set; }
        public string? TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public string? LoaiCauHoi { get; set; }      
        public double? Diem { get; set; }
        public string? DoKho { get; set; }           // VD: "De", "TrungBinh", "Kho"
        public int? ThuTuSapXep { get; set; }

        public List<CreateDapAnRequest> DanhSachDapAn { get; set; } = new();
    }
}
