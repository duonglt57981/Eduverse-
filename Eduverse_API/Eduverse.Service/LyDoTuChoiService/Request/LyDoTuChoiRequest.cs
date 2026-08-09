using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LyDoTuChoiService.Request
{
    public class LyDoTuChoiRequest
    {
        public Guid? Id { get; set; }
        public Guid? IdDoiTuong { get; set; }
        public string? LoaiDoiTuong { get; set; }
        public string? LyDo { get; set; }
    }
}
