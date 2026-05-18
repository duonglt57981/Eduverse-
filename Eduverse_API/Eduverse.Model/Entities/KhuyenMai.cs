using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class KhuyenMai : AuditableEntity
    {
        [StringLength(50)]
        public string? MaGiamGia { get; set; }
        public int? PhanTramGiam { get; set; }

        public DateTime? NgayBatDau { get; set; }

        public DateTime? NgayKetThuc { get; set; }
        public int? SoLuongHieuLuc { get; set; }
    }
}
