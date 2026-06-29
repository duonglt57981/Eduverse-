using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhanHocController : EduverseController
    {
        private readonly IPhanService _phanHocService;
        public PhanHocController(IPhanService phanHocService)
        {
            _phanHocService = phanHocService;
        }

        [HttpGet("\"phanhoc-get-toupdate/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<GetToUpdatePhanDto>> GetToUpdatePhan(Guid IdPhan)
        {
            try
            {
                var result = await _phanHocService.GetToUpdatePhan(IdPhan);
                return DataResponse<GetToUpdatePhanDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<GetToUpdatePhanDto>.False(ex.Message);
            }
        }

        [HttpPost("phanhoc")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<PhanHocDto>> CreatePhanHoc([FromForm] CreatePhanRequest request)
        {
            try
            {
                var result = await _phanHocService.CreatePhanHoc(request);
                return DataResponse<PhanHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PhanHocDto>.False(ex.Message);
            }
        }


        [HttpPut("phanhoc/{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<PhanHocDto>> UpdatePhanHoc([FromForm] UpdatePhanRequest request)
        {
            try
            {
                var result = await _phanHocService.UpdatePhanHoc(request);
                return DataResponse<PhanHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PhanHocDto>.False(ex.Message);
            }
        }


        [HttpDelete("phanhoc/{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<bool>> DeletePhanHoc(Guid id)
        {
            try
            {
                var result = await _phanHocService.DeletePhanHoc(id);
                return DataResponse<bool>.Success(result);
            }
            catch(Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }
    }
}
