using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class KhoaHocDto
    {
        public Guid Id { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? URLViewPreviewKhoaHoc { get; set; }
        public string? CapDo { get; set; }
        public int? TongThoiLuong { get; set; }
        public int? TongBaiGiang { get; set; }
        public int? SoLuongHocVien { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public DateTime? NgayTao { get; set; }
        public bool? DaYeuThich { get; set; }
        public bool? DaDangKy { get; set; }
    }

    public class KhoaHocDetailDto : KhoaHocDto
    {
        public List<PhanDto>? Phans { get; set; }
    }

    public class PhanDto
    {
        public Guid Id { get; set; }
        public string? TenPhan { get; set; }
        public string? MieuTa { get; set; }
        public int? ThuTuSapXep { get; set; }
        public List<BaiGiangDto>? BaiGiangs { get; set; }
    }

    public class BaiGiangDto
    {
        public Guid Id { get; set; }
        public string? TieuDe { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThuTuSapXep { get; set; }
        public int? ThoiLuong { get; set; }
        public bool? LaBaiGiangFree { get; set; }
        public string? TrangThai { get; set; }
    }

    public class DanhMucDto
    {
        public Guid Id { get; set; }
        public string? TenDanhMuc { get; set; }
    }

    public class CreateKhoaHocDto
    {
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? URLViewPreviewKhoaHoc { get; set; }
        public string? CapDo { get; set; }
        public Guid? IdDanhMuc { get; set; }
    }

    public class UpdateKhoaHocDto : CreateKhoaHocDto { }

    public class KhoaHocQueryDto
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string? Search { get; set; }
        public string? DanhMucId { get; set; }
        public string? CapDo { get; set; }
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int TotalPage { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
