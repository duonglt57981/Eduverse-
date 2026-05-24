using Eduverse.Model.Entities;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.DanhMucService.Dto;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class KhoaHocDto : KhoaHoc
    {


        //thêm list 
         public List<PhanHocDto>? DanhSachPhanHoc { get; set; }
    }
}
