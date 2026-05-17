using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DanhMuc_KhoaHoc : AuditableEntity
    {
        public Guid? IdKhoaHoc { get; set; }
        public Guid? IdDanhMuc { get; set; }

    }
}
