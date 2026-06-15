using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Eduverse.Model.Entities
{
    public class AppUser : IdentityUser<Guid>, IAuditableEntity
    {
        [DisplayName("Họ và tên")]
        public string? HoTen { get; set; } // TenBenhVien -> HoTen

        [DisplayName("Giới tính")]
        public int? GioiTinh { get; set; } // Gender -> GioiTinh

        [DisplayName("Ảnh đại diện")]
        public string? AnhDaiDien { get; set; } // Picture -> AnhDaiDien

        [DisplayName("Chức vụ")]
        public string? ChucVu { get; set; } // Type -> Loai

        [DisplayName("Mã đơn vị bệnh viện")]
        public Guid IdDonVi { get; set; } // IdDepartment -> IdDonVi

        [DisplayName("Địa chỉ")]
        public string? DiaChi { get; set; }

        [DisplayName("Ngày sinh")]
        public DateTime? NgaySinh { get; set; }

        [DisplayName("Tiểu sử cá nhân")]
        public string? TieuSu { get; set; }

        [DisplayName("Ảnh bìa")]
        public string? AnhBia { get; set; }

        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; }
        public Guid? UpdatedId { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedDate { get; set; }
        public Guid? DeletedId { get; set; }
    }
}
