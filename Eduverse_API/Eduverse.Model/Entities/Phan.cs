using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class Phan : AuditableEntity
    {
        public string? TenPhan { get; set; }

        public string? MieuTa { get; set; }

        public int? ThuTuSapXep { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public Guid? IdKhoaHoc { get; set; }
    }
}
