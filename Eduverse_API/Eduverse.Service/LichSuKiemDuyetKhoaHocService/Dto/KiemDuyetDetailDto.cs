using Eduverse.Model.Entities;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.DapAnService.Dto;
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
        public List<PhanChoDuyetDto> Phans { get; set; } = new();

    }

    public class PhanChoDuyetDto
    {
        public Guid? Id { get; set; }
        public string? TenPhan { get; set; }

        public string? MieuTa { get; set; }

        public int? ThuTuSapXep { get; set; }

        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public Guid? IdKhoaHoc { get; set; }

        public Guid? IdBanGhiTruoc { get; set; }
        public bool IsBanHienTai { get; set; } = true;

        public List<BaiGiangChoDuyetDto> BaiGiangs { get; set; } = new();
        public List<BaiKiemTraChoDuyetDto> BaiKiemTras { get; set; } = new();
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
        public List<TaiLieuChoDuyetDto> TaiLieus { get; set; } = new();
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

    public class BaiKiemTraChoDuyetDto
    {
        public Guid Id { get; set; }
        public string? TenBaiKiemTra { get; set; }
        public string? MoTa { get; set; }
        public double? DiemDat { get; set; }
        public int? GioiHanThoiGian { get; set; }
        public bool? ChoLamLai { get; set; }
        public int? SoLanLamToiDa { get; set; }
        public Guid? IdPhan { get; set; }
        public int? SoCauHoi { get; set; }
        public bool IsBanHienTai { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }

        public List<CauHoiChoDuyetDto> CauHois { get; set; }

    }

    public class CauHoiChoDuyetDto
    {
        public Guid Id { get; set; }
        public Guid IdBaiKiemTra { get; set; }
        public string TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public string? DoKho { get; set; }
        public string? LoaiCauHoi { get; set; }
        public int? ThuTuSapXep { get; set; }

        public List<DapAnChoDuyetDto> DapAns { get; set; }

    }

    public class DapAnChoDuyetDto
    {
        public Guid Id { get; set; }
        public string? NoiDungDapAn { get; set; }
        public bool? LaDapAnDung { get; set; }
        public int? ThuTuSapXep { get; set; }
        public Guid? IdCauHoi { get; set; }

        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }


        public Guid? IdBanGhiTruoc { get; set; }
        public bool IsBanHienTai { get; set; } = true;

    }
}
