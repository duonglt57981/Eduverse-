using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ThongBaoController : ControllerBase
    {
        private readonly IRepository<ThongBao> _repo;
        public ThongBaoController(IRepository<ThongBao> repo) => _repo = repo;
        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetCuaToi()
        {
            var result = await _repo.GetQueryable()
                .Where(t => t.IdNguoiDung == GetUserId())
                .OrderByDescending(t => t.ThoiGianTao)
                .Take(50)
                .ToListAsync();
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAdmin()
        {
            var result = await _repo.GetQueryable()
                .Where(t => t.IdNguoiDung == null)
                .OrderByDescending(t => t.ThoiGianTao)
                .ToListAsync();
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpGet("chua-doc")]
        public async Task<IActionResult> GetSoChuaDoc()
        {
            var count = await _repo.GetQueryable()
                .CountAsync(t => t.IdNguoiDung == GetUserId() && t.DaDoc == false);
            return Ok(DataResponse.Success(count, "Thành công"));
        }

        [HttpPut("{id}/da-doc")]
        public async Task<IActionResult> DanhDauDaDoc(Guid id)
        {
            var tb = await _repo.GetByIdAsync(id);
            if (tb == null) return NotFound();
            tb.DaDoc = true;
            tb.ThoiGianDoc = DateTime.Now;
            tb.UpdatedDate = DateTime.Now;
            _repo.Update(tb);
            await _repo.SaveAsync();
            return Ok(DataResponse.Success(null, "Đã đọc"));
        }

        [HttpPut("doc-tat-ca")]
        public async Task<IActionResult> DocTatCa()
        {
            var list = await _repo.GetQueryable()
                .Where(t => t.IdNguoiDung == GetUserId() && t.DaDoc == false)
                .ToListAsync();
            foreach (var tb in list)
            {
                tb.DaDoc = true;
                tb.ThoiGianDoc = DateTime.Now;
                tb.UpdatedDate = DateTime.Now;
                _repo.Update(tb);
            }
            await _repo.SaveAsync();
            return Ok(DataResponse.Success(null, "Đã đọc tất cả"));
        }
    }

}
