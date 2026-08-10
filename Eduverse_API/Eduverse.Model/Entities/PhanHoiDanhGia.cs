using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class PhanHoiDanhGia : AuditableEntity
    {
        public Guid IdDanhGia { get; set; }
        public string NoiDung { get; set; } = string.Empty;
    }
}
