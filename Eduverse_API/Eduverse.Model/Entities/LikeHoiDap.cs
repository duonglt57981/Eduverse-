using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LikeHoiDap : AuditableEntity
    {
        public Guid IdHoiDap { get; set; } 
        public Guid IdNguoiDung { get; set; }
    }
}
