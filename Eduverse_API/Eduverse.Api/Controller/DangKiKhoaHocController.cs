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

        [HttpPost("dangki-khoahoc{idKhoaHoc}")]
        public async Task<DataResponse<DangKyKhoaHocMienPhiDto>> DangKyKhoaHocMienPhi(Guid idKhoaHoc, Guid userId)
        {
            try
            {
                var result = await _dangKyKhoaHocService.DangKyKhoaHocMienPhi(idKhoaHoc, userId);
                return DataResponse<DangKyKhoaHocMienPhiDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<DangKyKhoaHocMienPhiDto>.False(ex.Message);
            }
        } 
    }
}
