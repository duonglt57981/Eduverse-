using Eduverse.Service.DanhGiaService;
using Eduverse.Service.DanhGiaService.Dto;
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
    public class DanhGiaController : EduverseController
    {
        private readonly IDanhGiaService _service;
        public DanhGiaController(IDanhGiaService service) => _service = service;
        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // POST api/danhgia — tạo đánh giá
        [HttpPost]
        public async Task<IActionResult> TaoDanhGia([FromBody] TaoDanhGiaDto dto)
        {
            try
            {
                await _service.TaoDanhGiaAsync(GetUserId(), dto);
                return Ok(DataResponse.Success(null, "Cảm ơn bạn đã đánh giá!"));
            }
            catch (Exception ex)
            {
                return BadRequest(DataResponse.False(ex.Message));
            }
        }

        // GET api/danhgia/khoa-hoc/{id} — lấy đánh giá theo khóa học (không cần đăng nhập)
        [HttpGet("khoa-hoc/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByKhoaHoc(Guid id)
        {
            var result = await _service.GetDanhGiaByKhoaHocAsync(id);
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        // GET api/danhgia/kiem-tra/{idKhoaHoc} — kiểm tra đã đánh giá chưa
        [HttpGet("kiem-tra/{idKhoaHoc}")]
        public async Task<IActionResult> KiemTraDaDanhGia(Guid idKhoaHoc)
        {
            var daDanhGia = await _service.KiemTraDaDanhGiaAsync(GetUserId(), idKhoaHoc);
            var daMua = await _service.KiemTraDaMuaAsync(GetUserId(), idKhoaHoc);
            return Ok(DataResponse.Success(new { daDanhGia, daMua }, "Thành công"));
        }
    }
}
