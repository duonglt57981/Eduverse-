using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class LanLamBaiKiemTra : AuditableEntity
    {
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianNop { get; set; }

        public bool? Dat { get; set; } 
        public int? LamLanThu { get; set; }
        public Guid? IdBaiKiemTra { get; set; }
        public Guid? IdNguoiDung { get; set; }

        //thêm
        public string? TrangThai { get; set; }
        public double? TongDiemLanKiemTra { get; set; }
        public double? TongThoiGianDaLam { get; set; }  // Tổng thời gian đã làm (giây)
        public DateTime? ThoiGianTiepTuc { get; set; }  // Thời điểm tiếp tục làm bài
        public DateTime? ThoiGianTamDung { get; set; }  // Thời điểm tạm dừng
        public DateTime? ThoiGianCapNhat { get; set; }  // Thời gian cập nhật cuối
    }
}
