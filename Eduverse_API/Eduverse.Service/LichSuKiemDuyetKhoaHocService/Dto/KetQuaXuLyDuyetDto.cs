using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KetQuaXuLyDuyetDto
    {
        public Guid IdBanNhap { get; set; }
        public string? TrangThaiMoi { get; set; }
        public bool DaMapDuLieu { get; set; }
        public string? GhiChu { get; set; }
    }
}
