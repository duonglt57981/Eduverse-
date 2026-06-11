using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DangKyKhoaHoc : AuditableEntity
    {
        public double? GiaDangKy { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? ThoiGianDK { get; set; }
        public Guid? IdNguoiDangKi { get; set; }
        public Guid? IdDangKi { get; set; }
        //thêm
        public bool? IsDangKy { get; set; }
    }
}
