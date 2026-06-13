using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMucService.Dto
{
    public class DanhMucDto
    {
        public Guid Id { get; set; }
        public string? TenDanhMuc { get; set; }
        public DateTime? NgayTao { get; set; }
        public string? TrangThai { get; set; }
    }
}
