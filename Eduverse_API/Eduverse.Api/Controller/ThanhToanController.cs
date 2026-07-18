using Eduverse.Service.ThanhToanService;
using Eduverse.Service.ThanhToanService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayOS.Models.Webhooks;
using System.Security.Claims;


namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThanhToanController : EduverseController
    {
        private readonly IThanhToanService _service;
        private readonly IConfiguration _config;
        private readonly PayOS.PayOSClient _payOS;

        public ThanhToanController(IThanhToanService service, IConfiguration config , PayOS.PayOSClient payOS)
        {
            _service = service;
            _config = config;
            _payOS = payOS;
        }

        private Guid GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new UnauthorizedAccessException("User chưa đăng nhập hoặc token không hợp lệ");
            }

            return Guid.Parse(userId);
        }

        [Authorize(Roles = "HocVien")]
        [HttpPost("tao-thanh-toan")]
        public async Task<IActionResult> TaoThanhToan([FromBody] TaoThanhToanDto dto)
        {
            var result = await _service.TaoThanhToanAsync(GetUserId(), dto);

            return Ok(DataResponse.Success(
                result,
                "Tạo thanh toán thành công"
            ));
        }

        [Authorize(Roles = "HocVien")]
        [HttpPost("kiem-tra-ma-giam-gia")]
        public async Task<IActionResult> KiemTraMaGiamGia([FromBody] ApDungMaGiamGiaDto dto)
        {
            var result = await _service.KiemTraMaGiamGiaAsync(dto);
            var soMaHopLe = result.KetQua.Count(k => k.HopLe);
            var thongBao = soMaHopLe > 0
                ? $"Áp dụng thành công {soMaHopLe}/{result.KetQua.Count} mã giảm giá"
                : "Không có mã giảm giá nào áp dụng được";
            return Ok(DataResponse.Success(result, thongBao));
        }
        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] Webhook webhook)
        {
            var success = await _service.XuLyWebhookAsync(webhook);
            return Ok(new { success = true }); 
        }

        [HttpGet("payment-return")]
        public IActionResult PaymentReturn(
            [FromQuery] string code,
            [FromQuery] string orderCode)
        {
            var feUrl = _config["FrontendUrl"] ?? "http://localhost:3000";

            return Redirect(
                $"{feUrl}/payment-result?code={code}&orderCode={orderCode}"
            );
        }

        [HttpGet("payment-cancel")]
        public IActionResult PaymentCancel([FromQuery] string orderCode)
        {
            var feUrl = _config["FrontendUrl"] ?? "http://localhost:3000";

            return Redirect(
                $"{feUrl}/payment-result?code=cancel&orderCode={orderCode}"
            );
        }

        [Authorize(Roles = "HocVien")]
        [HttpGet("don-hang")]
        public async Task<IActionResult> GetDonHang()
        {
            var result = await _service.GetDonHangByUserAsync(GetUserId());

            return Ok(DataResponse.Success(
                result,
                "Thành công"
            ));
        }

        [Authorize(Roles = "HocVien")]
        [HttpGet("don-hang/{id}")]
        public async Task<IActionResult> GetDonHangById(Guid id)
        {
            var result = await _service.GetDonHangByIdAsync(id);

            if (result == null)
            {
                return NotFound(
                    DataResponse.False("Không tìm thấy đơn hàng")
                );
            }

            return Ok(DataResponse.Success(
                result,
                "Thành công"
            ));
        }
        [AllowAnonymous]
[HttpPost("confirm-webhook")]
public async Task<IActionResult> ConfirmWebhook()
{
    var backendUrl = _config["BackendUrl"] ?? "https://eduverseapi-production-5a5e.up.railway.app";
    var result = await _payOS.Webhooks.ConfirmAsync(
        $"{backendUrl}/api/thanhtoan/webhook"
    );
    return Ok(result);
}
    }
}
