using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Request
{
    public class SubmitQuizRequest
    {
        public Guid IdLanLamBaiKiemTra { get; set; }

        public List<SubmitAnswerRequest> Answers { get; set; } = [];
    }
}
