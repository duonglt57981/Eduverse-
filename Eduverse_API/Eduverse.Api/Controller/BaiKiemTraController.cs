using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using PayOS.Models;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiKiemTraController : ControllerBase
    {
        private readonly IBaiKiemTraService _baiKiemTraSevice;

        public BaiKiemTraController(IBaiKiemTraService baiKiemTraSevice)
        {
            _baiKiemTraSevice = baiKiemTraSevice;
        }


        [HttpPost("BaiKiemTra")]
        public async Task<DataResponse<BaiKiemTraDto>> CreateQuiz( CreateQizzRequest request)
        {
            try
            {
                var result = await _baiKiemTraSevice.CreateQuiz(request);
                return DataResponse<BaiKiemTraDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiKiemTraDto>.False(ex.Message);
            }
        }
    }
}
