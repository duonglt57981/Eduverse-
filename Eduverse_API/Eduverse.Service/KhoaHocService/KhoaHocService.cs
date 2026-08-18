using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LyDoTuChoiRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.DapAnService;
using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.Dto;
using Eduverse.Service.ElasticsearchService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.LyDoTuChoiService.Dto;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.ThongBaoService;
using Elastic.Clients.Elasticsearch;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.ComponentModel.Design;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using Eduverse.Service.SignalRService;
using Eduverse.Repository.DanhGiaRepository;



namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>,IKhoaHocService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;
        private readonly ITienDoHocTapRepository _tienDoHocTapRepository;
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IBaiKiemTraRepository _baiKiemTraRepository ;
        private readonly ILanLamBaiKiemTraService _lanLamBaiKiemTraService;
        private readonly IDanhMuc_KhoaHocRepository _danhMuc_KhoaHocRepository;
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;
        private readonly ICauHoiService _cauHoiService;
        private readonly IBaiGiangService _baiGiangService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly EduverseContext _eduverseContext;
        private readonly IElasticsearchService _elasticsearchService;
        private readonly IDapAnService _dapAnService;
        private readonly IMemoryCache _cache;
        private readonly IAppUserService _appUserService;
        private readonly INotificationPublisher _notificationPublisher;
        private readonly IKhoaHoc_GiangVienRepository _khoaHoc_GiangVienRepository;
        private readonly ILyDoTuChoiRepository _lyDoTuChoiRepository;
        private readonly ICauHoiRepository _cauHoiRepository;
        private readonly IDapAnRepository _dapAnRepository;
        private readonly ISignalRService _signalRService;
        private readonly IDanhGiaRepository _danhGiaRepository;

        public KhoaHocService(
            IMemoryCache memoryCache,
            IKhoaHocRepository khoaHocRepository,
            ITaiLieuRepository taiLieuRepository,
            IDangKyKhoaHocService dangKyKhoaHocService,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IHttpContextAccessor httpContextAccessor,
            ICloudinaryService cloudinaryService,
            IDanhMucRepository danhMucRepository,
            IMapper mapper,
            ITienDoHocTapRepository tienDoHocTapRepository,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            IBaiKiemTraRepository baiKiemTraRepository,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            ICauHoiService cauHoiService,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            EduverseContext eduverseContext,
            IElasticsearchService elasticsearchService,
            IDapAnService dapAnService,
            IMemoryCache cache,
            IAppUserService appUserService,
            ILyDoTuChoiRepository lyDoTuChoiRepository,
            IDapAnRepository dapAnRepository,
            ICauHoiRepository cauHoiRepository,
            INotificationPublisher notificationPublisher,
            IKhoaHoc_GiangVienRepository khoaHoc_GiangVienRepository,
            ISignalRService signalRService,
            IDanhGiaRepository danhGiaRepository

        ) : base(khoaHocRepository)
        {
            _memoryCache = memoryCache;
            _taiLieuRepository = taiLieuRepository;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _mapper = mapper;
            this._httpContextAccessor = httpContextAccessor;
            _cloudinaryService = cloudinaryService;
            _danhMucRepository = danhMucRepository;
            _tienDoHocTapRepository = tienDoHocTapRepository;
            _phanRepository = phanRepository;
            _baiGiangRepository = baiGiangRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _baiKiemTraRepository = baiKiemTraRepository;
            _lanLamBaiKiemTraService = lanLamBaiKiemTraService;
            _danhMuc_KhoaHocRepository = danhMuc_KhoaHocRepository;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _cauHoiService = cauHoiService;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _eduverseContext = eduverseContext;
            _elasticsearchService = elasticsearchService;
            _dapAnService = dapAnService;
            _cache = cache;
            _appUserService = appUserService;
            _notificationPublisher = notificationPublisher;
            _khoaHoc_GiangVienRepository = khoaHoc_GiangVienRepository;
            _lyDoTuChoiRepository = lyDoTuChoiRepository;
            _cauHoiRepository = cauHoiRepository;
            _dapAnRepository = dapAnRepository;
            _signalRService = signalRService;
            _danhGiaRepository = danhGiaRepository;
        }


        #region GetListKhoaHoc
        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search)
        {
            search ??= new KhoaHocSearch();
            var result = await GetListFromDatabaseAsync(search);
            await GanDanhSachGiangVienHienThi(result.Items);
            return result;
        }

        #endregion

        #region SearchKhoaHocWithElasticsearch
        public async Task<PagedList<KhoaHocDto>> SearchWithElasticsearch(KhoaHocSearch search)
        {
            search ??= new KhoaHocSearch();
            await AddRegisteredCourseExclusionsAsync(search);

            PagedList<KhoaHocDto> result;
            try
            {
                result = await _elasticsearchService.SearchCoursesAsync(search);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch failed: {ex.Message}. Falling back to database.");
                result = await GetListFromDatabaseAsync(search);
            }

            await GanDanhSachGiangVienHienThi(result.Items);
            return result;
        }
        #endregion

        #region GetListKhoaHocByUser
        public async Task<PagedList<KhoaHocDto>> GetListByUser(KhoaHocSearch search)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không hợp lệ");

            search ??= new KhoaHocSearch();

            var registeredCourseIds = await _dangKyKhoaHocRepository.GetQueryable()
                .Where(dk => dk.IdNguoiDangKi == userId && !dk.IsDeleted && dk.IdKhoaHoc.HasValue)
                .Select(dk => dk.IdKhoaHoc!.Value)
                .ToListAsync();

            search.ExcludeCourseIds = registeredCourseIds;

            PagedList<KhoaHocDto> result;
            try
            {
                result = await _elasticsearchService.SearchCoursesAsync(search);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch failed: {ex.Message}. Falling back to database.");
                result = await GetListFromDatabaseAsync(search);
            }

            await GanDanhSachGiangVienHienThi(result.Items);
            return result;
        }
        #endregion

        private async Task AddRegisteredCourseExclusionsAsync(KhoaHocSearch search)
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId);

            if (userId == Guid.Empty)
                return;

            var registeredCourseIds = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(dk => dk.IdNguoiDangKi == userId
                    && !dk.IsDeleted
                    && dk.IdKhoaHoc.HasValue)
                .Select(dk => dk.IdKhoaHoc!.Value)
                .ToListAsync();

            search.ExcludeCourseIds = (search.ExcludeCourseIds ?? new List<Guid>())
                .Concat(registeredCourseIds)
                .Distinct()
                .ToList();
        }

        private async Task GanTenGiangVienHienThi(IEnumerable<KhoaHocDto> items)
        {
            var khoaHocIds = items.Select(x => x.Id).ToList();
            if (!khoaHocIds.Any()) return;

            var owners = await _khoaHoc_GiangVienRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => khoaHocIds.Contains(x.IdKhoaHoc) && !x.IsDeleted
                         && x.LaChuSoHuu && x.Visible)
                .Select(x => new { x.IdKhoaHoc, x.IdGiangVien })
                .ToListAsync();

            var giangVienIds = owners.Select(o => o.IdGiangVien).Distinct().ToList();
            var users = await _appUserService.GetQueryable()
                .AsNoTracking()
                .Where(u => giangVienIds.Contains(u.Id))
                .Select(u => new { u.Id, u.HoTen })
                .ToListAsync();

            var tenById = users.ToDictionary(u => u.Id, u => u.HoTen);

            foreach (var item in items)
            {
                var owner = owners.FirstOrDefault(o => o.IdKhoaHoc == item.Id);
                item.TenGiangVien = owner != null
                    ? tenById.GetValueOrDefault(owner.IdGiangVien)
                    : null;
            }
        }

        private async Task<PagedList<KhoaHocDto>> GetListFromDatabaseAsync(KhoaHocSearch search)
        {
            Guid.TryParse(
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
            out var currentUserId);
            // ← Thêm filter cơ bản để loại khóa học rác
            var query = GetAll()
                .Where(x => !x.IsDeleted
                         && x.TrangThai == "HoatDong"
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true
                         && x.TieuDe != null
                         && x.HinhAnhKhoaHoc != null);

            // Keyword Search
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var kw = search.Keyword.Trim().ToLower();
                query = query.Where(x =>
                    (x.TieuDe != null && x.TieuDe.ToLower().Contains(kw)) ||
                    (x.MoTa != null && x.MoTa.ToLower().Contains(kw)) ||
                    (x.LoaiKhoaHoc != null && x.LoaiKhoaHoc.ToLower().Contains(kw)));
            }

            if (currentUserId != Guid.Empty)
                query = query.Where(x => x.CreatedId != currentUserId);

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                var td = search.TieuDe.Trim().ToLower();
                query = query.Where(x => x.TieuDe != null && x.TieuDe.ToLower().Contains(td));
            }

            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
                query = query.Where(x => x.LoaiKhoaHoc == search.LoaiKhoaHoc);

            if (search.DanhMucId.HasValue)
            {
                var danhMucId = search.DanhMucId.Value;
                var courseIds = _eduverseContext.danhMuc_KhoaHocs
                    .Where(x => x.IdDanhMuc == danhMucId && !x.IsDeleted)
                    .Select(x => x.IdKhoaHoc);
                query = query.Where(x => courseIds.Contains(x.Id));
            }

            if (!string.IsNullOrWhiteSpace(search.CapDo))
                query = query.Where(x => x.CapDo == search.CapDo);

            if (search.IsFree == true)
                query = query.Where(x => x.Gia == 0 || x.Gia == null);
            else
            {
                if (search.GiaFrom.HasValue)
                    query = query.Where(x => x.Gia >= search.GiaFrom.Value);
                if (search.GiaTo.HasValue)
                    query = query.Where(x => x.Gia <= search.GiaTo.Value);
            }

            if (search.TongBaiGiangFrom.HasValue)
                query = query.Where(x => x.TongBaiGiang >= search.TongBaiGiangFrom.Value);
            if (search.TongBaiGiangTo.HasValue)
                query = query.Where(x => x.TongBaiGiang <= search.TongBaiGiangTo.Value);

            if (search.ExcludeCourseIds != null && search.ExcludeCourseIds.Any())
                query = query.Where(x => !search.ExcludeCourseIds.Contains(x.Id));

            // Sorting
            if (search.SortPrice?.ToLower() == "asc")
                query = query.OrderBy(x => x.Gia);
            else if (search.SortPrice?.ToLower() == "desc")
                query = query.OrderByDescending(x => x.Gia);
            else
                query = query.OrderByDescending(x => x.NgayTao);

            var itemsQuery = query.Select(x => new KhoaHocDto
            {
                Id = x.Id,
                TieuDe = x.TieuDe,
                MoTa = x.MoTa,
                Gia = x.Gia,
                GiaGoc = x.GiaGoc,
                LoaiKhoaHoc = x.LoaiKhoaHoc,
                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                CapDo = x.CapDo,
                TongThoiLuong = x.TongThoiLuong,
                TongBaiGiang = x.TongBaiGiang,
                SoLuongHocVien = _eduverseContext.dangKyKhoaHocs
                    .Where(dk => dk.IdKhoaHoc == x.Id
                        && !dk.IsDeleted
                        && dk.IsDangKy != false
                        && dk.IdNguoiDangKi.HasValue)
                    .Select(dk => dk.IdNguoiDangKi)
                    .Distinct()
                    .Count(),
                NgayTao = x.NgayTao,
                NgayCapNhat = x.NgayCapNhat,
                TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                TrangThai = x.TrangThai,
                CreatedId = x.CreatedId,
                CreatedBy = x.CreatedBy,
                CreatedDate = x.CreatedDate,
                IsBanHienTai = x.IsBanHienTai,
                IdBanGhiTruoc = x.IdBanGhiTruoc
            });

            var paged = await PagedList<KhoaHocDto>.CreateAsync(itemsQuery, search);
            await GanDanhSachGiangVienHienThi(paged.Items);
            return paged;
        }

        #region GetListDangKi
        public async Task<PagedList<GetDangKiKhoaHocDto>> GetListDangKi(KhoaHocDangKiSearch search)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không hợp lệ");

            search ??= new KhoaHocDangKiSearch();

            var query =
                from dk in _dangKyKhoaHocRepository.GetQueryable().AsNoTracking()
                join kh in GetAll()
                   on dk.IdKhoaHoc equals kh.Id
                where dk.IdNguoiDangKi == userId
                select new
                {
                    DangKyId = dk.Id,
                    NgayDangKy = dk.CreatedDate,
                    kh.Id,
                    kh.TieuDe,
                    kh.MoTa,
                    kh.LoaiKhoaHoc,
                    kh.HinhAnhKhoaHoc,
                    kh.URLViewPreviewKhoaHoc,
                    kh.CapDo,
                    kh.TongThoiLuong,
                    kh.SoLuongHocVien,
                    kh.TrangThaiPheDuyet
                };

            #region Filter

            // Lọc theo từ khóa
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                query = query.Where(x =>
                    (x.TieuDe ?? "").Contains(keyword) ||
                    (x.LoaiKhoaHoc ?? "").Contains(keyword));
            }

            #endregion

            #region Sort

            if (search.SapXepNgay == "Cu")
            {
                query = query.OrderBy(x => x.NgayDangKy);
            }
            else if (search.SapXepNgay == "Moi")
            {
                query = query.OrderByDescending(x => x.NgayDangKy);
            }
            else if (search.SapXepTen == "AZ")
            {
                query = query.OrderBy(x => x.TieuDe);
            }
            else if (search.SapXepTen == "ZA")
            {
                query = query.OrderByDescending(x => x.TieuDe);
            }
            else
            {
                query = query.OrderByDescending(x => x.NgayDangKy); // mặc định
            }

            #endregion

            var totalCount = await query.CountAsync();

            var pageData = await query
                .Skip((search.PageIndex - 1) * search.PageSize)
                .Take(search.PageSize)
                .ToListAsync();

            if (!pageData.Any())
            {
                return new PagedList<GetDangKiKhoaHocDto>(
                    new List<GetDangKiKhoaHocDto>(),
                    search.PageIndex,
                    search.PageSize,
                    totalCount);
            }

            var khoaHocIds = pageData.Select(x => x.Id).Distinct().ToList();
            var dangKyIds = pageData.Select(x => x.DangKyId).Distinct().ToList();
            var baiGiangList = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !bg.IsDeleted
                select new
                {
                    IdKhoaHoc = ph.IdKhoaHoc.Value,
                    IdBaiGiang = bg.Id,
                    ThoiLuong = bg.ThoiLuong
                }
            ).ToListAsync();

            // Tổng số bài giảng theo khoá học
            var tongBaiGiangDict = baiGiangList
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(g => g.Key, g => g.Count());

            // Tổng thời lượng theo khoá học
            var tongThoiLuongDict = baiGiangList
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.ThoiLuong));

            // Danh sách IdBaiGiang hợp lệ (dùng để đối chiếu tiến độ)
            var allBaiGiangIds = baiGiangList
                .Select(x => x.IdBaiGiang)
                .Distinct()
                .ToList();

            // ---------------------------------------------------------------
            // Tiến độ: đếm bài giảng đã hoàn thành theo đăng ký
            // ---------------------------------------------------------------
            var tienDoDict = await (
                from td in _tienDoHocTapRepository.GetQueryable().AsNoTracking()
                where td.IdDangKi.HasValue
                      && dangKyIds.Contains(td.IdDangKi.Value)
                      && td.TrangThai == "HoanThanh"
                      && allBaiGiangIds.Contains(td.IdBaiGiang.Value)
                group td by td.IdDangKi.Value into g
                select new
                {
                    IdDangKy = g.Key,
                    SoBaiGiangHoanThanh = g.Select(x => x.IdBaiGiang).Distinct().Count()
                }
            ).ToDictionaryAsync(x => x.IdDangKy, x => x.SoBaiGiangHoanThanh);

            var items = pageData
                .Select(x =>
                {
                    var tongBaiGiang = tongBaiGiangDict.TryGetValue(x.Id, out var tong) ? tong : 0;
                    var soBaiDaHoc = tienDoDict.TryGetValue(x.DangKyId, out var hoc) ? hoc : 0;
                    var tongThoiLuong = tongThoiLuongDict.TryGetValue(x.Id, out var tl) ? tl : 0;

                    return new GetDangKiKhoaHocDto
                    {
                        Id = x.Id,
                        idDangKiKhoaHoc = x.DangKyId,
                        TieuDe = x.TieuDe,
                        MoTa = x.MoTa,
                        LoaiKhoaHoc = x.LoaiKhoaHoc,
                        HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                        CapDo = x.CapDo,
                        TongThoiLuong = tongThoiLuong,
                        SoLuongHocVien = x.SoLuongHocVien,
                        DaDangKy = true,
                        NgayDangKy = x.NgayDangKy,
                        TongBaiGiang = tongBaiGiang,
                        SoBaiGiangHoanThanh = soBaiDaHoc,
                        PhanTramHoanThanh = tongBaiGiang > 0
                            ? Math.Round((double)soBaiDaHoc * 100 / tongBaiGiang)
                            : 0
                    };
                })
                .ToList();

            return new PagedList<GetDangKiKhoaHocDto>(
                items,
                search.PageIndex,
                search.PageSize,
                totalCount);
        }
        #endregion

        #region GetKhoaHocPreview (Public - chưa đăng ký)
        public async Task<KhoaHocDto> GetKhoaHocPreview(Guid idKhoaHoc)
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId);

            // 1. Lấy thông tin khóa học
            var khoaHoc = await GetAll()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.TrangThai == "HoatDong"
                         && x.IsBanHienTai == true)
                .Select(x => new KhoaHocDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                    LoaiKhoaHoc = x.LoaiKhoaHoc,
                    Gia = x.Gia,
                    GiaGoc = x.GiaGoc,
                    CreatedBy = x.CreatedBy,
                    CreatedId = x.CreatedId,
                    DanhSachPhanHoc = new List<PhanHocDto>()
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            await GanDanhSachGiangVienHienThi(new[] { khoaHoc });

            var soHocVien = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                    && !x.IsDeleted
                    && x.IsDangKy != false
                    && x.IdNguoiDangKi.HasValue)
                .Select(x => x.IdNguoiDangKi)
                .Distinct()
                .CountAsync();
            khoaHoc.SoLuongHocVien = soHocVien;

            
            bool daDangKy = false;
            Guid? idDangKiKhoaHoc = Guid.Empty;

            if (userId != Guid.Empty)
            {
                var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.IdKhoaHoc == idKhoaHoc &&
                        x.IdNguoiDangKi == userId &&
                        !x.IsDeleted);

                daDangKy = dangKy != null;
                if (daDangKy)
                    idDangKiKhoaHoc = dangKy.Id;
            }

            khoaHoc.DaDangKy = daDangKy;
            khoaHoc.idDangKiKhoaHoc = idDangKiKhoaHoc.Value; 
            

            // 4. Lấy danh sách phần học
            var phanHocs = await _phanRepository.GetAll()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && x.TrangThai == "HoatDong"
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true)
                .OrderBy(x => x.ThuTuSapXep)
                .Select(x => new PhanHocDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdKhoaHoc,
                    TenPhan = x.TenPhan,
                    MieuTa = x.MieuTa,
                    ThuTuSapXep = x.ThuTuSapXep,
                    DanhSachBaiGiang = new List<BaiGiangDto>()
                })
                .ToListAsync();

            // Gán thứ tự lại từ 1
            for (int i = 0; i < phanHocs.Count; i++)
                phanHocs[i].ThuTuSapXep = i + 1;

            khoaHoc.DanhSachPhanHoc = phanHocs;

            if (!phanHocs.Any())
            {
                khoaHoc.TongBaiGiang = 0;
                khoaHoc.TongThoiLuong = 0;
                khoaHoc.TongTaiLieu = 0;
                return khoaHoc;
            }

            var phanIds = phanHocs.Select(x => x.Id).ToList();

            // 5. Lấy danh sách bài giảng
            var baiGiangs = await _baiGiangRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => phanIds.Contains(x.IdPhan)
                         && !x.IsDeleted
                         && x.TrangThai != "ChoDuyet"
                         && x.TrangThai != "DangSua"
                         && x.IsBanHienTai == true)
                .OrderBy(x => x.ThuTuSapXep)
                .Select(x => x.LaBaiGiangFree == true
                    ? new BaiGiangDto
                    {
                        Id = x.Id,
                        IdGoc = x.Id,
                        IdPhan = x.IdPhan,
                        TieuDe = x.TieuDe,
                        LoaiBaiGiang = x.LoaiBaiGiang,
                        IdVideoBaiGiang = x.IdVideoBaiGiang,
                        URLBaiGiang = x.URLBaiGiang,
                        ThuTuSapXep = x.ThuTuSapXep,
                        ThoiLuong = x.ThoiLuong,
                        LaBaiGiangFree = x.LaBaiGiangFree
                    }
                    : new BaiGiangDto
                    {
                        Id = x.Id,
                        IdPhan = x.IdPhan,
                        TieuDe = x.TieuDe,
                        ThuTuSapXep = x.ThuTuSapXep,
                        ThoiLuong = x.ThoiLuong,
                        LaBaiGiangFree = x.LaBaiGiangFree
                    })
                .ToListAsync();

            khoaHoc.TongBaiGiang = baiGiangs.Count;
            khoaHoc.TongThoiLuong = baiGiangs.Sum(x => x.ThoiLuong ?? 0);

            // 6. Lấy tổng số tài liệu
            var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();
            var tongTaiLieu = await _taiLieuRepository.GetQueryable()
                .AsNoTracking()
                .CountAsync(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted);
            khoaHoc.TongTaiLieu = tongTaiLieu;

            // 7. Gắn bài giảng vào từng phần
            var baiGiangByPhan = baiGiangs
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var phan in phanHocs)
            {
                if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
                    phan.DanhSachBaiGiang = list;
            }

            return khoaHoc;
        }
        #endregion

        #region GetLearning with Cache & Realtime

        #region Cache Keys
        private static class CacheKeys
        {
            public static string SoHocVien(Guid? khoaHocId) => $"SoHocVien_{khoaHocId}";
            public static string SoCauHoiOfQuiz(List<Guid> quizIds) => $"SoCauHoiOfQuiz_{string.Join("_", quizIds.OrderBy(x => x))}";
            public static string KhoaHoc(Guid? khoaHocId) => $"KhoaHoc_{khoaHocId}";
            public static string PhanHocs(Guid? khoaHocId) => $"PhanHocs_{khoaHocId}";
            public static string BaiGiangs(List<Guid> phanIds) => $"BaiGiangs_{string.Join("_", phanIds.OrderBy(x => x))}";
            public static string BaiKiemTra(List<Guid> phanIds) => $"BaiKiemTra_{string.Join("_", phanIds.OrderBy(x => x))}";
            public static string BaiKiemTraFull(List<Guid> phanIds) => $"BaiKiemTraFull_{string.Join("_", phanIds.OrderBy(x => x))}";
            public static string TaiLieus(List<Guid> baiGiangIds) => $"TaiLieus_{string.Join("_", baiGiangIds.OrderBy(x => x))}";
        }
        #endregion

        #region TinhPhanTramHoanThanh (Real-time - NO CACHE, KHÔNG SWAP)
        public async Task<double> TinhPhanTramHoanThanh(Guid? idDangKy, DateTime? ngayDangKy = null)
        {
            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .Select(x => new { x.IdKhoaHoc, x.IdNguoiDangKi, x.CreatedDate })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var idKhoaHoc = dangKy.IdKhoaHoc;
            var userId = dangKy.IdNguoiDangKi;

            var phanIds = await GetOrCreateCacheAsync(
                CacheKeys.PhanHocs(idKhoaHoc),
                async () => await _phanRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync(),
                TimeSpan.FromMinutes(30));

            if (!phanIds.Any())
                return 0;

            // Lấy tất cả bài giảng GỐC (chuẩn để tính tổng số)
            var baiGiangGocIds = await GetOrCreateCacheAsync(
                CacheKeys.BaiGiangs(phanIds),
                async () => await _baiGiangRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan)
                             && !x.IsDeleted
                             && x.TrangThai == "HoatDong"
                             && x.IsBanHienTai == true)
                    .Select(x => x.Id)
                    .ToListAsync(),
                TimeSpan.FromMinutes(30));

            var tongBaiGiang = baiGiangGocIds.Count;
            var baiGiangGocSet = baiGiangGocIds.ToHashSet();

            // Lấy tiến độ hoàn thành của user (chỉ tính khớp với bài giảng gốc)
            var tienDoHoanThanhIds = await _tienDoHocTapRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang.HasValue
                         && x.TrangThai == "HoanThanh"
                         && !x.IsDeleted)
                .Select(x => x.IdBaiGiang!.Value)
                .ToListAsync();

            var hoanThanhBaiGiang = tienDoHoanThanhIds
                .Where(id => baiGiangGocSet.Contains(id))
                .Distinct()
                .Count();

            // Bài kiểm tra
            var baiKiemTraTheoPhans = await GetOrCreateCacheAsync(
                CacheKeys.BaiKiemTra(phanIds),
                async () => await _baiKiemTraRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan.Value)
                             && !x.IsDeleted
                             && x.TrangThai == "HoatDong")
                    .Select(x => new { x.Id, x.IdPhan, x.DiemDat })
                    .ToListAsync(),
                TimeSpan.FromMinutes(30));

            var baiKiemTraIds = baiKiemTraTheoPhans.Select(x => x.Id).ToList();

            if (!baiKiemTraIds.Any())
            {
                var phanTrambg = tongBaiGiang == 0 ? 0 : Math.Round((double)hoanThanhBaiGiang / tongBaiGiang * 100, 2);
                return phanTrambg;
            }

            var lanLamHoanThanhList = await _lanLamBaiKiemTraService.GetQueryable()
                .AsNoTracking()
                .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
                         && x.IdNguoiDung == userId
                         && x.TrangThai == "HoanThanh"
                         && !x.IsDeleted)
                .OrderBy(x => x.ThoiGianNop)
                .Select(x => new { x.IdBaiKiemTra, x.TongDiemLanKiemTra, x.ThoiGianNop })
                .ToListAsync();

            var lanLamHoanThanhNhat = lanLamHoanThanhList
                .GroupBy(x => x.IdBaiKiemTra)
                .Select(g => g.OrderBy(x => x.ThoiGianNop).First())
                .ToDictionary(x => x.IdBaiKiemTra!.Value, x => x.TongDiemLanKiemTra);

            var diemDatMap = baiKiemTraTheoPhans
                .ToDictionary(x => x.Id, x => x.DiemDat ?? 0);

            var quizDatIds = lanLamHoanThanhNhat
                .Where(x => x.Value >= diemDatMap.GetValueOrDefault(x.Key, 0))
                .Select(x => x.Key)
                .ToHashSet();

            var baiKiemTraByPhan = baiKiemTraTheoPhans
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.Select(q => q.Id).ToList());

            var soPhanHoanThanhQuiz = baiKiemTraByPhan
                .Count(phan => phan.Value.All(quizId => quizDatIds.Contains(quizId)));

            var tongPhanCoQuiz = baiKiemTraByPhan.Count;
            var tongItem = tongBaiGiang + tongPhanCoQuiz;
            var hoanThanhItem = hoanThanhBaiGiang + soPhanHoanThanhQuiz;

            var phanTram = tongItem == 0 ? 0 : Math.Round((double)hoanThanhItem / tongItem * 100, 2);

            return phanTram;
        }
        #endregion

        #region GetLearning
            public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
            {
                Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiDangKi);

                if (idDangKy == Guid.Empty)
                    throw new ArgumentException("Id đăng ký không hợp lệ");

                var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => (x.Id == idDangKy || x.IdKhoaHoc == idDangKy) && !x.IsDeleted && x.IdNguoiDangKi == nguoiDangKi)
                    .Select(x => new { x.Id, x.IdKhoaHoc, x.IdNguoiDangKi, x.CreatedDate })
                    .FirstOrDefaultAsync();

                if (dangKy == null)
                    throw new Exception("Bạn chưa đăng ký khóa học này");   

                var idKhoaHoc = dangKy.IdKhoaHoc;

                _cache.Remove(CacheKeys.KhoaHoc(idKhoaHoc));
                _cache.Remove(CacheKeys.PhanHocs(idKhoaHoc));

            // Cache: số học viên
            var soHocVien = await GetOrCreateCacheAsync(
                    CacheKeys.SoHocVien(idKhoaHoc),
                    () => _dangKyKhoaHocRepository.GetQueryable()
                        .AsNoTracking()
                        .CountAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted),
                    TimeSpan.FromMinutes(10));

                // Cache: thông tin khóa học
                var khoaHoc = await GetOrCreateCacheAsync(
        CacheKeys.KhoaHoc(idKhoaHoc),
        async () =>
        {
        var result = await GetAll()
            .AsNoTracking()
            .Where(x => x.Id == idKhoaHoc
                    && (x.TrangThaiPheDuyet == "DaDuyet")
                    && (x.TrangThai == "HoatDong" || x.TrangThai == "NgungHoatDong")
                    && x.IsBanHienTai == true)
                        .Select(x => new KhoaHocDto
                        {
                            Id = x.Id,
                            TieuDe = x.TieuDe,
                            MoTa = x.MoTa,
                            HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                            LoaiKhoaHoc = x.LoaiKhoaHoc,
                            SoLuongHocVien = soHocVien,
                            CreatedId = x.CreatedId,
                            ThongTinGiangVien = new AppUser(),
                            DanhSachPhanHoc = new List<PhanHocDto>()
                        })
                        .FirstOrDefaultAsync();

            // Thử query không có điều kiện để xem data thật
            var check = await GetAll()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc)
                .Select(x => new { x.Id, x.TieuDe, x.TrangThai, x.TrangThaiPheDuyet, x.IsBanHienTai, x.IsDeleted })
                .FirstOrDefaultAsync();


            var giangVien = await _appUserService.GetQueryable().FirstOrDefaultAsync(x => x.Id == result.CreatedId);

            if(giangVien != null)
            {
                result.ThongTinGiangVien = new AppUser
                {
                    Id = giangVien.Id,
                    AnhDaiDien = giangVien.AnhDaiDien,
                    HoTen = giangVien.HoTen,
                    TieuSu = giangVien.TieuSu

                };
            }

            return result;
                },
                TimeSpan.FromMinutes(30));


            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            // Cache: danh sách phần học
            var phanHocs = await GetOrCreateCacheAsync(
                CacheKeys.PhanHocs(idKhoaHoc),
                async () =>
                {
                    var list = await _phanRepository.GetAll()
                        .AsNoTracking()
                        .Where(x => x.IdKhoaHoc == idKhoaHoc
                             && x.TrangThai == "HoatDong"
                             && x.TrangThaiPheDuyet == "DaDuyet"
                             && x.IsDeleted == false  // ← thay thế
                             && x.IsBanHienTai == true)
                        .OrderBy(x => x.ThuTuSapXep)
                        .Select(x => new PhanHocDto
                        {
                            Id = x.Id,
                            IdKhoaHoc = x.IdKhoaHoc,
                            TenPhan = x.TenPhan,
                            MieuTa = x.MieuTa,
                            ThuTuSapXep = x.ThuTuSapXep,
                            DanhSachBaiGiang = new List<BaiGiangDto>()
                        })
                        .ToListAsync();

                    for (int i = 0; i < list.Count; i++)
                        list[i].ThuTuSapXep = i + 1;

                    return list;
                },
                TimeSpan.FromMinutes(30));

            khoaHoc.DanhSachPhanHoc = phanHocs;

            if (!phanHocs.Any())
            {
                khoaHoc.PhanTramHoanThanh = 0;
                return khoaHoc;
            }

            var phanIds = phanHocs.Select(x => x.Id).ToList();

            // Cache: bài giảng GỐC (dùng trực tiếp, không xử lý swap)
            var baiGiangs = await GetOrCreateCacheAsync(
                CacheKeys.BaiGiangs(phanIds),
                () => _baiGiangRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan)
                             && x.IsDeleted == false  // ← thay thế
                             && x.TrangThai == "HoatDong"
                             && x.TrangThaiPheDuyet == "DaDuyet"
                             && x.IsBanHienTai == true)
                    .OrderBy(x => x.ThuTuSapXep)
                    .Select(x => new BaiGiangDto
                    {
                        Id = x.Id,
                        IdGoc = x.Id,
                        IdPhan = x.IdPhan,
                        TieuDe = x.TieuDe,
                        LoaiBaiGiang = x.LoaiBaiGiang,
                        IdVideoBaiGiang = x.IdVideoBaiGiang,
                        URLBaiGiang = x.URLBaiGiang,
                        ThuTuSapXep = x.ThuTuSapXep,
                        ThoiLuong = x.ThoiLuong,
                        LaBaiGiangFree = x.LaBaiGiangFree,
                        DanhSachTaiLieu = new List<TaiLieuDto>()
                    })
                    .ToListAsync(),
                TimeSpan.FromMinutes(30));

            var baiGiangGocIds = baiGiangs.Select(x => x.Id).ToList();

            // Tiến độ của user
            var tienDoRaw = await _tienDoHocTapRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang.HasValue
                         && !x.IsDeleted)
                .Select(x => new { x.IdBaiGiang, x.ThoiGianXem, x.TrangThai })
                .ToListAsync();

            // Tài liệu cache theo gốc
            var taiLieuList = await GetOrCreateCacheAsync(
                CacheKeys.TaiLieus(baiGiangGocIds),
                () => _taiLieuRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => baiGiangGocIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                    .Select(x => new TaiLieuDto
                    {
                        Id = x.Id,
                        IdBaiGiang = x.IdBaiGiang,
                        TenTaiLieu = x.TenTaiLieu,
                        LoaiTaiLieu = x.LoaiTaiLieu,
                        URL = x.URL
                    })
                    .ToListAsync(),
                TimeSpan.FromMinutes(60));

            var baiKiemTraList = await GetOrCreateCacheAsync(
                CacheKeys.BaiKiemTraFull(phanIds),
                async () => await _baiKiemTraRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan.Value)
                             && !x.IsDeleted
                             && x.TrangThai == "HoatDong")
                    .Select(x => new
                    {
                        x.Id,
                        x.IdPhan,
                        x.DiemDat,
                        x.TenBaiKiemTra
                    })
                    .ToListAsync(),
                TimeSpan.FromMinutes(30));

            var baiKiemTraIds = baiKiemTraList.Select(x => x.Id).ToList();

            // Cache: số câu hỏi theo từng bài kiểm tra
            var soCauHoiMap = new Dictionary<Guid, int>();
            if (baiKiemTraIds.Any())
            {
                soCauHoiMap = await GetOrCreateCacheAsync(
                    CacheKeys.SoCauHoiOfQuiz(baiKiemTraIds),
                    async () =>
                    {
                        var counts = await _cauHoiService.GetQueryable()
                            .AsNoTracking()
                            .Where(x => x.IdBaiKiemTra.HasValue
                                     && baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
                                     && !x.IsDeleted)
                            .GroupBy(x => x.IdBaiKiemTra!.Value)
                            .Select(g => new { IdBaiKiemTra = g.Key, SoCauHoi = g.Count() })
                            .ToListAsync();
                        return counts.ToDictionary(x => x.IdBaiKiemTra, x => x.SoCauHoi);
                    },
                    TimeSpan.FromMinutes(30));
            }

            var baiKiemTraByPhan = baiKiemTraList
                .Where(x => x.IdPhan.HasValue)
                .GroupBy(x => x.IdPhan!.Value)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => new BaiKiemTraDto
                    {
                        Id = x.Id,
                        IdPhan = x.IdPhan,
                        TenBaiKiemTra = x.TenBaiKiemTra,
                        DiemDat = x.DiemDat,
                        SoCauHoi = soCauHoiMap.GetValueOrDefault(x.Id, 0),
                        DanhSachCauHois = new List<CauHoiDto>()
                    }).ToList());

            // Map tiến độ trực tiếp theo Id (không còn ánh xạ swap/gốc)
            var tienDoDict = new Dictionary<Guid, (int ThoiGianXem, string TrangThai)>();
            foreach (var t in tienDoRaw)
            {
                tienDoDict[t.IdBaiGiang!.Value] = (t.ThoiGianXem ?? 0, t.TrangThai);
            }

            // Tính % hoàn thành
            var phanTram = await TinhPhanTramHoanThanh(idDangKy, dangKy.CreatedDate);

            var taiLieuLookup = taiLieuList
                .GroupBy(x => x.IdBaiGiang)
                .ToDictionary(x => x.Key, x => x.ToList());

            // Gán dữ liệu
            int tongBaiGiang = 0, tongThoiLuong = 0, hoanThanhBaiGiang = 0;
            foreach (var bg in baiGiangs)
            {
                tongBaiGiang++;
                tongThoiLuong += bg.ThoiLuong ?? 0;
                if (tienDoDict.TryGetValue(bg.Id, out var td))
                {
                    bg.DaHoanThanh = td.TrangThai == "HoanThanh";
                    bg.ThoiGianXem = td.ThoiGianXem;
                    if (bg.DaHoanThanh) hoanThanhBaiGiang++;
                }
                if (taiLieuLookup.TryGetValue(bg.IdGoc, out var tls))
                    bg.DanhSachTaiLieu = tls;
            }

            // Gắn vào phần học
            var baiGiangByPhan = baiGiangs
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var phan in phanHocs)
            {
                if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
                    phan.DanhSachBaiGiang = list;

                if (baiKiemTraByPhan.TryGetValue(phan.Id, out var listBkt))
                    phan.DanhSachBaiKiemTra = listBkt;
            }

            khoaHoc.TongBaiGiang = tongBaiGiang;
            khoaHoc.TongThoiLuong = tongThoiLuong;
            khoaHoc.SoBaiGiangHoanThanh = hoanThanhBaiGiang;
            khoaHoc.PhanTramHoanThanh = phanTram;

            return khoaHoc;
        }
        #endregion

        #region Helper Methods
        private async Task<T> GetOrCreateCacheAsync<T>(string cacheKey, Func<Task<T>> factory, TimeSpan expiration)
        {
            if (_memoryCache.TryGetValue(cacheKey, out T cachedData))
                return cachedData;

            var data = await factory();
            _memoryCache.Set(cacheKey, data, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration,
                SlidingExpiration = TimeSpan.FromMinutes(5),
                Priority = CacheItemPriority.Normal
            });
            return data;
        }

        public void InvalidateCourseCache(Guid khoaHocId, List<Guid> phanIds = null)
        {
            _memoryCache.Remove(CacheKeys.SoHocVien(khoaHocId));
            _memoryCache.Remove(CacheKeys.KhoaHoc(khoaHocId));
            _memoryCache.Remove(CacheKeys.PhanHocs(khoaHocId));
            if (phanIds != null && phanIds.Any())
            {
                _memoryCache.Remove(CacheKeys.BaiGiangs(phanIds));
                _memoryCache.Remove(CacheKeys.BaiKiemTra(phanIds));
                _memoryCache.Remove(CacheKeys.BaiKiemTraFull(phanIds));
            }
        }

        private void ClearAllCache()
        {
            if (_memoryCache is MemoryCache memoryCache)
                memoryCache.Compact(1.0);
        }
        #endregion

        #endregion

        public async Task<KhoaHocDto> ChuyenTrangThaiChoDuyet(Guid idKhoaHoc)
        {
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Không xác định được người dùng");

            var khoaHoc = await GetQueryable()
                .Where(x => x.Id == idKhoaHoc && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học nào");

            var coQuyenGuiDuyet = await CoQuyenTrenKhoaHoc(khoaHoc.Id, userId, gv => gv.Manage);
            if (!coQuyenGuiDuyet)
                throw new Exception($"Bạn không có quyền hạn để sửa khóa học: {khoaHoc.Id}");

            var khoaHocNhap = await GetQueryable()
                .Where(kh => kh.IdBanGhiTruoc == khoaHoc.Id && !kh.IsDeleted)
                .FirstOrDefaultAsync();

            var khoaHocToUpdate = new List<KhoaHoc>();
            var phanUpdate = new List<Phan>();
            var baiGiangToUpdate = new List<BaiGiang>();
            var taiLieuToUpdate = new List<TaiLieu>();
            var baiKiemTraToUpdate = new List<BaiKiemTra>();
            var cauHoiToUpdate = new List<CauHoi>();
            var dapAnToUpdate = new List<DapAn>();

            // 1. Nếu khóa học đang DangSua thì chuyển ChoDuyet
            if (khoaHoc.TrangThaiPheDuyet == "DangSua")
            {
                khoaHoc.TrangThaiPheDuyet = "ChoDuyet";
                khoaHoc.TrangThai = "ChoDuyet";
                khoaHocToUpdate.Add(khoaHoc);
            }

            if (khoaHocNhap != null && khoaHocNhap.TrangThaiPheDuyet == "DangSua")
            {
                khoaHocNhap.TrangThaiPheDuyet = "ChoDuyet";
                khoaHocNhap.TrangThai = "ChoDuyet";
                khoaHocToUpdate.Add(khoaHocNhap);
            }

            // 2. Lấy tất cả phần học thuộc khóa học này
            var phanHocs = await _phanRepository.GetQueryable()
                .Where(p => p.IdKhoaHoc == idKhoaHoc && !p.IsDeleted)
                .ToListAsync();

            if (phanHocs.Any())
            {
                foreach (var ph in phanHocs)
                {
                    ph.TrangThaiPheDuyet = "ChoDuyet";
                    ph.TrangThai = "ChoDuyet";
                    phanUpdate.Add(ph);
                }

                var phanHocIds = phanHocs.Select(p => p.Id).ToList();

                // Bài giảng đang DangSua
                var baiGiangs = await _baiGiangRepository.GetQueryable()
                    .Where(b => phanHocIds.Contains(b.IdPhan) && !b.IsDeleted && b.TrangThaiPheDuyet == "DangSua")
                    .ToListAsync();

                foreach (var bg in baiGiangs)
                {
                    bg.TrangThaiPheDuyet = "ChoDuyet";
                    bg.TrangThai = "ChoDuyet";
                    baiGiangToUpdate.Add(bg);
                }

                // Tài liệu thuộc bài giảng hiện tại (bản hiện hành)
                var baiGiangHienTaiIds = await _baiGiangRepository.GetQueryable()
                    .Where(b => phanHocIds.Contains(b.IdPhan) && !b.IsDeleted && b.IsBanHienTai == true)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (baiGiangHienTaiIds.Any())
                {
                    var taiLieus = await _taiLieuRepository.GetQueryable()
                        .Where(t => baiGiangHienTaiIds.Contains(t.IdBaiGiang) && !t.IsDeleted && t.TrangThaiPheDuyet == "DangSua")
                        .ToListAsync();

                    foreach (var tl in taiLieus)
                    {
                        tl.TrangThaiPheDuyet = "ChoDuyet";
                        tl.TrangThai = "ChoDuyet";
                        tl.UpdatedDate = DateTime.UtcNow;
                        taiLieuToUpdate.Add(tl);
                    }
                }

                // Bài kiểm tra đang DangSua
                var baiKiemTras = await _baiKiemTraRepository.GetQueryable()
                    .Where(b => b.IdPhan.HasValue && phanHocIds.Contains(b.IdPhan.Value) && !b.IsDeleted && b.TrangThaiPheDuyet == "DangSua")
                    .ToListAsync();

                foreach (var bkt in baiKiemTras)
                {
                    bkt.TrangThaiPheDuyet = "ChoDuyet";
                    bkt.TrangThai = "ChoDuyet";
                    baiKiemTraToUpdate.Add(bkt);
                }
                var allBaiKiemTraIds = await _baiKiemTraRepository.GetQueryable()
                    .Where(b => b.IdPhan.HasValue && phanHocIds.Contains(b.IdPhan.Value) && !b.IsDeleted)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (allBaiKiemTraIds.Any())
                {
                    var cauHois = await _cauHoiService.GetQueryable()
                        .Where(c => c.IdBaiKiemTra.HasValue && allBaiKiemTraIds.Contains(c.IdBaiKiemTra.Value) && !c.IsDeleted && c.TrangThaiPheDuyet == "DangSua")
                        .ToListAsync();

                    foreach (var ch in cauHois)
                    {
                        ch.TrangThaiPheDuyet = "ChoDuyet";
                        ch.TrangThai = "ChoDuyet";
                        cauHoiToUpdate.Add(ch);
                    }

                    var allCauHoiIds = await _cauHoiService.GetQueryable()
                        .Where(c => c.IdBaiKiemTra.HasValue && allBaiKiemTraIds.Contains(c.IdBaiKiemTra.Value) && !c.IsDeleted)
                        .Select(c => c.Id)
                        .ToListAsync();

                    if (allCauHoiIds.Any())
                    {
                        var dapAns = await _dapAnService.GetQueryable()
                            .Where(d => d.IdCauHoi.HasValue && allCauHoiIds.Contains(d.IdCauHoi.Value) && !d.IsDeleted && d.TrangThaiPheDuyet == "DangSua")
                            .ToListAsync();

                        foreach (var da in dapAns)
                        {
                            da.TrangThaiPheDuyet = "ChoDuyet";
                            da.TrangThai = "ChoDuyet";
                            dapAnToUpdate.Add(da);
                        }
                    }
                }
            }

            if (!khoaHocToUpdate.Any() && !baiGiangToUpdate.Any() && !taiLieuToUpdate.Any()
                && !baiKiemTraToUpdate.Any() && !cauHoiToUpdate.Any() && !dapAnToUpdate.Any())
            {
                throw new Exception("Không có phần nào đang ở trạng thái Đang sửa để chuyển sang Chờ duyệt");
            }

            var executionStrategy = _eduverseContext.Database.CreateExecutionStrategy();
            await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _eduverseContext.Database.BeginTransactionAsync();
                try
                {
                    if (khoaHocToUpdate.Any())
                        await UpdateAsync(khoaHocToUpdate);

                    if (phanUpdate.Any())
                    {
                        foreach (var ph in phanUpdate)
                        {
                            _phanRepository.Update(ph);
                        }
                    }

                    if (baiGiangToUpdate.Any())
                        await _baiGiangService.UpdateAsync(baiGiangToUpdate);

                    if (taiLieuToUpdate.Any())
                        await _taiLieuService.UpdateAsync(taiLieuToUpdate);

                    foreach (var item in baiKiemTraToUpdate)
                        _baiKiemTraRepository.Update(item);

                    if (cauHoiToUpdate.Any())
                        await _cauHoiService.UpdateAsync(cauHoiToUpdate);

                    if (dapAnToUpdate.Any())
                        await _dapAnService.UpdateAsync(dapAnToUpdate);

                    await _eduverseContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            var approvalPayload = new NotificationPayload
            {
                TieuDe = "Khóa học mới chờ phê duyệt",
                NoiDung = $"Giảng viên đã gửi khóa học '{khoaHoc.TieuDe}' để phê duyệt.",
                LoaiThongBao = "KhoaHocChoDuyet",
                Link = $"/admin/approve-courses/{khoaHoc.Id}",
                FromUser = userId,
                ItemId = khoaHoc.Id,
                ItemName = khoaHoc.TieuDe
            };
            await _notificationPublisher.NotifyRoleAsync("Admin", approvalPayload, new[] { userId });

            return _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHoc);
        }

        public async Task<KhoaHocDto> ChuyenTrangThaiDangSua(Guid idKhoaHoc)
        {
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Không xác định được người dùng");

            var khoaHoc = await GetQueryable()
                .Where(x => x.Id == idKhoaHoc && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học nào");

            var coQuyenGuiDuyet = await CoQuyenTrenKhoaHoc(khoaHoc.Id, userId, gv => gv.Manage);
            if (!coQuyenGuiDuyet)
                throw new Exception($"Bạn không có quyền hạn để sửa khóa học: {khoaHoc.Id}");

            var khoaHocNhap = await GetQueryable()
                .Where(kh => kh.IdBanGhiTruoc == khoaHoc.Id && !kh.IsDeleted)
                .FirstOrDefaultAsync();

            var khoaHocToUpdate = new List<KhoaHoc>();
            var phanUpdate = new List<Phan>();
            var baiGiangToUpdate = new List<BaiGiang>();
            var taiLieuToUpdate = new List<TaiLieu>();
            var baiKiemTraToUpdate = new List<BaiKiemTra>();
            var cauHoiToUpdate = new List<CauHoi>();
            var dapAnToUpdate = new List<DapAn>();

            // 1. Nếu khóa học đang DangSua thì chuyển ChoDuyet
            if (khoaHoc.TrangThaiPheDuyet == "ChoDuyet")
            {
                khoaHoc.TrangThaiPheDuyet = "DangSua";
                khoaHoc.TrangThai = "DangSua";
                khoaHocToUpdate.Add(khoaHoc);
            }

            if (khoaHocNhap != null && khoaHocNhap.TrangThaiPheDuyet == "ChoDuyet")
            {
                khoaHocNhap.TrangThaiPheDuyet = "DangSua";
                khoaHocNhap.TrangThai = "DangSua";
                khoaHocToUpdate.Add(khoaHocNhap);
            }

            // 2. Lấy tất cả phần học thuộc khóa học này
            var phanHocs = await _phanRepository.GetQueryable()
                .Where(p => p.IdKhoaHoc == idKhoaHoc && !p.IsDeleted)
                .ToListAsync();

            if (phanHocs.Any())
            {
                foreach (var ph in phanHocs)
                {
                    ph.TrangThaiPheDuyet = "DangSua";
                    ph.TrangThai = "DangSua";
                    phanUpdate.Add(ph);
                }

                var phanHocIds = phanHocs.Select(p => p.Id).ToList();

                // Bài giảng đang DangSua
                var baiGiangs = await _baiGiangRepository.GetQueryable()
                    .Where(b => phanHocIds.Contains(b.IdPhan) && !b.IsDeleted && b.TrangThaiPheDuyet == "DangSua")
                    .ToListAsync();

                foreach (var bg in baiGiangs)
                {
                    bg.TrangThaiPheDuyet = "DangSua";
                    bg.TrangThai = "DangSua";
                    baiGiangToUpdate.Add(bg);
                }

                // Tài liệu thuộc bài giảng hiện tại (bản hiện hành)
                var baiGiangHienTaiIds = await _baiGiangRepository.GetQueryable()
                    .Where(b => phanHocIds.Contains(b.IdPhan) && !b.IsDeleted && b.IsBanHienTai == true)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (baiGiangHienTaiIds.Any())
                {
                    var taiLieus = await _taiLieuRepository.GetQueryable()
                        .Where(t => baiGiangHienTaiIds.Contains(t.IdBaiGiang) && !t.IsDeleted && t.TrangThaiPheDuyet == "ChoDuyet")
                        .ToListAsync();

                    foreach (var tl in taiLieus)
                    {
                        tl.TrangThaiPheDuyet = "DangSua";
                        tl.TrangThai = "DangSua";
                        tl.UpdatedDate = DateTime.UtcNow;
                        taiLieuToUpdate.Add(tl);
                    }
                }

                // Bài kiểm tra đang DangSua
                var baiKiemTras = await _baiKiemTraRepository.GetQueryable()
                    .Where(b => b.IdPhan.HasValue && phanHocIds.Contains(b.IdPhan.Value) && !b.IsDeleted && b.TrangThaiPheDuyet == "ChoDuyet")
                    .ToListAsync();

                foreach (var bkt in baiKiemTras)
                {
                    bkt.TrangThaiPheDuyet = "DangSua";
                    bkt.TrangThai = "DangSua";
                    baiKiemTraToUpdate.Add(bkt);
                }
                var allBaiKiemTraIds = await _baiKiemTraRepository.GetQueryable()
                    .Where(b => b.IdPhan.HasValue && phanHocIds.Contains(b.IdPhan.Value) && !b.IsDeleted)
                    .Select(b => b.Id)
                    .ToListAsync();

                if (allBaiKiemTraIds.Any())
                {
                    var cauHois = await _cauHoiService.GetQueryable()
                        .Where(c => c.IdBaiKiemTra.HasValue && allBaiKiemTraIds.Contains(c.IdBaiKiemTra.Value) && !c.IsDeleted && c.TrangThaiPheDuyet == "ChoDuyet")
                        .ToListAsync();

                    foreach (var ch in cauHois)
                    {
                        ch.TrangThaiPheDuyet = "DangSua";
                        ch.TrangThai = "DangSua";
                        cauHoiToUpdate.Add(ch);
                    }

                    var allCauHoiIds = await _cauHoiService.GetQueryable()
                        .Where(c => c.IdBaiKiemTra.HasValue && allBaiKiemTraIds.Contains(c.IdBaiKiemTra.Value) && !c.IsDeleted)
                        .Select(c => c.Id)
                        .ToListAsync();

                    if (allCauHoiIds.Any())
                    {
                        var dapAns = await _dapAnService.GetQueryable()
                            .Where(d => d.IdCauHoi.HasValue && allCauHoiIds.Contains(d.IdCauHoi.Value) && !d.IsDeleted && d.TrangThaiPheDuyet == "ChoDuyet")
                            .ToListAsync();

                        foreach (var da in dapAns)
                        {
                            da.TrangThaiPheDuyet = "DangSua";
                            da.TrangThai = "DangSua";
                            dapAnToUpdate.Add(da);
                        }
                    }
                }
            }

            if (!khoaHocToUpdate.Any() && !baiGiangToUpdate.Any() && !taiLieuToUpdate.Any()
                && !baiKiemTraToUpdate.Any() && !cauHoiToUpdate.Any() && !dapAnToUpdate.Any())
            {
                throw new Exception("Không có phần nào đang ở trạng thái Đang sửa để chuyển sang Chờ duyệt");
            }

            var executionStrategy = _eduverseContext.Database.CreateExecutionStrategy();
            await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _eduverseContext.Database.BeginTransactionAsync();
                try
                {
                    if (khoaHocToUpdate.Any())
                        await UpdateAsync(khoaHocToUpdate);

                    if (phanUpdate.Any())
                    {
                        foreach (var ph in phanUpdate)
                        {
                            _phanRepository.Update(ph);
                        }
                    }

                    if (baiGiangToUpdate.Any())
                        await _baiGiangService.UpdateAsync(baiGiangToUpdate);

                    if (taiLieuToUpdate.Any())
                        await _taiLieuService.UpdateAsync(taiLieuToUpdate);

                    foreach (var item in baiKiemTraToUpdate)
                        _baiKiemTraRepository.Update(item);

                    if (cauHoiToUpdate.Any())
                        await _cauHoiService.UpdateAsync(cauHoiToUpdate);

                    if (dapAnToUpdate.Any())
                        await _dapAnService.UpdateAsync(dapAnToUpdate);

                    await _eduverseContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            var approvalPayload = new NotificationPayload
            {
                TieuDe = "Khóa học mới chờ phê duyệt",
                NoiDung = $"Giảng viên đã gửi khóa học '{khoaHoc.TieuDe}' để phê duyệt.",
                LoaiThongBao = "KhoaHocChoDuyet",
                Link = $"/admin/approve-courses/{khoaHoc.Id}",
                FromUser = userId,
                ItemId = khoaHoc.Id,
                ItemName = khoaHoc.TieuDe
            };
            await _notificationPublisher.NotifyRoleAsync("Admin", approvalPayload, new[] { userId });

            return _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHoc);
        }

        public async Task<GetToUpdateKhoaHoc> GetToUpdateKhoaHoc(Guid idKhoaHoc)
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var nguoiTao
            );

            var coQuyen = await CoQuyenTrenKhoaHoc(idKhoaHoc, nguoiTao);
            if (!coQuyen)
                throw new Exception("Không tìm thấy khóa học hoặc bạn không có quyền.");

            var khoaHoc = await GetQueryable()
                .Where(x => x.Id == idKhoaHoc )
                .Select(x => new GetToUpdateKhoaHoc
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    GiaGoc = x.GiaGoc,
                    CapDo = x.CapDo,
                    UrlHinhAnh = x.HinhAnhKhoaHoc,
                    IsBanHienTai = x.IsBanHienTai,
                    TrangThai = x.TrangThai,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    IdLyDoTuChoi = x.IdLyDoTuChoi
                })
                .FirstOrDefaultAsync();

            // 2. Không tìm thấy khóa học
            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            // 3. Lấy lý do kiểm duyệt
            if (khoaHoc.IdLyDoTuChoi.HasValue)
            {
                khoaHoc.lichSuKiemDuyetKhoaHoc =
                    await _lichSuKiemDuyetKhoaHocService
                        .GetQueryable()
                        .Where(x => x.IdDoiTuong == khoaHoc.IdLyDoTuChoi)
                        .FirstOrDefaultAsync();
            }

            // 4. Lấy danh sách danh mục
            khoaHoc.DanhSachDanhMuc = await _danhMuc_KhoaHocRepository
                .GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc)
                .Select(x => x.IdDanhMuc)
                .ToListAsync();

            return khoaHoc;
        }

        #region GetKhoaHocDetail
        public async Task<KhoaHocGetDetailDto> GetKhoaHocDetail(Guid idKhoaHoc)
        {

            Guid.TryParse(
             _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
             out var nguoiDung);

            var coQuyen = await CoQuyenTrenKhoaHoc(idKhoaHoc, nguoiDung);   // không cờ, chỉ cần là thành viên
            if (!coQuyen)
                throw new Exception("Không tìm thấy khóa học hoặc bạn không có quyền.");
            // 1. Lấy đúng bản khóa học theo Id được truyền vào
            var targetVersion = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc);

            if (targetVersion == null)
                return null;

            var LyDoKhoaHoc = new LichSuKiemDuyetKhoaHoc();

            if (targetVersion.TrangThaiPheDuyet == "DangSua")
            {
                LyDoKhoaHoc = await _lichSuKiemDuyetKhoaHocService.GetQueryable().Where(x => x.IdDoiTuong == targetVersion.IdLyDoTuChoi).FirstOrDefaultAsync();
            }else if (targetVersion.TrangThaiPheDuyet == "TuChoi")
            {
                LyDoKhoaHoc = await _lichSuKiemDuyetKhoaHocService.GetQueryable().Where(x => x.IdDoiTuong == targetVersion.Id).FirstOrDefaultAsync();
            }

            // 2. Lấy toàn bộ cây dữ liệu (không dùng khóa ngoại, so khớp thủ công qua Id list)
            var phans = await _phanRepository.GetQueryable()
                .Where(x => x.IdKhoaHoc == targetVersion.Id)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var phanIds = phans.Select(p => p.Id).ToList();

            var baiGiangs = await _baiGiangRepository.GetQueryable()
                .Where(x => phanIds.Contains(x.IdPhan))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiGiangIds = baiGiangs.Select(b => new BaiGiangDto { Id = b.Id, IdLyDo = b.IdLyDo}).ToList();

            var ids = baiGiangIds
                .Select(x => x.Id)
                .ToList();

            var idLyDos = baiGiangIds
                .Select(x => x.IdLyDo)
                .ToList();

            var lyDoBaiGiangs = new List<LyDoTuChoi>();

            if (targetVersion.TrangThaiPheDuyet == "TuChoi")
            {
                lyDoBaiGiangs = await _lyDoTuChoiRepository.GetQueryable()
                   .Where(x => ids.Contains(x.IdDoiTuong ?? Guid.Empty))
                   .ToListAsync();
            }else if (targetVersion.TrangThaiPheDuyet == "DangSua")
            {
                lyDoBaiGiangs = await _lyDoTuChoiRepository.GetQueryable()
                   .Where(x => idLyDos.Contains(x.IdDoiTuong ?? Guid.Empty))
                   .ToListAsync();
            }

            var taiLieus = await _taiLieuRepository.GetQueryable()
                .Where(x => ids.Contains(x.IdBaiGiang))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository.GetQueryable()
                .Where(x => x.IdPhan.HasValue && phanIds.Contains(x.IdPhan.Value))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiKiemTraIds = baiKiemTras.Select(b => new BaiKiemTra {Id = b.Id, IdLyDo = b.IdLyDo}).ToList();

            var idbkts = baiKiemTraIds
                .Select(x => x.Id)
                .ToList();

            var idLyDobkts = baiKiemTraIds
                .Select(x => x.IdLyDo)
                .ToList();

            var lyDoBaiKiemTras = new List<LyDoTuChoi>();

            if (targetVersion.TrangThaiPheDuyet == "TuChoi")
            {
                lyDoBaiKiemTras = await _lyDoTuChoiRepository.GetQueryable()
                   .Where(x => idbkts.Contains(x.IdDoiTuong ?? Guid.Empty))
                   .ToListAsync();
            }
            else if (targetVersion.TrangThaiPheDuyet == "DangSua")
            {
                lyDoBaiKiemTras = await _lyDoTuChoiRepository.GetQueryable()
                   .Where(x => idLyDobkts.Contains(x.IdDoiTuong ?? Guid.Empty))
                   .ToListAsync();
            }

            var cauHois = await _cauHoiRepository.GetQueryable()
                .Where(x => idbkts.Contains(x.IdBaiKiemTra ?? Guid.Empty))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois.Select(c => c.Id).ToList();

            var dapAns = await _dapAnRepository.GetQueryable()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value))
                .ToListAsync();

            var tenDanhMucs = await _danhMuc_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc)
                .Join(_danhMucRepository.GetQueryable(),
                      dk => dk.IdDanhMuc,
                      dm => dm.Id,
                      (dk, dm) => dm.TenDanhMuc)
                .ToListAsync();

            // 3. Dựng cây lồng nhau: Phan -> BaiGiang -> TaiLieu, Phan -> BaiKiemTra -> CauHoi -> DapAn
            var taiLieuLookup = taiLieus.ToLookup(t => t.IdBaiGiang);
            var baiGiangLookup = baiGiangs.ToLookup(b => b.IdPhan);
            var lyDoBaiGiangLookup = lyDoBaiGiangs.ToLookup(l => l.IdDoiTuong);
            var dapAnLookup = dapAns.Where(d => d.IdCauHoi.HasValue).ToLookup(d => d.IdCauHoi.Value);
            var cauHoiLookup = cauHois.ToLookup(c => c.IdBaiKiemTra);
            var baiKiemTraLookup = baiKiemTras
                .Where(b => b.IdPhan.HasValue)
                .ToLookup(b => b.IdPhan.Value);
            var lyDoBaiKiemTraLookup = lyDoBaiKiemTras.ToLookup(l => l.IdDoiTuong);

            var phanDtos = phans.Select(p => new PhanHocDto
            {
                Id = p.Id,
                TenPhan = p.TenPhan,
                MieuTa = p.MieuTa,
                ThuTuSapXep = p.ThuTuSapXep,
                TrangThai = p.TrangThai,
                TrangThaiPheDuyet = p.TrangThaiPheDuyet,
                NgayTao = p.CreatedDate,
                IdKhoaHoc = p.IdKhoaHoc,
                IdBanGhiTruoc = p.IdBanGhiTruoc,
                IsBanHienTai = p.IsBanHienTai,
                CreatedBy = p.CreatedBy,
                UpdatedBy = p.UpdatedBy,
                UpdatedDate = p.UpdatedDate,

                DanhSachBaiGiang = baiGiangLookup[p.Id].Select(b => new BaiGiangDto
                {
                    Id = b.Id,
                    TieuDe = b.TieuDe,
                    LoaiBaiGiang = b.LoaiBaiGiang,
                    URLBaiGiang = b.URLBaiGiang,
                    ThoiLuong = b.ThoiLuong,
                    LaBaiGiangFree = b.LaBaiGiangFree,
                    TrangThai = b.TrangThai,
                    TrangThaiPheDuyet = b.TrangThaiPheDuyet,
                    IdPhan = b.IdPhan,
                    IsBanHienTai = b.IsBanHienTai,
                    IdBanGhiTruoc = b.IdBanGhiTruoc,
                    CreatedBy = b.CreatedBy,
                    UpdatedBy = b.UpdatedBy,
                    UpdatedDate = b.UpdatedDate,
                    LyDoTuChois = (targetVersion.TrangThaiPheDuyet == "TuChoi"
                        ? lyDoBaiGiangLookup[b.Id]
                        : lyDoBaiGiangLookup[b.IdLyDo])
                        .Select(l => new LyDoTuChoi { Id = l.Id, LyDo = l.LyDo })
                        .FirstOrDefault(),

                    DanhSachTaiLieu = taiLieuLookup[b.Id].Select(t => new TaiLieuDto
                    {
                        Id = t.Id,
                        LoaiTaiLieu = t.LoaiTaiLieu,
                        TenTaiLieu = t.TenTaiLieu,
                        URL = t.URL,
                        IdDocument = t.IdDocument,
                        TrangThai = t.TrangThai,
                        TrangThaiPheDuyet = t.TrangThaiPheDuyet,
                        IdBaiGiang = t.IdBaiGiang,
                        CreatedBy = t.CreatedBy,
                        UpdatedBy = t.UpdatedBy,
                        UpdatedDate = t.UpdatedDate,
                    }).ToList()
                }).ToList(),

                DanhSachBaiKiemTra = baiKiemTraLookup[p.Id].Select(bkt => new BaiKiemTraDto
                {
                    Id = bkt.Id,
                    TenBaiKiemTra = bkt.TenBaiKiemTra,
                    MoTa = bkt.MoTa,
                    DiemDat = bkt.DiemDat,
                    GioiHanThoiGian = bkt.GioiHanThoiGian,
                    ChoLamLai = bkt.ChoLamLai,
                    SoLanLamToiDa = bkt.SoLanLamToiDa,
                    IdPhan = bkt.IdPhan,
                    IsBanHienTai = bkt.IsBanHienTai,
                    IdBanGhiTruoc = bkt.IdBanGhiTruoc,
                    TrangThai = bkt.TrangThai,
                    TrangThaiPheDuyet = bkt.TrangThaiPheDuyet,
                    CreatedBy = bkt.CreatedBy,
                    UpdatedBy = bkt.UpdatedBy,
                    UpdatedDate = bkt.UpdatedDate,
                    LyDoTuChois = lyDoBaiKiemTraLookup[bkt.Id]
                        .Select(l => new LyDoTuChoiDto { Id = l.Id, LyDo = l.LyDo })
                        .FirstOrDefault(),
                    DanhSachCauHois = cauHoiLookup[bkt.Id].Select(c => new CauHoiDto
                    {
                        Id = c.Id,
                        IdBaiKiemTra = c.IdBaiKiemTra.Value,
                        TenCauHoi = c.TenCauHoi,
                        NoiDungCauHoi = c.NoiDungCauHoi,
                        DoKho = c.DoKho,
                        LoaiCauHoi = c.LoaiCauHoi,
                        ThuTuSapXep = c.ThuTuSapXep,
                        CreatedBy = c.CreatedBy,
                        UpdatedBy = c.UpdatedBy,
                        UpdatedDate = c.UpdatedDate,

                        DanhSachDapAns = dapAnLookup[c.Id].Select(d => new DapAnDto
                        {
                            Id = d.Id,
                            NoiDungDapAn = d.NoiDungDapAn,
                            LaDapAnDung = d.LaDapAnDung,
                            ThuTuSapXep = d.ThuTuSapXep,
                            IdCauHoi = d.IdCauHoi,
                            TrangThai = d.TrangThai,
                            TrangThaiPheDuyet = d.TrangThaiPheDuyet,
                            IdBanGhiTruoc = d.IdBanGhiTruoc,
                            IsBanHienTai = d.IsBanHienTai
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).ToList();

            // 4. Map thông tin Khóa học + gán cây Phần đã dựng ở trên
            var result = new KhoaHocGetDetailDto
            {
                Id = targetVersion.Id,
                TieuDe = targetVersion.TieuDe,
                MoTa = targetVersion.MoTa,
                GiaGoc = targetVersion.GiaGoc,
                LoaiKhoaHoc = targetVersion.LoaiKhoaHoc,    
                HinhAnhKhoaHoc = targetVersion.HinhAnhKhoaHoc,
                CapDo = targetVersion.CapDo,
                TrangThai = targetVersion.TrangThai,
                TrangThaiPheDuyet = targetVersion.TrangThaiPheDuyet,
                IdBanGhiTruoc = targetVersion.IdBanGhiTruoc,
                IsBanHienTai = targetVersion.IsBanHienTai,
                DanhMucs = tenDanhMucs,
                DanhSachPhanHoc = phanDtos,
                lichSuKiemDuyetKhoaHoc = LyDoKhoaHoc
            };

            return result;
        }
        #endregion

        public async Task<PagedList<KhoaHocDto>> GetListForManager(GetListSearch search)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            var kgvQuery = _khoaHoc_GiangVienRepository.GetQueryable();
            var query = GetQueryable()
                .Where(kh =>
                    !kh.IsDeleted &&
                    kh.IsBanHienTai &&
                    (
                        kh.CreatedId == userId ||
                        kgvQuery.Any(kgv =>
                            kgv.IdKhoaHoc == kh.Id &&
                            kgv.IdGiangVien == userId &&
                            !kgv.IsDeleted)
                    ));

            // ── Bộ lọc ──
            if (!string.IsNullOrEmpty(search.Keyword))
                query = query.Where(x => x.TieuDe != null && x.TieuDe.Contains(search.Keyword));

            if (!string.IsNullOrEmpty(search.TrangThai) && search.TrangThai != "TatCa")
                query = query.Where(x => x.TrangThaiPheDuyet == search.TrangThai);

            // ── Sắp xếp + Select DTO ──
            var dangKyQuery = _dangKyKhoaHocRepository.GetQueryable();

            var dtoQuery = (
                search.SapXepHocVienNhieuNhat == true
                    ? query.OrderByDescending(x => dangKyQuery.Count(d => d.IdKhoaHoc == x.Id))
                : search.SapXepNgay == "Moi"
                    ? query.OrderByDescending(x => x.CreatedDate)
                : search.SapXepNgay == "Cu"
                    ? query.OrderBy(x => x.CreatedDate)
                : search.SapXepTen == "AZ"
                    ? query.OrderBy(x => x.TieuDe ?? string.Empty)
                : search.SapXepTen == "ZA"
                    ? query.OrderByDescending(x => x.TieuDe ?? string.Empty)
                : query.OrderByDescending(x => x.CreatedDate)
            ).Select(x => new KhoaHocDto
            {
                Id = x.Id,
                TieuDe = x.TieuDe,
                MoTa = x.MoTa,
                Gia = x.Gia,
                GiaGoc = x.GiaGoc,
                CapDo = x.CapDo,
                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                TrangThai = x.TrangThai,
                TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                CreatedId = x.CreatedId,
                CreatedDate = x.CreatedDate,
                IsBanHienTai = x.IsBanHienTai,
                IdBanGhiTruoc = x.IdBanGhiTruoc,
                LaCongTacVien = kgvQuery.Where(g => g.IdKhoaHoc == x.Id
                                                 && g.IdGiangVien == userId
                                                 && !g.IsDeleted)
                                        .Select(g => !g.LaChuSoHuu)
                                        .FirstOrDefault(),
                SoGiangVien = kgvQuery.Count(g =>
                                        g.IdKhoaHoc == x.Id &&
                                        !g.IsDeleted),
            });

            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }

        public async Task<GiangVienKhoaHocDto> GetListByGiangVien(GetListSearch search, Guid UserId)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var hocvien);

            var khoaHocIds = await GetQueryable()
                .Where(x => x.CreatedId == UserId)
                .Select(x => x.Id)
                .ToListAsync();

            var tongHocVienDangHoc = 0;
            var tongHocVienDangKy = 0;
            var soSaoDanhGia = 0;


            if (khoaHocIds.Any())
            {
                tongHocVienDangHoc = await _dangKyKhoaHocRepository
                    .GetQueryable()
                    .Where(x => khoaHocIds.Contains(x.IdKhoaHoc.Value))
                    .Select(x => x.IdNguoiDangKi)
                    .Distinct()
                    .CountAsync();

                tongHocVienDangKy = await _dangKyKhoaHocRepository
                    .GetAll()
                    .Where(x => khoaHocIds.Contains(x.IdKhoaHoc.Value))
                    .Select(x => x.IdNguoiDangKi)
                    .Distinct()
                    .CountAsync();
            }

            var listDangKi = await _dangKyKhoaHocRepository
                .GetQueryable()
                .Where(x => x.IdNguoiDangKi == hocvien)
                .Select(x => new { x.IdKhoaHoc, x.Id })
                .ToListAsync();

            var mapDangKi = listDangKi
                .Where(x => x.IdKhoaHoc.HasValue)
                .GroupBy(x => x.IdKhoaHoc!.Value)
                .ToDictionary(
                    g => g.Key,
                    g => g.First().Id
                );

            var giangVien = await _appUserService.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == UserId)
                .Select(x => new AppUser
                {
                    Id = x.Id,
                    HoTen = x.HoTen,
                    AnhDaiDien = x.AnhDaiDien,
                    TieuSu = x.TieuSu
                })
                .FirstOrDefaultAsync();

            if (giangVien == null)
                throw new Exception("Không tìm thấy giảng viên.");

            // Lấy phần học thuộc các khóa học của giảng viên (không dùng Include, join thủ công qua Id list)
            var phanHocList = await _phanRepository
                .GetQueryable()
                .Where(x => khoaHocIds.Contains(x.IdKhoaHoc.Value) && !x.IsDeleted)
                .Select(x => new { x.Id, x.IdKhoaHoc })
                .ToListAsync();

            var phanHocIds = phanHocList.Select(x => x.Id).ToList();

            var baiGiangList = await _baiGiangRepository
                    .GetQueryable()
                    .Where(x => phanHocIds.Contains(x.IdPhan) && !x.IsDeleted)
                    .Select(x => new { x.IdPhan, x.ThoiLuong })
                    .ToListAsync();

            var phanHocToKhoaHoc = phanHocList.ToDictionary(x => x.Id, x => x.IdKhoaHoc);

            var thongKeBaiGiang = baiGiangList
                .Where(x => phanHocToKhoaHoc.ContainsKey(x.IdPhan))
                .GroupBy(x => phanHocToKhoaHoc[x.IdPhan])
                .ToDictionary(
                    g => g.Key,
                    g => new { SoLuong = g.Count(), TongThoiLuong = g.Sum(x => (int?)x.ThoiLuong ?? 0) }
                );

            var danhGiaList = await _danhGiaRepository
                 .GetQueryable()
                 .Where(x => khoaHocIds.Contains(x.IdKhoaHoc.Value) && !x.IsDeleted)
                 .Select(x => new { x.IdKhoaHoc, x.SoSao })
                 .ToListAsync();

            var thongKeDanhGia = danhGiaList
                .GroupBy(x => x.IdKhoaHoc.Value)
                .ToDictionary(
                    g => g.Key,
                    g => new { SoLuongDanhGia = g.Count(), DiemTrungBinh = g.Average(x => (double)x.SoSao) }
                );

            var query = GetQueryable()
                .AsNoTracking()
                .Where(x => x.CreatedId == UserId
                        && x.TrangThai == "HoatDong"
                        && x.TrangThaiPheDuyet == "DaDuyet")
                .Select(x => new KhoaHocDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                    Gia = x.Gia,
                    GiaGoc = x.GiaGoc,
                    LoaiKhoaHoc = x.LoaiKhoaHoc,
                    CapDo = x.CapDo,
                    TrangThai = x.TrangThai,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    NgayTao = x.CreatedDate,
                 });

            var pagedResult = await PagedList<KhoaHocDto>.CreateAsync(query, search);

            foreach (var item in pagedResult.Items)
            {
                if (mapDangKi.TryGetValue(item.Id, out var idDangKy))
                {
                    item.DaDangKy = true;
                    item.idDangKiKhoaHoc = idDangKy;
                }
                else
                {
                    item.DaDangKy = false;
                    item.idDangKiKhoaHoc = Guid.Empty;
                }

                if (thongKeBaiGiang.TryGetValue(item.Id, out var thongKe))
                {
                    item.SoLuongBaiGiang = thongKe.SoLuong;
                    item.TongThoiLuong = thongKe.TongThoiLuong;
                }
                else
                {
                    item.SoLuongBaiGiang = 0;
                    item.TongThoiLuong = 0;
                }

                if (thongKeDanhGia.TryGetValue(item.Id, out var danhGia))
                {
                    item.SoLuongDanhGia = danhGia.SoLuongDanhGia;
                    item.DiemDanhGiaTrungBinh = Math.Round(danhGia.DiemTrungBinh, 1);
                }
                else
                {
                    item.SoLuongDanhGia = 0;
                    item.DiemDanhGiaTrungBinh = 0;
                }
            }

            return new GiangVienKhoaHocDto
            {
                ThongTinGiangVien = giangVien,
                KhoaHocs = pagedResult,
                TongHocVienDangHoc = tongHocVienDangHoc,
                TongHocVienDangKy = tongHocVienDangKy
            };
        }

        public async Task<PagedList<KhoaHocDto>> GetListByDanhMuc(Guid idKhoaHoc, SearchBase search)
        {
            var danhMucIds = await _danhMuc_KhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .Select(x => x.IdDanhMuc)
                .Distinct()
                .ToListAsync();

            var query = GetAll()
                .AsNoTracking()
                .Where(x => !x.IsDeleted
                         && x.TrangThai == "HoatDong"
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true
                         && x.Id != idKhoaHoc);

            // Chỉ lấy các khóa học có chung ít nhất 1 danh mục
            if (danhMucIds.Any())
            {
                query = query.Where(x =>
                    _danhMuc_KhoaHocRepository.GetQueryable()
                        .Any(dm =>
                            dm.IdKhoaHoc == x.Id &&
                            !dm.IsDeleted &&
                            danhMucIds.Contains(dm.IdDanhMuc)));
            }

            var result = query
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new KhoaHocDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                    Gia = x.Gia,
                    GiaGoc = x.GiaGoc,
                    LoaiKhoaHoc = x.LoaiKhoaHoc,
                    CapDo = x.CapDo,
                    TrangThai = x.TrangThai,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    NgayTao = x.CreatedDate
                });

            return await PagedList<KhoaHocDto>.CreateAsync(result, search);
        }

        public async Task<PagedList<KhoaHocDto>> GetLitsKhoaHocPhatHanh(GetListSearch search)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            }

            var query = GetQueryable()
                .Where(x => x.IsBanHienTai == true
                         && x.TrangThai == "HoatDong"
                         && x.TrangThaiPheDuyet == "DaDuyet");

            var DangKiKhoaHocs = await _dangKyKhoaHocRepository.GetQueryable().ToListAsync();

            // ── Áp dụng bộ lọc ──
            if (!string.IsNullOrEmpty(search.Keyword))
            {
                query = query.Where(x => x.TieuDe != null && x.TieuDe.Contains(search.Keyword));
            }

            if (!string.IsNullOrEmpty(search.TrangThai) && search.TrangThai != "TatCa")
            {
                query = query.Where(x => x.TrangThaiPheDuyet == search.TrangThai);
            }

            // ── Sắp xếp đa cấp (kết hợp nhiều tiêu chí) ──
            IOrderedQueryable<KhoaHoc> orderedQuery = null;
            bool hasSort = false;

            // 1. Ưu tiên chính: Ngày tạo
            if (!string.IsNullOrEmpty(search.SapXepNgay))
            {
                orderedQuery = search.SapXepNgay == "Moi"
                    ? query.OrderByDescending(x => x.CreatedDate)
                    : query.OrderBy(x => x.CreatedDate);
                hasSort = true;
            }

            // 2. Sau đó: Tên (nếu có yêu cầu)
            if (!string.IsNullOrEmpty(search.SapXepTen))
            {
                if (hasSort)
                {
                    orderedQuery = search.SapXepTen == "AZ"
                        ? orderedQuery.ThenBy(x => x.TieuDe ?? string.Empty)
                        : orderedQuery.ThenByDescending(x => x.TieuDe ?? string.Empty);
                }
                else
                {
                    orderedQuery = search.SapXepTen == "AZ"
                        ? query.OrderBy(x => x.TieuDe ?? string.Empty)
                        : query.OrderByDescending(x => x.TieuDe ?? string.Empty);
                    hasSort = true;
                }
            }

            if (!hasSort)
            {
                orderedQuery = query.OrderByDescending(x => x.CreatedDate);
            }

            query = orderedQuery;

            var dtoQuery = query.Select(x => new KhoaHocDto
            {
                Id = x.Id,
                TieuDe = x.TieuDe,
                MoTa = x.MoTa,
                Gia = x.Gia,
                GiaGoc = x.GiaGoc,
                CapDo = x.CapDo,
                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                TrangThai = x.TrangThai,
                TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                CreatedBy = x.CreatedBy,
                CreatedId = x.CreatedId,
                CreatedDate = x.CreatedDate,
                IsBanHienTai = x.IsBanHienTai,
                IdBanGhiTruoc = x.IdBanGhiTruoc,
            });

            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }

        #region CreateFullKhoaHocDraft

        public class KhoaHocDraftResultDto
        {
            public KhoaHocDto KhoaHoc { get; set; }
            public List<PhanDraftDto> DanhSachPhan { get; set; } = new();
        }

        public class PhanDraftDto
        {
            public PhanHocDto Phan { get; set; }
            public List<BaiGiangDto> DanhSachBaiGiang { get; set; } = new();
            public List<BaiKiemTraDto> DanhSachBaiKiemTra { get; set; } = new();
        }


        // ═══════════════════════════════════════════════════════════
        // HÀM CHÍNH: Tạo bản nháp toàn bộ khóa học
        // ═══════════════════════════════════════════════════════════
        public async Task<KhoaHocDraftResultDto> CreateFullKhoaHocDraft(Guid IdKhoaHoc)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            var KhoaHocRoot = await GetAll()
                .FirstOrDefaultAsync(x => x.Id == IdKhoaHoc && x.IsBanHienTai);

            if (KhoaHocRoot == null)
                throw new Exception("Không tìm thấy khóa học");

            var coQuyenDraft = await CoQuyenTrenKhoaHoc(KhoaHocRoot.Id, nguoiTao, gv => gv.Manage);
            if (!coQuyenDraft)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            if (KhoaHocRoot.TrangThaiPheDuyet == "DangSua")
                throw new Exception("Khóa học đã ở có bản cần sửa");

            if (KhoaHocRoot.TrangThaiPheDuyet == "ChoDuyet")
                throw new Exception("Khóa học đang chờ duyệt, không thể chỉnh sửa!");

            if (KhoaHocRoot.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception(
                    $"❌ KHÓA HỌC ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
                    $"Hệ thống Eduverses đang kiểm duyệt khóa học này.\n" +
                    $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                    $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
                );

            var strategy = _eduverseContext.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _eduverseContext.Database.BeginTransactionAsync();
                try
                {
                    KhoaHoc khoaHocDraftEntity;
                    if (KhoaHocRoot.TrangThaiPheDuyet == "DaDuyet")
                    {
                        khoaHocDraftEntity = new KhoaHoc
                        {
                            Id = Guid.NewGuid(),
                            TieuDe = KhoaHocRoot.TieuDe,
                            MoTa = KhoaHocRoot.MoTa,
                            CapDo = KhoaHocRoot.CapDo,
                            Gia = KhoaHocRoot.Gia,
                            GiaGoc = KhoaHocRoot.GiaGoc,
                            LoaiKhoaHoc = KhoaHocRoot.LoaiKhoaHoc,
                            HinhAnhKhoaHoc = KhoaHocRoot.HinhAnhKhoaHoc,
                            IdHinhAnhKhoaHoc = KhoaHocRoot.IdHinhAnhKhoaHoc,
                            TrangThai = "DangSua",
                            TrangThaiPheDuyet = "DangSua",
                            IsBanHienTai = true,
                            IdBanGhiTruoc = KhoaHocRoot.Id
                        };
                        await CreateAsync(khoaHocDraftEntity);
                        await SaveAsync();
                    }
                    else if (KhoaHocRoot.TrangThaiPheDuyet == "TuChoi")
                    {
                        khoaHocDraftEntity = new KhoaHoc
                        {
                            Id = Guid.NewGuid(),
                            TieuDe = KhoaHocRoot.TieuDe,
                            MoTa = KhoaHocRoot.MoTa,
                            CapDo = KhoaHocRoot.CapDo,
                            Gia = KhoaHocRoot.Gia,
                            GiaGoc = KhoaHocRoot.GiaGoc,
                            LoaiKhoaHoc = KhoaHocRoot.LoaiKhoaHoc,
                            HinhAnhKhoaHoc = KhoaHocRoot.HinhAnhKhoaHoc,
                            IdHinhAnhKhoaHoc = KhoaHocRoot.IdHinhAnhKhoaHoc,
                            TrangThai = "DangSua",
                            TrangThaiPheDuyet = "DangSua",
                            IsBanHienTai = true,
                            IdBanGhiTruoc = KhoaHocRoot.IdBanGhiTruoc ?? null,
                            IdLyDoTuChoi = KhoaHocRoot.Id
                        };

                        await CreateAsync(khoaHocDraftEntity);
                        await SaveAsync();
                    }
                    else
                    {
                        throw new Exception($"Trạng thái khóa học '{KhoaHocRoot.TrangThaiPheDuyet}' không hợp lệ để tạo bản nháp");
                    }

                    await CopyDanhMucAsync(KhoaHocRoot.Id, khoaHocDraftEntity.Id);

                    var khoaHocResult = _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHocDraftEntity);
                    var idKhoaHocDraftMoi = khoaHocDraftEntity.Id;

                    var danhSachPhanRoot = await _phanRepository.GetAll()
                        .Where(x => x.IdKhoaHoc == IdKhoaHoc && x.IsBanHienTai == true && !x.IsDeleted)
                        .ToListAsync();

                    var danhSachPhanDraft = new List<PhanDraftDto>();

                    foreach (var phanRoot in danhSachPhanRoot)
                    {
                        Phan phanDraftMoi;

                        if (phanRoot.TrangThaiPheDuyet == "DaDuyet")
                        {
                            phanDraftMoi = new Phan
                            {
                                Id = Guid.NewGuid(),
                                IdKhoaHoc = idKhoaHocDraftMoi,
                                TenPhan = phanRoot.TenPhan,
                                ThuTuSapXep = phanRoot.ThuTuSapXep,
                                TrangThai = "DangSua",
                                TrangThaiPheDuyet = "DangSua",
                                IsBanHienTai = true,
                                IdBanGhiTruoc = phanRoot.Id
                            };
                            _phanRepository.Add(phanDraftMoi);
                            await _phanRepository.SaveAsync();
                        }
                        else if (phanRoot.TrangThaiPheDuyet == "TuChoi")
                        {
                            // Phần gốc bị từ chối → tạo Phần GỐC MỚI thay thế,
                            // Id của Phần bị từ chối chuyển vào IdBanGhiTruoc của bản mới
                            phanDraftMoi = new Phan
                            {
                                Id = Guid.NewGuid(),
                                IdKhoaHoc = idKhoaHocDraftMoi,
                                TenPhan = phanRoot.TenPhan,
                                ThuTuSapXep = phanRoot.ThuTuSapXep,
                                TrangThai = "DangSua",
                                TrangThaiPheDuyet = "DangSua",
                                IsBanHienTai = true,
                                IdBanGhiTruoc = phanRoot.IdBanGhiTruoc
                            };
                            _phanRepository.Add(phanDraftMoi);
                            await _phanRepository.SaveAsync();
                        }
                        else
                        {
                            throw new Exception($"Trạng thái Phần '{phanRoot.TenPhan}' ({phanRoot.TrangThaiPheDuyet}) không hợp lệ để tạo bản nháp");
                        }

                        var phanDraftDto = new PhanDraftDto
                        {
                            Phan = _mapper.Map<Phan, PhanHocDto>(phanDraftMoi),
                            DanhSachBaiGiang = await CloneBaiGiangAsync(phanRoot.Id, phanDraftMoi.Id),
                            DanhSachBaiKiemTra = await CloneBaiKiemTraAsync(phanRoot.Id, phanDraftMoi.Id)
                        };

                        danhSachPhanDraft.Add(phanDraftDto);
                    }

                    var khoaHoc_GiangVien = await _khoaHoc_GiangVienRepository.GetQueryable()
                         .Where(x => x.IdKhoaHoc == KhoaHocRoot.Id)
                         .ToListAsync(); 

                    if (khoaHoc_GiangVien.Any())
                    {
                        var khoaHoc_GiangVienNewList = khoaHoc_GiangVien.Select(item => new KhoaHoc_GiangVien
                        {
                            Id = Guid.NewGuid(),
                            IdGiangVien = item.IdGiangVien,
                            IdKhoaHoc = khoaHocDraftEntity.Id,
                            LaChuSoHuu = item.LaChuSoHuu,
                            Visible = item.Visible,
                            TyLeChiaDoanhThu = item.TyLeChiaDoanhThu,
                            Manage = item.Manage,
                            Performance = item.Performance,
                            QnA = item.QnA,
                            Reviews = item.Reviews,
                            Assignments = item.Assignments,
                            Materials = item.Materials,
                            Promotions = item.Promotions,
                        }).ToList();

                        foreach (var item in khoaHoc_GiangVien)
                        {
                            _khoaHoc_GiangVienRepository.Delete(item); 
                        }
                        await _khoaHoc_GiangVienRepository.SaveAsync();

                        foreach (var item in khoaHoc_GiangVienNewList)
                        {
                            _khoaHoc_GiangVienRepository.Add(item);
                        }
                        await _khoaHoc_GiangVienRepository.SaveAsync();
                    }

                    // Xóa sau khi tạo bản mới
                    if (KhoaHocRoot.TrangThaiPheDuyet == "TuChoi")
                    {
                        KhoaHocRoot.TrangThai = "DaXoa";
                    }
                    else if (KhoaHocRoot.TrangThaiPheDuyet == "DaDuyet")
                    {
                        KhoaHocRoot.TrangThai = "NgungHoatDong";
                    }
                    await UpdateAsync(KhoaHocRoot);
                    await DeleteAsync(KhoaHocRoot);
                    await SaveAsync();

                    await transaction.CommitAsync();

                    return new KhoaHocDraftResultDto
                    {
                        KhoaHoc = khoaHocResult,
                        DanhSachPhan = danhSachPhanDraft
                    };
                }
                catch(DbUpdateException ex)
                {
                    throw new Exception($"Lỗi khi lưu: {ex.InnerException?.Message}", ex);
                }
            });
        }


        // ═══════════════════════════════════════════════════════════
        // Clone Bài giảng (kèm Tài liệu của từng Bài giảng)
        // ═══════════════════════════════════════════════════════════

        private async Task<List<BaiGiangDto>> CloneBaiGiangAsync(Guid idPhanRoot, Guid idPhanDraftMoi)
        {
            var danhSachBaiGiangRoot = await _baiGiangRepository.GetAll()
                .Where(x => x.IdPhan == idPhanRoot && x.IsBanHienTai == true && !x.IsDeleted)
                .ToListAsync();

            if (!danhSachBaiGiangRoot.Any())
                return new List<BaiGiangDto>();

            var ketQua = new List<BaiGiangDto>();

            BaiGiang bgDraft;

            foreach (var bgRoot in danhSachBaiGiangRoot)
            {
                if(bgRoot.TrangThaiPheDuyet == "DaDuyet")
                {
                     bgDraft = new BaiGiang
                    {
                        Id = Guid.NewGuid(),
                        IdPhan = idPhanDraftMoi,
                        TieuDe = bgRoot.TieuDe,
                        URLBaiGiang = bgRoot.URLBaiGiang,
                        IdVideoBaiGiang = bgRoot.IdVideoBaiGiang,
                        ThoiLuong = bgRoot.ThoiLuong,
                        ThuTuSapXep = bgRoot.ThuTuSapXep,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        IsBanHienTai = true,
                        IdBanGhiTruoc = bgRoot.Id, 
                        LoaiBaiGiang = bgRoot.LoaiBaiGiang,
                        LaBaiGiangFree = bgRoot.LaBaiGiangFree
                    };
                    _baiGiangRepository.Add(bgDraft);
                    await _baiGiangRepository.SaveAsync();
                }
                else if (bgRoot.TrangThaiPheDuyet == "TuChoi")
                {
                     bgDraft = new BaiGiang
                    {
                        Id = Guid.NewGuid(),
                        IdPhan = idPhanDraftMoi,
                        TieuDe = bgRoot.TieuDe,
                        URLBaiGiang = bgRoot.URLBaiGiang,
                        IdVideoBaiGiang = bgRoot.IdVideoBaiGiang,
                        ThoiLuong = bgRoot.ThoiLuong,
                        ThuTuSapXep = bgRoot.ThuTuSapXep,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        IsBanHienTai = true,
                        IdBanGhiTruoc = bgRoot.IdBanGhiTruoc,
                        IdLyDo = bgRoot.Id,
                         LoaiBaiGiang = bgRoot.LoaiBaiGiang,
                        LaBaiGiangFree = bgRoot.LaBaiGiangFree
                    };
                    _baiGiangRepository.Add(bgDraft);
                    await _baiGiangRepository.SaveAsync();
                }
                else
                {
                    throw new Exception($"Trạng thái Bài giảng '{bgRoot.TieuDe}' ({bgRoot.TrangThaiPheDuyet}) không hợp lệ để tạo bản nháp");
                }


                

                var danhSachTaiLieu = await CloneTaiLieuAsync(bgRoot.Id, bgDraft.Id);

                var bgDto = _mapper.Map<BaiGiang, BaiGiangDto>(bgDraft);
                bgDto.DanhSachTaiLieu = danhSachTaiLieu;

                ketQua.Add(bgDto);
            }

            return ketQua;
        }


        // ═══════════════════════════════════════════════════════════
        // Clone Tài liệu (thuộc về Bài giảng)
        // ═══════════════════════════════════════════════════════════

        private async Task<List<TaiLieuDto>> CloneTaiLieuAsync(Guid idBaiGiangRoot, Guid idBaiGiangDraftMoi)
        {
            var danhSachTaiLieuRoot = await _taiLieuRepository.GetAll()
                .Where(x => x.IdBaiGiang == idBaiGiangRoot && !x.IsDeleted)
                .ToListAsync();

            if (!danhSachTaiLieuRoot.Any())
                return new List<TaiLieuDto>();

            var ketQua = new List<TaiLieuDto>();

            foreach (var tlRoot in danhSachTaiLieuRoot)
            {
                var tlDraft = new TaiLieu
                {
                    Id = Guid.NewGuid(),
                    IdBaiGiang = idBaiGiangDraftMoi,
                    TenTaiLieu = tlRoot.TenTaiLieu,
                    URL = tlRoot.URL,
                    IdDocument = tlRoot.IdDocument,
                    LoaiTaiLieu = tlRoot.LoaiTaiLieu,
                    TrangThai = "DangSua",
                    TrangThaiPheDuyet = "DangSua"
                };

                 _taiLieuRepository.Add(tlDraft);
                await _taiLieuRepository.SaveAsync();

                ketQua.Add(_mapper.Map<TaiLieu, TaiLieuDto>(tlDraft));
            }

            return ketQua;
        }


        // ═══════════════════════════════════════════════════════════
        // Clone Bài kiểm tra (kèm Câu hỏi + Đáp án)
        // ═══════════════════════════════════════════════════════════

        private async Task<List<BaiKiemTraDto>> CloneBaiKiemTraAsync(Guid idPhanRoot, Guid idPhanDraftMoi)
        {
            var danhSachBktRoot = await _baiKiemTraRepository.GetAll()
                .Where(x => x.IdPhan == idPhanRoot && x.IsBanHienTai == true && !x.IsDeleted)
                .ToListAsync();

            if (!danhSachBktRoot.Any())
                return new List<BaiKiemTraDto>();

            var ketQua = new List<BaiKiemTraDto>();

            foreach (var bktRoot in danhSachBktRoot)
            {
                BaiKiemTra bktDraft;

                if (bktRoot.TrangThaiPheDuyet == "DaDuyet")
                {
                    bktDraft = new BaiKiemTra
                    {
                        Id = Guid.NewGuid(),
                        IdPhan = idPhanDraftMoi,
                        TenBaiKiemTra = bktRoot.TenBaiKiemTra,
                        MoTa = bktRoot.MoTa,
                        GioiHanThoiGian = bktRoot.GioiHanThoiGian,
                        DiemDat = bktRoot.DiemDat,
                        SoLanLamLai = bktRoot.SoLanLamLai,
                        ThuTuSapXep = bktRoot.ThuTuSapXep,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        IsBanHienTai = true,
                        IdBanGhiTruoc = bktRoot.Id
                    };
                    _baiKiemTraRepository.Add(bktDraft);
                    await _baiKiemTraRepository.SaveAsync();
                }
                else if (bktRoot.TrangThaiPheDuyet == "TuChoi")
                {
                    bktDraft = new BaiKiemTra
                    {
                        Id = Guid.NewGuid(),
                        IdPhan = idPhanDraftMoi,
                        TenBaiKiemTra = bktRoot.TenBaiKiemTra,
                        MoTa = bktRoot.MoTa,
                        GioiHanThoiGian = bktRoot.GioiHanThoiGian,
                        DiemDat = bktRoot.DiemDat,
                        SoLanLamLai = bktRoot.SoLanLamLai,
                        ThuTuSapXep = bktRoot.ThuTuSapXep,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        IsBanHienTai = true,
                        IdBanGhiTruoc = bktRoot.IdBanGhiTruoc,
                        IdLyDo = bktRoot.Id,
                    };
                    _baiKiemTraRepository.Add(bktDraft);
                    await _baiKiemTraRepository.SaveAsync();
                }
                else
                {
                    throw new Exception($"Trạng thái Bài kiểm tra '{bktRoot.TenBaiKiemTra}' ({bktRoot.TrangThaiPheDuyet}) không hợp lệ để tạo bản nháp");
                }

                

                await CloneCauHoiVaDapAnAsync(bktRoot.Id, bktDraft.Id);

                ketQua.Add(_mapper.Map<BaiKiemTra, BaiKiemTraDto>(bktDraft));
            }

            return ketQua;
        }

        // ═══════════════════════════════════════════════════════════
        // Clone Câu hỏi + Đáp án
        // ═══════════════════════════════════════════════════════════

        private async Task CloneCauHoiVaDapAnAsync(Guid idBaiKiemTraRoot, Guid idBaiKiemTraDraftMoi)
        {
            var danhSachCauHoiRoot = await _cauHoiService.GetQueryable()
                .Where(x => x.IdBaiKiemTra == idBaiKiemTraRoot && !x.IsDeleted)
                .ToListAsync();

            if (!danhSachCauHoiRoot.Any())
                return;

            CauHoi chDraft;

            foreach (var chRoot in danhSachCauHoiRoot)
            {
                if(chRoot.TrangThaiPheDuyet == "DaDuyet")
                {
                     chDraft = new CauHoi
                    {
                        Id = Guid.NewGuid(),
                        IdBaiKiemTra = idBaiKiemTraDraftMoi,
                        TenCauHoi = chRoot.TenCauHoi,
                        LoaiCauHoi = chRoot.LoaiCauHoi,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        NoiDungCauHoi = chRoot.NoiDungCauHoi,
                        DoKho = chRoot.DoKho,
                        ThuTuSapXep = chRoot.ThuTuSapXep,
                        IsBanHienTai = true,
                        IdBanGhiTruoc = chRoot.Id
                    };
                    await _cauHoiService.CreateAsync(chDraft);
                    await _cauHoiService.SaveAsync();
                }
                else if (chRoot.TrangThaiPheDuyet == "TuChoi")
                {
                     chDraft = new CauHoi
                    {
                        Id = Guid.NewGuid(),
                        IdBaiKiemTra = idBaiKiemTraDraftMoi,
                        TenCauHoi = chRoot.TenCauHoi,
                        LoaiCauHoi = chRoot.LoaiCauHoi,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        NoiDungCauHoi = chRoot.NoiDungCauHoi,
                        DoKho = chRoot.DoKho,
                        ThuTuSapXep = chRoot.ThuTuSapXep,
                        IsBanHienTai = true,
                        IdBanGhiTruoc = chRoot.IdBanGhiTruoc
                     };
                    await _cauHoiService.CreateAsync(chDraft);
                    await _cauHoiService.SaveAsync();
                }
                else
                {
                    throw new Exception($"Trạng thái Bài giảng '{chRoot.NoiDungCauHoi}' ({chRoot.TrangThaiPheDuyet}) không hợp lệ để tạo bản nháp");
                }


                

                var danhSachDapAnRoot = await _dapAnService.GetQueryable()
                .Where(x => x.IdCauHoi == chRoot.Id && !x.IsDeleted)
                .ToListAsync();

                foreach (var daRoot in danhSachDapAnRoot)
                {
                    DapAn daDraft;

                    if (daRoot.TrangThaiPheDuyet == "DaDuyet")
                    {
                        daDraft = new DapAn
                        {
                            Id = Guid.NewGuid(),
                            IdCauHoi = chDraft.Id,
                            NoiDungDapAn = daRoot.NoiDungDapAn,
                            LaDapAnDung = daRoot.LaDapAnDung,
                            ThuTuSapXep = daRoot.ThuTuSapXep,
                            TrangThai = "DangSua",
                            TrangThaiPheDuyet = "DangSua",
                            IdBanGhiTruoc = daRoot.Id,
                            IsBanHienTai = true
                        };
                        await _dapAnService.CreateAsync(daDraft);
                        await _dapAnService.SaveAsync();
                    }
                    else if (daRoot.TrangThaiPheDuyet == "TuChoi")
                    {
                        daDraft = new DapAn
                        {
                            Id = Guid.NewGuid(),
                            IdCauHoi = chDraft.Id,
                            NoiDungDapAn = daRoot.NoiDungDapAn,
                            LaDapAnDung = daRoot.LaDapAnDung,
                            ThuTuSapXep = daRoot.ThuTuSapXep,
                            TrangThai = "DangSua",
                            TrangThaiPheDuyet = "DangSua",
                            IdBanGhiTruoc = daRoot.IdBanGhiTruoc,
                            IsBanHienTai = true
                        };
                        await _dapAnService.CreateAsync(daDraft);
                        await _dapAnService.SaveAsync();
                    }
                    else
                    {
                        throw new Exception($"Trạng thái Đáp án '{daRoot.Id}' ({daRoot.TrangThaiPheDuyet}) không hợp lệ để tạo bản nháp");
                    }
                }

                
            }
        }


        // ═══════════════════════════════════════════════════════════
        // Copy Danh mục khóa học
        // ═══════════════════════════════════════════════════════════

        private async Task CopyDanhMucAsync(Guid sourceCourseId, Guid targetCourseId)
        {
            var danhMucList = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == sourceCourseId && !x.IsDeleted)
                .ToListAsync();

            if (danhMucList.Any())
            {
                var danhMucNhapList = danhMucList.Select(d => new DanhMuc_KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = targetCourseId,
                    IdDanhMuc = d.IdDanhMuc,
                    CreatedDate = DateTime.Now
                }).ToList();

                await _danhMuc_KhoaHocService.CreateRange(danhMucNhapList);
                await _danhMuc_KhoaHocService.SaveAsync();
            }
        }
        #endregion

        #region CreateKhoaHoc
        public async Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên khóa học không được để trống");

            if (request.DanhSachDanhMuc == null || !request.DanhSachDanhMuc.Any())
                throw new Exception("Vui lòng chọn danh mục");

            if (request.GiaGoc < 0)
                throw new Exception("Giá không hợp lệ");

            if (request.GiaGoc > 100000000)
                throw new Exception("Giá không hợp lệ");

            var danhMucIds = request.DanhSachDanhMuc.Distinct().ToList();


            var invalidIds = danhMucIds
                .Except(await _danhMucRepository.GetQueryable()
                    .Where(x => danhMucIds.Contains(x.Id))
                    .Select(x => x.Id)
                    .ToListAsync())
                .ToList();

            if (invalidIds.Any())
                throw new Exception($"Danh mục không tồn tại: {string.Join(",", invalidIds)}");

            //var upLoadResult = await _cloudinaryService.UploadImageAsync(request.Img);

            var isFree = request.GiaGoc <= 0;

            var khoaHoc = new KhoaHoc
            {
                IsBanHienTai = true,
                TieuDe = request.TieuDe.Trim(),
                MoTa = request.MoTa,
                GiaGoc = request.GiaGoc,
                CapDo = request.CapDo,
                LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí",
                //HinhAnhKhoaHoc = upLoadResult.UrlImg.Trim(),
                //IdHinhAnhKhoaHoc = upLoadResult.PublicId,
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua",

            };

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            await CreateAsync(khoaHoc);
            await SaveAsync();

            // Tự động thêm người tạo làm chủ sở hữu trong KhoaHoc_GiangVien
            var chuSoHuu = new KhoaHoc_GiangVien
            {
                Id = Guid.NewGuid(),
                IdKhoaHoc = khoaHoc.Id,
                IdGiangVien = nguoiTao,
                LaChuSoHuu = true,
                Visible = true,
                TyLeChiaDoanhThu = 100,
                Manage = true,
                Performance = true,
                QnA = true,
                Reviews = true,
                Assignments = true,
                Materials = true,
                Promotions = true,
                IsDeleted = false,
            };
            _khoaHoc_GiangVienRepository.Add(chuSoHuu);
            await _khoaHoc_GiangVienRepository.SaveAsync();

            var khoaHocDanhMucs = danhMucIds.Select(id => new DanhMuc_KhoaHoc
            {
                IdKhoaHoc = khoaHoc.Id,
                IdDanhMuc = id
            }).ToList();

            await _danhMuc_KhoaHocService.CreateRange(khoaHocDanhMucs);
            await _danhMuc_KhoaHocService.SaveAsync();

            var KhoaHocDto = _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHoc);
            KhoaHocDto.DanhMucs = _mapper.MapToList<DanhMuc_KhoaHoc, DanhMuc_KhoaHocDto>(khoaHocDanhMucs);

            try
            {
                await _elasticsearchService.IndexCourseAsync(khoaHoc.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch Indexing failed during creation: {ex.Message}");
            }

            return KhoaHocDto;
        }
        #endregion
         
        #region UpdateKhoaHoc
        #region UpdateKhoaHoc
        public async Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            // ── Lấy bản gốc (IsBanHienTai = true) ───────────────
            var banGoc = await GetAll()
                .FirstOrDefaultAsync(x => x.Id == request.IdKhoaHoc && x.IsBanHienTai && !x.IsDeleted);

            if (banGoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (banGoc.TrangThaiPheDuyet == "ChoDuyet" && request.GiaGoc == null)
                throw new Exception("Chuyển sang DangSua để sửa khóa học này!");


            if (banGoc.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception(
                       $"❌ KHÓA HỌC ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
                       $"Hệ thống Eduverses đang kiểm duyệt khóa học này" +
                       $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                       $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
                );

            if (banGoc.TrangThaiPheDuyet == "DaDuyet" && request.GiaGoc == null)
                throw new Exception("Khóa học đang ở chế độ Đã Duyệt không thể sửa");

            var coQuyenSua = await CoQuyenTrenKhoaHoc(banGoc.Id, nguoiTao, gv => gv.Manage);
            if (!coQuyenSua)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            

            if (banGoc.TrangThaiPheDuyet == "DaDuyet" && banGoc != null)
            {

                if (request.Gia < 0)
                    throw new Exception("Giá không hợp lệ");

                if (request.GiaGoc < request.Gia)
                    throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

                banGoc.GiaGoc = request.GiaGoc;
                banGoc.Gia = request.GiaGoc;
                await UpdateAsync(banGoc);
                await SaveAsync();
            }


            else if (banGoc.TrangThaiPheDuyet == "DangSua" && banGoc != null)
            {
                if (banGoc.HinhAnhKhoaHoc == null && request.Img == null)
                    throw new Exception("Vui lòng chọn ảnh cho khóa học");

                if (request.MoTa == null)
                    throw new Exception("Vui lòng nhập mô tả cho khóa học");

                // ── Validation ───────────────────────────────────────
                if (string.IsNullOrWhiteSpace(request.TieuDe))
                    throw new Exception("Tên khóa học không được để trống");

                if (request.Gia < 0)
                    throw new Exception("Giá không hợp lệ");

                if (request.GiaGoc < request.Gia)
                    throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

                // ── Validate danh mục ────────────────────────────────
                var danhMucMoi = (request.DanhSachDanhMuc ?? new List<Guid>())
                    .Distinct()
                    .ToList();

                if (danhMucMoi.Any())
                {
                    var danhMucTonTai = await _danhMucRepository.GetQueryable()
                        .Where(x => danhMucMoi.Contains(x.Id) && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    var danhMucKhongTonTai = danhMucMoi.Except(danhMucTonTai).ToList();

                    if (danhMucKhongTonTai.Any())
                        throw new Exception($"Danh mục không tồn tại: {string.Join(", ", danhMucKhongTonTai)}");
                }

                // ── Upload ảnh nếu có ────────────────────────────────
                string hinhAnh = banGoc.HinhAnhKhoaHoc;
                string idHinhAnh = banGoc.IdHinhAnhKhoaHoc;

                if (request.Img != null)
                {
                    if (banGoc.HinhAnhKhoaHoc == null)
                    {
                        var upload = await _cloudinaryService.UploadImageAsync(request.Img);
                        if (upload == null)
                            throw new Exception("Upload hình ảnh thất bại");

                        hinhAnh = upload.UrlImg;
                        idHinhAnh = upload.PublicId;
                    }

                    if (banGoc.HinhAnhKhoaHoc != null)
                    {
                        var upload = await _cloudinaryService.UpdateImageAsync(banGoc.IdHinhAnhKhoaHoc, request.Img);
                        if (upload == null)
                            throw new Exception("Upload hình ảnh thất bại");

                        hinhAnh = upload.UrlImg;
                        idHinhAnh = upload.PublicId;
                    }
                }

                var isFree = request.GiaGoc <= 0;

                banGoc.TieuDe = request.TieuDe.Trim();
                banGoc.MoTa = request.MoTa?.Trim();
                banGoc.GiaGoc = request.GiaGoc;
                banGoc.Gia = request.GiaGoc;
                banGoc.CapDo = request.CapDo;
                banGoc.LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí";
                banGoc.HinhAnhKhoaHoc = hinhAnh;
                banGoc.IdHinhAnhKhoaHoc = idHinhAnh;
                banGoc.TrangThaiPheDuyet = "DangSua";
                banGoc.TrangThai = "DangSua";
                banGoc.IsBanHienTai = true;

                await UpdateAsync(banGoc);
                await UpdateDanhMuc(banGoc.Id, danhMucMoi);
                await SaveAsync();

                try { await _elasticsearchService.IndexCourseAsync(banGoc.Id); } catch {}  
            }

            await _signalRService.NotifyCourseUpdated(banGoc.Id);

            return _mapper.Map<KhoaHoc, KhoaHocDto>(banGoc);
        }
        #endregion

        // ── Helper cập nhật danh mục ─────────────────────────────
        private async Task UpdateDanhMuc(Guid idKhoaHoc, List<Guid> danhMucMoi)
        {
            if (!danhMucMoi.Any()) return;

            var danhMucCu = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .ToListAsync();

            var danhMucCuIds = danhMucCu.Select(x => x.IdDanhMuc).ToHashSet();
            var danhMucMoiSet = danhMucMoi.ToHashSet();

            var canXoa = danhMucCu
                .Where(x => !danhMucMoiSet.Contains(x.IdDanhMuc))
                .ToList();

            if (canXoa.Any())
            {
                await _danhMuc_KhoaHocService.DeleteAsync(canXoa);
                await _danhMuc_KhoaHocService.SaveAsync();
            }

            var canThem = danhMucMoiSet
                .Where(id => !danhMucCuIds.Contains(id))
                .Select(id => new DanhMuc_KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = idKhoaHoc,
                    IdDanhMuc = id
                }).ToList();

            if (canThem.Any())
            {
                await _danhMuc_KhoaHocService.CreateRange(canThem);
                await _danhMuc_KhoaHocService.SaveAsync();
            }
        }
        #endregion

        public async Task<bool> DeleteKhoaHoc(Guid idKhoaHoc)
        {
            var currentUser = _httpContextAccessor.HttpContext?.User;
            Guid.TryParse(currentUser?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);
            var khoaHoc = await GetByIdAsync(idKhoaHoc);
            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khoa học");

            if (currentUser?.IsInRole("Admin") != true && khoaHoc.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền xóa khóa học này!");

            if (khoaHoc.TrangThaiPheDuyet == "ChoDuyet" || khoaHoc.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception("Đang gửi duyệt không thể xóa");

            var coNguoiHoc = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc);

                khoaHoc.TrangThai = coNguoiHoc == false ? "DaXoa" : "NgungHoatDong";// nếu isdele = true + DaXoa  coi như kh ai co thể nhìn thấy(xóa khi chưa có ai đăng kí)
                                                                                   //nếu isdele = true + NgungHoatDong nhưng người đăng kí trước ngày xóa vẫn xem đc

            await DeleteAsync(khoaHoc);
            await SaveAsync();

            try
            {
                await _elasticsearchService.DeleteCourseAsync(idKhoaHoc);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch deletion failed: {ex.Message}");
            }

            await _signalRService.NotifyCourseUpdated(idKhoaHoc);

            return true;
        }

        // danh sách khóa học đã được duyệt dùng để áp dụng khuyến mãi
        public async Task<List<KhoaHocMiniDto>> GetApprovedListForSelect()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");

            var list = await GetAll()
                .Where(x => x.CreatedId == userId
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true
                         && !x.IsDeleted)              // ← thêm dòng này
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new KhoaHocMiniDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc
                })
                .ToListAsync();

            return list.GroupBy(x => x.Id).Select(g => g.First()).ToList();
        }

        public async Task<List<string>> GetSearchSuggestions(string query)
        {
            return await _elasticsearchService.GetSearchSuggestionsAsync(query);
        }

        public async Task SyncElasticsearch()
        {
            await _elasticsearchService.BulkIndexAllCoursesAsync();
        }

        public async Task<int> BackfillChuSoHuuGiangVien()
        {
            var tatCaKhoaHoc = await GetAll()
                .Where(x => !x.IsDeleted)
                .Select(x => new { x.Id, x.CreatedId })
                .ToListAsync();

            // Lấy đầy đủ cặp (IdKhoaHoc, IdGiangVien) đã tồn tại — không chỉ IdKhoaHoc,
            // để không bỏ sót khóa học đã có cộng tác viên nhưng thiếu chủ sở hữu
            var existingPairs = (await _khoaHoc_GiangVienRepository.GetQueryable()
                .Where(x => !x.IsDeleted)
                .Select(x => new { x.IdKhoaHoc, x.IdGiangVien })
                .ToListAsync())
                .Select(x => (x.IdKhoaHoc, x.IdGiangVien))
                .ToHashSet();

            var thieuOwner = tatCaKhoaHoc
                .Where(x => x.CreatedId.HasValue
                         && !existingPairs.Contains((x.Id, x.CreatedId.Value)))
                .ToList();

            if (!thieuOwner.Any())
                return 0;

            // Tính tỷ lệ đã dùng theo từng khóa học, để không set 100% đè lên
            // tỷ lệ đã chia cho cộng tác viên hiện có (nếu có)
            var tyLeDaDung = await _khoaHoc_GiangVienRepository.GetQueryable()
                .Where(x => !x.IsDeleted)
                .GroupBy(x => x.IdKhoaHoc)
                .Select(g => new { IdKhoaHoc = g.Key, Tong = g.Sum(x => x.TyLeChiaDoanhThu) })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Tong);

            var danhSachThem = thieuOwner.Select(x => new KhoaHoc_GiangVien
            {
                Id = Guid.NewGuid(),
                IdKhoaHoc = x.Id,
                IdGiangVien = x.CreatedId.Value,
                LaChuSoHuu = true,
                Visible = true,
                TyLeChiaDoanhThu = 100 - tyLeDaDung.GetValueOrDefault(x.Id, 0),
                Manage = true,
                Performance = true,
                QnA = true,
                Reviews = true,
                Assignments = true,
                Materials = true,
                Promotions = true,
                IsDeleted = false,
            }).ToList();

            foreach (var item in danhSachThem)
                _khoaHoc_GiangVienRepository.Add(item);

            await _khoaHoc_GiangVienRepository.SaveAsync();

            return danhSachThem.Count;
        }

        private async Task ApDungCoVisible(IEnumerable<KhoaHocDto> items)
        {
            var khoaHocIds = items.Select(x => x.Id).ToList();
            if (!khoaHocIds.Any()) return;

            // Lấy toàn bộ thành viên đang hoạt động theo từng khóa học
            var members = await _khoaHoc_GiangVienRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => khoaHocIds.Contains(x.IdKhoaHoc) && !x.IsDeleted)
                .Select(x => new { x.IdKhoaHoc, x.LaChuSoHuu, x.Visible })
                .ToListAsync();

            var membersByKhoaHoc = members
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var item in items)
            {
                if (!membersByKhoaHoc.TryGetValue(item.Id, out var ds))
                    continue; // chưa có dòng nào (hiếm) → giữ nguyên CreatedBy sẵn có

                // Chỉ 1 giảng viên (hoặc chỉ có owner, chưa mời ai) → luôn hiện, không gate
                if (ds.Count <= 1)
                    continue;

                // Từ 2 người trở lên → chỉ hiện nếu chủ sở hữu bật Visible
                var owner = ds.FirstOrDefault(x => x.LaChuSoHuu);
                if (owner != null && !owner.Visible)
                    item.CreatedBy = null;
            }
        }

        private async Task GanDanhSachGiangVienHienThi(IEnumerable<KhoaHocDto> items)
        {
            var khoaHocIds = items.Select(x => x.Id).ToList();
            if (!khoaHocIds.Any()) return;

            var members = await _khoaHoc_GiangVienRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => khoaHocIds.Contains(x.IdKhoaHoc) && !x.IsDeleted)
                .Select(x => new { x.IdKhoaHoc, x.IdGiangVien, x.LaChuSoHuu, x.Visible })
                .ToListAsync();

            var membersByKhoaHoc = members
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Xác định danh sách Id giảng viên cần hiển thị cho từng khóa học.
            // Đã backfill KhoaHoc_GiangVien -> theo Visible/chủ sở hữu.
            // Chưa backfill (ds rỗng) -> fallback về CreatedId (người tạo khóa học).
            var idsTheoKhoaHoc = new Dictionary<Guid, List<Guid>>();
            var idsCanTraTen = new HashSet<Guid>();

            foreach (var item in items)
            {
                List<Guid> ids;

                if (membersByKhoaHoc.TryGetValue(item.Id, out var ds) && ds.Any())
                {
                    var visibleOnes = ds.Where(x => x.Visible).Select(x => x.IdGiangVien).ToList();
                    ids = visibleOnes.Any()
                        ? visibleOnes
                        : (ds.FirstOrDefault(x => x.LaChuSoHuu) is { } owner
                            ? new List<Guid> { owner.IdGiangVien }
                            : new List<Guid>());
                }
                else
                {
                    ids = item.CreatedId.HasValue
                        ? new List<Guid> { item.CreatedId.Value }
                        : new List<Guid>();
                }

                idsTheoKhoaHoc[item.Id] = ids;
                foreach (var id in ids) idsCanTraTen.Add(id);
            }

            var infoById = new Dictionary<Guid, GiangVienHienThiDto>();
            if (idsCanTraTen.Any())
            {
                infoById = await _appUserService.GetQueryable()
                    .AsNoTracking()
                    .Where(u => idsCanTraTen.Contains(u.Id))
                    .Select(u => new GiangVienHienThiDto
                    {
                        Id = u.Id,
                        HoTen = (!string.IsNullOrWhiteSpace(u.HoTen) ? u.HoTen
                               : !string.IsNullOrWhiteSpace(u.UserName) ? u.UserName
                               : u.Email) ?? "",
                        AnhDaiDien = u.AnhDaiDien
                    })
                    .ToDictionaryAsync(x => x.Id);
            }

            foreach (var item in items)
            {
                var giangViens = idsTheoKhoaHoc.TryGetValue(item.Id, out var ids)
                    ? ids.Select(id => infoById.GetValueOrDefault(id))
                         .Where(gv => gv != null && !string.IsNullOrWhiteSpace(gv!.HoTen))
                         .Select(gv => gv!)
                         .ToList()
                    : new List<GiangVienHienThiDto>();

                item.DanhSachGiangVien = giangViens;
                item.DanhSachGiangVienHienThi = giangViens.Count > 0
                    ? giangViens.Select(gv => gv.HoTen).ToList()
                    : (!string.IsNullOrWhiteSpace(item.CreatedBy)
                        ? new List<string> { item.CreatedBy }
                        : new List<string>());
            }
        }

        private async Task<bool> CoQuyenTrenKhoaHoc(Guid idKhoaHoc, Guid userId, Func<KhoaHoc_GiangVien, bool>? capQuyenCuThe = null)
        {
            var khoaHoc = await GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc);
            if (khoaHoc == null) return false;
            if (khoaHoc.CreatedId == userId) return true;

            var thanhVien = await _khoaHoc_GiangVienRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == userId && !x.IsDeleted);
            if (thanhVien == null) return false;
            if (thanhVien.LaChuSoHuu) return true;

            return capQuyenCuThe == null || capQuyenCuThe(thanhVien);
        }
    }
}
