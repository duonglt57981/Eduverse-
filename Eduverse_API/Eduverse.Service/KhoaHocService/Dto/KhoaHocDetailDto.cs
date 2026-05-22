using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class KhoaHocDetailDto
    {
        public string? TieuDeKhoaHoc { get; set; }
        public string? MoTa { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public double? Gia { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public double? GiaGoc { get; set; }

        public string? LoaiKhoaHoc { get; set; }

        public string? HinhAnhKhoaHoc { get; set; }
        public string? URLViewPreviewKhoaHoc { get; set; }
        public string? CapDo { get; set; }

        public int? TongThoiLuong { get; set; }

        public int? TongBaiGiang { get; set; }



        public string? TenPhan { get; set; }
        public string? MieuTa { get; set; }
        public int? ThuTuSapXepPhanHoc { get; set; }


        public string? TieuDeBaiGiang { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? IdVideoBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThuTuSapXepBaiGiang { get; set; }
        public int? ThoiLuong { get; set; }
        public bool? LaBaiGiangFree { get; set; }


        public string? LoaiTaiLieu { get; set; }
        public string? TenTaiLieu { get; set; }
        public string? URL { get; set; }
    }
}
