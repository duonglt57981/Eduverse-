
using Eduverse.IService.KhoaHocService;
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


        [HttpGet("GetData")]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetData(KhoaHocSearch search)
        {
            var result = await _khoaHocService.GetData(search);

            return DataResponse<PagedList<KhoaHocDto>>.Success(result);
        }


        [HttpGet("GetByIdKhoaHoc")]
        public async Task<DataResponse<KhoaHocDto>> GetByIdKhoaHoc(Guid id)
        {
            try
            {
                await _khoaHocService.GetDetail(id);

                return DataResponse<KhoaHocDto>.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [Authorize]
        [HttpPost("CreateKhoaHoc")]
        public async Task<DataResponse> CreateKhoaHocs(CreateKhoaHocRequest request)
        {
            try
            {
                await _khoaHocService.CreateKhoaHoc(request);

                return DataResponse.Success(null);
            } catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("UpdateKhoaHoc")]
        public async Task<DataResponse> UpdateKhoaHoc(UpdateKhoaHocRequest request, Guid id)
        {
            try
            {
                await _khoaHocService.UpdateKhoaHoc(request, id);

                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }


        [Authorize]
        [HttpDelete("DeleteKhoaHoc")]
        public async Task<DataResponse> DeleteKhoaHoc(Guid id)
        {
            try
            {
                await _khoaHocService.DeleteKhoaHoc(id);

                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }
    }
}
