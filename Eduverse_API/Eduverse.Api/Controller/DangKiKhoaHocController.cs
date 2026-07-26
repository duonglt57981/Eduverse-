using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.DangKyKhoaHocService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class DangKiKhoaHocController : EduverseController
    {
        private readonly IDangKyKhoaHocService _dangKyKhoaHocService;

        public DangKiKhoaHocController(IDangKyKhoaHocService dangKyKhoaHocService)
        {
            _dangKyKhoaHocService = dangKyKhoaHocService;
        }

        [HttpPost("dangki-khoahoc/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<DangKyKhoaHocMienPhiDto>> DangKyKhoaHocMienPhi(Guid idKhoaHoc)
        {
            try
            {
                var result = await _dangKyKhoaHocService.DangKyKhoaHocMienPhi(idKhoaHoc);
                return DataResponse<DangKyKhoaHocMienPhiDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<DangKyKhoaHocMienPhiDto>.False(ex.Message);
            }
        }

        [HttpGet("by-khoahoc/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<Guid?>> GetIdDangKyByKhoaHoc(Guid idKhoaHoc)
        {
            try
            {
                Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
                var dangKy = await _dangKyKhoaHocService.GetByKhoaHocAndUser(idKhoaHoc, userId);
                if (dangKy == null)
                    return DataResponse<Guid?>.False("Bạn chưa đăng ký khóa học này");
                return DataResponse<Guid?>.Success(dangKy.Id);
            }
            catch (Exception ex)
            {
                return DataResponse<Guid?>.False(ex.Message);
            }
        }
    }
}
