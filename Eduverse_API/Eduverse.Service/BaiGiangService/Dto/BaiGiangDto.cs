using Eduverse.Model.Entities;
using Eduverse.Service.TaiLieuService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService.Dto
{
    public class BaiGiangDto : BaiGiang
    {
        //
        public List<TaiLieuDto>? DanhSachTaiLieu { get; set; }
    }
}
