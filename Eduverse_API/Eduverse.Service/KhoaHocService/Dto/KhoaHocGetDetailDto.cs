using Eduverse.Model.Entities;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class KhoaHocGetDetailDto : KhoaHoc
    {
        public Guid idDangKiKhoaHoc { get; set; }
        public DateTime? NgayDangKy { get; set; }
        public bool DaDangKy { get; set; }
        public int SoBaiGiangHoanThanh { get; set; }
        public double PhanTramHoanThanh { get; set; }
        public int TongTaiLieu { get; set; }
        public bool hasDraft { get; set; }
        public Guid? CreatedId { get; set; }

        public AppUser? ThongTinGiangVien { get; set; }
        public List<PhanHocDto>? DanhSachPhanHoc { get; set; }
        public List<string>? DanhMucs { get; set; }
        public LichSuKiemDuyetKhoaHoc lichSuKiemDuyetKhoaHoc { get; set; }
    }
}
