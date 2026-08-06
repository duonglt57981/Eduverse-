using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LoiMoiGiangVien : AuditableEntity
    {
        public Guid IdKhoaHoc { get; set; }

        // Người gửi lời mời (luôn là CreatedId của KhoaHoc)
        public Guid IdNguoiMoi { get; set; }

        // Người được mời — resolve từ email sang Guid khi tạo lời mời
        public Guid IdNguoiDuocMoi { get; set; }

        [MaxLength(256)]
        public string EmailDuocMoi { get; set; } = string.Empty;

        // "Pending" | "Accepted" | "Rejected"
        [MaxLength(50)]
        public string TrangThai { get; set; } = "Pending";

        public DateTime? NgayPhanHoi { get; set; }

        // ── Quyền đề xuất khi gửi lời mời ─────────────────────────────
        // Người tạo set ngay lúc mời; khi Accepted thì copy sang KhoaHoc_GiangVien
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }  // 0-100, tổng tất cả GV ≤ 100
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }
}
