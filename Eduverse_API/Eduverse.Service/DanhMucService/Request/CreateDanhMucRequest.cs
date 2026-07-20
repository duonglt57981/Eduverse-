using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMucService.Request
{
    public class CreateDanhMucRequest
    {
        public string? MaDanhMuc { get; set; }

        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        public string? TenDanhMuc { get; set; }

        public string? TrangThai { get; set; }
    }

}