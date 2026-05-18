using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LienKet : AuditableEntity
    {
        public string? LoaiLienKet { get; set; }
        public string? URL { get; set; }
        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public int? TrangThai { get; set; }
    }
}
