using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class ChiTietLamBaiKiemTra : AuditableEntity
    {
        public bool? LaDung { get; set; }
        public double? DiemNhanDuoc { get; set; }
        public Guid? IdCauHoi { get; set; }
        public Guid? IdDapAnChon { get; set; }
        public Guid? IdLanLamBaiKiemTra { get; set; }
    }
}
