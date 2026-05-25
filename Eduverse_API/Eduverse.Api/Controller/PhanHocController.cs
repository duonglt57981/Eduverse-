using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhanHocController : ControllerBase
    {
        private readonly IPhanService _phanHocService;
        public PhanHocController(IPhanService phanHocService)
        {
            _phanHocService = phanHocService;
        }

        [HttpPost("create-phanhoc")]
        public async Task<DataResponse<PhanHocDto>> CreatePhanHoc(CreatePhanRequest request)
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


        [HttpPut("update-phanhoc")]
        public async Task<DataResponse<PhanHocDto>> UpdatePhanHoc(UpdatePhanRequest request)
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


        [HttpDelete("delete-phanhoc")]
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
