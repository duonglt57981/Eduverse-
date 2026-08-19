using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class GiangVienHienThiDto
    {
        public Guid Id { get; set; }
        public string HoTen { get; set; } = null!;
        public string? AnhDaiDien { get; set; }
        public string? TieuSu { get; set; }
    }
}
