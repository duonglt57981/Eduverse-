
using Eduverse.IService.KhoaHocService;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : ControllerBase
    {
        private readonly IKhoaHocService _khoaHocService;

        public KhoaHocController(IKhoaHocService khoaHocService)
        {
            _khoaHocService = khoaHocService;
        }

        [HttpGet("get-khoahoc")]
        public async Task<IActionResult> GetList([FromQuery] KhoaHocSearch search)
        {
            var result = await _khoaHocService.GetList(search);
            return Ok(result);
        }


        [HttpGet("get-khoahoc-by-id")]
        public async Task<IActionResult> GetLearning(Guid idKhoaHoc, Guid idNguoiDung)
        {
            var result = await _khoaHocService.GetLearning(idKhoaHoc, idNguoiDung);
            return Ok(result);
        }


        [HttpPost("create-khoahoc")]
        public async Task<IActionResult> CreateKhoaHoc([FromBody] CreateKhoaHocRequest request)
        {
            var result = await _khoaHocService.CreateKhoaHoc(request);
            return Ok(result);

        }
    }
}
