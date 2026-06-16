using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KhoaHocKiemDuyetSearchDto : SearchBase
    {
        public string? Keyword { get; set; }
    }
}
