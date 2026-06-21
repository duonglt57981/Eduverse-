using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
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


        public BaiGiangService(
            IBaiGiangRepository baiGiangRepository,
            ICloudinaryService cloudinaryService,
            IPhanRepository phanRepository,
            IMapper mapper,
            IDangKyKhoaHocRepository dangkyKhoaHocRepository,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            IHttpContextAccessor httpContextAccessor
            ) : base(baiGiangRepository)
        {
            _cloudinaryService = cloudinaryService;
            _phanRepository = phanRepository;
            _mapper = mapper;
            _dangkyKhoaHocRepository = dangkyKhoaHocRepository;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _httpContextAccessor = httpContextAccessor;
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

            var uploadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

            int thoiLuongBaiGiang = (int)uploadResult.ThoiLuong;

            var maxThuTu = await GetQueryable()
                .Where(x => x.IdPhan == request.IdPhan.Value)
                .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TieuDe);

            var entity = new BaiGiang
            {
                IdPhan = request.IdPhan.Value,
                TieuDe = request.TieuDe.Trim(),
                LoaiBaiGiang = request.Video == null ? "Bài giảng tài liệu" : "Bài giảng video",
                IdVideoBaiGiang = uploadResult.IdVideoBaiGiang,
                URLBaiGiang = uploadResult.URLBaiGiang.Trim(),
                ThuTuSapXep = maxThuTu + 1,
                ThoiLuong = thoiLuongBaiGiang,
                LaBaiGiangFree = request.LaBaiGiangFree,
                TrangThai = "HoatDong",
                CreatedDate = DateTime.UtcNow
            };

            await CreateAsync(entity);
            await SaveAsync();

            return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
        }


        public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            if (request.IdPhan == null)
                throw new Exception("Id phần học không hợp lệ");

            var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
            if (phanHoc == null)
                throw new Exception("Không tìm thấy phần học");

            var banGoc = await GetQueryable()
               .FirstOrDefaultAsync(x => x.Id == request.IdBaiGiang && x.IsBanHienTai);
            if (banGoc == null)
                throw new Exception("Không tim thấy bài giảng");


            var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                    x.IdPhan == request.IdPhan &&
                    x.ThuTuSapXep == request.ThuTuSapXep &&
                    x.Id != request.IdBaiGiang &&
                    !x.IsDeleted);

            if (thuTuDaTon)
                throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại");

            var checkTrangThaiDangDuyet = await GetAll()
                .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id
                                        && !x.IsDeleted
                                        && x.TrangThai == "DangDuyet");
            if (checkTrangThaiDangDuyet != null)
                throw new Exception(
                   $"❌ BÀI GIANG ĐANG ĐƯỢC KIỂM DUYỆT!\n" +
                   $"Hệ thống Eduverses đang kiểm duyệt bài giảng này" +
                   $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                   $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin ."
               );

            string video = banGoc.URLBaiGiang;
            string idVideo = banGoc.IdVideoBaiGiang;
            int? thoiLuong = banGoc.ThoiLuong;

            if (request.Video != null)
            {
                var upload = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);
                if (upload == null)
                    throw new Exception("Upload hình ảnh thất bại");

                video = upload.URLBaiGiang;
                idVideo = upload.IdVideoBaiGiang;

            }

            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TieuDe);

            var banNhapBaiGiang = new BaiGiang
            {
                IdPhan = request.IdPhan.Value,
                IdBanGhiTruoc = banGoc.Id,
                TieuDe = request.TieuDe,
                ThuTuSapXep = request.ThuTuSapXep,
                LaBaiGiangFree = request.LaBaiGiangFree,
                IdVideoBaiGiang = idVideo,
                URLBaiGiang = video,
                ThoiLuong = thoiLuong,
                LoaiBaiGiang = thoiLuong == null ? "Bài giảng tài liệu" : "Bài giảng video",
                IsPendingSwap = false,
            };

            await CreateAsync(banNhapBaiGiang);
            await SaveAsync();

            return _mapper.Map<BaiGiang, BaiGiangDto>(banNhapBaiGiang);
        }


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            var baiGiang = await GetByIdAsync(id);
            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            var coNguoiHoc = await (
                 from ph in _phanRepository.GetQueryable()
                 join dk in _dangkyKhoaHocRepository.GetQueryable()
                     on ph.IdKhoaHoc equals dk.IdKhoaHoc
                 where ph.Id == baiGiang.IdPhan
                 select dk.Id
             ).AnyAsync();

            baiGiang.TrangThai = coNguoiHoc == null ? "DaXoa" : "NgungHoatDong"; // nếu isdele = true + DaXoa  coi như kh ai co thể nhìn thấy(xóa khi chưa có ai đăng kí)
                                                                                 //nếu isdele = true + HoatDong nhưng người đăng kí trước ngày xóa vẫn xem đc

            await DeleteAsync(baiGiang);
            await SaveAsync();
            return true;
        }
    }
}
