using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class GetListSearch : SearchBase
    {
        public string? Keyword { get; set; }
        public int LoaiBan { get; set; } = 0;
        public string? TrangThaiPheDuyet { get; set; }
    }
}
