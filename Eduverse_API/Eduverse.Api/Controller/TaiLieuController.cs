using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiLieuController : EduverseController
    {

        private readonly ITaiLieuService _taiLieuService;

        public TaiLieuController(ITaiLieuService taiLieuService)
        {
            _taiLieuService = taiLieuService;
        }

        [HttpPost("tailieu")]
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<TaiLieuDto>> CreateTaiLieu([FromForm] CreateTaiLieuRequest request)
        {
            try
            {
                var result = await _taiLieuService.CreateTaiLieu(request);
                return DataResponse<TaiLieuDto>.Success(result);
            }
            catch(Exception ex)
            {
                return DataResponse<TaiLieuDto>.False(ex.Message);
            }
        }


        [HttpDelete("tailieu/{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<bool>> DeleteTaiLieu( Guid id)
        {
            try
            {
                var result = await _taiLieuService.DeleteTaiLieu(id);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }
    }
}
