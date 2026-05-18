using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class BaiGiang : AuditableEntity
    {
        public string? TieuDe { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThuTuSapXep { get; set; }
        public int? ThoiLuong { get; set; }
        public bool? LaBaiGiangFree { get; set; }
        public int? TrangThai { get; set; }
        public Guid? IdPhan { get; set; }
    }
}
