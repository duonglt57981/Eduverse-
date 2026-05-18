using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class KhuyenMai_KhoaHoc : AuditableEntity
    {
        public Guid? IdKhuyenMai { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}
