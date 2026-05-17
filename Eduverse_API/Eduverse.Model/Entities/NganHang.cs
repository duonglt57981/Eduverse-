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
        public string? TenTaiKhoan { get; set; }
        public string? SoTaiKhoan { get; set; }
        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public int? TrangThai { get; set; }
    }
}
