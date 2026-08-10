using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class KhoaHoc : AuditableEntity
    {
        [StringLength(255)]
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public double? Gia { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public double? GiaGoc { get; set; }

        public string? LoaiKhoaHoc { get; set; }

        public string? HinhAnhKhoaHoc { get; set; }

        public string? IdHinhAnhKhoaHoc { get; set; }

        public string? URLViewPreviewKhoaHoc { get; set; }

        public string? CapDo { get; set; }

        public int? TongThoiLuong { get; set; }

        public int? TongBaiGiang { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public DateTime? NgayCapNhat { get; set; }
        public int? SoLuongHocVien { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? TrangThai { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public bool IsBanHienTai { get; set; } = true;
        public Guid? IdLyDoTuChoi { get; set; }
        public Guid? IdNguoiDuyet { get; set; }

    }
}
