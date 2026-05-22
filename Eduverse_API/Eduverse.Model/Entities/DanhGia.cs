using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class DanhGia : AuditableEntity
    {
        public string? TenDanhMuc { get; set; }
        public string? NoiDung { get; set; }
        public string? TrangThai { get; set; }
    }
}
