using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThongKeKhoaHocService.Dto
{
    public class ThongKeDoanhThuDto
    {
        public double TongDoanhThu { get; set; }  // tổng GiaLucDat từ DonHangChiTiet
        public double DoanhThuSauGiam { get; set; }  // sau khi trừ khuyến mãi
        public double PhanGiangVien { get; set; }  // 70% dành cho GV
        public double PhanHeTong { get; set; }  // 30% admin
        public int TongDonHang { get; set; }
        public int TongHocVien { get; set; }
        public List<DoanhThuTheoThangDto> DoanhThuTheoThang { get; set; } = new();
        public List<PhanChiaGiangVienDto> PhanChiaGiangVien { get; set; } = new();
    }

    public class DoanhThuTheoThangDto
    {
        public int Nam { get; set; }
        public int Thang { get; set; }
        public double DoanhThu { get; set; }
        public int SoDon { get; set; }
    }

    public class PhanChiaGiangVienDto
    {
        public Guid IdGiangVien { get; set; }
        public string? HoTen { get; set; }
        public string? AnhDaiDien { get; set; }
        public bool LaChuSoHuu { get; set; }
        public int TyLeChiaDoanhThu { get; set; }        // %
        public double SoTienNhan { get; set; }        // tính từ PhanGiangVien * TyLe/100
    }

    // Thống kê học viên
    public class ThongKeHocVienDto
    {
        public int TongHocVien { get; set; }
        public int HocVienMoi30Ngay { get; set; }
        public int DangHoc { get; set; }       // IsDangKy = true
        public int HetHan { get; set; }       // NgayHetHan < now
        public List<HocVienTheoThangDto> HocVienTheoThang { get; set; } = new();
        public List<HocVienGanDayDto> DanhSachHocVien { get; set; } = new();
    }

    public class HocVienTheoThangDto
    {
        public int Nam { get; set; }
        public int Thang { get; set; }
        public int SoLuong { get; set; }
    }

    public class HocVienGanDayDto
    {
        public Guid IdHocVien { get; set; }
        public string? HoTen { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? Email { get; set; }
        public double? GiaDangKy { get; set; }
        public DateTime? ThoiGianDK { get; set; }
        public string? TrangThai { get; set; }
        public bool? IsDangKy { get; set; }
        public DateTime? NgayHetHan { get; set; }
    }
}
