using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class BaiKiemTra : AuditableEntity
    {
        public string? TenBaiKiemTra { get; set; }
        public string? MoTa { get; set; }
        public double? DiemDat { get; set; } 
        public int? GioiHanThoiGian { get; set; } 
        public bool? ChoLamLai { get; set; }
        public int? SoLanLamLai { get; set; }

        public int? SoLanLamToiDa { get; set; }
        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public string? TrangThai { get; set; }
        public Guid? IdPhan { get; set; }



        public List<CauHoi> DanhSachCauHois { get; set; }
    }
}
