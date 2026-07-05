namespace Eduverse.Service.ThongBaoService.Request
{
    public class ThongBaoRequest
    {
        public string? Message { get; set; }
        public string? Link { get; set; }
        public string? FromUser { get; set; }
        public string? ToUser { get; set; }
        public bool? IsRead { get; set; }

        public string? Type { get; set; }
        public bool? SendToFrontEndUser { get; set; }
        public Guid? ItemId { get; set; }
        public string? ItemName { get; set; }
        public Guid? ItemType { get; set; }
        public bool? IsDisplay { get; set; }
        public Guid? DonViId { get; set; }

        public string? Email { get; set; }
        public string? LoaiThongBao { get; set; }
        public string? ProductId { get; set; }
        public string? ProductName { get; set; }

        public string? TieuDe { get; set; }
        public string? NoiDung { get; set; }
        public Guid? NguoiTao { get; set; }
        public string? FileDinhKem { get; set; }
        public bool? IsXuatBan { get; set; }
        public Guid? IdNguoiDung { get; set; }
    }
}
