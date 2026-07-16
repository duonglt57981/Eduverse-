using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TaiLieuService.Request
{
    public class UpdateTaiLieuRequest
    {
        public Guid? Id { get; set; }
        public string? TenTaiLieu { get; set; }
        public string? URL { get; set; }
        public string? IdDocument { get; set; }
        public string? TrangThai { get; set; }
        public Guid? IdBaiGiang { get; set; }

        public IFormFile Document { get; set; }
    }
}
