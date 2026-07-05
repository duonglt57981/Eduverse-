using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.PhanService;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiGiangController : EduverseController
    {
        private readonly IBaiGiangService _baiGiangService;

        public BaiGiangController(IPhanService phanService, IBaiGiangService baiGiangService)
        {

            _baiGiangService = baiGiangService;

        }


        [HttpGet("baigiang-getlistformanager/{IdPhan}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<BaiGiangDto>>> GetListForManagerBaiGiang(Guid IdPhan)
        {
            try
            {
                var result = await _baiGiangService.GetListForManager(IdPhan);
                return DataResponse<List<BaiGiangDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<BaiGiangDto>>.False(ex.Message);
            }
        }


        [HttpPost("baigiang-chuyentrangthai-dangsua")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<BaiGiangDto>> ChuyenTTDangSua([FromForm] Guid id)
        {
            try
            {
                var result = await _baiGiangService.ChuyenTrangThaiDangSua(id);
                return DataResponse<BaiGiangDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiGiangDto>.False(ex.Message);
            }
        }


        [HttpPost("baigiang-chuyentrangthai-choduyet")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<BaiGiangDto>> ChuyenTTChoDuyet([FromForm] Guid id)
        {
            try
            {
                var result = await _baiGiangService.ChuyenTrangThaiChoDuyet(id);
                return DataResponse<BaiGiangDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiGiangDto>.False(ex.Message);
            }
        }


        [HttpPost("baigiang-create")]
        [RequestSizeLimit(2L * 1024 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 2L * 1024 * 1024 * 1024)]
        [DisableRequestSizeLimit]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<BaiGiangDto>> CreateBaiGiang( CreateBaiGiangRequest request)
        {
            try
            {
                var result = await _baiGiangService.CreateBaiGiang(request);
                return DataResponse<BaiGiangDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiGiangDto>.False(ex.Message);
            }
        }


        [HttpPut("baigiang-update")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(2147483648)]
        [RequestFormLimits(MultipartBodyLengthLimit = 2147483648)]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<BaiGiangDto>> UpdateBaiGiang( UpdateBaiGiangRequest request)
        {
            try
            {
                var result = await _baiGiangService.UpdateBaiGiang(request);
                return DataResponse<BaiGiangDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<BaiGiangDto>.False(ex.Message);
            }
        }


        [HttpDelete("baigiang-delete/{idBaiGiang}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<bool>> DeleteBaiGiang(Guid idBaiGiang)
        {
            try
            {
                var result = await _baiGiangService.DeleteBaiGiang(idBaiGiang);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }

    }
}
