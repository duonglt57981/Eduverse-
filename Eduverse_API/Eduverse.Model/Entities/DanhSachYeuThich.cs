using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DanhSachYeuThich : AuditableEntity
    {
        public Guid? IdNguoiDung { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}
