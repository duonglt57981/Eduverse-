using Eduverse.Service.Common;
using Eduverse.Service.Dto;

namespace Eduverse.Service.DanhSachYeuThichService.Request
{
    public class DanhSachYeuThichSearch : SearchBase
    {
        public Guid? IdNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public string? TenKhoaHoc { get; set; }
    }
}