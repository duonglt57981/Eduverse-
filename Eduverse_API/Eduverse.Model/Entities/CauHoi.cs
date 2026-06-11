using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class CauHoi : AuditableEntity
    {
        public string? TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public string? LoaiCauHoi { get; set; }
        public double? Diem { get; set; }
        public int? ThuTuSapXep { get; set; }

        [Column("IdBaiKiemTra")]
        public Guid? IdBaiKiemTra { get; set; }
    }
}
