using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DonHang : AuditableEntity
    {
        public decimal? SoTienGiamGia { get; set; }
        public decimal? SoTienThanhToan { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public int? TrangThai { get; set; }
        public Guid? IdNguoiDung { get; set; }
    }
}
