using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiLieuController : ControllerBase
    {

        private readonly ITaiLieuService _taiLieuService;

        public TaiLieuController(ITaiLieuService taiLieuService)
        {
            _taiLieuService = taiLieuService;
        }

        [HttpPost("create-tailieu")]
        public async Task<DataResponse<TaiLieuDto>> CreateTaiLieu(CreateTaiLieuRequest request)
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


        [HttpPut("update-tailieu")]
        public async Task<DataResponse<TaiLieuDto>> UpdateTaiLieu(UpdateTaiLieuRequest request)
        {
            try
            {
                var result = await _taiLieuService.UpdateTaiLieu(request);
                return DataResponse<TaiLieuDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<TaiLieuDto>.False(ex.Message);
            }
        }


        [HttpDelete("delete-tailieu")]
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
