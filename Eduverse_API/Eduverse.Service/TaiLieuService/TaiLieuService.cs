using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace Eduverse.Service.TaiLieuService
{
    public class TaiLieuService : Service<Model.Entities.TaiLieu>, ITaiLieuService
    {
        private readonly IMapper _mapper;
        private IBaiGiangRepository _baiGiangRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPhanRepository _phanRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        public TaiLieuService( 
            IBaiGiangRepository baiGiangRepository,
            ITaiLieuRepository taiLieuRepository,
            IMapper mapper,
            ICloudinaryService cloudinaryService,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            IHttpContextAccessor httpContextAccessor,
            IPhanRepository phanRepository,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository
            ) : base(taiLieuRepository)
        {
            _baiGiangRepository = baiGiangRepository;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _httpContextAccessor = httpContextAccessor;
            _phanRepository = phanRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
        }


        public async Task<List<TaiLieuDto>> GetListForManager(Guid IdBaiGiang)
        {
            // Lấy userId từ token
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            }

            var query = GetQueryable()
                .Where(x => x.CreatedId == userId
                    && x.IdBaiGiang == IdBaiGiang)
                .OrderBy(x => x.CreatedDate)
                .Select(x => new TaiLieuDto
                {
                    Id = x.Id,
                    IdBaiGiang = IdBaiGiang,
                    TenTaiLieu = x.TenTaiLieu,
                    URL = x.URL,
                    TrangThai = x.TrangThai,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,

                });

            return await query.ToListAsync();
        }


        public async Task<TaiLieuDto> CreateTaiLieu(CreateTaiLieuRequest request)
        {
            var baiGiang = await _baiGiangRepository.GetByIdAsync(request.IdBaiGiang);
            if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");

            if (string.IsNullOrWhiteSpace(request.TenTaiLieu))
                throw new Exception("Vui lòng nhập tên tài liệu");

            if (request.Document == null)
                throw new Exception("Vui lòng chọn file tài liệu");

            var uploadResult = await _cloudinaryService.UploadDocumentAsync(request.Document);

            var fileExtension = Path.GetExtension(request.Document.FileName).TrimStart('.').ToUpper();

            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TenTaiLieu);

            var entity = new TaiLieu
            {
                IdBaiGiang = request.IdBaiGiang,
                TenTaiLieu = request.TenTaiLieu.Trim(),
                URL = uploadResult.UrlDoc.Trim(),
                IdDocument = uploadResult.IdDocument,
                LoaiTaiLieu = fileExtension.Trim(),
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua"
            };

            await CreateAsync(entity);
            await SaveAsync();
            return _mapper.Map<TaiLieu, TaiLieuDto>(entity);
        }


        public async Task<TaiLieuDto> UpdateTaiLieu(UpdateTaiLieuRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            var banGoc = await GetAll()
                .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted);

            if (banGoc.TrangThaiPheDuyet == "ChoDuyet")
                throw new Exception("Chuyển sang DangSua để sửa khóa học này!");


            if (banGoc.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception(
                       $"❌ KHÓA HỌC ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
                       $"Hệ thống Eduverses đang kiểm duyệt khóa học này" +
                       $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                       $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
                );

            if (banGoc == null)
                throw new Exception("Không tìm thấy tài liệu");

            if (banGoc.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            // ── Validation ───────────────────────────────────────
            if (string.IsNullOrWhiteSpace(request.TenTaiLieu))
                throw new Exception("Tên khóa học không được để trống");


            

            // ── Upload ảnh nếu có ────────────────────────────────
            string UrlDoc = banGoc.URL;
            string IdDoc = banGoc.IdDocument;

            if (request.Document != null)
            {
                var upload = await _cloudinaryService.UpdateDocumentAsync(request.Document , banGoc.IdDocument);
                if (upload == null)
                    throw new Exception("Upload hình ảnh thất bại");

                UrlDoc = upload.UrlDoc;
                IdDoc = upload.IdDocument;
            }

            if (banGoc.TrangThaiPheDuyet == "DangSua" && banGoc != null)
            {
                banGoc.TenTaiLieu = request.TenTaiLieu.Trim();
                banGoc.IdDocument = IdDoc;
                banGoc.URL = UrlDoc;
                banGoc.TrangThaiPheDuyet = "DangSua";
                banGoc.TrangThai = "DangSua";

                await UpdateAsync(banGoc);
                await SaveAsync();
            }
            else if (banGoc.TrangThaiPheDuyet == "TuChoi" && banGoc != null)
            {
                banGoc.TenTaiLieu = request.TenTaiLieu.Trim();
                banGoc.IdDocument = IdDoc;
                banGoc.URL = UrlDoc;
                banGoc.TrangThaiPheDuyet = "DangSua";
                banGoc.TrangThai = "DangSua";

                await CreateAsync(banGoc);
                await SaveAsync();
            }
            return _mapper.Map<TaiLieu, TaiLieuDto>(banGoc);
        }



        public async Task<bool> DeleteTaiLieu(Guid id)
        {
            var taiLieu = await GetByIdAsync(id);
            if (taiLieu == null)
                throw new Exception("Không tìm thấy bài giảng");


            if (taiLieu.TrangThaiPheDuyet == "ChoDuyet" || taiLieu.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception("Đang gửi duyệt không thể xóa");

            var coNguoiHoc = await (
                 from ph in _phanRepository.GetQueryable()
                 join dk in _dangKyKhoaHocRepository.GetQueryable()
                     on ph.IdKhoaHoc equals dk.IdKhoaHoc
                 join bg in _baiGiangRepository.GetQueryable()
                    on ph.Id equals bg.IdPhan
                 where bg.Id == taiLieu.IdBaiGiang
                 select dk.Id
             ).AnyAsync();

            taiLieu.TrangThai = coNguoiHoc == false ? "DaXoa" : "NgungHoatDong"; // nếu isdele = true + DaXoa  coi như kh ai co thể nhìn thấy(xóa khi chưa có ai đăng kí)
                                                                                  //nếu isdele = true + HoatDong nhưng người đăng kí trước ngày xóa vẫn xem đc

            await DeleteAsync(taiLieu);
            await SaveAsync();
            return true;

        }
    }
}
