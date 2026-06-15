using Eduverse.Service.TienDoHocTapService;
using Eduverse.Service.TienDoHocTapService.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TienDoHocTapController : ControllerBase
    {
        private readonly ITienDoHocTapService _service;

        public TienDoHocTapController(ITienDoHocTapService service)
        {
            _service = service;
        }

        [HttpPost("updatetiendo-baigiang")]
        public async Task<IActionResult> UpdateVideoProgress(UpdateTienDoBaiGiangRequest request)
        {
            await _service.UpdateTienDoBaiGiang(request);
            return Ok();
        }

        [HttpGet("tiendo-khoahoc{idDangKy}")]
        public async Task<IActionResult> GetTienDoKhoaHoc(Guid idDangKy)
        {
            return Ok(await _service.GetTienDoKhoaHoc(idDangKy));
        }
    }
}
