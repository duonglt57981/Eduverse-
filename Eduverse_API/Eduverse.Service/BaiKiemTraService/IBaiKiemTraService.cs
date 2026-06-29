using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.Common;
using Eduverse.Service.LanLamBaiKiemTraService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService
{
    public interface IBaiKiemTraService : IService<Model.Entities.BaiKiemTra>
    {
        //Task<GetQuizToLearningDto> GetQuizToLearning(Guid idDangKy);

        Task<CreateBaiKiemTraDto> CreateQuiz(CreateBaiKiemTraRequest request);

        Task<UpdateBaiKiemTraDto> UpdateQuiz(UpdateBaiKiemTraRequest request);

        Task<bool> DeleteQuiz(Guid id);


        /// <summary>
        /// Bắt đầu một lần làm bài kiểm tra mới.
        /// Kiểm tra số lần làm, quyền làm lại và tạo bản ghi LanLamBaiKiemTra.
        /// </summary>
        /// <param name="request">Thông tin bài kiểm tra và người dùng.</param>
        /// <returns>Id của lần làm bài được tạo.</returns>
        Task<LanLamBaiKiemTraDto> StartQuiz(StartQuizRequest request);


        /// <summary>
        /// Lấy danh sách câu hỏi và đáp án của bài kiểm tra cho học viên làm bài.
        /// Không trả về thông tin đáp án đúng.
        /// </summary>
        /// <param name="idBaiKiemTra">Id bài kiểm tra.</param>
        /// <returns>Thông tin bài kiểm tra và danh sách câu hỏi.</returns>
        Task<BaiKiemTraLamBaiDto> GetQuizForStudent(Guid idBaiKiemTra);


        /// <summary>
        /// Nộp bài kiểm tra.
        /// Thực hiện chấm điểm, lưu chi tiết bài làm và cập nhật kết quả lần thi.
        /// </summary>
        /// <param name="request">Danh sách câu trả lời của học viên.</param>
        /// <returns>Kết quả bài thi.</returns>
        Task<KetQuaLanKiemTraDto> SubmitQuiz(SubmitQizRequest request);


        /// <summary>
        /// Xem lại chi tiết bài làm.
        /// Trả về câu hỏi, đáp án đã chọn, đáp án đúng và điểm từng câu.
        /// </summary>
        /// <param name="idLanLamBai">Id lần làm bài.</param>
        /// <returns>Thông tin review bài làm.</returns>
        Task<ReviewQizzDto> GetReviewQuiz(Guid idLanLamBai);


        /// <summary>
        /// Lấy lịch sử các lần làm bài của người dùng đối với một bài kiểm tra.
        /// </summary>
        /// <param name="idBaiKiemTra">Id bài kiểm tra.</param>
        /// <param name="idNguoiDung">Id người dùng.</param>
        /// <returns>Danh sách lịch sử làm bài.</returns>
        Task<List<LichSuLamBaiDto>> GetHistory(Guid idBaiKiemTra);


        /// <summary>
        /// Kiểm tra người dùng có được phép làm lại bài kiểm tra hay không.
        /// Dựa trên cấu hình ChoLamLai và SoLanLamToiDa.
        /// </summary>
        /// <param name="idBaiKiemTra">Id bài kiểm tra.</param>
        /// <param name="idNguoiDung">Id người dùng.</param>
        /// <returns>True nếu được phép làm lại, ngược lại False.</returns>
        Task<bool> CheckCanRetake(Guid idBaiKiemTra);


        /// <summary>
        /// Tự động lưu câu trả lời của học viên khi chọn đáp án (auto-save).
        /// Đồng thời kiểm tra thứ tự làm bài: chỉ cho phép lưu câu hiện tại (câu đầu tiên chưa trả lời)
        /// hoặc câu đã trả lời trước đó, không cho phép bỏ qua câu hỏi.
        /// </summary>
        /// <param name="request">Thông tin lần làm bài, câu hỏi và các đáp án được chọn.</param>
        /// <returns>
        /// - Success: true nếu lưu thành công.
        /// - SoCauDaLam: số câu đã hoàn thành sau khi lưu.
        /// - TongSoCau: tổng số câu hỏi của bài kiểm tra.
        /// - DaHoanThanh: true nếu đã trả lời hết tất cả câu hỏi.
        /// - NextQuestionId: ID của câu hỏi tiếp theo (để FE tự động chuyển).
        /// - ThoiGianConLai: thời gian còn lại (giây) nếu bài có giới hạn thời gian.
        /// - CoGioiHan: true nếu bài kiểm tra có giới hạn thời gian.
        /// - Message: thông báo cho người dùng.
        /// </returns>
        Task<AutoSaveDapAnDto> AutoSaveCauTraLoi(AutoSaveRequest request);



        Task<HeartbeatResultDto> Heartbeat(Guid idLanLamBaiKiemTra);


        /// <summary>
        /// Tiếp tục bài làm đang dở, khôi phục toàn bộ trạng thái: câu trả lời đã lưu,
        /// vị trí câu hỏi đang làm dở, thời gian còn lại. Gọi khi học viên vào lại bài kiểm tra
        /// sau khi đã tạm dừng hoặc thoát đột ngột.
        /// </summary>
        /// <param name="idLanLamBaiKiemTra">ID của lần làm bài cần tiếp tục.</param>
        /// <returns>
        /// - IdLanLamBaiKiemTra, IdBaiKiemTra, TenBaiKiemTra: thông tin cơ bản.
        /// - CurrentQuestionIndex, CurrentQuestionId: vị trí câu hỏi đang làm dở.
        /// - SavedAnswers: Dictionary<IdCauHoi, List<IdDapAnChon>> – các đáp án đã chọn.
        /// - AllQuestions: danh sách câu hỏi kèm đáp án (để hiển thị toàn bộ đề).
        /// - Progress: số câu đã làm, tổng số câu, phần trăm, đã hoàn thành hay chưa.
        /// - ThoiGian: thời gian bắt đầu, thời gian đã làm, thời gian còn lại, có giới hạn hay không.
        /// </returns>
        Task<ContinueQuizFullDto> ContinueQuizFull(Guid idLanLamBaiKiemTra);
    }
}
