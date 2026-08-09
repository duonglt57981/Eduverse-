using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LyDoTuChoiRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.BunnyService;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


namespace Eduverse.Service.BaiGiangService
{
    public class BaiGiangService : Service<Model.Entities.BaiGiang>, IBaiGiangService
    {
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IPhanRepository _phanRepository;
        private readonly IMapper _mapper; 
        private readonly IDangKyKhoaHocRepository _dangkyKhoaHocRepository;
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IBunnyService _bunnyService;
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly ILyDoTuChoiRepository _lyDoTuChoiRepository;

        public BaiGiangService(
            IBaiGiangRepository baiGiangRepository,
            ICloudinaryService cloudinaryService,
            IPhanRepository phanRepository,
            IMapper mapper,
            IDangKyKhoaHocRepository dangkyKhoaHocRepository,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            IHttpContextAccessor httpContextAccessor,
            IBunnyService bunnyService,
            IKhoaHoc_GiangVienRepository khoaHocGVRepository,
            IKhoaHocRepository khoaHocRepository,
            ILyDoTuChoiRepository lyDoTuChoiRepository
            ) : base(baiGiangRepository)
        {
            _cloudinaryService = cloudinaryService;
            _phanRepository = phanRepository;
            _mapper = mapper;
            _dangkyKhoaHocRepository = dangkyKhoaHocRepository;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _httpContextAccessor = httpContextAccessor;
            _bunnyService = bunnyService;
            _lyDoTuChoiRepository = lyDoTuChoiRepository;
            _khoaHocGVRepository = khoaHocGVRepository;
            _khoaHocRepository = khoaHocRepository;
        }


        public async Task<List<BaiGiangDto>> GetListForManager(Guid IdPhan)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            }

            var query = GetQueryable()
                .Where(x => x.IdPhan == IdPhan && !x.IsDeleted)
                .AsNoTracking() 
                .OrderBy(x => x.ThuTuSapXep ?? 0) 
                .Select(x => new BaiGiangDto
                {
                    Id = x.Id,
                    IdPhan = x.IdPhan, 
                    TieuDe = x.TieuDe,
                    LoaiBaiGiang = x.LoaiBaiGiang,
                    ThuTuSapXep = x.ThuTuSapXep,
                    URLBaiGiang = x.URLBaiGiang,
                    LaBaiGiangFree = x.LaBaiGiangFree,
                    ThoiLuong = x.ThoiLuong,
                    TrangThai = x.TrangThai,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    IsBanHienTai = x.IsBanHienTai,
                    IdBanGhiTruoc = x.IdBanGhiTruoc
                });

            return await query.ToListAsync();
        }


        public async Task<BaiGiangDto> ChuyenTrangThaiChoDuyet(Guid IdBaiGiang)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            if (IdBaiGiang == Guid.Empty)
                throw new Exception("Id khóa học không hợp lệ");

            var banGoc = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == IdBaiGiang && !x.IsDeleted);

            if (banGoc == null)
                throw new Exception("Không tìm thấy khóa học");

            var coQuyen = await CoQuyenQuaPhan(banGoc.IdPhan, nguoiTao, gv => gv.Manage);
            if (!coQuyen)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            var banCanXuLy = await GetAll()
                .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id
                                        && !x.IsDeleted
                                        && x.TrangThaiPheDuyet == "DangSua");

            if (banCanXuLy == null && banGoc.TrangThaiPheDuyet == "DangSua")
                banCanXuLy = banGoc;

            if (banCanXuLy == null)
                throw new Exception("Bài giảng hiện không ở trạng thái Đang sửa nên không thể gửi CHỜ DUYỆT");

            banCanXuLy.TrangThaiPheDuyet = "ChoDuyet";
            banCanXuLy.TrangThai = "ChoDuyet";
            banCanXuLy.UpdatedDate = DateTime.UtcNow;

            await UpdateAsync(banCanXuLy);
            await SaveAsync();

            return _mapper.Map<BaiGiang, BaiGiangDto>(banCanXuLy);
        }

        public async Task<BaiGiangDto> CreateBaiGiang(CreateBaiGiangRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.IdPhan == null)
                throw new Exception("Id phần học không hợp lệ");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            if (request.Video == null)
                throw new Exception("Vui lòng chọn video");

            var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
            if (phanHoc == null)
                throw new Exception("Không tìm thấy phần học");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTaoBaiGiang);

            var coQuyen = await CoQuyenQuaPhan(request.IdPhan.Value, nguoiTaoBaiGiang, gv => gv.Manage);
            if (!coQuyen)
                throw new Exception("Bạn không có quyền hạn để thêm bài giảng vào phần học này!");

            var uploadResult = await _bunnyService.UploadVideoAsync(request.Video);

            int thoiLuongBaiGiang = (int)uploadResult.Duration;

            var entity = new BaiGiang
            {
                IdPhan = request.IdPhan.Value,
                TieuDe = request.TieuDe.Trim(),
                LoaiBaiGiang = request.Video == null ? "Bài giảng tài liệu" : "Bài giảng video",
                IdVideoBaiGiang = uploadResult.Id,
                URLBaiGiang = uploadResult.Url.Trim(),
                ThuTuSapXep = request.ThuTuSapXep,
                ThoiLuong = thoiLuongBaiGiang,
                LaBaiGiangFree = request.LaBaiGiangFree,
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua",
                IsBanHienTai = true,
            };

            await CreateAsync(entity);
            await SaveAsync();

            return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
        }


        public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            var banGoc = await GetQueryable()
               .FirstOrDefaultAsync(x => x.Id == request.IdBaiGiang && x.IsBanHienTai);

            if (banGoc == null)
                throw new Exception("Không tim thấy bài giảng");

            var coQuyen = await CoQuyenQuaPhan(banGoc.IdPhan, nguoiTao, gv => gv.Manage);
            if (!coQuyen)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            if (banGoc.TrangThaiPheDuyet == "ChoDuyet")
                throw new Exception("Chuyển sang DangSua để sửa khóa học này!");

            if (banGoc.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception(
                   $"❌ BÀI GIANG ĐANG ĐƯỢC KIỂM DUYỆT!\n" +
                   $"Hệ thống Eduverses đang kiểm duyệt bài giảng này" +
                   $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                   $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin ."
               );

            if (banGoc.TrangThaiPheDuyet == "DaDuyet")
                throw new Exception("Khóa học đang ở chế độ Đã Duyệt không thể sửa");

            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");


            var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                    x.IdPhan == request.IdPhan &&
                    x.ThuTuSapXep == request.ThuTuSapXep &&
                    x.Id != request.IdBaiGiang &&
                    !x.IsDeleted);

            if (thuTuDaTon)
                throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại");



            string video = banGoc.URLBaiGiang;
            string idVideo = banGoc.IdVideoBaiGiang;
            int? thoiLuong = banGoc.ThoiLuong;

            if (request.Video != null)
            {
                //var upload = await _bunnyService.UpdateVideoAsync(idVideo,request.Video);
                //if (upload == null)
                //    throw new Exception("Upload hình ảnh thất bại");

                //video = upload.Url;
                //idVideo = upload.Id;
                //thoiLuong = upload.Duration;

                var upload = await _bunnyService.UploadVideoAsync(request.Video);
                if (upload == null)
                    throw new Exception("Upload hình ảnh thất bại");

                video = upload.Url;
                idVideo = upload.Id;
                thoiLuong = upload.Duration;

            }
            //else if (request.Video != null )
            //{
            //    var upload = await _bunnyService.UploadVideoAsync(request.Video);
            //    if (upload == null)
            //        throw new Exception("Upload hình ảnh thất bại");

            //    video = upload.Url;
            //    idVideo = upload.Id;
            //    thoiLuong = upload.Duration;
            //}

            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TieuDe);

            if((banGoc.TrangThaiPheDuyet == "DangSua") && banGoc.IsBanHienTai == true && banGoc != null)
            {
                banGoc.TieuDe = request.TieuDe;
                banGoc.ThuTuSapXep = request.ThuTuSapXep == null? banGoc.ThuTuSapXep : request.ThuTuSapXep;
                banGoc.LaBaiGiangFree = request.LaBaiGiangFree;
                banGoc.IdVideoBaiGiang = idVideo;
                banGoc.URLBaiGiang = video;
                banGoc.ThoiLuong = thoiLuong;
                banGoc.LoaiBaiGiang = thoiLuong == null ? "Bài giảng tài liệu" : "Bài giảng video";
                banGoc.IsPendingSwap = false;
                banGoc.TrangThai = "DangSua";
                banGoc.TrangThaiPheDuyet = "DangSua";
                banGoc.ThuTuSapXep = request.ThuTuSapXep;

                

                await UpdateAsync(banGoc);
                await SaveAsync();
                return _mapper.Map<BaiGiang, BaiGiangDto>(banGoc);
            }

            var banNhap = await GetAll()
               .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id
                                       && !x.IsDeleted
                                       && (x.TrangThaiPheDuyet == "ChoDuyet"
                                           || x.TrangThaiPheDuyet == "DaDuyet"
                                           || x.TrangThaiPheDuyet == "TuChoi"
                                           || x.TrangThaiPheDuyet == "DangDuyet"
                                           || x.TrangThaiPheDuyet == "DangSua"));

            if(banNhap != null && banNhap.TrangThaiPheDuyet == "DangSua" )
            {
                var coQuyenBanNhap = await CoQuyenQuaPhan(banNhap.IdPhan, nguoiTao, gv => gv.Manage);
                if (!coQuyenBanNhap)
                    throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

                if (banNhap.TrangThaiPheDuyet == "ChoDuyet")
                    throw new Exception("Chuyển sang DangSua để sửa khóa học này!");

                if (banNhap.TrangThaiPheDuyet == "DangDuyet")
                    throw new Exception(
                           $"❌ KHÓA HỌC ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
                           $"Hệ thống Eduverses đang kiểm duyệt khóa học này" +
                           $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                           $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
                    );

                banNhap.IdBanGhiTruoc = banGoc.Id;
                banNhap.TieuDe = request.TieuDe;
                banNhap.ThuTuSapXep = request.ThuTuSapXep == 0 ? banGoc.ThuTuSapXep : request.ThuTuSapXep;
                banNhap.LaBaiGiangFree = request.LaBaiGiangFree;
                banNhap.IdVideoBaiGiang = idVideo;
                banNhap.URLBaiGiang = video;
                banNhap.ThoiLuong = thoiLuong;
                banNhap.LoaiBaiGiang = thoiLuong == null ? "Bài giảng tài liệu" : "Bài giảng video";
                banNhap.IsPendingSwap = false;
                banNhap.IsBanHienTai = false;




                await UpdateAsync(banNhap);
                await SaveAsync();
            }
            else if(banGoc.TrangThaiPheDuyet != "DangSua" || banNhap.TrangThaiPheDuyet != "DangSua")
            {
                var banNhapBaiGiang = new BaiGiang
                {
                    IdBanGhiTruoc = banGoc.Id,
                    TieuDe = request.TieuDe,
                    ThuTuSapXep = request.ThuTuSapXep == 0 ? banGoc.ThuTuSapXep : request.ThuTuSapXep,
                    LaBaiGiangFree = request.LaBaiGiangFree,
                    IdVideoBaiGiang = idVideo,
                    URLBaiGiang = video,
                    ThoiLuong = thoiLuong,
                    LoaiBaiGiang = thoiLuong == null ? "Bài giảng tài liệu" : "Bài giảng video",
                    IsPendingSwap = false,
                    TrangThai = "DangSua",
                    TrangThaiPheDuyet = "DangSua",
                    IsBanHienTai = false
                    
                };

                await CreateAsync(banNhapBaiGiang);
                await SaveAsync();
            }

            

            return _mapper.Map<BaiGiang, BaiGiangDto>(banNhap);
        }


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            var baiGiang = await GetByIdAsync(id);
            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiXoaBaiGiang);

            var coQuyen = await CoQuyenQuaPhan(baiGiang.IdPhan, nguoiXoaBaiGiang, gv => gv.Manage);
            if (!coQuyen)
                throw new Exception("Bạn không có quyền hạn để xóa bài giảng này!");

            if (baiGiang.TrangThaiPheDuyet == "ChoDuyet" || baiGiang.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception("Đang gửi duyệt không thể xóa");

            var coNguoiHoc = await (
                 from ph in _phanRepository.GetQueryable()
                 join dk in _dangkyKhoaHocRepository.GetQueryable()
                     on ph.IdKhoaHoc equals dk.IdKhoaHoc
                 where ph.Id == baiGiang.IdPhan
                 select dk.Id
             ).AnyAsync();

            baiGiang.TrangThai = coNguoiHoc == false ? "DaXoa" : "NgungHoatDong";

            await DeleteAsync(baiGiang);
            await SaveAsync();
            return true;
        }
        // ── Helper: kiểm tra chủ sở hữu HOẶC cộng tác viên có quyền trên khóa học ──
        private async Task<bool> CoQuyenTrenKhoaHoc(Guid idKhoaHoc, Guid userId, Func<KhoaHoc_GiangVien, bool> capQuyenCuThe = null)
        {
            var khoaHoc = await _khoaHocRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc);
            if (khoaHoc == null) return false;
            if (khoaHoc.CreatedId == userId) return true;

            var thanhVien = await _khoaHocGVRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == userId && !x.IsDeleted);
            if (thanhVien == null) return false;
            if (thanhVien.LaChuSoHuu) return true;

            return capQuyenCuThe == null || capQuyenCuThe(thanhVien);
        }

        private async Task<bool> CoQuyenQuaPhan(Guid idPhan, Guid userId, Func<KhoaHoc_GiangVien, bool> capQuyenCuThe = null)
        {
            var phan = await _phanRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == idPhan);
            if (phan == null || !phan.IdKhoaHoc.HasValue) return false;
            return await CoQuyenTrenKhoaHoc(phan.IdKhoaHoc.Value, userId, capQuyenCuThe);
        }
    }
}
