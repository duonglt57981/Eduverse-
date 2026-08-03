using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhuyenMaiService;
using Eduverse.Service.KhuyenMaiService.Dto;
using Eduverse.Service.KhuyenMaiService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhuyenMaiController : EduverseController
    {
        private readonly IKhuyenMaiService _khuyenMaiService;

        public KhuyenMaiController(IKhuyenMaiService khuyenMaiService)
        {
            _khuyenMaiService = khuyenMaiService;
        }

        [HttpGet("khuyenmai-getlistall")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<KhuyenMaiDto>>> GetListAll()
        {
            try
            {
                var result = await _khuyenMaiService.GetListAll();
                return DataResponse<List<KhuyenMaiDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<KhuyenMaiDto>>.False(ex.Message);
            }
        }

        [HttpPost("khuyenmai-create")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<KhuyenMaiDto>> CreateKhuyenMai(CreateKhuyenMaiRequest request)
        {
            try
            {
                var isAdmin = User.IsInRole("Admin");

                if (isAdmin && request.PhanTramGiam > 30)
                    return DataResponse<KhuyenMaiDto>.False("Admin chỉ được tạo tối đa 30%");

                if (!isAdmin && request.PhanTramGiam > 100)
                    return DataResponse<KhuyenMaiDto>.False("Phần trăm giảm không được vượt quá 100%");

                if (request.PhanTramGiam <= 0)
                    return DataResponse<KhuyenMaiDto>.False("Phần trăm giảm phải lớn hơn 0%");

                var result = await _khuyenMaiService.CreateKhuyenMai(request);
                return DataResponse<KhuyenMaiDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhuyenMaiDto>.False(ex.Message);
            }
        }

        [HttpPut("khuyenmai-update")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<KhuyenMaiDto>> UpdateKhuyenMai(UpdateKhuyenMaiRequest request)
        {
            try
            {
                var isAdmin = User.IsInRole("Admin");

                if (isAdmin && request.PhanTramGiam > 30)
                    return DataResponse<KhuyenMaiDto>.False("Admin chỉ được tạo tối đa 30%");

                if (!isAdmin && request.PhanTramGiam > 100)
                    return DataResponse<KhuyenMaiDto>.False("Phần trăm giảm không được vượt quá 100%");

                if (request.PhanTramGiam <= 0)
                    return DataResponse<KhuyenMaiDto>.False("Phần trăm giảm phải lớn hơn 0%");

                var result = await _khuyenMaiService.UpdateKhuyenMai(request);
                return DataResponse<KhuyenMaiDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhuyenMaiDto>.False(ex.Message);
            }
        }

        [HttpDelete("khuyenmai-delete/{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<bool>> DeleteKhuyenMai(Guid id)
        {
            try
            {
                var result = await _khuyenMaiService.DeleteKhuyenMai(id);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }

        [HttpGet("khuyenmai-getall-khoahoc-daduyet")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<List<KhoaHocMiniDto>>> GetAllApprovedKhoaHoc()
        {
            try
            {
                var result = await _khuyenMaiService.GetAllApprovedKhoaHocAsync();
                return DataResponse<List<KhoaHocMiniDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<KhoaHocMiniDto>>.False(ex.Message);
            }
        }
    }
}
