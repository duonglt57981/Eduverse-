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
        private readonly IPhanService _phanService;
        private readonly IBaiGiangService _baiGiangService;

        public BaiGiangController(IPhanService phanService, IBaiGiangService baiGiangService)
        {
            _phanService = phanService;
            _baiGiangService = baiGiangService;

        }

        [HttpPost("create-baigiang")]
        public async Task<DataResponse<BaiGiangDto>> CreateBaiGiang(CreateBaiGiangRequest request)
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
    }
}
