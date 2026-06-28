namespace Eduverse.Service.ChungChiService.Request
{
    public class ChungChiRequest
    {
        public string? MaSoChungChi { get; set; }
        public string? TenChungChi { get; set; }
        public string? URL_ChungChi { get; set; }
        public DateTime? NgayCap { get; set; }
        public DateTime? NgayHetHan { get; set; }
        public string? TrangThai { get; set; }
        public int? TongThoiGianHoc { get; set; }
        public double? DiemTongKet { get; set; }
        public Guid? IdDangKi { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}