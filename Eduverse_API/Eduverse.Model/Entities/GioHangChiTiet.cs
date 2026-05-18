using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class GioHangChiTiet : AuditableEntity
    {
        public bool? DaChon { get; set; }

        public bool? DaMua { get; set; }

        public DateTime? ThoiGianThem { get; set; } = DateTime.Now;
        public Guid? IdKhoaHoc { get; set; }
    }
}
