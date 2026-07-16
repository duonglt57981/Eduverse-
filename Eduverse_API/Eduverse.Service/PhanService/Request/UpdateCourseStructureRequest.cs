using Eduverse.Service.PhanService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Collections.Specialized.BitVector32;

namespace Eduverse.Service.PhanService.Request
{
    public class UpdateCourseStructureRequest
    {
        public Guid IdKhoaHoc { get; set; }
        public List<SectionStructureDto> Sections { get; set; } = [];
    }
}
