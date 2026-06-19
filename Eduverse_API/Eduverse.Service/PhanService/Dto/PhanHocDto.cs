using Eduverse.Model.Entities;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.TaiLieuService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService.Dto
{
    public  class PhanHocDto : Phan
    {


        //
        public bool IsDangSua { get; set; }
        public List<BaiGiangDto>? DanhSachBaiGiang { get; set; }
        
    }
}
