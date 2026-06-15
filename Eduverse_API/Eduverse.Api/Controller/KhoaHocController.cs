using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : EduverseController
    {
        private readonly IKhoaHocService _service;

        public KhoaHocController(IKhoaHocService service)
        {
            _service = service;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] KhoaHocQueryDto query)
        {
            var result = await _service.GetPagedAsync(query);
            return Ok(DataResponse.Success(
                result,
                "Lấy danh sách thành công"
            ));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            Guid? userId = null;
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdClaim, out var uid)) userId = uid;

            var result = await _service.GetByIdAsync(id, userId);
            if (result == null)
            {
                return NotFound(DataResponse.False("Không tìm thấy khóa học"));
            }

            return Ok(DataResponse.Success(
                result,
                "Thành công"
            ));
        }

        [Authorize(Roles = "GiaoVien,Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateKhoaHocDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.TaoKhoaHocAsync(dto, userId);
            return Ok(DataResponse.Success(
                result,
                "Tạo khóa học thành công"
            ));
        }

        [Authorize(Roles = "GiaoVien,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateKhoaHocDto dto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.CapNhatKhoaHocAsync(id, dto, userId);
            return Ok(DataResponse.Success(
                result,
                "Cập nhật thành công"
            ));
        }

        [Authorize(Roles = "GiaoVien,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var khoahoc = await _service.GetByIdAsync(id);

            if (khoahoc == null)
            {
                return NotFound(DataResponse.False("Không tìm thấy khóa học để xóa"));
            }
            await _service.DeleteAsync(khoahoc);
            return Ok(DataResponse.Success(
                null,
                "Xóa thành công"
            ));
        }

        [HttpGet("danh-muc")]
        public async Task<IActionResult> GetDanhMuc()
        {
            var result = await _service.GetAllDanhMucAsync();
            return Ok(DataResponse.Success(
                result,
                "Thành công"
            ));
        }

        [Authorize]
        [HttpPost("{id}/yeu-thich")]
        public async Task<IActionResult> ToggleYeuThich(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _service.ToggleYeuThichAsync(userId, id);
            return Ok(DataResponse.Success(
                null,
                "Thành công"
            ));
        }

        [Authorize]
        [HttpGet("yeu-thich")]
        public async Task<IActionResult> GetYeuThich([FromQuery] KhoaHocSearch search)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.GetYeuThichAsync(userId, search);
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpGet("search")]
        public async Task<IActionResult> GetData([FromQuery] KhoaHocSearch search)
        {
            Guid? userId = null;
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(claim, out var uid)) userId = uid;

            var result = await _service.GetDataAsync(search, userId);
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpGet("{id}/detail")]
        public async Task<IActionResult> GetChiTiet(Guid id)
        {
            Guid? userId = null;
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(claim, out var uid)) userId = uid;

            var result = await _service.GetChiTietAsync(id, userId);
            if (result == null) return NotFound(DataResponse.False("Không tìm thấy"));
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [Authorize]
        [HttpGet("da-dang-ky")]
        public async Task<IActionResult> GetDaDangKy([FromQuery] KhoaHocSearch search)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _service.GetKhoaHocDaDangKyAsync(userId, search);
            return Ok(DataResponse.Success(result, "Thành công"));
        }
    }
}
