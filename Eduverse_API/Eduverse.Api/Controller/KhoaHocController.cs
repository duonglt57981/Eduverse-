using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Eduverse.Service.KhoaHocService.KhoaHocService;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : EduverseController
    {
        private readonly IKhoaHocService _khoaHocService;

        public KhoaHocController(IKhoaHocService khoaHocService)
        {
            _khoaHocService = khoaHocService;
        }


        [HttpGet("khoahoc-list")]
        [AllowAnonymous]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetList([FromQuery] KhoaHocSearch search)
        {
            try
            {
                var result = await _khoaHocService.GetList(search);
                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-by/{userId}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetListByUser([FromQuery] KhoaHocSearch search)
        {
            try
            {
                var result = await _khoaHocService.GetListByUser(search);
                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-dangki")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<PagedList<GetDangKiKhoaHocDto>>> GetListDangKi([FromQuery] KhoaHocDangKiSearch search,
            Guid userId)
        {
            try
            {
                var result = await _khoaHocService.GetListDangKi(search);
                return DataResponse<PagedList<GetDangKiKhoaHocDto>>.Success(result); 
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<GetDangKiKhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-preview/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<KhoaHocDto>> GetKhoaHocPreview( Guid idKhoaHoc)
        {
            try
            {
                var result = await _khoaHocService.GetKhoaHocPreview(idKhoaHoc);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-learning/{idDangKy}")]
        [Authorize(Roles = "Admin,GiaoVien,HocVien")]
        public async Task<DataResponse<KhoaHocDto>> GetLearning(Guid idDangKy)
        {
            try
            {
                var result = await _khoaHocService.GetLearning(idDangKy);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }

        [HttpPost("khoahoc-chuyentrangthai-choduyet-batch/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<KhoaHocDto>> ChuyenTTChoDuyetBatch(Guid idKhoaHoc)
        {
            try
            {
                var result = await _khoaHocService.ChuyenTrangThaiChoDuyet(idKhoaHoc);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }

        [HttpPost("khoahoc-chuyentrangthai-dangsua-batch")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<KhoaHocDto>>> ChuyenTTDangSuaBatch(BatchIdsRequest request)
        {
            try
            {
                var result = await _khoaHocService.ChuyenTrangThaiDangSua(request);
                return DataResponse<List<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<KhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-get-toupdatekhoahoc/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<GetToUpdateKhoaHoc>> GetToUpdateKhoaHoc(Guid  idKhoaHoc)
        {
            try
            {
                var result = await _khoaHocService.GetToUpdateKhoaHoc(idKhoaHoc);
                return DataResponse<GetToUpdateKhoaHoc>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<GetToUpdateKhoaHoc>.False(ex.Message);
            }
        }


        [HttpGet("khoahoc-getlistformanager")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<PagedList<KhoaHocDto>>> GetListForManager([FromQuery] GetListSearch search)
        {
            try
            {
                var result = await _khoaHocService.GetListForManager(search);
                return DataResponse<PagedList<KhoaHocDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<PagedList<KhoaHocDto>>.False(ex.Message);
            }
        }


        [HttpPost("khoahoc-create")]   
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<KhoaHocDto>> CreateKhoaHoc( [FromForm] CreateKhoaHocRequest request)
        {
            try
            {
                var result = await _khoaHocService.CreateKhoaHoc(request);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPut("khoahoc-put")]
        [Consumes("multipart/form-data")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<KhoaHocDto>> UpdateKhoaHoc([FromForm] UpdateKhoaHocRequest request)
        {
            try
            {
                var result = await _khoaHocService.UpdateKhoaHoc(request);
                return DataResponse<KhoaHocDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDto>.False(ex.Message);
            }
        }


        [HttpPost("createfullkhoahocdraft/{IdKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<KhoaHocDraftResultDto>> CreateFullKhoaHocDraft(Guid IdKhoaHoc)
        {
            try
            {
                var result = await _khoaHocService.CreateFullKhoaHocDraft(IdKhoaHoc);
                return DataResponse<KhoaHocDraftResultDto>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<KhoaHocDraftResultDto>.False(ex.Message);
            }
        }


        [HttpDelete("khoahoc-delete/{idKhoaHoc}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<bool>> DeleteKhoaHoc(Guid idKhoaHoc)
        {
            try
            {
                var result = await _khoaHocService.DeleteKhoaHoc(idKhoaHoc);
                return DataResponse<bool>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<bool>.False(ex.Message);
            }
        }

        [HttpGet("khoahoc-getlist-daduyet")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<List<KhoaHocMiniDto>>> GetApprovedListForSelect()
        {
            try
            {
                var result = await _khoaHocService.GetApprovedListForSelect();
                return DataResponse<List<KhoaHocMiniDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<KhoaHocMiniDto>>.False(ex.Message);
            }
        }

        [HttpGet("autocomplete")]
        [AllowAnonymous]
        public async Task<DataResponse<List<string>>> GetSuggestions([FromQuery] string query)
        {
            try
            {
                var result = await _khoaHocService.GetSearchSuggestions(query);
                return DataResponse<List<string>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<string>>.False(ex.Message);
            }
        }

        [HttpPost("sync-elasticsearch")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<string>> SyncElasticsearch()
        {
            try
            {
                await _khoaHocService.SyncElasticsearch();
                return DataResponse<string>.Success("Elasticsearch index populated successfully.");
            }
            catch (Exception ex)
            {
                return DataResponse<string>.False(ex.Message);
            }
        }
    }
}
