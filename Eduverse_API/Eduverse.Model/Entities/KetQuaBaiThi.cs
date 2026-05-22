using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class KetQuaBaiThi : AuditableEntity
    {
        public double? Diem { get; set; }

        public int? SoCauDung { get; set; }

        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayNop { get; set; }
    }
}
