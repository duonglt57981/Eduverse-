using Eduverse.Model.Entities;
using Eduverse.Service.KhoaHocService.Dto;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class CreateKhoaHocRequest 
    {
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public double? Gia { get; set; }
        public double? GiaGoc { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? URLViewPreviewKhoaHoc { get; set; }
        public string? CapDo { get; set; }

        public IFormFile? Img { get; set; }


        // Danh sách danh mục
        public List<Guid>? DanhSachDanhMuc { get; set; }
    }
}
