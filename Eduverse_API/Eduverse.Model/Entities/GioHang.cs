using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class GioHang : AuditableEntity
    {
        public Guid? IdNguoiDung { get; set; }
    }
}
