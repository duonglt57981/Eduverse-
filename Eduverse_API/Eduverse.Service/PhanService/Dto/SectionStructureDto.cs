using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService.Dto
{
    public class SectionStructureDto
    {
        public Guid IdPhan { get; set; }

        public int ThuTuSapXep { get; set; }

        public List<CourseItemDto> Items { get; set; } = [];
    }
}
