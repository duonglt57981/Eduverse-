using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Request
{
    public class SubmitAnswerRequest
    {
        public Guid IdCauHoi { get; set; }

        public Guid IdDapAn { get; set; }
    }
}
