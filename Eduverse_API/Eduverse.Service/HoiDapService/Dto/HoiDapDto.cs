using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.HoiDapService.Dto
{
    public class TraLoiDto
    {
        public Guid Id { get; set; }
        public string NoiDung { get; set; } = string.Empty;
        public bool LaGiangVien { get; set; }
        public bool GhimTraLoi { get; set; }
        public int SoLike { get; set; }
        public bool DaLike { get; set; } 
        public Guid? NguoiTraLoiId { get; set; }
        public string? NguoiTraLoiTen { get; set; }
        public string? NguoiTraLoiAnh { get; set; }
        public DateTime NgayTao { get; set; }
        public bool LaCuaToi { get; set; }
        public List<TraLoiDto> DanhSachReply { get; set; } = new();
    }

    public class HoiDapDto
    {
        public Guid Id { get; set; }
        public Guid? IdBaiGiang { get; set; }
        public string? TenBaiGiang { get; set; }
        public string NoiDung { get; set; } = string.Empty;
        public bool DaGhim { get; set; }
        public bool DaDong { get; set; }
        public int SoTraLoi { get; set; }
        public Guid? NguoiHoiId { get; set; }
        public string? NguoiHoiTen { get; set; }
        public string? NguoiHoiAnh { get; set; }
        public DateTime NgayTao { get; set; }
        public bool LaCuaToi { get; set; }
        public int TongLike { get; set; }
        public List<TraLoiDto> DanhSachTraLoi { get; set; } = new();
    }

    public class AISuggestionDto
    {
        public string NoiDungGoiY { get; set; } = string.Empty;
        public bool CoNoiDungBaiGiang { get; set; }
    }
}
