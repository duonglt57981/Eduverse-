namespace Eduverse.Model.Entities
{
    public class PhanCongKiemDuyetKhoaHoc : AuditableEntity
    {
        public Guid IdKhoaHoc { get; set; }
        public Guid IdNguoiDuyet { get; set; }
        public Guid IdNguoiPhanCong { get; set; }
        public DateTime NgayPhanCong { get; set; }
    }
}
