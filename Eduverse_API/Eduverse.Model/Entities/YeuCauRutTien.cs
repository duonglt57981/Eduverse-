using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class YeuCauRutTien : AuditableEntity
    {
        public decimal? SoTienRut { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? NgayYeuCau { get; set; } = DateTime.Now;
        public DateTime? NgayXuLy { get; set; }
        public Guid? IdNguoiDung { get; set; }
        public Guid? IdNganHang { get; set; }
    }
}
