using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class TienDoHocTap : AuditableEntity
    {
        public int? ThoiGianXem { get; set; }

        public DateTime? LanCuoiXem { get; set; }

        public int? vitrixem { get; set; }

        public DateTime? ThoiGianHoanThanh { get; set; }

        public string? TrangThai { get; set; }
        public Guid? IdCauHoi { get; set; }
        public Guid? IdDangKi { get; set; }
        public Guid? IdBaiGiang { get; set; }
    }
}
