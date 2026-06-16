using Eduverse.Service.KhoaHocService;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : EduverseController
    {
        private readonly IKhoaHocService _khoaHocService;

        public KhoaHocController(IKhoaHocService khoaHocService)
        {
            _khoaHocService = khoaHocService;
        }


        [HttpGet("khoahoc-list")]
        [AllowAnonymous]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetList([FromQuery] KhoaHocSearch search)
        {
            try
            {
                var result = await _khoaHocService.GetList(search);
                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-by/{userId}")]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetListByUser([FromQuery] KhoaHocSearch search,Guid userId)
        {
            try
            {
                var result = await _khoaHocService.GetListByUser(search, userId);
                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-dangki/{userId}")]
        public async Task<DataResponse<PagedList<GetDangKiKhoaHocDto>>> GetListDangKi(
            [FromQuery] KhoaHocDangKiSearch search,
            Guid userId)
        {
            try
            {
                var result = await _khoaHocService.GetListDangKi(search, userId);

                Console.WriteLine($"PageIndex: {search.PageIndex}");
                Console.WriteLine($"PageSize: {search.PageSize}");
                Console.WriteLine($"UserId: {userId}");

                return DataResponse<PagedList<GetDangKiKhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<GetDangKiKhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-learning/{idDangKy}")]
        public async Task<DataResponse<KhoaHocDto>> GetLearning(Guid idDangKy)
        {
            try
            {
                var result = await _khoaHocService.GetLearning(idDangKy);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPost("khoahoc-create")]   
        [Consumes("multipart/form-data")]
        public async Task<DataResponse<KhoaHocDto>> CreateKhoaHoc( [FromForm] CreateKhoaHocRequest request)
        {
            try
            {
                var result = await _khoaHocService.CreateKhoaHoc(request);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPut("khoahoc-put")]
        [Consumes("multipart/form-data")]
        public async Task<DataResponse<KhoaHocDto>> UpdateKhoaHoc([FromForm] UpdateKhoaHocRequest request)
        {
            try
            {
                var result = await _khoaHocService.UpdateKhoaHoc(request);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpDelete("khoahoc-delete/{id}")]
        public async Task<DataResponse<bool>> DeleteKhoaHoc(Guid id)
        {
            try
            {
                var result = await _khoaHocService.DeleteKhoaHoc(id);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }
    }
}