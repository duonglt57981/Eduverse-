using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhSachMuonMuaSauService.Dto
{
    public class DanhSachMuonMuaSauDto
    {
        public Guid Id { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public string? HinhAnh { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public DateTime? ThoiGianLuu { get; set; }
        public string? TenTacGia { get; set; }
        public int? TongThoiLuong { get; set; }
        public int? TongBaiGiang { get; set; }
        public List<string> DanhSachGiangVien { get; set; } = new();
    }
}
