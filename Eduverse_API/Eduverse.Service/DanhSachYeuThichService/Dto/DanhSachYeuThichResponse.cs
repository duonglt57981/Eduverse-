using System;

namespace Eduverse.Service.DanhSachYeuThichService.Dto
{
    public class DanhSachYeuThichResponse
    {
        public Guid Id { get; set; }
        public Guid? IdNguoiDung { get; set; }
        public string? TenNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public DateTime CreatedDate { get; set; }   // từ AuditableEntity
        public string? MoTa { get; set; }
        public string? HinhAnh { get; set; }
        public string? GiangVien { get; set; }
        public double? GiaTien { get; set; }
        public string? CapDo { get; set; }              // ← THÊM
        public int SoLuongHocVien { get; set; }          // ← THÊM
        public double? DiemDanhGiaTrungBinh { get; set; } // ← THÊM — null = chưa có đánh giá
        public int SoLuongDanhGia { get; set; }
    }
}