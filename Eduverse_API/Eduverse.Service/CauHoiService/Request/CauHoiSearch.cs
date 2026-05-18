using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Service.Dto;

namespace Eduverse.Service.CauHoiService.Request
{
    public class CauHoiSearch : SearchBase
    {
        public string NoiDung { get; set; }
        public int? BaiGiangId { get; set; }

    }
}
