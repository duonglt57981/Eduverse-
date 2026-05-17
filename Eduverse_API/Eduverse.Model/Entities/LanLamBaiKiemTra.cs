using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LanLamBaiKiemTra : AuditableEntity
    {
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianNop { get; set; }

        public bool? Dat { get; set; } 
        public int? LamLanThu { get; set; }
        public Guid? IdBaiKiemTra { get; set; }
        public Guid? IdNguoiDung { get; set; }
    }
}
