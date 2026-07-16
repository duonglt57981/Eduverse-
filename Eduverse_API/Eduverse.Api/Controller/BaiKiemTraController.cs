using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.LanLamBaiKiemTraService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiKiemTraController : EduverseController
    {
        private readonly IBaiKiemTraService _baiKiemTraService;
        private readonly ICauHoiService _cauHoiService;

        public BaiKiemTraController(
            IBaiKiemTraService baiKiemTraService,
            ICauHoiService cauHoiService)
        {
            _baiKiemTraService = baiKiemTraService;
            _cauHoiService = cauHoiService;
        }


        [HttpGet("getlistformanager/{IdPhan}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<BaiKiemTraDto>>> GetListForManager(Guid IdPhan)
        {
            try
            {
                var result = await _baiKiemTraService.GetListForManager(IdPhan);
                return DataResponse<List<BaiKiemTraDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<BaiKiemTraDto>>.False(ex.Message);
            }

        }


        [HttpPost("create")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public  async Task<DataResponse<CreateBaiKiemTraDto>> CreateBaiKiemTra ( CreateBaiKiemTraRequest request)
        {
            try
            {
                var result = await _baiKiemTraService.CreateQuiz(request);
                return DataResponse<CreateBaiKiemTraDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<CreateBaiKiemTraDto>.False(ex.Message);
            }
            
        }


        [HttpPut("update/{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<UpdateBaiKiemTraDto>> UpdateBaiKiemTra([FromBody] UpdateBaiKiemTraRequest request)
        {
            try
            {
                var result = await _baiKiemTraService.UpdateQuiz(request);
                return DataResponse<UpdateBaiKiemTraDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<UpdateBaiKiemTraDto>.False(ex.Message);
            }
        }


        [HttpDelete("delete/{Id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<bool>> DeleteBaiKiemTra( Guid Id)
        {
            try
            {
                var result = await _baiKiemTraService.DeleteQuiz(Id);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }


        //[HttpPost("CauHoi/create-cauhoi")]
        //[Authorize(Roles = "Admin,GiaoVien")]
        //public async Task<DataResponse<CreateCauHoiDto>> CreateCauHoi([FromBody] CreateCauHoiRequest request)
        //{
        //    try
        //    {
        //        var result = await _cauHoiService.CreateQuestion(request);
        //        return DataResponse<CreateCauHoiDto>.Success(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        return DataResponse<CreateCauHoiDto>.False(ex.Message);
        //    }
        //}


        /// <summary>
        /// Bắt đầu làm bài kiểm tra.
        /// </summary>
        [HttpPost("start")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<LanLamBaiKiemTraDto>> StartQuiz([FromBody] StartQuizRequest request)
        {
            try
            {
                var result = await _baiKiemTraService.StartQuiz(request);

                return DataResponse<LanLamBaiKiemTraDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<LanLamBaiKiemTraDto>.False(ex.Message);
            }
        }

        /// <summary>
        /// Lấy đề thi cho học viên.
        /// </summary>
        [HttpGet("{idBaiKiemTra}/quiz")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
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
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
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
        /// Xem lại bài làm.
        /// </summary>
        [HttpGet("review/{idLanLamBai}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
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
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<List<LichSuLamBaiDto>>> GetHistory(Guid idBaiKiemTra)
        {
            try
            {
                var result = await _baiKiemTraService
                        .GetHistory( idBaiKiemTra);

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
        public async Task<DataResponse<bool>>CheckCanRetake(Guid idBaiKiemTra)
        {
            try
            {
                var result = await _baiKiemTraService
                        .CheckCanRetake(idBaiKiemTra);

                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }


        /// <summary>
        /// Auto-save câu trả lời khi học viên chọn đáp án (có kiểm tra thứ tự)
        /// </summary>
        [HttpPost("auto-save")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<AutoSaveDapAnDto>> AutoSaveCauTraLoi([FromBody] AutoSaveRequest request)
        {
            try
            {
                var result = await _baiKiemTraService.AutoSaveCauTraLoi(request);
                return DataResponse<AutoSaveDapAnDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<AutoSaveDapAnDto>.False(ex.Message);
            }
        }


        [HttpPost("heartbeat-timequiz/{idLanLamBaiKiemTra}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<HeartbeatResultDto>> Heartbeat(Guid idLanLamBaiKiemTra)
        {
            try
            {
                var result = await _baiKiemTraService.Heartbeat(idLanLamBaiKiemTra);
                return DataResponse<HeartbeatResultDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<HeartbeatResultDto>.False(ex.Message);
            }
        }


        /// <summary>
        /// Tiếp tục bài làm (khôi phục toàn bộ trạng thái) - gọi khi user vào lại quiz
        /// </summary>
        [HttpGet("continue-full/{idLanLamBaiKiemTra}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<ContinueQuizFullDto>> ContinueQuizFull(Guid idLanLamBaiKiemTra)
        {
            try
            {
                var result = await _baiKiemTraService.ContinueQuizFull(idLanLamBaiKiemTra);
                return DataResponse<ContinueQuizFullDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<ContinueQuizFullDto>.False(ex.Message);
            }
        }



    }
}