using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KhoaHocKiemDuyetListDto
    {
        public Guid IdKhoaHoc { get; set; }
        public string TieuDe { get; set; }
        public DateTime? NgayGuiDuyet { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public DateTime? CreateDate { get; set; }
        public string TrangThai { get; set; }
        public string TrangThaiPheDuyet { get; set; }
        public string CreateBy { get; set; }
    }
}
