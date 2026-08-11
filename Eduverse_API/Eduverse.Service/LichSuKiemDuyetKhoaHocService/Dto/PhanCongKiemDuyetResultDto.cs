namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class PhanCongKiemDuyetResultDto
    {
        public Guid IdNguoiDuyet { get; set; }
        public string TenNguoiDuyet { get; set; } = string.Empty;
        public int SoKhoaHocDaPhan { get; set; }
        public List<Guid> DanhSachKhoaHocId { get; set; } = new();
        public DateTime NgayPhanCong { get; set; }
    }
}
