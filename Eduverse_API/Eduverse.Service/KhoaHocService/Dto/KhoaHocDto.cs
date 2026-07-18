using Eduverse.Model.Entities;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.DanhMucService.Dto;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class KhoaHocDto : KhoaHoc
    {
        public Guid idDangKiKhoaHoc { get; set; }
        public DateTime? NgayDangKy { get; set; }
        public bool DaDangKy { get; set; }
        public int SoBaiGiangHoanThanh { get; set; }
        public double PhanTramHoanThanh { get; set; }
        public int TongTaiLieu { get; set; }
        public bool hasDraft { get; set; }
        //thêm list 
        public List<PhanHocDto>? DanhSachPhanHoc { get; set; }
        public List<DanhMuc_KhoaHocDto>? DanhMucs { get; set; }
    }
}
