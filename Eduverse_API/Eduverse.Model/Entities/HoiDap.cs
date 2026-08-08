using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class HoiDap : AuditableEntity
    {
        public string? NoiDung { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public Guid? IdNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public Guid? IdHoiDapCha { get; set; }
        public Guid? IdBaiGiang { get; set; }
        public bool DaGhim { get; set; } 
        public bool DaDong { get; set; }
        public bool LaGiangVien { get; set; }
        public bool GhimTraLoi { get; set; }
        public int SoLike { get; set; }
    }
}
