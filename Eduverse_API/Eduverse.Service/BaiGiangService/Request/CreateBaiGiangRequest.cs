using Eduverse.Model.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService.Request
{
    public class CreateBaiGiangRequest : BaiGiang
    {
        public IFormFile Video { get; set; }
    }
}
