using Eduverse.Service.NganHangService;
using Eduverse.Service.NganHangService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NganHangController : EduverseController
    {
        private readonly INganHangService _service;
        public NganHangController(INganHangService service) => _service = service;
        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetMyNganHang()
        {
            var result = await _service.GetByUserAsync(GetUserId());
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> Tao([FromBody] TaoNganHangDto dto)
        {
            var result = await _service.TaoNganHangAsync(GetUserId(), dto);
            return Ok(DataResponse.Success(result, "Đã thêm tài khoản ngân hàng"));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Xoa(Guid id)
        {
            await _service.XoaNganHangAsync(id, GetUserId());
            return Ok(DataResponse.Success(null, "Đã xóa"));
        }
    }
}