using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.LyDoTuChoiService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class BaiKiemTraDto
    {
        public Guid Id { get; set; }
        public Guid IdGoc { get; set; }
        public string? TenBaiKiemTra { get; set; }
        public string? MoTa { get; set; }
        public double? DiemDat { get; set; }
        public int? GioiHanThoiGian { get; set; }
        public bool? ChoLamLai { get; set; }
        public int? SoLanLamToiDa { get; set; }
        public Guid? IdPhan { get; set; }
        public int? SoCauHoi { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsBanHienTai { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public bool IsSwap { get; set; }
        public int? ThuTuSapXep { get; set; }
        public LyDoTuChoiDto? LyDoTuChois { get; set; }
        public List<CauHoiDto> DanhSachCauHois { get; set; }
    }
}
