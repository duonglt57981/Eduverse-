using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMucService.Dto
{
    public class DanhMucSearch : SearchBase
    {
        public string? Keyword { get; set; }
        public string? TrangThai { get; set; }
    }
}
