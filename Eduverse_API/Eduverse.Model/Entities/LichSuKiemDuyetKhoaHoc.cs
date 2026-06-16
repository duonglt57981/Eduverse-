using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LichSuKiemDuyetKhoaHoc : AuditableEntity
    {
        public Guid? IdKhoaHoc { get; set; }

        public Guid? IdNguoiDuyet { get; set; }

        public string? TrangThaiPheDuyet { get; set; }

        public string? LyDo { get; set; }

        public DateTime? NgayDuyet { get; set; }
    }
}
