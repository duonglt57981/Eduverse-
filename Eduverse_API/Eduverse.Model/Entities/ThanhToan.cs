using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class ThanhToan : AuditableEntity
    {
        public string? MaGiaoDich { get; set; }
        public decimal? SoTien { get; set; }
        public string? TrangThaiThanhToan { get; set; }
        public DateTime? NgayThanhToan { get; set; } = DateTime.Now;
        public string? PhatSinhLoi { get; set; }
        public Guid? IdDonHang { get; set; }
        public Guid? IdNganHangs { get; set; }
    }
}
