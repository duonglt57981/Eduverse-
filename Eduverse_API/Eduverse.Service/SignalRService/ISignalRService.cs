using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.SignalRService
{
    public interface ISignalRService
    {
        Task NotifyCourseUpdated(Guid courseId);

        Task NotifySectionUpdated(
            Guid courseId,
            Guid sectionId
        );

        Task NotifyLectureUpdated(
            Guid courseId,
            Guid lectureId
        );

        Task NotifyQuizUpdated(
            Guid courseId,
            Guid quizId
        );

        Task NotifyQuestionUpdated(
            Guid courseId,
            Guid questionId
        );

        Task NotifyDocumentUpdated(
            Guid courseId,
            Guid documentId
        );
    }
}
