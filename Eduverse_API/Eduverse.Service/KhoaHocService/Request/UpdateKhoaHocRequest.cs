using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class UpdateKhoaHocRequest
    {
        public Guid? Id { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? URLViewPreviewKhoaHoc { get; set; }
        public string? CapDo { get; set; }



        public List<Guid>? DanhSachDanhMuc { get; set; }
    }
}
