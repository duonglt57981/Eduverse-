
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        [HttpGet("get-khoahoc")]
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


        [HttpGet("get-learning")]
        public async Task<DataResponse<KhoaHocDto>> GetLearning(Guid idKhoaHoc, Guid idNguoiDung)
        {
            try
            {
                var result = await _khoaHocService.GetLearning(idKhoaHoc, idNguoiDung);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPost("create-khoahoc")]
        public async Task<DataResponse<KhoaHocDto>> CreateKhoaHoc([FromBody] CreateKhoaHocRequest request)
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

        [HttpPut("update-khoahoc")]
        public async Task<DataResponse<KhoaHocDto>> UpdateKhoaHoc(Guid id, [FromBody] UpdateKhoaHocRequest request)
        {
            try
            {
                var result = await _khoaHocService.UpdateKhoaHoc(id, request);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch(Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }

        [HttpDelete("delete-khoahoc")]
        public async Task<DataResponse<bool>> DeleteKhoaHoc(Guid id)
        {
            try
            {
                var result = await _khoaHocService.DeleteKhoaHoc(id);
                return DataResponse<bool>.Success(result);
            }
            catch(Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }

    }
}
