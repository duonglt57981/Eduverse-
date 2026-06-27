using Eduverse.Service.CauHoiService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService.Dto
{
    public class ContinueQuizFullDto
    {
        public Guid IdLanLamBaiKiemTra { get; set; }
        public Guid IdBaiKiemTra { get; set; }
        public string TenBaiKiemTra { get; set; }
        public int CurrentQuestionIndex { get; set; }
        public Guid? CurrentQuestionId { get; set; }
        public Dictionary<Guid, List<Guid>> SavedAnswers { get; set; }
        public List<CauHoiLamBaiDto> AllQuestions { get; set; }
        public TienDoQuizDto Progress { get; set; }
        public QuizTimeDto ThoiGian { get; set; }
    }
}
