using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DonHangChiTiet : AuditableEntity
    {
        public decimal? GiaLucDat { get; set; }
        public Guid? IdKhoaHoc { get; set; }
        public Guid? IdDonHang { get; set; }
    }
}
