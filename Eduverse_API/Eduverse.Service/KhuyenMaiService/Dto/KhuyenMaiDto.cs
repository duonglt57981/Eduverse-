using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhuyenMaiService.Dto
{
    public class KhuyenMaiDto
    {
        public Guid? Id { get; set; }
        public string? MaGiamGia { get; set; }
        public int? PhanTramGiam { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public int? SoLuongHieuLuc { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<KhoaHocMiniDto>? DanhSachKhoaHoc { get; set; }
    }
}
