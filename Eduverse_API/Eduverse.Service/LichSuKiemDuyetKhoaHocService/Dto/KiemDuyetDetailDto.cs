using Eduverse.Model.Entities;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KiemDuyetDetailDto 
    {
        public Guid IdKhoaHoc { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? CapDo { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? TrangThai { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public bool IsBanHienTai { get; set; } = true;
        public string? CreateBy { get; set; }
        public List<PhanHocDto> PhanHocs { get; set; } = new();
        public List<BaiGiangChoDuyetDto> BaiGiangs { get; set; } = new();
        public List<TaiLieuChoDuyetDto> TaiLieus { get; set; } = new();
    }

    public class BaiGiangChoDuyetDto
    {
        public Guid IdBaiGiang { get; set; }
        public string? TieuDe { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThoiLuong { get; set; }
        public bool? LaBaiGiangFree { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public Guid IdPhan { get; set; }
        public bool IsBanHienTai { get; set; } = true;
        public Guid? IdBanGhiTruoc { get; set; }
    }

    public class TaiLieuChoDuyetDto
    {
        public Guid IdTaiLieu { get; set; }
        public string? LoaiTaiLieu { get; set; }
        public string? TenTaiLieu { get; set; }
        public string? URL { get; set; }
        public string? IdDocument { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public Guid IdBaiGiang { get; set; }
        
    }

}
