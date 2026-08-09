using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LyDoTuChoiService.Dto
{
    public class LyDoTuChoiDto
    {
        public Guid? Id { get; set; }
        public Guid? IdDoiTuong { get; set; }
        public string? LoaiDoiTuong { get; set; }
        public string? LyDo { get; set; }
        public string? TrangThai { get; set; }
        public Guid? CreatedId { get; set; }
    }
}
