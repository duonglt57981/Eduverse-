using Eduverse.Service.KhoaHocService.Dto;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class UpdateKhoaHocRequest
    {
        public Guid? IdKhoaHoc { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? CapDo { get; set; }
        public string? TrangThai { get; set; }


        public IFormFile? Img { get; set; }
        public List<Guid>? DanhSachDanhMuc { get; set; }
    }
}
