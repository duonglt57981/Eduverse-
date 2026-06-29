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
    public class KiemDuyetDetailDto 
    {
        public Guid IdKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; }
        public string MoTa { get; set; }
        public string TrangThaiPheDuyet { get; set; }
        public List<BaiGiangChoDuyetDto> BaiGiangChoDuyet { get; set; } = new();
        public List<TaiLieuChoDuyetDto> TaiLieuChoDuyet { get; set; } = new();
    }

    public class BaiGiangChoDuyetDto
    {
        public Guid IdBaiGiang { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public string TenBaiGiang { get; set; }
        public string TrangThaiPheDuyet { get; set; }
        public DateTime? NgayGuiDuyet { get; set; }
    }

    public class TaiLieuChoDuyetDto
    {
        public Guid IdTaiLieu { get; set; }
        public Guid? IdBanGhiTruoc { get; set; }
        public string TenTaiLieu { get; set; }
        public string TrangThaiPheDuyet { get; set; }
        public DateTime? NgayGuiDuyet { get; set; }
    }
}
