using Eduverse.Api.Controller;
using Eduverse.IService.DanhSachYeuThichService;
using Eduverse.Service.DanhSachYeuThichService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Eduverse.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhSachYeuThichController : EduverseController
    {
        private readonly IDanhSachYeuThichService _service;

        public DanhSachYeuThichController(IDanhSachYeuThichService service)
        {
            _service = service;
        }

        [HttpGet("get-data")]
        public async Task<DataResponse<object>> GetData([FromQuery] DanhSachYeuThichSearch search)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    search.IdNguoiDung = Guid.Parse(userId);
                }
                var result = await _service.GetData(search);
                return DataResponse<object>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False(ex.Message);
            }
        }
        [HttpPost("them")]
        public async Task<DataResponse<object>> ThemYeuThich([FromQuery] Guid khoaHocId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return DataResponse<object>.False("Không xác định được người dùng.");

                var result = await _service.ThemYeuThich(Guid.Parse(userId), khoaHocId);
                if (result == null)
                    return DataResponse<object>.False("Đã tồn tại yêu thích này.");
                return DataResponse<object>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False(ex.Message);
            }
        }

        [HttpDelete("xoa-theo-id/{id}")]
        public async Task<DataResponse<object>> XoaTheoId(Guid id)
        {
            try
            {
                var result = await _service.XoaYeuThich(id);
                if (result == null)
                    return DataResponse<object>.False("Không tìm thấy yêu thích cần xóa.");
                return DataResponse<object>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False(ex.Message);
            }
        }

        [HttpDelete("xoa-theo-khoahoc/{khoaHocId}")]
        public async Task<DataResponse<object>> XoaTheoKhoaHoc(Guid khoaHocId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return DataResponse<object>.False("Không xác định được người dùng.");

                var userGuid = Guid.Parse(userId);
                var yeuThich = await _service.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdNguoiDung == userGuid && x.IdKhoaHoc == khoaHocId && !x.IsDeleted);

                if (yeuThich == null)
                    return DataResponse<object>.False("Không tìm thấy yêu thích cần xóa.");

                var result = await _service.XoaYeuThich(yeuThich.Id);
                return DataResponse<object>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False(ex.Message);
            }
        }
    }
}