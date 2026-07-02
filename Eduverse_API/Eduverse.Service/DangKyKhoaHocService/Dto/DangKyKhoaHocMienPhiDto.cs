using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DangKyKhoaHocService.Dto
{
    public class DangKyKhoaHocMienPhiDto
    {
        public double? GiaDangKy { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? ThoiGianDK { get; set; }
        public Guid? IdNguoiDangKi { get; set; }
        public Guid? IdDangKi { get; set; }
        public bool? IsDangKy { get; set; } 
    }
}
