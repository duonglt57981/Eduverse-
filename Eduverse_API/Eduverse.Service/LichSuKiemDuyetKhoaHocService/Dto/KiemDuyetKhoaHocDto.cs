using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KiemDuyetKhoaHocDto
    {
        public Guid? IdKhoaHoc { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public DateTime? NgayDuyet { get; set; }
    }
}
