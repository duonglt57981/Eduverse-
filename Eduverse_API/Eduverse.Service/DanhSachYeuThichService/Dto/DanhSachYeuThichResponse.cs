using System;

namespace Eduverse.Service.DanhSachYeuThichService.Dto
{
    public class DanhSachYeuThichResponse
    {
        public Guid Id { get; set; }
        public Guid? IdNguoiDung { get; set; }
        public string? TenNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
        public DateTime CreatedDate { get; set; }   // từ AuditableEntity
    }
}