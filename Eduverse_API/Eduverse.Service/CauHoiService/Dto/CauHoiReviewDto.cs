using Eduverse.Service.DapAnService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Dto
{
    public class CauHoiReviewDto
    {
        public Guid IdCauHoi { get; set; }

        public string? TenCauHoi { get; set; }

        public string? NoiDungCauHoi { get; set; }

        public Guid? IdDapAnChon { get; set; }

        public Guid? IdDapAnDung { get; set; }

        public bool LaDung { get; set; }

        public double DiemNhanDuoc { get; set; }

        public List<DapAnReviewDto> DapAns { get; set; } = new();
    }
}
