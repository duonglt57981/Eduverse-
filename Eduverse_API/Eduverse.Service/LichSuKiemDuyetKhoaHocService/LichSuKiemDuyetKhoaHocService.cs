using CloudinaryDotNet.Actions;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.Common;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DapAnService;
using Eduverse.Service.GeminiService;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate.YourNamespace.KiemDuyet;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{

    public static class TrangThaiPheDuyet
    {
        public const string ChoDuyet = "ChoDuyet";
        public const string DaDuyet = "DaDuyet";
        public const string TuChoi = "TuChoi";
        public const string ChoAdminDuyet = "ChoAdminDuyet";
    }

    public static class TrangThaiLamBai
    {
        public const string DangLam = "DangLam";
    }

    public static class TrangThaiTienDo
    {
        public const string HoanThanh = "HoanThanh";
    }

    public class LichSuKiemDuyetKhoaHocService : Service<Model.Entities.LichSuKiemDuyetKhoaHoc>, ILichSuKiemDuyetKhoaHocService
    {
        private const double NGUONG_CHAN = 0.7;      // Reject if score >= 0.7
        private const double NGUONG_PHAN_VAN = 0.4;  // Need admin review if score >= 0.4 and < 0.7

        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IBaiKiemTraRepository _kiemTraRepository;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private readonly IDanhMuc_KhoaHocRepository _danhMuc_KhoaHocRepository;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;
        private readonly IBaiKiemTraService _baiKiemTraService;
        private readonly ILanLamBaiKiemTraRepository _lanLamBaiKiemTraRepository;
        private readonly ICauHoiRepository _cauHoiRepository;
        private readonly IDapAnRepository _dapAnRepository;
        private readonly IGeminiService _geminiService;
        private readonly ILogger<LichSuKiemDuyetKhoaHocService> _logger;


        public LichSuKiemDuyetKhoaHocService(
            ILichSuKiemDuyetKhoaHocRepository repository,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IKhoaHocRepository khoaHocRepository,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository,
            ITaiLieuRepository taiLieuRepository,
            IBaiKiemTraRepository kiemTraRepository,
            IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository,
            IDanhMucRepository _danhMucRepository,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IGeminiService geminiService,
            ILogger<LichSuKiemDuyetKhoaHocService> logger,
            IBaiKiemTraRepository _baiKiemTraRepository,
            ILanLamBaiKiemTraRepository lanLamBaiKiemTraRepository,
            ICauHoiRepository cauHoiRepository,
            IDapAnRepository dapAnRepository,
            IHttpContextAccessor? httpContextAccessor = null) : base(repository)
        {
            _khoaHocRepository = khoaHocRepository;
            _phanRepository = phanRepository;
            _baiKiemTraRepository = _baiKiemTraRepository;
            _baiGiangRepository = baiGiangRepository;
            _taiLieuRepository = taiLieuRepository;
            _kiemTraRepository = kiemTraRepository;
            this._httpContextAccessor = httpContextAccessor;
            _danhMuc_KhoaHocRepository = danhMuc_KhoaHocRepository;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _geminiService = geminiService;
            _logger = logger;
            _lanLamBaiKiemTraRepository = lanLamBaiKiemTraRepository;
            _cauHoiRepository = cauHoiRepository;
            _dapAnRepository = dapAnRepository;
        }

        #region GetDanhSachKiemDuyet
        public async Task<PagedList<KhoaHocKiemDuyetListDto>> GetDanhSachKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            const string CHO_DUYET = "ChoDuyet";

            var phanList = await _phanRepository.GetQueryable()
                .AsNoTracking()
                .Select(p => new { p.Id, p.IdKhoaHoc })
                .ToListAsync();

            var allBaiGiang = await _baiGiangRepository.GetQueryable()
                .AsNoTracking()
                .Select(x => new { x.Id, x.IdPhan, x.TrangThaiPheDuyet })
                .ToListAsync();

            var taiLieuChoDuyet = await _taiLieuRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.TrangThaiPheDuyet == CHO_DUYET)
                .Select(x => new { x.IdBaiGiang })
                .ToListAsync();

            var khoaHocChoDuyet = await _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.TrangThaiPheDuyet == CHO_DUYET)
                .Select(x => x.Id)
                .ToListAsync();

            var phanToKhoaHoc = phanList
                .Where(p => p.IdKhoaHoc.HasValue)
                .ToDictionary(p => p.Id, p => p.IdKhoaHoc.Value);

            var baiGiangChoDuyet = allBaiGiang.Where(x => x.TrangThaiPheDuyet == CHO_DUYET).ToList();

            var bgWithKhoaHoc = baiGiangChoDuyet
                .Where(bg => phanToKhoaHoc.ContainsKey(bg.IdPhan))
                .Select(bg => phanToKhoaHoc[bg.IdPhan])
                .ToList();

            var baiGiangToKhoaHoc = allBaiGiang
                .Where(bg => phanToKhoaHoc.ContainsKey(bg.IdPhan))
                .ToDictionary(bg => bg.Id, bg => phanToKhoaHoc[bg.IdPhan]);

            var tlWithKhoaHoc = taiLieuChoDuyet
                .Where(tl => baiGiangToKhoaHoc.ContainsKey(tl.IdBaiGiang))
                .Select(tl => baiGiangToKhoaHoc[tl.IdBaiGiang])
                .ToList();

            var idKhoaHocs = bgWithKhoaHoc
                .Concat(tlWithKhoaHoc)
                .Concat(khoaHocChoDuyet)
                .Distinct()
                .ToList();

            if (!idKhoaHocs.Any())
                return new PagedList<KhoaHocKiemDuyetListDto>(new List<KhoaHocKiemDuyetListDto>(), search.PageIndex, search.PageSize, 0);

            var khoaHocQuery = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => idKhoaHocs.Contains(x.Id));

            if (!string.IsNullOrWhiteSpace(search.Keyword))
                khoaHocQuery = khoaHocQuery.Where(x => x.TieuDe.Contains(search.Keyword));

            var khoaHocList = await khoaHocQuery
                .Select(x => new { x.Id, x.TieuDe })
                .ToListAsync();

            var fullList = khoaHocList.Select(kh => new KhoaHocKiemDuyetListDto
            {
                IdKhoaHoc = kh.Id,
                TenKhoaHoc = kh.TieuDe,
                SoBaiGiangChoDuyet = bgWithKhoaHoc.Count(x => x == kh.Id),
                SoTaiLieuChoDuyet = tlWithKhoaHoc.Count(x => x == kh.Id)
            }).ToList();

            var totalCount = fullList.Count;
            search.PageIndex = search.PageIndex < 1 ? 1 : search.PageIndex;

            List<KhoaHocKiemDuyetListDto> pagedItems;
            int pageIndex;
            int pageSize;

            if (search.PageSize == -1)
            {
                pagedItems = fullList;
                pageIndex = 1;
                pageSize = totalCount;
            }
            else
            {
                pagedItems = fullList
                    .Skip((search.PageIndex - 1) * search.PageSize)
                    .Take(search.PageSize)
                    .ToList();
                pageIndex = search.PageIndex;
                pageSize = search.PageSize;
            }

            return new PagedList<KhoaHocKiemDuyetListDto>(pagedItems, pageIndex, pageSize, totalCount);
        }
        #endregion


        //#region GetDetailKiemDuyet
        //// ===== 2. Chi tiết kiểm duyệt 1 khóa học =====
        //public async Task<KhoaHocKiemDuyetDetailDto> GetDetailKiemDuyet(Guid idKhoaHoc)
        //{
        //    const string CHO_DUYET = "ChoDuyet";

        //    var khoaHoc = await _khoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idKhoaHoc)
        //        .Select(x => new { x.Id, x.TenKhoaHoc, x.MoTa })
        //        .FirstOrDefaultAsync();

        //    if (khoaHoc == null)
        //        return null;

        //    var idPhans = await _phanRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdKhoaHoc == idKhoaHoc)
        //        .Select(x => x.Id)
        //        .ToListAsync();

        //    if (!idPhans.Any())
        //    {
        //        return new KhoaHocKiemDuyetDetailDto
        //        {
        //            IdKhoaHoc = khoaHoc.Id,
        //            TenKhoaHoc = khoaHoc.TenKhoaHoc,
        //            MoTa = khoaHoc.MoTa
        //        };
        //    }

        //    var allBaiGiang = await _baiGiangRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => idPhans.Contains(x.IdPhan))
        //        .Select(x => new { x.Id, x.IdBanGhiTruoc, x.TenBaiGiang, x.TrangThaiPheDuyet })
        //        .ToListAsync();

        //    var idBaiGiangs = allBaiGiang.Select(x => x.Id).ToList();

        //    var baiGiangChoDuyet = allBaiGiang
        //        .Where(x => x.TrangThaiPheDuyet == CHO_DUYET)
        //        .Select(x => new BaiGiangChoDuyetDto
        //        {
        //            IdBaiGiang = x.Id,
        //            IdBanGhiTruoc = x.IdBanGhiTruoc,
        //            TenBaiGiang = x.TenBaiGiang,
        //            TrangThaiPheDuyet = x.TrangThaiPheDuyet
        //        })
        //        .ToList();

        //    var taiLieuChoDuyet = await _taiLieuRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => idBaiGiangs.Contains(x.IdBaiGiang) && x.TrangThaiPheDuyet == CHO_DUYET)
        //        .Select(x => new TaiLieuChoDuyetDto
        //        {
        //            IdTaiLieu = x.Id,
        //            IdBanGhiTruoc = x.IdBanGhiTruoc,
        //            TenTaiLieu = x.TenTaiLieu,
        //            TrangThaiPheDuyet = x.TrangThaiPheDuyet
        //        })
        //        .ToListAsync();

        //    return new KhoaHocKiemDuyetDetailDto
        //    {
        //        IdKhoaHoc = khoaHoc.Id,
        //        TenKhoaHoc = khoaHoc.TenKhoaHoc,
        //        MoTa = khoaHoc.MoTa,
        //        BaiGiangChoDuyet = baiGiangChoDuyet,
        //        TaiLieuChoDuyet = taiLieuChoDuyet
        //    };
        //}
        //#endregion


        #region GetLichSuKiemDuyet
        public async Task<List<LichSuKiemDuyetDto>> GetLichSuKiemDuyet(Guid idKhoaHoc)
        {
            return await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDoiDuong == idKhoaHoc && !x.IsDeleted)
                .OrderByDescending(x => x.NgayDuyet)
                .Select(x => new LichSuKiemDuyetDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdDoiDuong,
                    IdNguoiDuyet = x.IdNguoiDuyet,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    LyDo = x.LyDo,
                    NgayDuyet = x.NgayDuyet
                })
                .ToListAsync();
        }
        #endregion


        //#region KiemDuyetKhoaHoc
        //public async Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        //{
        //    // ── Kiểm tra quyền ──────────────────────────────────
        //    var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        //    if (role != "Admin")
        //        throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt khóa học.");

        //    if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
        //        throw new Exception("Trạng thái phê duyệt không hợp lệ.");

        //    if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
        //        throw new Exception("Phải nhập lý do khi từ chối khóa học.");

        //    var khoaHocNhap = await _khoaHocService.GetByIdOrThrowAsync(request.IdKhoaHoc);

        //    if (khoaHocNhap.TrangThaiPheDuyet != "ChoDuyet" && khoaHocNhap.TrangThaiPheDuyet != "DangDuyet")
        //        throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

        //    Guid.TryParse(
        //        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
        //        out var idNguoiDuyet);
        //    var ngayDuyet = DateTime.Now;

        //    // ── TuChoi ──────────────────────────────────────────
        //    if (request.TrangThaiPheDuyet == "TuChoi")
        //    {
        //        khoaHocNhap.TrangThaiPheDuyet = "TuChoi";

        //        if (khoaHocNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            await _khoaHocService.DeleteAsync(khoaHocNhap);
        //        }

        //        await _khoaHocService.UpdateAsync(khoaHocNhap);
        //        await _khoaHocService.SaveAsync();
        //    }
        //    // ── DaDuyet ─────────────────────────────────────────
        //    else
        //    {
        //        var phanIds = await _phanService.GetQueryable()
        //            .Where(x => x.IdKhoaHoc == khoaHocNhap.Id && !x.IsDeleted)
        //            .Select(x => x.Id)
        //            .ToListAsync();

        //        var baiGiangIds = await _baiGiangService.GetQueryable()
        //            .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
        //            .Select(x => x.Id)
        //            .ToListAsync();

        //        // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
        //        if (!khoaHocNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
        //            khoaHocNhap.TrangThai = "HoatDong";
        //            khoaHocNhap.IsBanHienTai = true;

        //            await _phanService.GetQueryable()
        //                .Where(x => phanIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _baiGiangService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _taiLieuService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));
        //        }
        //        // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
        //        else
        //        {
        //            var idBanGoc = khoaHocNhap.IdBanGhiTruoc.Value;

        //            var banGoc = await _khoaHocService.GetByIdOrThrowAsync(idBanGoc);

        //            // ① Copy field từ bản nháp → bản gốc (giữ Id gốc để FK DangKy không vỡ)
        //            banGoc.TieuDe = khoaHocNhap.TieuDe;
        //            banGoc.MoTa = khoaHocNhap.MoTa;
        //            banGoc.HinhAnhKhoaHoc = khoaHocNhap.HinhAnhKhoaHoc;
        //            banGoc.IdHinhAnhKhoaHoc = khoaHocNhap.IdHinhAnhKhoaHoc;
        //            banGoc.Gia = khoaHocNhap.Gia;
        //            banGoc.GiaGoc = khoaHocNhap.GiaGoc;
        //            banGoc.CapDo = khoaHocNhap.CapDo;
        //            banGoc.LoaiKhoaHoc = khoaHocNhap.LoaiKhoaHoc;
        //            banGoc.TrangThaiPheDuyet = "DaDuyet";
        //            banGoc.TrangThai = "HoatDong";
        //            banGoc.IsBanHienTai = true;
        //            banGoc.UpdatedDate = DateTime.UtcNow;

        //            // ⭐ ② Copy danh mục từ bản nháp sang bản gốc
        //            await CopyDanhMucFromNhapToGoc(khoaHocNhap.Id, idBanGoc);

        //            // ③ Lấy phan/baigiang gốc để soft-delete
        //            var phanGocIds = await _phanService.GetQueryable()
        //                .Where(x => x.IdKhoaHoc == idBanGoc && !x.IsDeleted)
        //                .Select(x => x.Id)
        //                .ToListAsync();

        //            var baiGiangGocIds = await _baiGiangService.GetQueryable()
        //                .Where(x => phanGocIds.Contains(x.IdPhan) && !x.IsDeleted)
        //                .Select(x => x.Id)
        //                .ToListAsync();

        //            // ④ Soft-delete tailieu → baigiang → phan gốc
        //            await _taiLieuService.GetQueryable()
        //                .Where(x => baiGiangGocIds.Contains(x.IdBaiGiang))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IsDeleted, true)
        //                    .SetProperty(p => p.DeletedDate, DateTime.Now));

        //            await _baiGiangService.GetQueryable()
        //                .Where(x => baiGiangGocIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IsDeleted, true)
        //                    .SetProperty(p => p.DeletedDate, DateTime.Now));

        //            await _phanService.GetQueryable()
        //                .Where(x => phanGocIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IsDeleted, true)
        //                    .SetProperty(p => p.DeletedDate, DateTime.Now));

        //            // ⑤ Chuyển phan/baigiang nháp sang IdKhoaHoc gốc + activate
        //            await _phanService.GetQueryable()
        //                .Where(x => phanIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IdKhoaHoc, idBanGoc)
        //                    .SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _baiGiangService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _taiLieuService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            // ⑥ Reset bản nháp (giữ lại, tái sử dụng lần sau)
        //            khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
        //            khoaHocNhap.TrangThai = "Nhap";
        //            khoaHocNhap.IsBanHienTai = false;
        //            khoaHocNhap.UpdatedDate = DateTime.UtcNow;

        //            await _khoaHocService.UpdateAsync(banGoc);
        //            await _khoaHocService.UpdateAsync(khoaHocNhap);
        //        }

        //        await _khoaHocService.SaveAsync();
        //    }

        //    // ── Ghi lịch sử ─────────────────────────────────────
        //    var lichSu = new LichSuKiemDuyetKhoaHoc
        //    {
        //        Id = Guid.NewGuid(),
        //        IdKhoaHoc = request.IdKhoaHoc,
        //        IdNguoiDuyet = idNguoiDuyet,
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        LyDo = request.LyDo,
        //        NgayDuyet = ngayDuyet
        //    };

        //    await CreateAsync(lichSu);
        //    await SaveAsync();

        //    return new KiemDuyetKhoaHocDto
        //    {
        //        IdKhoaHoc = khoaHocNhap.IdBanGhiTruoc ?? khoaHocNhap.Id,
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        NgayDuyet = ngayDuyet
        //    };
        //}

        //// ── Helper copy danh mục từ bản nháp sang bản gốc ──
        //private async Task CopyDanhMucFromNhapToGoc(Guid idKhoaHocNhap, Guid idKhoaHocGoc)
        //{
        //    // ① Lấy danh mục của bản nháp (chưa bị xóa)
        //    var danhMucNhap = await _danhMuc_KhoaHocService.GetQueryable()
        //        .Where(x => x.IdKhoaHoc == idKhoaHocNhap && !x.IsDeleted)
        //        .ToListAsync();

        //    // ② Lấy danh mục hiện tại của bản gốc
        //    var danhMucGoc = await _danhMuc_KhoaHocService.GetQueryable()
        //        .Where(x => x.IdKhoaHoc == idKhoaHocGoc && !x.IsDeleted)
        //        .ToListAsync();

        //    var danhMucGocIds = danhMucGoc.Select(x => x.IdDanhMuc).ToHashSet();
        //    var danhMucNhapIds = danhMucNhap.Select(x => x.IdDanhMuc).ToHashSet();

        //    // ③ Xóa những danh mục của bản gốc không có trong bản nháp
        //    var canXoa = danhMucGoc
        //        .Where(x => !danhMucNhapIds.Contains(x.IdDanhMuc))
        //        .ToList();

        //    if (canXoa.Any())
        //    {
        //        await _danhMuc_KhoaHocService.DeleteAsync(canXoa);
        //        await _danhMuc_KhoaHocService.SaveAsync();
        //    }

        //    // ④ Thêm những danh mục của bản nháp chưa có trong bản gốc
        //    var canThem = danhMucNhapIds
        //        .Where(id => !danhMucGocIds.Contains(id))
        //        .Select(id => new DanhMuc_KhoaHoc
        //        {
        //            Id = Guid.NewGuid(),
        //            IdKhoaHoc = idKhoaHocGoc,
        //            IdDanhMuc = id
        //        }).ToList();

        //    if (canThem.Any())
        //    {
        //        await _danhMuc_KhoaHocService.CreateRange(canThem);
        //        await _danhMuc_KhoaHocService.SaveAsync();
        //    }
        //}
        //#endregion


        #region KiemDuyetOuputThuCong
        #region KiemDuyetKhoaHoc
        public async Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        {
            // ── Kiểm tra quyền ──────────────────────────────────
            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin")
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt khóa học.");

            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối khóa học.");

            var khoaHocNhap = await _khoaHocRepository.GetByIdAsync(request.IdBanNhap);
            if (khoaHocNhap == null)
                throw new Exception("Không tìm thấy bản nháp");

            if (khoaHocNhap.TrangThaiPheDuyet != "ChoDuyet")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),out var idNguoiDuyet);
            
            var ngayDuyet = DateTime.Now;

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                khoaHocNhap.TrangThaiPheDuyet = "TuChoi";
                khoaHocNhap.TrangThai = "TuChoi";

                if (khoaHocNhap.IdBanGhiTruoc.HasValue)
                {
                     _khoaHocRepository.Delete(khoaHocNhap);
                }

                 _khoaHocRepository.Update(khoaHocNhap);
                await _khoaHocRepository.SaveAsync();
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
                if (!khoaHocNhap.IdBanGhiTruoc.HasValue)
                {
                    khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
                    khoaHocNhap.TrangThai = "HoatDong";
                    khoaHocNhap.IsBanHienTai = true;
                }
                // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
                else
                {
                    var idBanGoc = khoaHocNhap.IdBanGhiTruoc.Value;
                    var banGoc = await _khoaHocRepository.GetByIdAsync(idBanGoc);

                    // 1. Copy field từ bản nháp → bản gốc (giữ Id gốc để FK DangKy không vỡ)
                    banGoc.TieuDe = khoaHocNhap.TieuDe;
                    banGoc.MoTa = khoaHocNhap.MoTa;
                    banGoc.HinhAnhKhoaHoc = khoaHocNhap.HinhAnhKhoaHoc;
                    banGoc.IdHinhAnhKhoaHoc = khoaHocNhap.IdHinhAnhKhoaHoc;
                    banGoc.Gia = khoaHocNhap.Gia;
                    banGoc.GiaGoc = khoaHocNhap.GiaGoc;
                    banGoc.CapDo = khoaHocNhap.CapDo;
                    banGoc.LoaiKhoaHoc = khoaHocNhap.LoaiKhoaHoc;
                    banGoc.TrangThaiPheDuyet = "DaDuyet";
                    banGoc.TrangThai = "HoatDong";
                    banGoc.IsBanHienTai = true;
                    banGoc.UpdatedDate = DateTime.UtcNow;
                    khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
                    khoaHocNhap.TrangThai = "BanNhap";

                    //  2. Copy danh mục từ bản nháp sang bản gốc
                    await CopyDanhMucFromNhapToGoc(khoaHocNhap.Id, idBanGoc);
                     _khoaHocRepository.Update(banGoc);
                     _khoaHocRepository.Update(khoaHocNhap);
                }
                await _khoaHocRepository.SaveAsync();
            }

            // ── Ghi lịch sử ─────────────────────────────────────
            var lichSu = new LichSuKiemDuyetKhoaHoc
            {
                Id = Guid.NewGuid(),
                IdDoiDuong = request.IdBanNhap,
                LoaiDoiTuong = "KhoaHoc",
                IdNguoiDuyet = idNguoiDuyet,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                LyDo = request.LyDo,
                NgayDuyet = ngayDuyet
            };

            await CreateAsync(lichSu);
            await SaveAsync();

            return new KiemDuyetKhoaHocDto
            {
                IdDoiTuong = khoaHocNhap.IdBanGhiTruoc ?? khoaHocNhap.Id,
                LoaiDoiTuong = lichSu.LoaiDoiTuong,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }
        // ── Helper copy danh mục từ bản nháp sang bản gốc ──
        private async Task CopyDanhMucFromNhapToGoc(Guid idKhoaHocNhap, Guid idKhoaHocGoc)
        {
            // ① Lấy danh mục của bản nháp (chưa bị xóa)
            var danhMucNhap = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHocNhap && !x.IsDeleted)
                .ToListAsync();

            // ② Lấy danh mục hiện tại của bản gốc
            var danhMucGoc = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHocGoc && !x.IsDeleted)
                .ToListAsync();

            var danhMucGocIds = danhMucGoc.Select(x => x.IdDanhMuc).ToHashSet();
            var danhMucNhapIds = danhMucNhap.Select(x => x.IdDanhMuc).ToHashSet();

            // ③ Xóa những danh mục của bản gốc không có trong bản nháp
            var canXoa = danhMucGoc
                .Where(x => !danhMucNhapIds.Contains(x.IdDanhMuc))
                .ToList();

            if (canXoa.Any())
            {
                await _danhMuc_KhoaHocService.DeleteAsync(canXoa);
                await _danhMuc_KhoaHocService.SaveAsync();
            }

            // ④ Thêm những danh mục của bản nháp chưa có trong bản gốc
            var canThem = danhMucNhapIds
                .Where(id => !danhMucGocIds.Contains(id))
                .Select(id => new DanhMuc_KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = idKhoaHocGoc,
                    IdDanhMuc = id
                }).ToList();

            if (canThem.Any())
            {
                await _danhMuc_KhoaHocService.CreateRange(canThem);
                await _danhMuc_KhoaHocService.SaveAsync();
            }
        }
        #endregion


        #region KiemDuyetBaiGiang
        public async Task<KiemDuyetKhoaHocDto> KiemDuyetBaiGiang(KiemDuyetKhoaHocRequest request)
        {
            // ── Kiểm tra quyền ──────────────────────────────────
            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin")
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt bài giảng.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDuyet);
            

            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối.");

            var baiGiangNhap = await _baiGiangRepository.GetByIdAsync(request.IdBanNhap);
            if (baiGiangNhap.CreatedId != idNguoiDuyet)
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt bài giảng.");
            if (baiGiangNhap == null)
                throw new Exception("Không tìm thấy bản nháp");

            if (baiGiangNhap.TrangThaiPheDuyet != "ChoDuyet" && baiGiangNhap.TrangThaiPheDuyet != "DangDuyet")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

            
            var ngayDuyet = DateTime.Now;

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                baiGiangNhap.TrangThaiPheDuyet = "TuChoi";

                if (baiGiangNhap.IdBanGhiTruoc.HasValue)
                {
                    _baiGiangRepository.Delete(baiGiangNhap);
                }

                _baiGiangRepository.Update(baiGiangNhap);
                await _khoaHocRepository.SaveAsync();
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
                if (!baiGiangNhap.IdBanGhiTruoc.HasValue)
                {
                    baiGiangNhap.TrangThaiPheDuyet = "DaDuyet";
                    baiGiangNhap.TrangThai = "HoatDong";
                    baiGiangNhap.IsBanHienTai = true;
                }
                // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
                else
                {
                    baiGiangNhap.TrangThaiPheDuyet = "DaDuyet";
                    baiGiangNhap.TrangThai = "BanNhap";

                    _baiGiangRepository.Update(baiGiangNhap);
                }
                await _khoaHocRepository.SaveAsync();
            }

            // ── Ghi lịch sử ─────────────────────────────────────
            var lichSu = new LichSuKiemDuyetKhoaHoc
            {
                Id = Guid.NewGuid(),
                IdDoiDuong = request.IdBanNhap,
                LoaiDoiTuong = "BaiGiang",
                IdNguoiDuyet = idNguoiDuyet,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                LyDo = request.LyDo,
                NgayDuyet = ngayDuyet
            };

            await CreateAsync(lichSu);
            await SaveAsync();

            return new KiemDuyetKhoaHocDto
            {
                IdDoiTuong = baiGiangNhap.IdBanGhiTruoc ?? baiGiangNhap.Id,
                LoaiDoiTuong = lichSu.LoaiDoiTuong,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }
        #endregion


        #region KiemDuyetBaiKiemTra
        public async Task<KiemDuyetKhoaHocDto> KiemDuyetBaiKiemTra(KiemDuyetKhoaHocRequest request)
        {
            // ── Kiểm tra quyền ──────────────────────────────────
            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin")
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt");

            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối");

            var baiKiemTraNhap = await _baiKiemTraService.GetByIdAsync(request.IdBanNhap);
            if (baiKiemTraNhap == null)
                throw new Exception("Không tìm thấy bản nháp");

            if (baiKiemTraNhap.TrangThaiPheDuyet != "ChoDuyet")
                throw new Exception("Bài giảng không ở trạng thái chờ duyệt.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDuyet);

            var ngayDuyet = DateTime.Now;

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                baiKiemTraNhap.TrangThaiPheDuyet = "TuChoi";
                baiKiemTraNhap.TrangThai = "TuChoi";

                if (baiKiemTraNhap.IdBanGhiTruoc.HasValue)
                {
                    await _baiKiemTraService.DeleteAsync(baiKiemTraNhap);
                }

                _baiKiemTraService.UpdateAsync(baiKiemTraNhap);
                await _baiKiemTraService.SaveAsync();
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
                if (!baiKiemTraNhap.IdBanGhiTruoc.HasValue && baiKiemTraNhap.TrangThaiPheDuyet =="ChoDuyet")
                {
                    baiKiemTraNhap.TrangThaiPheDuyet = "DaDuyet";
                    baiKiemTraNhap.TrangThai = "HoatDong";
                    baiKiemTraNhap.IsBanHienTai = true;
                }
                // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
                else if(baiKiemTraNhap.IdBanGhiTruoc.HasValue && baiKiemTraNhap.TrangThaiPheDuyet == "ChoDuyet")
                {
                    var idBanGoc = baiKiemTraNhap.IdBanGhiTruoc.Value;
                    var banGoc = await _baiKiemTraService.GetByIdAsync(idBanGoc);
                    banGoc.TrangThaiPheDuyet = "DaDuyet";
                    banGoc.TrangThai = "HoatDong";
                    banGoc.IsBanHienTai = true;
                }
                await _khoaHocRepository.SaveAsync();
            }

            // ── Ghi lịch sử ─────────────────────────────────────
            var lichSu = new LichSuKiemDuyetKhoaHoc
            {
                Id = Guid.NewGuid(),
                IdDoiDuong = request.IdBanNhap,
                LoaiDoiTuong = "BaiKiemTra",
                IdNguoiDuyet = idNguoiDuyet,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                LyDo = request.LyDo,
                NgayDuyet = ngayDuyet
            };

            await CreateAsync(lichSu);
            await SaveAsync();

            return new KiemDuyetKhoaHocDto
            {
                IdDoiTuong = baiKiemTraNhap.IdBanGhiTruoc ?? baiKiemTraNhap.Id,
                LoaiDoiTuong = lichSu.LoaiDoiTuong,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }
        #endregion
        #endregion


        #region KiemDuyetInputAIandThuCong
        public async Task KiemTraVaNemExceptionAsync(string noiDung)
        {
            if (string.IsNullOrWhiteSpace(noiDung)) return;

            //// 1. Kiem tra tu cam co ban
            var listtucam = TuCams._tuCam;
            var tuTimThay = listtucam.Where(t => noiDung.ToLower().Contains(t)).ToList();
            if (tuTimThay.Any())
            {
                throw new KiemDuyetException(
                    $"Noi dung chua tu ngu nhay cam: {string.Join(", ", tuTimThay)}", 
                    "TuCamCoBan",
                    tuTimThay,
                    "Vui long loai bo cac tu ngu khong phu hop"
                );
            }

            // 2. Kiem tra bang Gemini
            var ketQua = await _geminiService.KiemDuyetInputAsync(noiDung);

            if (!ketQua.HopLe)
            {
                throw new KiemDuyetException(
                    ketQua.ThongBao ?? "Noi dung vi pham",
                    ketQua.Loai ?? "ViPham",
                    ketQua.TuViPham ?? new List<string>(),
                    ketQua.GoiYSua
                );
            }
        }
        #endregion


        #region KiemDuyetOuputAI
        //// ===============================================================
        //// 1. KHOA HOC — map ngay khi DaDuyet, không có điều kiện phụ
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetKhoaHocAsync(Guid idBanNhap)
        //{
        //    var nhap = await _khoaHocRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap KhoaHoc voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap KhoaHoc {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Tieu de: {nhap.TieuDe}\nMo ta: {nhap.MoTa}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThaiPheDuyet = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //         _khoaHocRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThaiPheDuyet = TrangThaiPheDuyet.ChoAdminDuyet;
        //         _khoaHocRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    // DaDuyet -> map ngay
        //    var goc = await _khoaHocRepository.GetByIdAsync(nhap.IdBanGhiTruoc.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc KhoaHoc voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TieuDe = nhap.TieuDe;
        //    goc.MoTa = nhap.MoTa;
        //    goc.Gia = nhap.Gia;
        //    goc.GiaGoc = nhap.GiaGoc;
        //    goc.LoaiKhoaHoc = nhap.LoaiKhoaHoc;
        //    goc.HinhAnhKhoaHoc = nhap.HinhAnhKhoaHoc;
        //    goc.IdHinhAnhKhoaHoc = nhap.IdHinhAnhKhoaHoc;
        //    goc.URLViewPreviewKhoaHoc = nhap.URLViewPreviewKhoaHoc;
        //    goc.CapDo = nhap.CapDo;
        //    goc.TongThoiLuong = nhap.TongThoiLuong;
        //    goc.TongBaiGiang = nhap.TongBaiGiang;
        //    goc.NgayCapNhat = DateTime.Now;
        //    // Khong dong: TrangThaiPheDuyet, TrangThai (hien thi), SoLuongHocVien cua goc

        //    nhap.TrangThaiPheDuyet = TrangThaiPheDuyet.DaDuyet;
        //    nhap.IsDeleted = true; // da map xong, khong can giu nhap nua

        //    _khoaHocRepository.Update(goc);
        //    _khoaHocRepository.Update(nhap);

        //    return KetQua(idBanNhap, TrangThaiPheDuyet.DaDuyet, true, "Da map du lieu KhoaHoc vao ban goc");
        //}

        //// ===============================================================
        //// 2. PHAN — map ngay khi DaDuyet, không có điều kiện phụ
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetPhanAsync(Guid idBanNhap)
        //{
        //    var nhap = await _phanRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap Phan voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap Phan {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Ten phan: {nhap.TenPhan}\nMieu ta: {nhap.MieuTa}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //         _phanRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.ChoAdminDuyet;
        //         _phanRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    var goc = await _phanRepository.GetByIdAsync(nhap.IdBanGhiTruoc.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc Phan voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TenPhan = nhap.TenPhan;
        //    goc.MieuTa = nhap.MieuTa;
        //    goc.ThuTuSapXep = nhap.ThuTuSapXep;
        //    // TrangThai cua goc giu nguyen y nghia hien thi, khong bi ghi de boi DaDuyet

        //    nhap.TrangThai = TrangThaiPheDuyet.DaDuyet;
        //    nhap.IsDeleted = true;

        //     _phanRepository.Update(goc);
        //     _phanRepository.Update(nhap);

        //    return KetQua(idBanNhap, TrangThaiPheDuyet.DaDuyet, true, "Da map du lieu Phan vao ban goc");
        //}

        //// ===============================================================
        //// 3. BAI GIANG — KHÔNG tự map. Chỉ đánh dấu IsPendingSwap trên bản
        //// gốc; SwapPendingBaiGiang() (đã có sẵn, chạy lúc đạt 100%) sẽ map.
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetBaiGiangAsync(Guid idBanNhap)
        //{
        //    var nhap = await _baiGiangRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap BaiGiang voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap BaiGiang {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Tieu de bai giang: {nhap.TieuDe}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //        _baiGiangRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.ChoAdminDuyet;
        //        _baiGiangRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    // DaDuyet -> KHONG map ngay. Chi bao hieu cho co che swap co san:
        //    // danh dau ban GOC (id cu) la "co ban thay the dang cho", tro toi nhap.
        //    var goc = await _baiGiangRepository.GetByIdAsync(nhap.IdBanGhiTruoc.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc BaiGiang voi Id {nhap.IdBanGhiTruoc}");

        //    nhap.TrangThai = TrangThaiPheDuyet.DaDuyet;

        //    goc.IdBaiGiangMoi = nhap.Id;
        //    goc.IsPendingSwap = true;
        //    // KHONG xoa nhap, KHONG copy field sang goc o day -
        //    // SwapPendingBaiGiang() se lam viec do khi hoc vien dat 100%.

        //    _baiGiangRepository.Update(nhap);
        //    _baiGiangRepository.Update(goc);

        //    return KetQua(
        //        idBanNhap,
        //        TrangThaiPheDuyet.DaDuyet,
        //        false,
        //        "AI da duyet. Da danh dau cho swap, se duoc ap dung khi hoc vien hoan thanh 100% khoa hoc");
        //}

        //// ===============================================================
        //// 4. BAI KIEM TRA — map khi không có LanLamBaiKiemTra nào DangLam
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetBaiKiemTraAsync(Guid idBanNhap)
        //{
        //    var nhap = await _baiKiemTraService.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap BaiKiemTra voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap BaiKiemTra {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Ten bai kiem tra: {nhap.TenBaiKiemTra}\nMo ta: {nhap.MoTa}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //        await _baiKiemTraService.UpdateAsync(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.ChoAdminDuyet;
        //        await _baiKiemTraService.UpdateAsync(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    nhap.TrangThai = TrangThaiPheDuyet.DaDuyet;
        //    await _baiKiemTraService.UpdateAsync(nhap);
        //    await _baiKiemTraService.SaveAsync();

        //    var daMap = await ThuMapBaiKiemTraNeuDuDieuKienAsync(nhap);

        //    return KetQua(
        //        idBanNhap,
        //        TrangThaiPheDuyet.DaDuyet,
        //        daMap,
        //        daMap
        //            ? "Da map du lieu BaiKiemTra vao ban goc"
        //            : "AI da duyet, nhung CHUA map - dang co nguoi DangLam bai kiem tra nay");
        //}

        ///// <summary>
        ///// Map 1 bản nháp BaiKiemTra đã DaDuyet vào bản gốc, nếu không có
        ///// LanLamBaiKiemTra nào (của bài kiểm tra GỐC) đang ở trạng thái
        ///// DangLam. Nên được gọi lại khi 1 LanLamBaiKiemTra chuyển khỏi
        ///// DangLam (nộp bài/hết giờ), không chỉ ngay lúc AI duyệt.
        ///// </summary>
        //public async Task<bool> ThuMapBaiKiemTraNeuDuDieuKienAsync(BaiKiemTra nhap)
        //{
        //    if (nhap.TrangThai != TrangThaiPheDuyet.DaDuyet)
        //        return false;

        //    var coAiDangLam = await _lanLamBaiKiemTraRepository.AnyAsync(
        //        x => x.IdBaiKiemTra == nhap.IdBanGhiTruoc && x.TrangThai == TrangThaiLamBai.DangLam);

        //    if (coAiDangLam)
        //        return false;

        //    var goc = await _baiKiemTraService.GetByIdAsync(nhap.IdBanGhiTruoc!.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc BaiKiemTra voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TenBaiKiemTra = nhap.TenBaiKiemTra;
        //    goc.MoTa = nhap.MoTa;
        //    goc.DiemDat = nhap.DiemDat;
        //    goc.GioiHanThoiGian = nhap.GioiHanThoiGian;
        //    goc.ChoLamLai = nhap.ChoLamLai;
        //    goc.SoLanLamLai = nhap.SoLanLamLai;
        //    goc.SoLanLamToiDa = nhap.SoLanLamToiDa;

        //    nhap.IsDeleted = true;

        //    await _baiKiemTraService.UpdateAsync(goc);
        //    await _baiKiemTraService.UpdateAsync(nhap);
        //    await _baiKiemTraService.SaveAsync();

        //    return true;
        //}

        //// ===============================================================
        //// 5. CAU HOI — map theo cùng điều kiện với BaiKiemTra cha của nó
        //// (không có LanLamBaiKiemTra nào DangLam). DapAn đi kèm CauHoi
        //// được map cùng lúc, không kiểm duyệt AI riêng (không có text rời).
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetCauHoiAsync(Guid idBanNhap)
        //{
        //    var nhap = await _cauHoiRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap CauHoi voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap CauHoi {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Cau hoi: {nhap.TenCauHoi}\nNoi dung: {nhap.NoiDungCauHoi}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.IsDeleted = true;
        //        _cauHoiRepository.Update(nhap);
        //        // DapAn cua nhap CauHoi nay cung khong con can thiet -> xoa mem theo
        //        await XoaMemDapAnCuaCauHoiAsync(nhap.Id);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        // LUU Y: entity CauHoi duoc gui khong co cot TrangThai rieng.
        //        // Neu can luu trang thai ChoAdminDuyet cho CauHoi, can bo sung
        //        // cot TrangThai vao entity CauHoi truoc. Hien tai chi log lai.
        //        _logger.LogWarning("CauHoi {Id} can ChoAdminDuyet nhung entity chua co cot TrangThai - vui long bo sung", idBanNhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    var daMap = await ThuMapCauHoiNeuDuDieuKienAsync(nhap);

        //    return KetQua(
        //        idBanNhap,
        //        TrangThaiPheDuyet.DaDuyet,
        //        daMap,
        //        daMap
        //            ? "Da map du lieu CauHoi + DapAn vao ban goc"
        //            : "AI da duyet, nhung CHUA map - dang co nguoi DangLam bai kiem tra chua cau hoi nay");
        //}

        ///// <summary>
        ///// Map 1 bản nháp CauHoi (+ DapAn con của nó) vào bản gốc, theo cùng
        ///// điều kiện với BaiKiemTra: không map khi có LanLamBaiKiemTra nào
        ///// đang DangLam cho BaiKiemTra chứa câu hỏi này.
        ///// </summary>
        //public async Task<bool> ThuMapCauHoiNeuDuDieuKienAsync(CauHoi nhap)
        //{
        //    if (nhap.IdBaiKiemTra == null)
        //    {
        //        _logger.LogWarning("CauHoi {Id} khong co IdBaiKiemTra, khong the kiem tra dieu kien map", nhap.Id);
        //        return false;
        //    }

        //    var coAiDangLam = await _lanLamBaiKiemTraRepository.AnyAsync(
        //        x => x.IdBaiKiemTra == nhap.IdBaiKiemTra && x.TrangThai == TrangThaiLamBai.DangLam);

        //    if (coAiDangLam)
        //        return false;

        //    var goc = await _cauHoiRepository.GetByIdAsync(nhap.IdBanGhiTruoc!.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc CauHoi voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TenCauHoi = nhap.TenCauHoi;
        //    goc.NoiDungCauHoi = nhap.NoiDungCauHoi;
        //    goc.LoaiCauHoi = nhap.LoaiCauHoi;
        //    goc.Diem = nhap.Diem;
        //    goc.ThuTuSapXep = nhap.ThuTuSapXep;
        //    goc.DoKho = nhap.DoKho;

        //    nhap.IsDeleted = true;

        //     _cauHoiRepository.Update(goc);
        //     _cauHoiRepository.Update(nhap);
        //    await _cauHoiRepository.SaveAsync();

        //    // Map DapAn nhap (cua CauHoi nhap) -> ghi de DapAn cua CauHoi goc
        //    await MapDapAnTheoCauHoiAsync(idCauHoiNhap: nhap.Id, idCauHoiGoc: goc.Id);

        //    return true;
        //}

        ///// <summary>
        ///// Map toàn bộ DapAn thuộc 1 CauHoi nháp sang CauHoi gốc tương ứng:
        ///// xóa mềm DapAn cũ của gốc, tạo lại theo DapAn của nháp.
        ///// (DapAn không có quy trình duyệt AI riêng — đi theo CauHoi cha.)
        ///// </summary>
        //private async Task MapDapAnTheoCauHoiAsync(Guid idCauHoiNhap, Guid idCauHoiGoc)
        //{
        //    var dapAnGocCu = _dapAnRepository.GetQueryable()
        //        .Where(x => x.IdCauHoi == idCauHoiGoc)
        //        .ToList();

        //    foreach (var da in dapAnGocCu)
        //    {
        //        _dapAnRepository.Delete(da);
        //        await _dapAnRepository.SaveAsync();
        //    }
        //    if (dapAnGocCu.Any())
        //    {
        //        foreach (var da in dapAnGocCu)
        //        {
        //            _dapAnRepository.Update(da);
        //        }
        //    }

        //    var dapAnNhap = _dapAnRepository.GetQueryable()
        //        .Where(x => x.IdCauHoi == idCauHoiNhap)
        //        .ToList();

        //    var dapAnMoi = dapAnNhap.Select(da => new DapAn
        //    {
        //        Id = Guid.NewGuid(),
        //        NoiDungDapAn = da.NoiDungDapAn,
        //        LaDapAnDung = da.LaDapAnDung,
        //        ThuTuSapXep = da.ThuTuSapXep,
        //        IdCauHoi = idCauHoiGoc,
        //        IsBanHienTai = true
        //    }).ToList();

        //    if (dapAnMoi.Any())
        //    {
        //         _dapAnRepository.AddRange(dapAnMoi);
        //    }

        //    // Don ban nhap DapAn cu (gan voi CauHoi nhap, da map xong khong can nua)
        //    foreach (var da in dapAnNhap)
        //    {
        //         _dapAnRepository.Delete(da);
        //        await _dapAnRepository.SaveAsync();
        //    }
        //    if (dapAnNhap.Any())
        //    {
        //        foreach (var da in dapAnNhap)
        //        {
        //             _dapAnRepository.Update(da);
        //        }
        //    }
        //}

        //private async Task XoaMemDapAnCuaCauHoiAsync(Guid idCauHoi)
        //{
        //    var dapAns = _dapAnRepository.GetQueryable().Where(x => x.IdCauHoi == idCauHoi).ToList();
        //    foreach (var da in dapAns)
        //    {
        //         _dapAnRepository.Delete(da);
        //    }
        //    if (dapAns.Any())
        //    {
        //        foreach (var da in dapAns)
        //        {
        //             _dapAnRepository.Update(da);
        //        }
        //    }
        //}

        //// ===============================================================
        //// HELPERS DÙNG CHUNG
        //// ===============================================================

        //private static KetQuaXuLyDuyetDto KetQua(Guid id, string trangThai, bool daMap, string ghiChu) =>
        //    new()
        //    {
        //        IdBanNhap = id,
        //        TrangThaiMoi = trangThai,
        //        DaMapDuLieu = daMap,
        //        GhiChu = ghiChu
        //    };

        //private static string PhanLoaiTheoDiem(double diemSo)
        //{
        //    if (diemSo >= NGUONG_CHAN) return TrangThaiPheDuyet.TuChoi;
        //    if (diemSo >= NGUONG_PHAN_VAN) return TrangThaiPheDuyet.ChoAdminDuyet;
        //    return TrangThaiPheDuyet.DaDuyet;
        //}
        #endregion
    }
}

