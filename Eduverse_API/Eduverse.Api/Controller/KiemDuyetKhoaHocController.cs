using CloudinaryDotNet;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
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

        public KiemDuyetKhoaHocController(ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService)
        {
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
        }

        [HttpGet("kiemduyet-khoahoc-getdanhsach")]
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
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


        [HttpPost("kiemduyet-khoahoc")]
        [Authorize(Roles = "Admin")]
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
