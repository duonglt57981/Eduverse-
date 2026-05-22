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
        public string? MaGiaoDich { get; set; }
        public double? SoTienGiamGia { get; set; }
        public double? SoTienThanhToan { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public int? TrangThai { get; set; }
        public Guid? IdNguoiDung { get; set; }
        //không tạo FK mới, chỉ để EF biết quan hệ
        public ICollection<DonHangChiTiet>? DonHangChiTiets { get; set; }
    }
}
