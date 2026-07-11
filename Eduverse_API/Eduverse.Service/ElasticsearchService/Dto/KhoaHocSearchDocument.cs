using System;
using System.Collections.Generic;

namespace Eduverse.Service.ElasticsearchService.Dto
{
    public class KhoaHocSearchDocument
    {
        public Guid Id { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? CapDo { get; set; }
        public int? TongThoiLuong { get; set; }
        public int? TongBaiGiang { get; set; }
        public int? SoLuongHocVien { get; set; }
        public DateTime? NgayTao { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? TrangThai { get; set; }
        public bool IsFree { get; set; }
        public string? TenGiangVien { get; set; }
        public List<Guid> DanhMucIds { get; set; } = new();
        public List<string> TenDanhMucList { get; set; } = new();
    }
}
