using Eduverse.Service.DapAnService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Dto
{
    public class CauHoiLamBaiDto
    {
        public Guid Id { get; set; }
        public string? TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public string? LoaiCauHoi { get; set; }
        public double? Diem { get; set; }
        public string? DoKho { get; set; }
        public List<DapAnLamBaiDto> DapAns { get; set; } = new();


        public List<Guid>? DapAnDaChon { get; set; } = new List<Guid>();
        public bool DaTraLoi { get; set; }
    }
}
    