using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DapAn : AuditableEntity
    {
        public string? NoiDungDapAn { get; set; }
        public bool? LaDapAnDung { get; set; }
        public int? ThuTuSapXep { get; set; }
        public Guid? IdCauHoi { get; set; }
    }
}
