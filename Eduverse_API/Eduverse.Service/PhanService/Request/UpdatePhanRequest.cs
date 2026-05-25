using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService.Request
{
    public class UpdatePhanRequest
    {
        public Guid? Id { get; set; }
        public string? TenPhan { get; set; }
        public string? MieuTa { get; set; }
        public int? ThuTuSapXep { get; set; }
        public Guid? IdKhoaHoc { get; set; }
    }
}
