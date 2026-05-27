using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.PhanService;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiGiangController : ControllerBase
    {
        private readonly IBaiGiangService _baiGiangService;

        public BaiGiangController(IPhanService phanService, IBaiGiangService baiGiangService)
        {

            _baiGiangService = baiGiangService;

        }

        [HttpPost("create-baigiang")]
        [RequestSizeLimit(2L * 1024 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 2L * 1024 * 1024 * 1024)]
        [DisableRequestSizeLimit]
        public async Task<DataResponse<BaiGiangDto>> CreateBaiGiang([FromForm] CreateBaiGiangRequest request)
        {
            try
            {
                var result = await _baiGiangService.CreateBaiGiang(request);
                return DataResponse<BaiGiangDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiGiangDto>.False(ex.Message);
            }
        }


        [HttpPut("update-baigiang")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(2147483648)]
        [RequestFormLimits(MultipartBodyLengthLimit = 2147483648)]
        public async Task<DataResponse<BaiGiangDto>> UpdateBaiGiang([FromForm] UpdateBaiGiangRequest request)
        {
            try
            {
                var result = await _baiGiangService.UpdateBaiGiang(request);
                return DataResponse<BaiGiangDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiGiangDto>.False(ex.Message);
            }
        }


        [HttpDelete("delete-baigiang")]
        public async Task<DataResponse<bool>> DeleteBaiGiang(Guid id)
        {
            try
            {
                var result = await _baiGiangService.DeleteBaiGiang(id);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }

    }
}
