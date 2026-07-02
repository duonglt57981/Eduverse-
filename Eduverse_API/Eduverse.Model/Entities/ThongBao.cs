using System.ComponentModel.DataAnnotations;

namespace Eduverse.Model.Entities
{
    public class ThongBao : AuditableEntity
    {
        [Required]
        public string Message { get; set; } = ".";
        public string? Link { get; set; }
        public Guid? FromUser { get; set; }
        public Guid? ToUser { get; set; }
        public bool IsRead { get; set; }

        [MaxLength(250)]
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

        public bool? DaDoc { get; set; }
        public DateTime? ThoiGianDoc { get; set; }
        public DateTime? ThoiGianTao { get; set; } = DateTime.Now;
        public string? TrangThai { get; set; }
        public Guid? IdNguoiDung { get; set; }
    }
}
