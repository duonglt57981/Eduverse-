using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DanhSachMuonMuaSau : AuditableEntity
    {
        public Guid? IdNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}
