using Eduverse.Model.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService.Request
{
    public class UpdateBaiGiangRequest
    {
        public Guid? IdBaiGiang { get; set; }
        public string? TieuDe { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? IdVideoBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThuTuSapXep { get; set; }
        public bool? LaBaiGiangFree { get; set; } = false;
        public Guid? IdPhan { get; set; }

        //
        public IFormFile? Video { get; set; }
    }
}
