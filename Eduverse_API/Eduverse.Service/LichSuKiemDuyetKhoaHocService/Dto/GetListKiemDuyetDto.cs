using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class GetListKiemDuyetDto
    {
        public Guid Id { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? CapDo { get; set; }
        public int? TongBaiGiang { get; set; }
        public int? TongQizz { get; set; }
        public int? TongTaiLieu { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? TrangThai { get; set; }

    }
}
