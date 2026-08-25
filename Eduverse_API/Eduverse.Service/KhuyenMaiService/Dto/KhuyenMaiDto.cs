using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhuyenMaiService.Dto
{
    public class KhuyenMaiDto
    {
        public Guid? Id { get; set; }
        public string? MaGiamGia { get; set; }
        public int? PhanTramGiam { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public int? SoLuongHieuLuc { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<KhoaHocMiniDto>? DanhSachKhoaHoc { get; set; }
        public List<LoiMoiApDungKhuyenMaiDto> DanhSachDangCho { get; set; } = new();
    }

    public class LoiMoiApDungKhuyenMaiDto
    {
        public Guid IdLoiMoi { get; set; }
        public Guid IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public Guid IdGiangVienDuocMoi { get; set; }
        public string? TenGiangVien { get; set; }

        // "Pending" | "Accepted" | "Rejected"
        public string TrangThai { get; set; } = "Pending";
        public DateTime NgayMoi { get; set; }
        public DateTime? NgayPhanHoi { get; set; }
    }
    public class LoiMoiKhuyenMaiChoXacNhanDto
    {
        public Guid Id { get; set; }
        public Guid IdKhuyenMai { get; set; }
        public string? MaGiamGia { get; set; }
        public int? PhanTramGiam { get; set; }
        public DateTime? NgayBatDauKM { get; set; }
        public DateTime? NgayKetThucKM { get; set; }

        public Guid IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }

        public string? TenNguoiMoi { get; set; }   // Admin gửi
        public string? AnhNguoiMoi { get; set; }

        public string TrangThai { get; set; } = "Pending";
        public DateTime NgayMoi { get; set; }
    }
}
