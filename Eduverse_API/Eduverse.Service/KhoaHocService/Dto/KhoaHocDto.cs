using Eduverse.Model.Entities;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.DanhMucService.Dto;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class KhoaHocDto : KhoaHoc
    {
        public Guid ? idDangKiKhoaHoc { get; set; }
        public DateTime? NgayDangKy { get; set; }
        public bool DaDangKy { get; set; }
        public int SoBaiGiangHoanThanh { get; set; }
        public double PhanTramHoanThanh { get; set; }
        public int TongTaiLieu { get; set; }
        public bool hasDraft { get; set; }
        public Guid? CreatedId { get; set; }
        public int? SoLuongBaiGiang { get; set; }
        public int? SoLuongDanhGia { get; set; }
        public double? DiemDanhGiaTrungBinh { get; set; }

        public AppUser? ThongTinGiangVien { get; set; }
        public List<PhanHocDto>? DanhSachPhanHoc { get; set; }
        public List<DanhMuc_KhoaHocDto>? DanhMucs { get; set; }
        public int SoGiangVien { get; set; }
        public bool LaCongTacVien { get; set; }
        public string? TenGiangVien { get; set; }
        public List<string>? DanhSachGiangVienHienThi { get; set; }
        public List<GiangVienHienThiDto> DanhSachGiangVien { get; set; } = new();
    }

    public class GiangVienNoiBatDto
    {
        public Guid Id { get; set; }
        public string? HoTen { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? TieuSu { get; set; }
        public int SoKhoaHoc { get; set; }
        public int SoHocVien { get; set; }
        public double? DiemDanhGiaTrungBinh { get; set; }
        public int SoLuongDanhGia { get; set; }
    }
}
