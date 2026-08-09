using CloudinaryDotNet;
using Eduverse.Model.Entities;
using Eduverse.Service.AppUserService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using Eduverse.Service.LyDoTuChoiService;
using Eduverse.Service.LyDoTuChoiService.Dto;
using Eduverse.Service.LyDoTuChoiService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KiemDuyetKhoaHocController : EduverseController
    {
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;
        private readonly ILyDoTuChoiService _lyDoTuChoiService;

        public KiemDuyetKhoaHocController(ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService, ILyDoTuChoiService lyDoTuChoiService)
        {
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _lyDoTuChoiService = lyDoTuChoiService;
        }

        [HttpGet("kiemduyet-khoahoc-getdanhsach")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<PagedList<KhoaHocKiemDuyetListDto>>> GetListKiemDuyetKhoaHoc([FromQuery] KhoaHocKiemDuyetSearchDto search)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.GetDanhSachKiemDuyet(search);
                return DataResponse<PagedList<KhoaHocKiemDuyetListDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocKiemDuyetListDto>>.False(ex.Message);
            }
        }


        [HttpGet("kiemduyet-khoahoc-getdetail/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<KiemDuyetDetailDto>> GetDetailKiemDuyetKhoaHoc( Guid idKhoaHoc)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.GetDetailKiemDuyet(idKhoaHoc);
                return DataResponse<KiemDuyetDetailDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KiemDuyetDetailDto>.False(ex.Message);
            }
        }

        [HttpGet("kiemduyet-list-gethistory")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<PagedList<KhoaHocKiemDuyetListDto>>> GetListLichSuKiemDuyet([FromQuery]  KhoaHocKiemDuyetSearchDto search)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.GetListLichSuKiemDuyet(search);
                return DataResponse< PagedList<KhoaHocKiemDuyetListDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse< PagedList<KhoaHocKiemDuyetListDto>>.False(ex.Message);
            }
        }

        [HttpGet("kiemduyet-detail-gethistory/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<KiemDuyetDetailDto>> GetDetailLichSuKiemDuyet(Guid idKhoaHoc)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.GetDetailLichSuKiemDuyet(idKhoaHoc);
                return DataResponse<KiemDuyetDetailDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KiemDuyetDetailDto>.False(ex.Message);
            }
        }


        [HttpGet("kiemduyet-list-nhanvienkiemduyet")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<PagedList<NhanVienPheDuyetDto>>> GetNhanVienPheDuyet([FromQuery] NhanVienSearch search)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.GetNhanVienPheDuyet(search);
                return DataResponse<PagedList<NhanVienPheDuyetDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<NhanVienPheDuyetDto>>.False(ex.Message);
            }
        }


        [HttpPut("kiemduyet-phankhoahoc/{idNguoiDuyet}")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<List<KhoaHocDto>>> KiemDuyetKhoaHoc(Guid idNguoiDuyet,[FromBody] List<Guid> danhSachKhoaHocId)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.PhanDuyetKhoaHoc(idNguoiDuyet, danhSachKhoaHocId);
                return DataResponse< List<KhoaHocDto>>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<List<KhoaHocDto>>.False(ex.Message);
            }
        }



        [HttpPost("kiemduyet-khoahoc")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<KiemDuyetKhoaHocDto>> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.KiemDuyetFullKhoaHoc(request);
                return DataResponse<KiemDuyetKhoaHocDto>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<KiemDuyetKhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPost("kiemduyet-createlydo")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<LyDoTuChoiDto>> CreateLyDoTuChoi(LyDoTuChoiRequest request)
        {
            try
            {
                var result = await _lyDoTuChoiService.CreateLyDoTuChoi(request);
                return DataResponse<LyDoTuChoiDto>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<LyDoTuChoiDto>.False(ex.Message);
            }
        }


        [HttpPut("kiemduyet-updatelydo")]
        [Authorize(Roles = "Admin,personnel")]
        public async Task<DataResponse<LyDoTuChoiDto>> UpdateLyDoTuChoi(LyDoTuChoiRequest request)
        {
            try
            {
                var result = await _lyDoTuChoiService.UpdateLyDoTuChoi(request);
                return DataResponse<LyDoTuChoiDto>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<LyDoTuChoiDto>.False(ex.Message);
            }
        }

        //[HttpPost("kiemduyet-baigiang")]
        //[Authorize(Roles = "Admin")]
        //public async Task<DataResponse<KiemDuyetKhoaHocDto>> KiemDuyetBaiGiang([FromForm] KiemDuyetKhoaHocRequest request)
        //{
        //    try
        //    {
        //        var result = await _lichSuKiemDuyetKhoaHocService.KiemDuyetBaiGiang(request);
        //        return DataResponse<KiemDuyetKhoaHocDto>.Success(result);

        //    }
        //    catch (Exception ex)
        //    {
        //        return DataResponse<KiemDuyetKhoaHocDto>.False(ex.Message);
        //    }
        //}


        //[HttpPost("kiemduyet-tailieu")]
        //[Authorize(Roles = "Admin")]
        //public async Task<DataResponse<KiemDuyetKhoaHocDto>> KiemDuyetTaiLieu([FromForm] KiemDuyetKhoaHocRequest request)
        //{
        //    try
        //    {
        //        var result = await _lichSuKiemDuyetKhoaHocService.KiemDuyetTaiLieu(request);
        //        return DataResponse<KiemDuyetKhoaHocDto>.Success(result);

        //    }
        //    catch (Exception ex)
        //    {
        //        return DataResponse<KiemDuyetKhoaHocDto>.False(ex.Message);
        //    }
        //}
    } 
}
