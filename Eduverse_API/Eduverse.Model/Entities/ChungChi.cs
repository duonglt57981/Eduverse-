using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class ChungChi : AuditableEntity
    {
        public string? MaSoChungChi { get; set; }
        public string? TenChungChi { get; set; }
        public string? URL_ChungChi { get; set; }

        public DateTime? NgayCap { get; set; }

        public DateTime? NgayHetHan { get; set; }

        public string? TrangThai { get; set; }
        public int? TongThoiGianHoc { get; set; }

        public double? DiemTongKet { get; set; }

        public DateTime? NgayTao { get; set; } = DateTime.Now;
        public Guid? IdDangKi { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}
