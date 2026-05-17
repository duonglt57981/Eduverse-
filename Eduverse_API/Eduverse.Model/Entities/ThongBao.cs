using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class ThongBao : AuditableEntity
    {
        public string? TieuDe { get; set; }
        public string? NoiDung { get; set; }

        public bool? DaDoc { get; set; }

        public DateTime? ThoiGianDoc { get; set; }

        public DateTime? ThoiGianTao { get; set; } = DateTime.Now;

        public int? TrangThai { get; set; }

        public string? LoaiThongBao { get; set; }
    }
}
