using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class CauTraLoiSubmitDto
    {
        public Guid IdCauHoi { get; set; }
        public List<Guid> IdDapAnChons { get; set; } = new List<Guid>();
    }
}
