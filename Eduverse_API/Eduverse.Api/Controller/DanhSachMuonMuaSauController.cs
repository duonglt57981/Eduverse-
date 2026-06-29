using Eduverse.Service.DanhSachMuonMuaSauService;
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
    public class DanhSachMuonMuaSauController : EduverseController
    {
        private readonly IDanhSachMuonMuaSauService _service;

        public DanhSachMuonMuaSauController(IDanhSachMuonMuaSauService service)
        {
            _service = service;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetDanhSach()
        {
            var result = await _service.GetDanhSachAsync(GetUserId());
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpPost("{khoaHocId}")]
        public async Task<IActionResult> LuuMuaSau(Guid khoaHocId)
        {
            await _service.LuuMuaSauAsync(GetUserId(), khoaHocId);
            return Ok(DataResponse.Success(null, "Đã lưu để mua sau"));
        }

        [HttpDelete("{khoaHocId}")]
        public async Task<IActionResult> XoaKhoiMuaSau(Guid khoaHocId)
        {
            await _service.XoaKhoiMuaSauAsync(GetUserId(), khoaHocId);
            return Ok(DataResponse.Success(null, "Đã xóa"));
        }

        [HttpPost("{khoaHocId}/chuyen-vao-gio-hang")]
        public async Task<IActionResult> ChuyenVaoGioHang(Guid khoaHocId)
        {
            await _service.ChuyenVaoGioHangAsync(GetUserId(), khoaHocId);
            return Ok(DataResponse.Success(null, "Đã chuyển vào giỏ hàng"));
        }
    }
}
