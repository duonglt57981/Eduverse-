using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TaiLieuService.Request
{
    public class CreateTaiLieuRequest 
    {
        public string? TenTaiLieu { get; set; }
        public string? TrangThai { get; set; }
        public Guid IdBaiGiang { get; set; }

        public IFormFile Document { get; set; }
    }
}
