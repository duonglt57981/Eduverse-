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

        [HttpGet("khoa-hoc/{idKhoaHoc}/giang-vien/{idGiangVien}/lich-su-don-hang")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<LichSuNhanTheoDonDto>>> GetLichSuDonHang(Guid idKhoaHoc, Guid idGiangVien)
        {
            try { return DataResponse<List<LichSuNhanTheoDonDto>>.Success(await _service.GetLichSuDonHang(idKhoaHoc, idGiangVien)); }
            catch (Exception ex) { return DataResponse<List<LichSuNhanTheoDonDto>>.False(ex.Message); }
        }

        [HttpGet("khoa-hoc/{idKhoaHoc}/giang-vien/{idGiangVien}/lich-su-ty-le")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<LichSuThayDoiTyLeDto>>> GetLichSuTyLe(Guid idKhoaHoc, Guid idGiangVien)
        {
            try { return DataResponse<List<LichSuThayDoiTyLeDto>>.Success(await _service.GetLichSuThayDoiTyLe(idKhoaHoc, idGiangVien)); }
            catch (Exception ex) { return DataResponse<List<LichSuThayDoiTyLeDto>>.False(ex.Message); }
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

        [HttpPut("khoa-hoc/{idKhoaHoc}/cap-nhat-quyen-hang-loat")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<string>> CapNhatQuyenHangLoat(
        Guid idKhoaHoc, [FromBody] CapNhatQuyenHangLoatRequest request)
        {
            try { await _service.CapNhatQuyenHangLoat(idKhoaHoc, request); return DataResponse<string>.Success("OK"); }
            catch (Exception ex) { return DataResponse<string>.False(ex.Message); }
        }

        [HttpGet("khoa-hoc/{idKhoaHoc}/quyen-cua-toi")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<QuyenCuaToiDto>> GetQuyenCuaToi(Guid idKhoaHoc)
        {
            try { return DataResponse<QuyenCuaToiDto>.Success(await _service.GetQuyenCuaToi(idKhoaHoc)); }
            catch (Exception ex) { return DataResponse<QuyenCuaToiDto>.False(ex.Message); }
        }

        [HttpPost("backfill-don-hang-giang-vien")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Backfill()
        {
            var count = await _service.BackfillDonHangGiangVienAsync();

            return Ok(new
            {
                success = true,
                message = $"Đã backfill {count} bản ghi",
                count
            });
        }
    }
}
