using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class UpdateKhoaHocRequest 
    {
        [StringLength(255)]
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Gia { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaGoc { get; set; }

        public string? LoaiKhoaHoc { get; set; }

        public string? HinhAnhKhoaHoc { get; set; }
        public string? URLViewPreviewKhoaHoc { get; set; }
        public string? CapDo { get; set; }

        public int? TongThoiLuong { get; set; }

        public int? TongBaiGiang { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;

        public DateTime? NgayCapNhat { get; set; }

        public int? SoLuongHocVien { get; set; }
        public int? TrangThaiPheDuyet { get; set; }
        public int? TrangThai { get; set; }
    }
}
