using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class TaiLieu : AuditableEntity
    {
        public string? LoaiTaiLieu { get; set; }
        public string? TenTaiLieu { get; set; }
        public string? URL { get; set; }
        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public string? TrangThai { get; set; }
        public Guid? IdBaiGiang { get; set; }
    }
}
