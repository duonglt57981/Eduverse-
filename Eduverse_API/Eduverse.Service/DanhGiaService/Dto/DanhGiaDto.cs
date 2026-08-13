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
        public string? HoTenNguoiDung { get; set; }  
        public string? AnhNguoiDung { get; set; }   
        public PhanHoiDanhGiaDto? PhanHoi { get; set; }
    }

    public class PhanHoiDanhGiaDto
    {
        public Guid Id { get; set; }
        public string NoiDung { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
        public string? HoTenGV { get; set; }
        public string? AnhGV { get; set; }
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

    public class TaoPhanHoiDto
    {
        public Guid IdDanhGia { get; set; }
        public string NoiDung { get; set; } = string.Empty;
    }
}
