using Eduverse.Service.CauHoiService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LanLamBaiKiemTraService.Dto
{
    public class ReviewQizzDto
    {
        public Guid IdLanLamBaiKiemTra { get; set; }

        public double TongDiem { get; set; }

        public DateTime? ThoiGianNop { get; set; }

        public bool Dat { get; set; }

        public List<CauHoiReviewDto> CauHois { get; set; } = new();
        public bool ChoXemDapAn { get; set; }
    }
}
