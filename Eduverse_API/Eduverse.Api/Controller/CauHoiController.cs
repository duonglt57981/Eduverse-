using Eduverse.IService.CauHoi;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.Common;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class CauHoiController : ControllerBase
    {
        private readonly ICauHoiService _cauHoiService;

        public CauHoiController(ICauHoiService cauHoiService)
        {
            _cauHoiService = cauHoiService;
        }


        [HttpGet("GetData")]
        public async Task<DataResponse<PagedList<CauHoiDto>>> GetData(CauHoiSearch search)
        {
            var data = await _cauHoiService.GetData(search);
            return DataResponse<PagedList<CauHoiDto>>.Success(data);
        }

    }
}
