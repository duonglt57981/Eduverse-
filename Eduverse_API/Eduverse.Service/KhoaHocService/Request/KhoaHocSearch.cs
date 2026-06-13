using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class KhoaHocSearch : SearchBase
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 12;
        public string? Keyword { get; set; }
        public string? CapDo { get; set; }
        public Guid? DanhMucId { get; set; }
        public string? LoaiKhoaHoc { get; set; }
        public double? GiaTu { get; set; }
        public double? GiaDen { get; set; }
        public string? TrangThai { get; set; }
        public Guid? GiangVienId { get; set; }
    }
}
