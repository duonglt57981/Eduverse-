using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DonHang_KhuyenMai : AuditableEntity
    {
        public Guid? IdDonHang { get; set; }
        public Guid? IdKhuyenMai { get; set; }
        public double? SoTienGiam { get; set; }
        public Guid? IdKhoaHocDuocGiam { get; set; }
    }
}
