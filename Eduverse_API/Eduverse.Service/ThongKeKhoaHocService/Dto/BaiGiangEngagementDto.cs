using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThongKeKhoaHocService.Dto
{
    public class BaiGiangEngagementDto
    {
        public Guid IdBaiGiang { get; set; }
        public string? TenBaiGiang { get; set; }
        public int ThuTu { get; set; }  
        public int LuotXem { get; set; } 
        public double TyLeHoanThanh { get; set; }
    }

    public class CourseEngagementDto
    {
        public int HocVienDaDangKy { get; set; }
        public int HocVienDaBatDauHoc { get; set; }
        public double TongThoiGianHocGio { get; set; }
        public int LuotXemBaiGiang { get; set; }
        public double TyLeHoanThanhTrungBinh { get; set; }
        public int HocVienDangHoatDong { get; set; }
    }
}
