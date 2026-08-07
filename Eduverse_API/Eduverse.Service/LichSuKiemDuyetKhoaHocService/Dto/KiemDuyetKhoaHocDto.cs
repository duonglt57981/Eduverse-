using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KiemDuyetKhoaHocDto
    {
        public Guid? IdDoiTuong { get; set; }
        public string LoaiDoiTuong { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? LyDo { get; set; }
        public DateTime? NgayDuyet { get; set; }
    }
}
