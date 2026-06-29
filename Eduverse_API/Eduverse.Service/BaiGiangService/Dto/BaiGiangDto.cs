using Eduverse.Model.Entities;
using Eduverse.Service.BaiGiangService.SwapService;
using Eduverse.Service.TaiLieuService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService.Dto
{
    public class BaiGiangDto //: ISwapable<BaiGiangDto>
    {
        public Guid Id { get; set; }
        public Guid IdGoc { get; set; }
        public string? TieuDe { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? IdVideoBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThuTuSapXep { get; set; }
        public int? ThoiLuong { get; set; }
        public bool? LaBaiGiangFree { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public Guid IdPhan { get; set; }
        public List<TaiLieuDto>? DanhSachTaiLieu { get; set; }
        public bool IsDangSua { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public bool IsBanHienTai { get; set; } = true;
        public DateTime CreatedDate { get; set; }


        // Property realtime
        public bool DaHoanThanh { get; set; }
        public int ThoiGianXem { get; set; }

        //public BaiGiangDto MapFromSwap(BaiGiangDto swap)
        //{
        //    return new BaiGiangDto
        //    {
        //        Id = swap.Id,
        //        IdBanGhiTruoc = swap.IdBanGhiTruoc,
        //        IsBanHienTai = swap.IsBanHienTai,
        //        CreatedDate = swap.CreatedDate,
        //        IdPhan = this.IdPhan,  // Giữ nguyên phần học
        //        TieuDe = swap.TieuDe,
        //        LoaiBaiGiang = swap.LoaiBaiGiang,
        //        IdVideoBaiGiang = swap.IdVideoBaiGiang,
        //        URLBaiGiang = swap.URLBaiGiang,
        //        ThuTuSapXep = this.ThuTuSapXep,  // Giữ nguyên thứ tự
        //        ThoiLuong = swap.ThoiLuong,
        //        LaBaiGiangFree = this.LaBaiGiangFree,
        //        DanhSachTaiLieu = this.DanhSachTaiLieu,  // Giữ nguyên tài liệu
        //        DaHoanThanh = this.DaHoanThanh,
        //        ThoiGianXem = this.ThoiGianXem
        //    };
        //}

        //public BaiGiangDto MapFromGoc(BaiGiangDto goc)
        //{
        //    return new BaiGiangDto
        //    {
        //        Id = goc.Id,
        //        IdBanGhiTruoc = goc.IdBanGhiTruoc,
        //        IsBanHienTai = goc.IsBanHienTai,
        //        CreatedDate = goc.CreatedDate,
        //        IdPhan = goc.IdPhan,
        //        TieuDe = goc.TieuDe,
        //        LoaiBaiGiang = goc.LoaiBaiGiang,
        //        IdVideoBaiGiang = goc.IdVideoBaiGiang,
        //        URLBaiGiang = goc.URLBaiGiang,
        //        ThuTuSapXep = goc.ThuTuSapXep,
        //        ThoiLuong = goc.ThoiLuong,
        //        LaBaiGiangFree = goc.LaBaiGiangFree,
        //        DanhSachTaiLieu = goc.DanhSachTaiLieu,
        //        DaHoanThanh = goc.DaHoanThanh,
        //        ThoiGianXem = goc.ThoiGianXem
        //    };
        //}
    }
}
