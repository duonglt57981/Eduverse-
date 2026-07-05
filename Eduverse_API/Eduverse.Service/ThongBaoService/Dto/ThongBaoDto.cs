using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThongBaoService.Dto
{
    public class ThongBaoDto
    {
        public Guid Id { get; set; }
        public string? TieuDe { get; set; }
        public string? NoiDung { get; set; }
        public bool? DaDoc { get; set; }
        public DateTime? ThoiGianDoc { get; set; }
        public DateTime? ThoiGianTao { get; set; }
        public string? TrangThai { get; set; }
        public string? LoaiThongBao { get; set; }
        public Guid? IdNguoiDung { get; set; }
    }
}
