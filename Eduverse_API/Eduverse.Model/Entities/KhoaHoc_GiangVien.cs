using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class KhoaHoc_GiangVien : AuditableEntity
    {
        public Guid IdKhoaHoc { get; set; }
        public Guid IdGiangVien { get; set; }

        // true = người tạo khóa học gốc
        public bool LaChuSoHuu { get; set; }

        // Hiển thị công khai trên trang khóa học
        public bool Visible { get; set; }

        // 0-100 (%), tổng tất cả GV trong 1 khóa ≤ 100
        public int TyLeChiaDoanhThu { get; set; }

        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }
}
