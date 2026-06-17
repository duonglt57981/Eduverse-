using Eduverse.Model.Entities;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KiemDuyetDetailDto : KhoaHoc
    {
        public Guid idDangKiKhoaHoc { get; set; }
        public DateTime? NgayDangKy { get; set; }
        public bool DaDangKy { get; set; }
        public int SoBaiGiangHoanThanh { get; set; }
        public double PhanTramHoanThanh { get; set; }

        public bool IsDangSua { get; set; }
        //thêm list 
        public List<PhanHocDto>? DanhSachPhanHoc { get; set; }
        public List<string>? DanhMucs { get; set; }
    }
}
