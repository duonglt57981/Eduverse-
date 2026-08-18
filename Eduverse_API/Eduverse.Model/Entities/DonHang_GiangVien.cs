using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DonHang_GiangVien : AuditableEntity
    {
        public Guid IdDonHang { get; set; }
        public Guid? IdDonHangChiTiet { get; set; }
        public Guid IdKhoaHoc { get; set; }
        public Guid IdGiangVien { get; set; }

        public bool LaChuSoHuu { get; set; }
        public int TyLeChiaDoanhThu { get; set; }
        public double GiaLucDat { get; set; }
        public double SoTienGiam { get; set; }
        public double SoTienNhan { get; set; }   
        public DateTime NgayGhiNhan { get; set; }  
    }
}
