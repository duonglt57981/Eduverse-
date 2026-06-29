using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class GetQuizToLearningDto
    {
        //public Guid IdKhoaHoc { get; set; }
        //public string? TenKhoaHoc { get; set; }
        //public List<PhanHocDto> DanhSachTheoPhan { get; set; } = new();
        //public List<BaiKiemTraDto> DanhSachTatCa { get; set; } = new();
        //public int TongSoBaiKiemTra { get; set; }

        public Guid IdBaiKiemTra { get; set; }
        public Guid IdDangKy { get; set; }
        public string TenBaiKiemTra { get; set; }
        public int SoCauHoi { get; set; }
    }
}
