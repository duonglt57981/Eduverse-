using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhuyenMaiService.Request
{
    public class CreateKhuyenMaiRequest
    {
        public string? MaGiamGia { get; set; }
        public int? PhanTramGiam { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public int? SoLuongHieuLuc { get; set; }
        public List<Guid>? IdsKhoaHoc { get; set; }
    }

    public class UpdateKhuyenMaiRequest
    {
        public Guid? Id { get; set; }
        public string? MaGiamGia { get; set; }
        public int? PhanTramGiam { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public int? SoLuongHieuLuc { get; set; }
        public List<Guid>? IdsKhoaHoc { get; set; }
    }
}
