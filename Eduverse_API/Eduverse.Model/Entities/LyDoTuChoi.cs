using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LyDoTuChoi : AuditableEntity
    {
        public Guid? IdDoiTuong { get; set; }
        public string? LoaiDoiTuong { get; set; }
        public string? LyDo { get; set; }
        public string? TrangThai { get; set; }
    }
}
