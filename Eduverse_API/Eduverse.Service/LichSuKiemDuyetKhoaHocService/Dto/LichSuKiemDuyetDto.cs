using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class LichSuKiemDuyetDto
    {
        public Guid Id { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public Guid? IdNguoiDuyet { get; set; }
        public string? TenNguoiDuyet { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? LyDo { get; set; }
        public DateTime? NgayDuyet { get; set; }
    }
}
