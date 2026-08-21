using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.GioHangService.Dto
{
    public class GioHangDto
    {
        public Guid GioHangId { get; set; }
        public List<GioHangChiTietDto> Items { get; set; } = new();
        public double TongTien { get; set; }
        public double TongTienDaChon { get; set; }
        public int SoLuongDaChon { get; set; }
    }

    public class GioHangChiTietDto
    {
        public Guid Id { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public string? HinhAnh { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public bool? DaChon { get; set; }
        public DateTime? ThoiGianThem { get; set; }
        public string? TenTacGia { get; set; }
        public int? TongThoiLuong { get; set; } 
        public int? TongBaiGiang { get; set; }
        public List<string> DanhSachGiangVien { get; set; } = new();
    }
}
