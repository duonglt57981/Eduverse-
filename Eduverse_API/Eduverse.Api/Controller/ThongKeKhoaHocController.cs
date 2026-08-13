using Eduverse.Service.ThongKeKhoaHocService;
using Eduverse.Service.ThongKeKhoaHocService.Dto;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThongKeKhoaHocController : EduverseController
    {
        private readonly IThongKeKhoaHocService _service;
        public ThongKeKhoaHocController(IThongKeKhoaHocService service) => _service = service;

        [HttpGet("{idKhoaHoc}/doanh-thu")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<ThongKeDoanhThuDto>> GetDoanhThu(Guid idKhoaHoc)
        {
            try { return DataResponse<ThongKeDoanhThuDto>.Success(await _service.GetThongKeDoanhThu(idKhoaHoc)); }
            catch (Exception ex) { return DataResponse<ThongKeDoanhThuDto>.False(ex.Message); }
        }

        [HttpGet("{idKhoaHoc}/hoc-vien")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<ThongKeHocVienDto>> GetHocVien(Guid idKhoaHoc, [FromQuery] int? nam)
        {
            try { return DataResponse<ThongKeHocVienDto>.Success(await _service.GetThongKeHocVien(idKhoaHoc, nam)); }
            catch (Exception ex) { return DataResponse<ThongKeHocVienDto>.False(ex.Message); }
        }

        [HttpGet("{idKhoaHoc}/bai-giang")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<BaiGiangEngagementDto>>> GetBaiGiang(Guid idKhoaHoc)
        {
            try { return DataResponse<List<BaiGiangEngagementDto>>.Success(await _service.GetThongKeBaiGiang(idKhoaHoc)); }
            catch (Exception ex) { return DataResponse<List<BaiGiangEngagementDto>>.False(ex.Message); }
        }

        [HttpGet("{idKhoaHoc}/engagement")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<CourseEngagementDto>> GetEngagement(Guid idKhoaHoc)
        {
            try { return DataResponse<CourseEngagementDto>.Success(await _service.GetCourseEngagement(idKhoaHoc)); }
            catch (Exception ex) { return DataResponse<CourseEngagementDto>.False(ex.Message); }
        }
    }
}
