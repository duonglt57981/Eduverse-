using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.YeuCauRutTienService.Dto
{
    public class YeuCauRutTienDto
    {
        public Guid Id { get; set; }
        public decimal? SoTienRut { get; set; }
        public string? TrangThai { get; set; }
        public DateTime? NgayYeuCau { get; set; }
        public DateTime? NgayXuLy { get; set; }
        public string? TenNganHang { get; set; }
        public string? SoTaiKhoan { get; set; }
        public string? TenTaiKhoan { get; set; }
        public string? TenGiangVien { get; set; }
        public decimal? SoDuHienTai { get; set; }
    }

    public class TaoYeuCauRutTienDto
    {
        public decimal SoTienRut { get; set; }
        public Guid IdNganHang { get; set; }
    }

    public class XuLyYeuCauDto
    {
        public string TrangThai { get; set; } = ""; // "DaDuyet" hoặc "TuChoi"
        public string? GhiChu { get; set; }
    }

}
