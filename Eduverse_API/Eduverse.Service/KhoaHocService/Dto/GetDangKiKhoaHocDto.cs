using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Dto
{
    public class GetDangKiKhoaHocDto
    {
        public Guid? Id { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public string? HinhAnhKhoaHoc { get; set; }
        public string? CapDo { get; set; }
        public int? TongThoiLuong { get; set; }
        public int? TongBaiGiang { get; set; }
        public int? SoLuongHocVien { get; set; }

        //thêm
        public Guid idDangKiKhoaHoc { get; set; }
        public DateTime? NgayDangKy { get; set; }
        public bool DaDangKy { get; set; }
        public int SoBaiGiangHoanThanh { get; set; }
        public double PhanTramHoanThanh { get; set; }
        //thêm list 
        public List<PhanHocDto>? DanhSachPhanHoc { get; set; }
        public List<DanhMuc_KhoaHocDto>? DanhMucs { get; set; }
    }
}
