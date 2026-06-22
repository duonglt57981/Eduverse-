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


        //[HttpGet("kiemduyet-khoahoc-getdetail")]
        //[Authorize(Roles = "Admin")]
        //public async Task<DataResponse<KiemDuyetDetailDto>> GetDetailKiemDuyetKhoaHoc([FromQuery] Guid idKhoaHoc)
        //{
        //    try
        //    {
        //        var result = await _lichSuKiemDuyetKhoaHocService.GetDetailKhoaHocKiemDuyet(idKhoaHoc);
        //        return DataResponse<KiemDuyetDetailDto>.Success(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        return DataResponse<KiemDuyetDetailDto>.False(ex.Message);
        //    }
        //}   


        [HttpPost("kiemduyet-khoahoc")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<KiemDuyetKhoaHocDto>> KiemDuyetKhoaHoc([FromForm] KiemDuyetKhoaHocRequest request)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.KiemDuyetKhoaHoc(request);
                return DataResponse<KiemDuyetKhoaHocDto>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<KiemDuyetKhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPost("kiemduyet-baigiang")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<KiemDuyetKhoaHocDto>> KiemDuyetBaiGiang([FromForm] KiemDuyetKhoaHocRequest request)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.KiemDuyetBaiGiang(request);
                return DataResponse<KiemDuyetKhoaHocDto>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<KiemDuyetKhoaHocDto>.False(ex.Message);
            }
        }


        [HttpGet("kiemduyet-khoahoc-gethistory/{idKhoaHoc}")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<List<LichSuKiemDuyetDto>>> GetLichSuKiemDuyet(Guid idKhoaHoc)
        {
            try
            {
                var result = await _lichSuKiemDuyetKhoaHocService.GetLichSuKiemDuyet(idKhoaHoc);
                return DataResponse<List<LichSuKiemDuyetDto>>.Success(result);

            }
            catch (Exception ex)
            {
                return DataResponse<List<LichSuKiemDuyetDto>>.False(ex.Message);
            }
        }
    } 
}
