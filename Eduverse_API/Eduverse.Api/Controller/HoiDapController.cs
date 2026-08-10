using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.HoiDapService;
using Eduverse.Service.HoiDapService.Dto;
using Eduverse.Service.HoiDapService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoiDapController : EduverseController
    {
        private readonly IHoiDapService _service;
        public HoiDapController(IHoiDapService service) => _service = service;

        [HttpGet("danh-sach")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<PagedList<HoiDapDto>>> GetDanhSach(
            [FromQuery] SearchHoiDapRequest request)
        {
            try { return DataResponse<PagedList<HoiDapDto>>.Success(await _service.GetDanhSachCauHoi(request)); }
            catch (Exception ex) { return DataResponse<PagedList<HoiDapDto>>.False(ex.Message); }
        }

        [HttpGet("{idCauHoi}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<HoiDapDto>> GetChiTiet(Guid idCauHoi)
        {
            try { return DataResponse<HoiDapDto>.Success(await _service.GetChiTiet(idCauHoi)); }
            catch (Exception ex) { return DataResponse<HoiDapDto>.False(ex.Message); }
        }

        [HttpPost("dat-cau-hoi")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<HoiDapDto>> DatCauHoi([FromBody] DatCauHoiRequest request)
        {
            try { return DataResponse<HoiDapDto>.Success(await _service.DatCauHoi(request)); }
            catch (Exception ex) { return DataResponse<HoiDapDto>.False(ex.Message); }
        }

        [HttpPost("tra-loi")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<TraLoiDto>> TraLoi([FromBody] TraLoiRequest request)
        {
            try { return DataResponse<TraLoiDto>.Success(await _service.TraLoi(request)); }
            catch (Exception ex) { return DataResponse<TraLoiDto>.False(ex.Message); }
        }

        [HttpPost("{idTraLoi}/like")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<int>> ToggleLike(Guid idTraLoi)
        {
            try { return DataResponse<int>.Success(await _service.ToggleLike(idTraLoi)); }
            catch (Exception ex) { return DataResponse<int>.False(ex.Message); }
        }

        [HttpPut("{idCauHoi}/ghim")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> GhimCauHoi(Guid idCauHoi, [FromQuery] bool ghim)
        {
            try { await _service.GhimCauHoi(idCauHoi, ghim); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        [HttpPut("{idTraLoi}/ghim-tra-loi")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> GhimTraLoi(Guid idTraLoi, [FromQuery] bool ghim)
        {
            try { await _service.GhimTraLoi(idTraLoi, ghim); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        [HttpPut("{idCauHoi}/dong")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> DongCauHoi(Guid idCauHoi, [FromQuery] bool dong)
        {
            try { await _service.DongCauHoi(idCauHoi, dong); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        [HttpDelete("cau-hoi/{idCauHoi}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<string>> XoaCauHoi(Guid idCauHoi)
        {
            try { await _service.XoaCauHoi(idCauHoi); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        [HttpDelete("tra-loi/{idTraLoi}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<string>> XoaTraLoi(Guid idTraLoi)
        {
            try { await _service.XoaTraLoi(idTraLoi); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        [HttpPost("reply")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<TraLoiDto>> Reply([FromBody] ReplyRequest request)
        {
            try { return DataResponse<TraLoiDto>.Success(await _service.Reply(request)); }
            catch (Exception ex) { return DataResponse<TraLoiDto>.False(ex.Message); }
        }

        [HttpGet("giang-vien/danh-sach")]
        [Authorize(Roles = "Admin,GiaoVien")]   
        public async Task<DataResponse<PagedList<HoiDapDto>>> GetDanhSachChoGiangVien(
        [FromQuery] SearchHoiDapRequest request)
        {
            try
            {
                return DataResponse<PagedList<HoiDapDto>>.Success(
                    await _service.GetDanhSachChoGiangVien(request));
            }
            catch (Exception ex) { return DataResponse<PagedList<HoiDapDto>>.False(ex.Message); }
        }

        [HttpPut("{idTraLoi}/top-answer")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> GhimTopAnswer(Guid idTraLoi, [FromQuery] bool ghim)
        {
            try { await _service.GhimTopAnswer(idTraLoi, ghim); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }
    }
}
