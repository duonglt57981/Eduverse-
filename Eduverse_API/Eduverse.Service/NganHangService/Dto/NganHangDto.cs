using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.NganHangService.Dto
{
    public class NganHangDto
    {
        public Guid Id { get; set; }
        public string? TenNganHang { get; set; }
        public string? TenTaiKhoan { get; set; }
        public string? SoTaiKhoan { get; set; }
        public string? TrangThai { get; set; }
    }

    public class TaoNganHangDto
    {
        public string TenNganHang { get; set; } = "";
        public string TenTaiKhoan { get; set; } = "";
        public string SoTaiKhoan { get; set; } = "";
    }
}
