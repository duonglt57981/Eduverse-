using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DanhMuc : AuditableEntity
    {
        public string? TenDanhMuc { get; set; }
        public DateTime? NgayTao { get; set; }
        public bool? TrangThai { get; set; }
    }
}
