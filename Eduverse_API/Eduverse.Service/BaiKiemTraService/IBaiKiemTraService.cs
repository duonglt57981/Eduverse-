using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService
{
    public interface IBaiKiemTraService : IService<Model.Entities.BaiKiemTra>
    {
        Task<BaiKiemTraDto> CreateQuiz(CreateQizzRequest request);

        //Task<bool> UpdateQuiz(Guid id, UpdateQuizDto dto);

        //Task<bool> DeleteQuiz(Guid id);

        //Task<QuizDetailDto> GetQuizDetail(Guid id);

        //Task<QuizLearningDto> GetQuizLearning(Guid idPhan);

        //Task<Guid> StartQuiz(Guid idPhan, Guid userId);

        //Task<QuizResultDto> SubmitQuiz(SubmitQuizDto dto);

        //Task<List<QuizHistoryDto>> GetQuizHistory(Guid userId);

        //Task<QuizResultDto> GetQuizResult(Guid idLanLam);
    }
}
