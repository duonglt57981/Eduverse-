using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LoiMoiGiangVienService.Dto
{
    public class LoiMoiGiangVienDto
    {
        public Guid Id { get; set; }
        public Guid IdKhoaHoc { get; set; }
        public string? EmailDuocMoi { get; set; }
        public string? TrangThai { get; set; }
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
        public DateTime NgayMoi { get; set; }
        public DateTime? NgayPhanHoi { get; set; }
    }

    public class GiangVienCongTacDto
    {
        public Guid IdGiangVien { get; set; }
        public string? HoTen { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? Email { get; set; }
        public bool LaChuSoHuu { get; set; }
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }
    public class LoiMoiChoXacNhanDto
    {
        public Guid Id { get; set; }
        public Guid IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? TenNguoiMoi { get; set; }
        public string? AnhNguoiMoi { get; set; }
        public string TrangThai { get; set; } = "Pending";
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
        public DateTime NgayMoi { get; set; }
    }
    public class LoiMoiDangChoDto
    {
        public Guid IdLoiMoi { get; set; }
        public string? EmailDuocMoi { get; set; }
        public string? HoTenDuocMoi { get; set; }
        public string? AnhDaiDienDuocMoi { get; set; }
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
        public DateTime NgayMoi { get; set; }
    }

    public class DanhSachGiangVienDto
    {
        public List<GiangVienCongTacDto> DanhSachCongTac { get; set; } = new();
        public List<LoiMoiDangChoDto> DanhSachDangMoi { get; set; } = new();
    }

    public class QuyenCuaToiDto
    {
        public bool LaChuSoHuu { get; set; }
        public bool Visible { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }

    public class LichSuNhanTheoDonDto
    {
        public Guid IdDonHang { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public double GiaLucDat { get; set; }
        public double SoTienGiam { get; set; }
        public double SoTienNhan { get; set; }
        public DateTime NgayGhiNhan { get; set; }
    }

    public class LichSuThayDoiTyLeDto
    {
        public int TyLeCu { get; set; }
        public int TyLeMoi { get; set; }
        public DateTime NgayThayDoi { get; set; }
    }
}
