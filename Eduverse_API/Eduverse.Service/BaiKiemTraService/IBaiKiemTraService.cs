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
        Task<CreateBaiKiemTraDto> CreateQuiz(CreateBaiKiemTraRequest request);

        Task<Guid> UpdateQuiz(UpdateBaiKiemTraRequest request);

        Task<bool> DeleteQuiz(Guid id);

        /// <summary>
        /// Bắt đầu một lần làm bài kiểm tra mới.
        /// Kiểm tra số lần làm, quyền làm lại và tạo bản ghi LanLamBaiKiemTra.
        /// </summary>
        /// <param name="request">Thông tin bài kiểm tra và người dùng.</param>
        /// <returns>Id của lần làm bài được tạo.</returns>
        Task<Guid> StartQuiz(StartQuizRequest request);


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
        /// Lấy kết quả của một lần làm bài.
        /// Bao gồm điểm số, số câu đúng và trạng thái đạt.
        /// </summary>
        /// <param name="idLanLamBai">Id lần làm bài.</param>
        /// <returns>Kết quả bài thi.</returns> 
        Task<KetQuaLanKiemTraDto> GetResult(Guid idLanLamBai);


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
        Task<List<LichSuLamBaiDto>> GetHistory(Guid idBaiKiemTra, Guid idNguoiDung);


        /// <summary>
        /// Kiểm tra người dùng có được phép làm lại bài kiểm tra hay không.
        /// Dựa trên cấu hình ChoLamLai và SoLanLamToiDa.
        /// </summary>
        /// <param name="idBaiKiemTra">Id bài kiểm tra.</param>
        /// <param name="idNguoiDung">Id người dùng.</param>
        /// <returns>True nếu được phép làm lại, ngược lại False.</returns>
        Task<bool> CheckCanRetake(Guid idBaiKiemTra, Guid idNguoiDung);
    }
}
