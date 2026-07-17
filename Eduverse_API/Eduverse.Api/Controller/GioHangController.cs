
using Eduverse.Service.GioHangService;
using Eduverse.Service.GioHangService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [Authorize(Roles = "HocVien,GiaoVien")]
    [ApiController]
    public class GioHangController : EduverseController
    {
        private readonly IGioHangService _service;

        public GioHangController(IGioHangService service)
        {
            _service = service;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetGioHang()
        {
            var result = await _service.GetGioHangAsync(GetUserId());

            return Ok(DataResponse.Success(
                result,
                "Thành công"
            ));
        }

        [Authorize]
        [HttpPost("{khoaHocId}")]
        public async Task<IActionResult> ThemVao(Guid khoaHocId)
        {
            try
            {
                var request = new GioHangRequest
                {
                    IdNguoiDung = GetUserId(),
                    IdKhoaHoc = khoaHocId
                };

                var result = await _service.ThemVaoGioHangAsync(request);

                return Ok(DataResponse.Success(result, "Đã thêm vào giỏ hàng"));
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(DataResponse.False(ex.Message));
            }
        }

        [HttpDelete("{khoaHocId}")]
        public async Task<IActionResult> XoaKhoi(Guid khoaHocId)
        {
            var result = await _service.XoaKhoiGioHangAsync(
                GetUserId(),
                khoaHocId
            );

            return Ok(DataResponse.Success(
                result,
                "Đã xóa khỏi giỏ hàng"
            ));
        }

        [HttpPut("{khoaHocId}/chon")]
        public async Task<IActionResult> ToggleChon(Guid khoaHocId)
        {
            var result = await _service.ToggleChonAsync(
                GetUserId(),
                khoaHocId
            );

            return Ok(DataResponse.Success(
                result,
                "Thành công"
            ));
        }
    }
}
