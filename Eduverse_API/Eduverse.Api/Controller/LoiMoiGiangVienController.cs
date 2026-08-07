using Eduverse.Service.GioHangService;
using Eduverse.Service.LoiMoiGiangVienService;
using Eduverse.Service.LoiMoiGiangVienService.Dto;
using Eduverse.Service.LoiMoiGiangVienService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoiMoiGiangVienController : ControllerBase
    {
        private readonly ILoiMoiGiangVienService _service;

        public LoiMoiGiangVienController(ILoiMoiGiangVienService service)
        {
            _service = service;
        }


        [HttpGet("cua-toi")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<LoiMoiChoXacNhanDto>>> GetLoiMoiCuaToi()
        {
            try { return DataResponse<List<LoiMoiChoXacNhanDto>>.Success(await _service.GetLoiMoiCuaToi()); }
            catch (Exception ex) { return DataResponse<List<LoiMoiChoXacNhanDto>>.False(ex.Message); }
        }

        // Cập nhật quyền theo idGiangVien
        [HttpPut("khoa-hoc/{idKhoaHoc}/giang-vien/{idGiangVien}/cap-nhat-quyen")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> CapNhatQuyenTheoGiangVien(
            Guid idKhoaHoc, Guid idGiangVien, [FromBody] CapNhatQuyenRequest request)
        {
            try { await _service.CapNhatQuyenTheoGiangVien(idKhoaHoc, idGiangVien, request); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }


        // Hủy/kick theo idGiangVien
        [HttpDelete("khoa-hoc/{idKhoaHoc}/giang-vien/{idGiangVien}/huy")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> HuyTheoGiangVien(Guid idKhoaHoc, Guid idGiangVien)
        {
            try { await _service.HuyTheoGiangVien(idKhoaHoc, idGiangVien); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }


        [HttpPost("gui-loi-moi")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<LoiMoiGiangVienDto>> GuiLoiMoi(
        [FromBody] GuiLoiMoiRequest request)
        {
            try { return DataResponse<LoiMoiGiangVienDto>.Success(await _service.GuiLoiMoi(request)); }
            catch (Exception ex) { return DataResponse<LoiMoiGiangVienDto>.False(ex.Message); }
        }


        [HttpPost("{idLoiMoi}/phan-hoi")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> PhanHoi(Guid idLoiMoi, [FromQuery] bool dongY)
        {
            try { await _service.PhanHoi(idLoiMoi, dongY); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }


        [HttpPut("{idLoiMoi}/cap-nhat-quyen")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> CapNhatQuyen(
        Guid idLoiMoi, [FromBody] CapNhatQuyenRequest request)
        {
            try { await _service.CapNhatQuyen(idLoiMoi, request); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        // ── Chủ sở hữu hủy lời mời theo idLoiMoi ────────────────────────────
        [HttpDelete("{idLoiMoi}/huy")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> HuyLoiMoi(Guid idLoiMoi)
        {
            try { await _service.HuyLoiMoi(idLoiMoi); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }


        [HttpGet("khoa-hoc/{idKhoaHoc}/danh-sach")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<DanhSachGiangVienDto>> GetDanhSachGiangVien(Guid idKhoaHoc)
        {
            try { return DataResponse<DanhSachGiangVienDto>.Success(await _service.GetDanhSachGiangVien(idKhoaHoc)); }
            catch (Exception ex) { return DataResponse<DanhSachGiangVienDto>.False(ex.Message); }
        }


    }
}
