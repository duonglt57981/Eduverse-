using Eduverse.Service.KhoaHocService;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : ControllerBase
    {
        private readonly IKhoaHocService _khoaHocService;

        public KhoaHocController(IKhoaHocService khoaHocService)
        {
            _khoaHocService = khoaHocService;
        }

        [HttpGet("khoahoc/{userId}")]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetList(
            [FromQuery] KhoaHocSearch search,
            Guid userId)
        {
            try
            {
                var result = await _khoaHocService.GetList(search, userId);
                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }

        [HttpGet("khoahoc-dangki/{userId}")]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetListDangKi(
            [FromQuery] KhoaHocDangKiSearch search,
            Guid userId)
        {
            try
            {
                var result = await _khoaHocService.GetListDangKi(search, userId);

                Console.WriteLine($"PageIndex: {search.PageIndex}");
                Console.WriteLine($"PageSize: {search.PageSize}");
                Console.WriteLine($"UserId: {userId}");

                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }

        //[HttpGet("learning/{idDangKy}")]
        //public async Task<DataResponse<KhoaHocDto>> GetLearning(Guid idDangKy)
        //{
        //    try
        //    {
        //        var result = await _khoaHocService.GetLearning(idDangKy);
        //        return DataResponse<KhoaHocDto>.Success(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        return DataResponse<KhoaHocDto>.False(ex.Message);
        //    }
        //}

        [HttpPost("khoahoc")]
        [Consumes("multipart/form-data")]
        public async Task<DataResponse<KhoaHocDto>> CreateKhoaHoc(
            [FromForm] CreateKhoaHocRequest request)
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

        [HttpPut("khoahoc/{id}")]
        [Consumes("multipart/form-data")]
        public async Task<DataResponse<KhoaHocDto>> UpdateKhoaHoc(
            [FromForm] UpdateKhoaHocRequest request)
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

        [HttpDelete("khoahoc/{id}")]
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