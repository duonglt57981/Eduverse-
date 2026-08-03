using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhGiaService.Dto
{
    public class DanhGiaDto
    {
        public Guid Id { get; set; }
        public int SoSao { get; set; }
        public string? NoiDung { get; set; }
        public DateTime NgayTao { get; set; }
        public Guid? IdNguoiDung { get; set; }
        public string? TenNguoiDung { get; set; }
        public string? AnhDaiDien { get; set; }
    }
    public class TaoDanhGiaDto
    {
        public Guid IdKhoaHoc { get; set; }
        public int SoSao { get; set; }
        public string? NoiDung { get; set; }
    }
    public class DanhGiaKhoaHocDto
    {
        public int TongSoDanhGia { get; set; }
        public double DiemTrungBinh { get; set; }
        public Dictionary<int, int> PhanBoSao { get; set; } = new();
        public List<DanhGiaDto> DanhSach { get; set; } = new();
    }
}
