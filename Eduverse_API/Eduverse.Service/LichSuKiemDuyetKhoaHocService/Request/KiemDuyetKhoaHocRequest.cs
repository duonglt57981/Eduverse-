using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request
{
    public class KiemDuyetKhoaHocRequest
    {
        public Guid? IdKhoaHoc { get; set; }
        public string TrangThaiPheDuyet { get; set; }
        public string? LyDo { get; set; }
    }
}
