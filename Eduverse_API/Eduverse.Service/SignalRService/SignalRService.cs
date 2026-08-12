using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Eduverse.Service.SignalRService
{
    public class SignalRService : ISignalRService
    {
        private readonly IHubContext<SignalRHub> _hubContext;
        private readonly ILogger<SignalRService> _logger;

        public SignalRService(IHubContext<SignalRHub> hubContext, ILogger<SignalRService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task NotifyCourseUpdated(Guid courseId)
        {
            try
            {
                var groupName = $"course_{courseId}";
                await _hubContext.Clients.Group(groupName).SendAsync("CourseUpdated", courseId);
                _logger.LogInformation("[SignalR] Sent CourseUpdated for Course {CourseId}", courseId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SignalR] Failed to send CourseUpdated for Course {CourseId}", courseId);
            }
        }

        public async Task NotifySectionUpdated(Guid courseId, Guid sectionId)
        {
            try
            {
                var groupName = $"course_{courseId}";
                await _hubContext.Clients.Group(groupName).SendAsync("SectionUpdated", courseId, sectionId);
                _logger.LogInformation("[SignalR] Sent SectionUpdated for Course {CourseId}, Section {SectionId}", courseId, sectionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SignalR] Failed to send SectionUpdated for Course {CourseId}", courseId);
            }
        }

        public async Task NotifyLectureUpdated(Guid courseId, Guid lectureId)
        {
            try
            {
                var groupName = $"course_{courseId}";
                await _hubContext.Clients.Group(groupName).SendAsync("LectureUpdated", courseId, lectureId);
                _logger.LogInformation("[SignalR] Sent LectureUpdated for Course {CourseId}, Lecture {LectureId}", courseId, lectureId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SignalR] Failed to send LectureUpdated for Course {CourseId}", courseId);
            }
        }

        public async Task NotifyQuizUpdated(Guid courseId, Guid quizId)
        {
            try
            {
                var groupName = $"course_{courseId}";
                await _hubContext.Clients.Group(groupName).SendAsync("QuizUpdated", courseId, quizId);
                _logger.LogInformation("[SignalR] Sent QuizUpdated for Course {CourseId}, Quiz {QuizId}", courseId, quizId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SignalR] Failed to send QuizUpdated for Course {CourseId}", courseId);
            }
        }

        public async Task NotifyQuestionUpdated(Guid courseId, Guid questionId)
        {
            try
            {
                var groupName = $"course_{courseId}";
                await _hubContext.Clients.Group(groupName).SendAsync("QuestionUpdated", courseId, questionId);
                _logger.LogInformation("[SignalR] Sent QuestionUpdated for Course {CourseId}, Question {QuestionId}", courseId, questionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SignalR] Failed to send QuestionUpdated for Course {CourseId}", courseId);
            }
        }

        public async Task NotifyDocumentUpdated(Guid courseId, Guid documentId)
        {
            try
            {
                var groupName = $"course_{courseId}";
                await _hubContext.Clients.Group(groupName).SendAsync("DocumentUpdated", courseId, documentId);
                _logger.LogInformation("[SignalR] Sent DocumentUpdated for Course {CourseId}, Document {DocumentId}", courseId, documentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SignalR] Failed to send DocumentUpdated for Course {CourseId}", courseId);
            }
        }
    }
}