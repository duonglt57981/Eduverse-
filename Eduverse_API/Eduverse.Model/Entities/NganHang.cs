using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class NganHang : AuditableEntity
    {
        public string? TenNganHang { get; set; }
        public string? TenTaiKhoan { get; set; }
        public string? SoTaiKhoan { get; set; }
        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public string? TrangThai { get; set; }
        public Guid? IdNguoiDung { get; set; }
        public string? HinhAnhQR { get; set; }
        public string? PublicIdHinhAnhQR { get; set; }
    }
}
