using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ChungChiService.Request
{
    public class ChungChiSearch : SearchBase
    {
        public Guid? IdKhoaHoc { get; set; }
        public string? TrangThai { get; set; }
        public string? TenChungChi { get; set; }
        public Guid? IdNguoiDung { get; set; } // nếu cần lọc id cụ thể
    }
}
