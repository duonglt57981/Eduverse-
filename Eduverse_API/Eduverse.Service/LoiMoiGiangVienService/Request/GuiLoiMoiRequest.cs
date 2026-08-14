using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LoiMoiGiangVienService.Request
{
    public class GuiLoiMoiRequest
    {
        public Guid IdKhoaHoc { get; set; }
        public string Email { get; set; } = string.Empty;
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }

    public class CapNhatQuyenRequest
    {
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }

    public class CapNhatQuyenNhieuNguoiRequest
    {
        public Guid IdGiangVien { get; set; }
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }

    public class CapNhatQuyenHangLoatItem
    {
        public Guid IdGiangVien { get; set; }
        public bool Visible { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public bool Manage { get; set; }
        public bool Performance { get; set; }
        public bool QnA { get; set; }
        public bool Reviews { get; set; }
        public bool Assignments { get; set; }
        public bool Materials { get; set; }
        public bool Promotions { get; set; }
    }

    public class CapNhatQuyenHangLoatRequest
    {
        public List<CapNhatQuyenHangLoatItem> DanhSach { get; set; } = new();
    }
}
