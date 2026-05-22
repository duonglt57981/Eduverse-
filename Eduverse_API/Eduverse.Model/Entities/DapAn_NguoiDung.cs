using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DapAn_NguoiDung : AuditableEntity
    {
        public string? DapAnChon { get; set; }

        public string? DiemDatDuoc { get; set; }
    }
}
