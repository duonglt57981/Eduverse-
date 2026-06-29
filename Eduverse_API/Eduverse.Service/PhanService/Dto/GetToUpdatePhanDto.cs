using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService.Dto
{
    public class GetToUpdatePhanDto
    {
        public Guid? Id { get; set; }

        public string? TenPhan { get; set; }

        public string? MieuTa { get; set; }

        public int? ThuTuSapXep { get; set; }
    }
}
