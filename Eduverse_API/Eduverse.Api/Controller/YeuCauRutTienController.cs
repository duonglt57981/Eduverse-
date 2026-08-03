using Eduverse.Service.YeuCauRutTienService;
using Eduverse.Service.YeuCauRutTienService.Dto;
using Eduverse.Service.YeuCauRutTienService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class YeuCauRutTienController : EduverseController
    {
        private readonly IYeuCauRutTienService _service;
        public YeuCauRutTienController(IYeuCauRutTienService service) => _service = service;
        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("so-du")]
        public async Task<IActionResult> GetSoDu()
        {
            var soDu = await _service.GetSoDuAsync(GetUserId());
            return Ok(DataResponse.Success(soDu, "Thành công"));
        }

        [HttpGet("cua-toi")]
        public async Task<IActionResult> GetCuaToi()
        {
            var result = await _service.GetByUserAsync(GetUserId());
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpPost]
        public async Task<IActionResult> TaoYeuCau([FromBody] TaoYeuCauRutTienDto dto)
        {
            try
            {
                await _service.TaoYeuCauAsync(GetUserId(), dto);
                return Ok(DataResponse.Success(null, "Đã gửi yêu cầu rút tiền"));
            }
            catch (Exception ex)
            {
                return BadRequest(DataResponse.False(ex.Message));
            }
        }

        // Admin only
        [HttpGet("tat-ca")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpPut("{id}/xu-ly")]
        public async Task<IActionResult> XuLy(Guid id, [FromBody] XuLyYeuCauDto dto)
        {
            await _service.XuLyYeuCauAsync(id, dto);
            return Ok(DataResponse.Success(null, "Đã xử lý yêu cầu"));
        }

        [HttpPost("gui-otp")]
        public async Task<IActionResult> GuiOtp([FromBody] GuiOtpRutTienRequest request)
        {
            try
            {
                await _service.GuiOtpAsync(GetUserId(), request);
                return Ok(DataResponse.Success(null, "Đã gửi mã OTP đến email của bạn"));
            }
            catch (Exception ex)
            {
                return BadRequest(DataResponse.False(ex.Message));
            }
        }

        [HttpDelete("{id}/huy")]
        public async Task<IActionResult> HuyYeuCau(Guid id)
        {
            try
            {
                await _service.HuyYeuCauAsync(id, GetUserId());
                return Ok(DataResponse.Success(null, "Đã hủy yêu cầu và hoàn tiền"));
            }
            catch (Exception ex)
            {
                return BadRequest(DataResponse.False(ex.Message));
            }
        }
    }

}
