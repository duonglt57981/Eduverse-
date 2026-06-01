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
        public int ThoiGianXem { get; set; }
        public bool DaHoanThanh { get; set; }
        public List<TaiLieuDto>? DanhSachTaiLieu { get; set; }
    }
}
