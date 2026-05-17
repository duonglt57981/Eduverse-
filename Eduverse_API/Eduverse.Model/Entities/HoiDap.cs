using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class HoiDap : AuditableEntity
    {
        public string? NoiDung { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public Guid? IdNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}
