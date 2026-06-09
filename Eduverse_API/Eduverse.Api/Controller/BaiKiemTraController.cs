using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.LanLamBaiKiemTraService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiKiemTraController : ControllerBase
    {
        private readonly IBaiKiemTraService _baiKiemTraService;

        public BaiKiemTraController(
            IBaiKiemTraService baiKiemTraService)
        {
            _baiKiemTraService = baiKiemTraService;
        }

        /// <summary>
        /// Bắt đầu làm bài kiểm tra.
        /// </summary>
        [HttpPost("start")]
        public async Task<DataResponse<Guid>> StartQuiz([FromBody] StartQuizRequest request)
        {
            try
            {
                var result =
                    await _baiKiemTraService.StartQuiz(request);

                return DataResponse<Guid>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<Guid>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy đề thi cho học viên.
        /// </summary>
        [HttpGet("{idBaiKiemTra}/quiz")]
        public async Task<DataResponse<BaiKiemTraLamBaiDto>>GetQuizForStudent(Guid idBaiKiemTra)
        {
            try
            {
                var result = await _baiKiemTraService .GetQuizForStudent(idBaiKiemTra);

                return DataResponse<BaiKiemTraLamBaiDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiKiemTraLamBaiDto>
                    .False(ex.Message);
            }
        }

        /// <summary>
        /// Nộp bài kiểm tra.
        /// </summary>
        [HttpPost("submit")]
        public async Task<DataResponse<KetQuaLanKiemTraDto>> SubmitQuiz([FromBody] SubmitQizRequest request)
        {
            try
            {
                var result = await _baiKiemTraService.SubmitQuiz(request);

                return DataResponse<KetQuaLanKiemTraDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KetQuaLanKiemTraDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy kết quả bài thi.
        /// </summary>
        [HttpGet("result/{idLanLamBai}")]
        public async Task<DataResponse<KetQuaLanKiemTraDto>> GetResult(Guid idLanLamBai)
        {
            try
            {
                var result = await _baiKiemTraService
                        .GetResult(idLanLamBai);

                return DataResponse<KetQuaLanKiemTraDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KetQuaLanKiemTraDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Xem lại bài làm.
        /// </summary>
        [HttpGet("review/{idLanLamBai}")]
        public async Task<DataResponse<ReviewQizzDto>>GetReviewQuiz(Guid idLanLamBai)
        {
            try
            {
                var result = await _baiKiemTraService
                        .GetReviewQuiz(idLanLamBai);

                return DataResponse<ReviewQizzDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<ReviewQizzDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lịch sử làm bài.
        /// </summary>
        [HttpGet("{idBaiKiemTra}/history/{idNguoiDung}")]
        public async Task<DataResponse<List<LichSuLamBaiDto>>> GetHistory(Guid idBaiKiemTra,Guid idNguoiDung)
        {
            try
            {
                var result = await _baiKiemTraService
                        .GetHistory( idBaiKiemTra,idNguoiDung);

                return DataResponse<List<LichSuLamBaiDto>>
                    .Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<LichSuLamBaiDto>>.False(ex.Message);
            }
        }

        /// <summary>
        /// Kiểm tra có được làm lại hay không.
        /// </summary>
        [HttpGet("{idBaiKiemTra}/can-retake/{idNguoiDung}")]
        public async Task<DataResponse<bool>>CheckCanRetake(Guid idBaiKiemTra,Guid idNguoiDung)
        {
            try
            {
                var result = await _baiKiemTraService
                        .CheckCanRetake(idBaiKiemTra,idNguoiDung);

                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }
    }
}