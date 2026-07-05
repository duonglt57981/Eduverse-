using Eduverse.Service.Dto;

namespace Eduverse.Service.ThongBaoService.Request
{
    public class ThongBaoSearch : SearchBase
    {
        public string? Keyword { get; set; }
        public string? LoaiThongBao { get; set; }
        public string? Type { get; set; }
        public Guid? IdNguoiDung { get; set; }
        public Guid? FromUser { get; set; }
        public Guid? ToUser { get; set; }
        public bool? IsRead { get; set; }
        public bool? IsDisplay { get; set; }
        public bool? IsXuatBan { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
