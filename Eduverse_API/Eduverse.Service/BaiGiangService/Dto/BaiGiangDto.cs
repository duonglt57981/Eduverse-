using Eduverse.Model.Entities;
using Eduverse.Service.BaiGiangService.SwapService;
using Eduverse.Service.LyDoTuChoiService.Dto;
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
        public bool IsDangSua { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public bool IsBanHienTai { get; set; } = true;
        public DateTime CreatedDate { get; set; }
        public bool DaHoanThanh { get; set; }
        public int ThoiGianXem { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public Guid? IdLyDo { get; set; }
        public LyDoTuChoi? LyDoTuChois { get; set; }
        public List<TaiLieuDto>? DanhSachTaiLieu { get; set; }

    }
}
