using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.TienDoHocTapRepository;
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
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using Eduverse.Service.ElasticsearchService;



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
            IMemoryCache cache

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
        }
        


        #region GetListKhoaHoc
        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search)
        {
            search ??= new KhoaHocSearch();
            try
            {
                return await _elasticsearchService.SearchCoursesAsync(search);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch failed: {ex.Message}. Falling back to database.");
                return await GetListFromDatabaseAsync(search);
            }
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

            try
            {
                return await _elasticsearchService.SearchCoursesAsync(search);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch failed: {ex.Message}. Falling back to database.");
                return await GetListFromDatabaseAsync(search);
            }
        }
        #endregion

        private async Task<PagedList<KhoaHocDto>> GetListFromDatabaseAsync(KhoaHocSearch search)
        {
            var query = GetAll()
                .Where(x => x.TrangThaiPheDuyet == "DaDuyet" && x.TrangThai == "HoatDong" && x.IsBanHienTai);

            // Keyword Search
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var kw = search.Keyword.Trim().ToLower();
                query = query.Where(x => (x.TieuDe != null && x.TieuDe.ToLower().Contains(kw)) ||
                                         (x.MoTa != null && x.MoTa.ToLower().Contains(kw)) ||
                                         (x.LoaiKhoaHoc != null && x.LoaiKhoaHoc.ToLower().Contains(kw)));
            }

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                var td = search.TieuDe.Trim().ToLower();
                query = query.Where(x => x.TieuDe != null && x.TieuDe.ToLower().Contains(td));
            }

            // Category filter
            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
            {
                query = query.Where(x => x.LoaiKhoaHoc == search.LoaiKhoaHoc);
            }

            // Level filter
            if (!string.IsNullOrWhiteSpace(search.CapDo))
            {
                query = query.Where(x => x.CapDo == search.CapDo);
            }

            // Price filter
            if (search.IsFree == true)
            {
                query = query.Where(x => x.Gia == 0 || x.Gia == null);
            }
            else
            {
                if (search.GiaFrom.HasValue)
                {
                    query = query.Where(x => x.Gia >= search.GiaFrom.Value);
                }
                if (search.GiaTo.HasValue)
                {
                    query = query.Where(x => x.Gia <= search.GiaTo.Value);
                }
            }

            // Lecture count range filter
            if (search.TongBaiGiangFrom.HasValue)
            {
                query = query.Where(x => x.TongBaiGiang >= search.TongBaiGiangFrom.Value);
            }
            if (search.TongBaiGiangTo.HasValue)
            {
                query = query.Where(x => x.TongBaiGiang <= search.TongBaiGiangTo.Value);
            }

            // Exclude course IDs (for registered courses)
            if (search.ExcludeCourseIds != null && search.ExcludeCourseIds.Any())
            {
                query = query.Where(x => !search.ExcludeCourseIds.Contains(x.Id));
            }

            // Sorting
            if (search.SortPrice?.ToLower() == "asc")
            {
                query = query.OrderBy(x => x.Gia);
            }
            else if (search.SortPrice?.ToLower() == "desc")
            {
                query = query.OrderByDescending(x => x.Gia);
            }
            else
            {
                query = query.OrderByDescending(x => x.NgayTao);
            }

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
                SoLuongHocVien = x.SoLuongHocVien,
                NgayTao = x.NgayTao,
                NgayCapNhat = x.NgayCapNhat,
                TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                TrangThai = x.TrangThai,
                CreatedId = x.CreatedId,
                CreatedDate = x.CreatedDate,
                IsBanHienTai = x.IsBanHienTai,
                IdBanGhiTruoc = x.IdBanGhiTruoc
            });

            return await PagedList<KhoaHocDto>.CreateAsync(itemsQuery, search);
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
                join kh in GetAll().AsNoTracking()
                    on dk.IdKhoaHoc equals kh.Id
                where dk.IdNguoiDangKi == userId
                && (kh.TrangThaiPheDuyet == "DaDuyet")
                && (kh.TrangThai == "HoatDong" || kh.TrangThai == "NgungHoatDong")
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
                    kh.SoLuongHocVien
                };

            #region Filter
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                query = query.Where(x =>
                    (x.TieuDe ?? "").Contains(keyword) ||
                    (x.LoaiKhoaHoc ?? "").Contains(keyword));
            }
            #endregion

            query = query.OrderByDescending(x => x.NgayDangKy);

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

            // ---------------------------------------------------------------
            // Lấy tất cả bài giảng gốc thuộc khoá học trong trang
            // Với mỗi bài giảng gốc: nếu có BanSwap thì chọn bản Swap mới nhất,
            // ngược lại dùng chính bản gốc đó.
            // Kết quả: danh sách (IdKhoaHoc, IdBaiGiangHieuLuc, ThoiLuong)
            // ---------------------------------------------------------------
            var baiGiangHieuLuc = await (
                from ph in _phanRepository.GetAll().AsNoTracking()
                join bgGoc in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bgGoc.IdPhan
                // LEFT JOIN sang bảng bài giảng để tìm bản Swap của bài gốc
                join bgSwap in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on bgGoc.Id equals bgSwap.IdBanGhiTruoc into swapGroup
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !bgGoc.IsDeleted
                      && bgGoc.IdBanGhiTruoc == null   // chỉ lấy bản gốc làm điểm neo
                      && bgGoc.TrangThai == "HoatDong"
                select new
                {
                    IdKhoaHoc = ph.IdKhoaHoc.Value,
                    IdBaiGiangGoc = bgGoc.Id,
                    // Nếu có swap thì lấy swap mới nhất, không thì lấy bản gốc
                    IdBaiGiangHieuLuc = swapGroup
                        .Where(s => s.TrangThai == "BanSwap" && !s.IsDeleted)
                        .OrderByDescending(s => s.CreatedDate)
                        .Select(s => (Guid?)s.Id)
                        .FirstOrDefault() ?? bgGoc.Id,
                    ThoiLuongHieuLuc = swapGroup
                        .Where(s => s.TrangThai == "BanSwap" && !s.IsDeleted)
                        .OrderByDescending(s => s.CreatedDate)
                        .Select(s => (int?)s.ThoiLuong)
                        .FirstOrDefault() ?? (int?)bgGoc.ThoiLuong
                }
            ).ToListAsync();

            // Tổng số bài giảng theo khoá học
            var tongBaiGiangDict = baiGiangHieuLuc
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(g => g.Key, g => g.Count());

            // Tổng thời lượng theo khoá học (dùng thời lượng hiệu lực)
            var tongThoiLuongDict = baiGiangHieuLuc
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(x => x.ThoiLuongHieuLuc ?? 0));  // int? ?? 0 = int, OK

            // IdBaiGiangHieuLuc toàn bộ (dùng để đối chiếu tiến độ)
            var allBaiGiangHieuLucIds = baiGiangHieuLuc
                .Select(x => x.IdBaiGiangHieuLuc)
                .Distinct()
                .ToList();

            // ---------------------------------------------------------------
            // Tiến độ: đếm bài giảng hiệu lực đã hoàn thành theo đăng ký
            // Chỉ tính IdBaiGiang nằm trong danh sách bài giảng hiệu lực
            // ---------------------------------------------------------------
            var tienDoDict = await (
                from td in _tienDoHocTapRepository.GetQueryable().AsNoTracking()
                where td.IdDangKi.HasValue
                      && dangKyIds.Contains(td.IdDangKi.Value)
                      && td.TrangThai == "HoanThanh"
                      && allBaiGiangHieuLucIds.Contains(td.IdBaiGiang.Value)
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
                // Cache: số học viên
                var soHocVien = await GetOrCreateCacheAsync(
                    CacheKeys.SoHocVien(idKhoaHoc),
                    () => _dangKyKhoaHocRepository.GetQueryable()
                        .AsNoTracking()
                        .CountAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted),
                    TimeSpan.FromMinutes(10));
                Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId);
            // Check đã đăng ký chưa
            var daDangKy = userId != Guid.Empty && await _dangKyKhoaHocRepository
                .GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                           && x.IdNguoiDangKi == userId
                           && !x.IsDeleted);

            // Cache: thông tin khóa học
            var khoaHoc = await GetOrCreateCacheAsync(
                    CacheKeys.KhoaHoc(idKhoaHoc),
                    async () =>
                    {
                        var result = await GetAll()
                            .AsNoTracking()
                            .Where(x => x.Id == idKhoaHoc
                                    && x.TrangThaiPheDuyet == "DaDuyet"
                                    && (x.TrangThai == "HoatDong")
                                    && x.IsBanHienTai == true)
                            .Select(x => new KhoaHocDto
                            {
                                Id = x.Id,
                                TieuDe = x.TieuDe,
                                MoTa = x.MoTa,
                                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                                LoaiKhoaHoc = x.LoaiKhoaHoc,
                                SoLuongHocVien = soHocVien,
                                Gia = x.Gia,     
                                GiaGoc = x.GiaGoc,
                                DaDangKy = daDangKy,
                                DanhSachPhanHoc = new List<PhanHocDto>()
                            })
                            .FirstOrDefaultAsync();
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
                                     && x.TrangThai != "BanNhap"
                                     && x.TrangThaiPheDuyet == "DaDuyet"
                                     && x.DeletedId == null
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
                    khoaHoc.TongBaiGiang = 0;
                    khoaHoc.TongThoiLuong = 0;
                    return khoaHoc;
                }

                var phanIds = phanHocs.Select(x => x.Id).ToList();

                // Cache: bài giảng GỐC
                var baiGiangsGoc = await GetOrCreateCacheAsync(
                    CacheKeys.BaiGiangs(phanIds),
                    () => _baiGiangRepository.GetQueryable()
                        .AsNoTracking()
                        .Where(x => phanIds.Contains(x.IdPhan)
                                 && !x.IsDeleted
                                 && x.TrangThai != "ChoDuyet"
                                 && x.TrangThai != "DangSua"
                                 && x.IsBanHienTai == true)
                        .OrderBy(x => x.ThuTuSapXep)
                        .Select(x => new BaiGiangDto
                        {
                            Id = x.Id,
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

                var baiGiangGocIds = baiGiangsGoc.Select(x => x.Id).ToList();

                // Lấy swap mới nhất cho từng bài giảng gốc (public: luôn lấy bản swap mới nhất)
                var allSwaps = await _baiGiangRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.IdBanGhiTruoc.HasValue
                             && baiGiangGocIds.Contains(x.IdBanGhiTruoc.Value)
                             && x.TrangThaiPheDuyet == "DaDuyet"
                             && x.TrangThai == "BanSwap"
                             && x.IsBanHienTai == false
                             && !x.IsDeleted)
                    .OrderByDescending(x => x.CreatedDate)
                    .Select(x => new
                    {
                        x.Id,
                        x.IdBanGhiTruoc,
                        x.CreatedDate,
                        x.TieuDe,
                        x.LoaiBaiGiang,
                        x.IdVideoBaiGiang,
                        x.URLBaiGiang,
                        x.ThoiLuong,
                        x.LaBaiGiangFree
                    })
                    .ToListAsync();

                var swapMoiNhatByGoc = allSwaps
                    .GroupBy(x => x.IdBanGhiTruoc!.Value)
                    .ToDictionary(
                        g => g.Key,
                        g => g.OrderByDescending(x => x.CreatedDate).First());

                // Tài liệu cache theo gốc (chỉ cần cho bài giảng free)
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

                var taiLieuLookup = taiLieuList
                    .GroupBy(x => x.IdBaiGiang)
                    .ToDictionary(x => x.Key, x => x.ToList());

                // Build danh sách bài giảng hiển thị (áp swap mới nhất, ẩn chi tiết nếu không free)
                var baiGiangs = new List<BaiGiangDto>();
                foreach (var bgGoc in baiGiangsGoc)
                {
                    bool isFree = bgGoc.LaBaiGiangFree == true;
                    BaiGiangDto item;

                    if (swapMoiNhatByGoc.TryGetValue(bgGoc.Id, out var swap))
                    {
                        isFree = swap.LaBaiGiangFree == true;

                        if (isFree)
                        {
                            item = new BaiGiangDto
                            {
                                Id = swap.Id,
                                IdGoc = bgGoc.Id,
                                IdPhan = bgGoc.IdPhan,
                                TieuDe = swap.TieuDe,
                                LoaiBaiGiang = swap.LoaiBaiGiang,
                                IdVideoBaiGiang = swap.IdVideoBaiGiang,
                                URLBaiGiang = swap.URLBaiGiang,
                                ThuTuSapXep = bgGoc.ThuTuSapXep,
                                ThoiLuong = swap.ThoiLuong,
                                LaBaiGiangFree = true,
                                DanhSachTaiLieu = taiLieuLookup.GetValueOrDefault(bgGoc.Id, new List<TaiLieuDto>())
                            };
                        }
                        else
                        {
                            item = new BaiGiangDto
                            {
                                Id = swap.Id,
                                IdPhan = bgGoc.IdPhan,
                                TieuDe = swap.TieuDe,
                                LoaiBaiGiang = swap.LoaiBaiGiang,
                                ThuTuSapXep = bgGoc.ThuTuSapXep,
                                ThoiLuong = swap.ThoiLuong,
                                LaBaiGiangFree = false
                            };
                        }
                    }
                    else
                    {
                        if (isFree)
                        {
                            item = new BaiGiangDto
                            {
                                Id = bgGoc.Id,
                                IdGoc = bgGoc.Id,
                                IdPhan = bgGoc.IdPhan,
                                TieuDe = bgGoc.TieuDe,
                                LoaiBaiGiang = bgGoc.LoaiBaiGiang,
                                IdVideoBaiGiang = bgGoc.IdVideoBaiGiang,
                                URLBaiGiang = bgGoc.URLBaiGiang,
                                ThuTuSapXep = bgGoc.ThuTuSapXep,
                                ThoiLuong = bgGoc.ThoiLuong,
                                LaBaiGiangFree = true,
                                DanhSachTaiLieu = taiLieuLookup.GetValueOrDefault(bgGoc.Id, new List<TaiLieuDto>())
                            };
                        }
                        else
                        {
                            item = new BaiGiangDto
                            {
                                Id = bgGoc.Id,
                                IdGoc = bgGoc.Id,
                                IdPhan = bgGoc.IdPhan,
                                TieuDe = bgGoc.TieuDe,
                                LoaiBaiGiang = bgGoc.LoaiBaiGiang,
                                ThuTuSapXep = bgGoc.ThuTuSapXep,
                                ThoiLuong = bgGoc.ThoiLuong,
                                LaBaiGiangFree = false
                            };
                        }
                    }

                    baiGiangs.Add(item);
                }

                // Gắn bài giảng vào từng phần
                var baiGiangByPhan = baiGiangs
                    .GroupBy(x => x.IdPhan)
                    .ToDictionary(x => x.Key, x => x.ToList());

                foreach (var phan in phanHocs)
                {
                    if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
                        phan.DanhSachBaiGiang = list;
                }

                // Tính tổng số liệu khóa học
                int tongBaiGiang = baiGiangs.Count;
                int tongThoiLuong = baiGiangs.Sum(x => x.ThoiLuong ?? 0);
                int tongTaiLieu = taiLieuList.Count;

                khoaHoc.TongBaiGiang = tongBaiGiang;
                khoaHoc.TongThoiLuong = tongThoiLuong;
                khoaHoc.TongTaiLieu = tongTaiLieu; // nếu KhoaHocDto chưa có field này, cần bổ sung

                return khoaHoc;
            }
        #endregion


        //#region getLearning Realtime

        //#region TinhPhanTramHoanThanh
        ///// <summary>
        ///// Tính % hoàn thành khóa học cho 1 đăng ký, dựa trên:
        ///// - Bài giảng: đã hoàn thành (TienDoHocTap.TrangThai == "HoanThanh")
        ///// - Phần: TẤT CẢ quiz trong phần phải có ÍT NHẤT 1 lần làm đạt DiemDat (không quan tâm cũ/mới)
        ///// - Phần không có quiz → tự động tính là hoàn thành
        ///// % = (SoBaiGiangHoanThanh + SoPhanHoanThanh) / (TongBaiGiang + TongPhan) * 100
        ///// 
        ///// Hàm này không cache, tính trực tiếp mỗi lần gọi.
        ///// </summary>
        //public async Task<double> TinhPhanTramHoanThanh(Guid idDangKy)
        //{
        //    var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //        .Select(x => new { x.IdDangKi, x.IdNguoiDangKi })
        //        .FirstOrDefaultAsync();

        //    if (dangKy == null)
        //        throw new Exception("Bạn chưa đăng ký khóa học này");

        //    var idKhoaHoc = dangKy.IdDangKi;
        //    var userId = dangKy.IdNguoiDangKi;

        //    var phanIds = await _phanService.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
        //        .Select(x => x.Id)
        //        .ToListAsync();

        //    if (!phanIds.Any())
        //        return 0;

        //    // ── Bài giảng ─────────────────────────────────────────────────
        //    var baiGiangIds = await _baiGiangService.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => phanIds.Contains(x.IdPhan)
        //                 && !x.IsDeleted
        //                 && x.TrangThai != "ChoDuyet")
        //        .Select(x => x.Id)
        //        .ToListAsync();

        //    var tongBaiGiang = baiGiangIds.Count;

        //    var hoanThanhBaiGiang = await _tienDoHocTapService.GetQueryable()
        //        .AsNoTracking()
        //        .CountAsync(x => x.IdDangKi == idDangKy
        //                       && x.IdBaiGiang.HasValue
        //                       && baiGiangIds.Contains(x.IdBaiGiang.Value)
        //                       && x.TrangThai == "HoanThanh"
        //                       && !x.IsDeleted);

        //    // ── Bài kiểm tra theo từng phần kèm DiemDat ─────────────────────
        //    var baiKiemTraTheoPhans = await _baiKiemTraRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => phanIds.Contains(x.IdPhan.Value)
        //                 && !x.IsDeleted
        //                 && x.TrangThai == "HoatDong")
        //        .Select(x => new { x.Id, x.IdPhan, x.DiemDat })
        //        .ToListAsync();

        //    var baiKiemTraIds = baiKiemTraTheoPhans.Select(x => x.Id).ToList();

        //    var tongPhan = phanIds.Count;
        //    int tongPhanHoanThanhQuiz;

        //    if (!baiKiemTraIds.Any())
        //    {
        //        // Không phần nào có quiz → tất cả phần tự động hoàn thành
        //        tongPhanHoanThanhQuiz = tongPhan;
        //    }
        //    else
        //    {
        //        // ── Lần làm quiz của user (đạt = TongDiem >= DiemDat, không quan tâm cũ/mới) ──
        //        var lanLamList = await _lanLamBaiKiemTraService.GetQueryable()
        //            .AsNoTracking()
        //            .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
        //                     && x.IdNguoiDung == userId
        //                     && x.ThoiGianNop != null
        //                     && !x.IsDeleted)
        //            .Select(x => new { x.IdBaiKiemTra, x.TongDiemLanKiemTra })
        //            .ToListAsync();

        //        var diemDatMap = baiKiemTraTheoPhans
        //            .ToDictionary(x => x.Id, x => x.DiemDat ?? 0);

        //        // Quiz đạt = có ít nhất 1 lần làm >= DiemDat của bài đó (cũ hay mới đều tính)
        //        var quizDatIds = lanLamList
        //            .Where(x => x.TongDiemLanKiemTra >= diemDatMap.GetValueOrDefault(x.IdBaiKiemTra!.Value, 0))
        //            .Select(x => x.IdBaiKiemTra!.Value)
        //            .ToHashSet();

        //        // Group quiz theo phần
        //        var baiKiemTraByPhan = baiKiemTraTheoPhans
        //            .GroupBy(x => x.IdPhan)
        //            .ToDictionary(x => x.Key, x => x.Select(q => q.Id).ToList());

        //        // Phần hoàn thành quiz = TẤT CẢ quiz trong phần đều đạt
        //        var soPhanHoanThanhQuiz = baiKiemTraByPhan
        //            .Count(phan => phan.Value.All(quizId => quizDatIds.Contains(quizId)));

        //        // Phần không có quiz → tự động hoàn thành
        //        var phanKhongCoQuiz = phanIds
        //            .Count(pId => !baiKiemTraByPhan.ContainsKey(pId));

        //        tongPhanHoanThanhQuiz = soPhanHoanThanhQuiz + phanKhongCoQuiz;
        //    }

        //    // ── Tính % hoàn thành ─────────────────────────────────────────
        //    var tongItem = tongBaiGiang + tongPhan;
        //    var hoanThanhItem = hoanThanhBaiGiang + tongPhanHoanThanhQuiz;

        //    var phanTram = tongItem == 0
        //        ? 0
        //        : Math.Round((double)hoanThanhItem / tongItem * 100, 2);

        //    // ── AUTO-SWAP: 100% → kích hoạt bài giảng mới ────────────────
        //    if (phanTram >= 100)
        //        await SwapPendingBaiGiang(phanIds);

        //    return phanTram;
        //}
        //#endregion


        //#region GetLearning
        //public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
        //{
        //    if (idDangKy == Guid.Empty)
        //        throw new ArgumentException("Id đăng ký không hợp lệ");

        //    var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //        .Select(x => new { x.Id, x.IdDangKi, x.IdNguoiDangKi })
        //        .FirstOrDefaultAsync();

        //    if (dangKy == null)
        //        throw new Exception("Bạn chưa đăng ký khóa học này");

        //    var idKhoaHoc = dangKy.IdDangKi;

        //    var soHocVien = await _dangKyKhoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .CountAsync(x => x.IdDangKi == idKhoaHoc && !x.IsDeleted);

        //    var khoaHoc = await GetAll()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idKhoaHoc)
        //        .Select(x => new KhoaHocDto
        //        {
        //            Id = x.Id,
        //            TieuDe = x.TieuDe,
        //            MoTa = x.MoTa,
        //            HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
        //            LoaiKhoaHoc = x.LoaiKhoaHoc,
        //            SoLuongHocVien = soHocVien,
        //            DanhSachPhanHoc = new List<PhanHocDto>()
        //        })
        //        .FirstOrDefaultAsync();

        //    if (khoaHoc == null)
        //        throw new Exception("Không tìm thấy khóa học");

        //    var phanHocs = await _phanService.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
        //        .OrderBy(x => x.ThuTuSapXep)
        //        .Select(x => new PhanHocDto
        //        {
        //            Id = x.Id,
        //            IdKhoaHoc = x.IdKhoaHoc,
        //            TenPhan = x.TenPhan,
        //            MieuTa = x.MieuTa,
        //            ThuTuSapXep = x.ThuTuSapXep,
        //            DanhSachBaiGiang = new List<BaiGiangDto>()
        //        })
        //        .ToListAsync();

        //    khoaHoc.DanhSachPhanHoc = phanHocs;

        //    if (!phanHocs.Any())
        //    {
        //        khoaHoc.PhanTramHoanThanh = 0;
        //        return khoaHoc;
        //    }

        //    var phanIds = phanHocs.Select(x => x.Id).ToList();

        //    // ── Bài giảng ─────────────────────────────────────────────────
        //    var baiGiangs = await _baiGiangService.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => phanIds.Contains(x.IdPhan)
        //                 && !x.IsDeleted
        //                 && x.TrangThai != "ChoDuyet")
        //        .OrderBy(x => x.ThuTuSapXep)
        //        .Select(x => new BaiGiangDto
        //        {
        //            Id = x.Id,
        //            IdPhan = x.IdPhan,
        //            TieuDe = x.TieuDe,
        //            LoaiBaiGiang = x.LoaiBaiGiang,
        //            IdVideoBaiGiang = x.IdVideoBaiGiang,
        //            URLBaiGiang = x.URLBaiGiang,
        //            ThuTuSapXep = x.ThuTuSapXep,
        //            ThoiLuong = x.ThoiLuong,
        //            LaBaiGiangFree = x.LaBaiGiangFree,
        //            DanhSachTaiLieu = new List<TaiLieuDto>()
        //        })
        //        .ToListAsync();

        //    var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();

        //    // ── CHẠY TUẦN TỰ (không Task.WhenAll) để tránh lỗi:
        //    // "A second operation was started on this context instance before
        //    //  a previous operation completed" do dùng chung 1 DbContext.
        //    var tienDoDict = await _tienDoHocTapService.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdDangKi == idDangKy
        //                 && x.IdBaiGiang.HasValue
        //                 && baiGiangIds.Contains(x.IdBaiGiang.Value)
        //                 && !x.IsDeleted)
        //        .Select(x => new { x.IdBaiGiang, x.ThoiGianXem, x.TrangThai })
        //        .ToDictionaryAsync(x => x.IdBaiGiang!.Value);

        //    var taiLieuList = await _taiLieuService.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //        .Select(x => new TaiLieuDto
        //        {
        //            Id = x.Id,
        //            IdBaiGiang = x.IdBaiGiang,
        //            TenTaiLieu = x.TenTaiLieu,
        //            LoaiTaiLieu = x.LoaiTaiLieu,
        //            URL = x.URL
        //        })
        //        .ToListAsync();

        //    var phanTram = await TinhPhanTramHoanThanh(idDangKy);

        //    var taiLieuLookup = taiLieuList
        //        .GroupBy(x => x.IdBaiGiang)
        //        .ToDictionary(x => x.Key, x => x.ToList());

        //    // ── Gán dữ liệu + thống kê bài giảng ─────────────────────────
        //    int tongBaiGiang = 0, tongThoiLuong = 0, hoanThanhBaiGiang = 0;

        //    foreach (var bg in baiGiangs)
        //    {
        //        tongBaiGiang++;
        //        tongThoiLuong += bg.ThoiLuong ?? 0;

        //        if (tienDoDict.TryGetValue(bg.Id, out var td))
        //        {
        //            bg.DaHoanThanh = td.TrangThai == "HoanThanh";
        //            bg.ThoiGianXem = td.ThoiGianXem ?? 0;
        //            if (bg.DaHoanThanh) hoanThanhBaiGiang++;
        //        }

        //        if (taiLieuLookup.TryGetValue(bg.Id, out var tls))
        //            bg.DanhSachTaiLieu = tls;
        //    }

        //    // ── Gắn bài giảng vào phần học ───────────────────────────────
        //    var baiGiangByPhan = baiGiangs
        //        .GroupBy(x => x.IdPhan)
        //        .ToDictionary(x => x.Key, x => x.ToList());

        //    foreach (var phan in phanHocs)
        //    {
        //        if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
        //            phan.DanhSachBaiGiang = list;
        //    }

        //    khoaHoc.TongBaiGiang = tongBaiGiang;
        //    khoaHoc.TongThoiLuong = tongThoiLuong;
        //    khoaHoc.SoBaiGiangHoanThanh = hoanThanhBaiGiang;
        //    khoaHoc.PhanTramHoanThanh = phanTram;

        //    return khoaHoc;
        //}
        //#endregion


        //#region HoanThanhBaiGiang
        ///// <summary>
        ///// Gọi khi user xem hết / đánh dấu hoàn thành 1 bài giảng.
        ///// Trả về % mới để FE update progress bar ngay, không cần gọi lại GetLearning.
        ///// </summary>
        //public async Task<double> HoanThanhBaiGiang(Guid idDangKy, Guid idBaiGiang, int thoiGianXem)
        //{
        //    var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //        .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //        .FirstOrDefaultAsync();

        //    if (dangKy == null)
        //        throw new Exception("Bạn chưa đăng ký khóa học này");

        //    var tienDo = await _tienDoHocTapService.GetQueryable()
        //        .Where(x => x.IdDangKi == idDangKy && x.IdBaiGiang == idBaiGiang && !x.IsDeleted)
        //        .FirstOrDefaultAsync();

        //    if (tienDo == null)
        //    {
        //        tienDo = new TienDoHocTap
        //        {
        //            Id = Guid.NewGuid(),
        //            IdDangKi = idDangKy,
        //            IdBaiGiang = idBaiGiang,
        //            ThoiGianXem = thoiGianXem,
        //            TrangThai = "HoanThanh"
        //        };
        //        await _tienDoHocTapService.CreateAsync(tienDo);
        //    }
        //    else
        //    {
        //        tienDo.ThoiGianXem = thoiGianXem;
        //        tienDo.TrangThai = "HoanThanh";
        //        await _tienDoHocTapService.UpdateAsync(tienDo);
        //    }

        //    await _tienDoHocTapService.SaveAsync();

        //    // Tính lại % realtime, không cache, không thêm cột
        //    return await TinhPhanTramHoanThanh(idDangKy);
        //}
        //#endregion


        //#region NopBaiKiemTra
        ///// <summary>
        ///// Gọi khi user nộp bài kiểm tra.
        ///// Trả về % mới để FE update progress bar ngay, không cần gọi lại GetLearning.
        ///// </summary>
        //public async Task<NopBaiKiemTraResultDto> NopBaiKiemTra(Guid idDangKy, Guid idBaiKiemTra, double tongDiem)
        //{
        //    var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //        .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //        .FirstOrDefaultAsync();

        //    if (dangKy == null)
        //        throw new Exception("Bạn chưa đăng ký khóa học này");

        //    var baiKiemTra = await _baiKiemTraRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idBaiKiemTra && !x.IsDeleted)
        //        .Select(x => new { x.DiemDat })
        //        .FirstOrDefaultAsync();

        //    if (baiKiemTra == null)
        //        throw new Exception("Không tìm thấy bài kiểm tra");

        //    // Lưu lần làm bài
        //    var lanLam = new LanLamBaiKiemTra
        //    {
        //        Id = Guid.NewGuid(),
        //        IdBaiKiemTra = idBaiKiemTra,
        //        IdNguoiDung = dangKy.IdNguoiDangKi,
        //        TongDiemLanKiemTra = tongDiem,
        //        ThoiGianNop = DateTime.UtcNow
        //    };

        //    await _lanLamBaiKiemTraService.CreateAsync(lanLam);
        //    await _lanLamBaiKiemTraService.SaveAsync();

        //    var daDat = tongDiem >= (baiKiemTra.DiemDat ?? 0);

        //    // Tính lại % realtime (kèm auto-swap nếu đạt 100%)
        //    var phanTram = await TinhPhanTramHoanThanh(idDangKy);

        //    return new NopBaiKiemTraResultDto
        //    {
        //        DiemSo = tongDiem,
        //        DaDat = daDat,
        //        PhanTramHoanThanh = phanTram
        //    };
        //}
        //#endregion


        //#region SwapPendingBaiGiang
        //private async Task SwapPendingBaiGiang(List<Guid> phanIds)
        //{
        //    var baiGiangCuList = await _baiGiangService.GetQueryable()
        //        .Where(x => phanIds.Contains(x.IdPhan)
        //                 && x.IsPendingSwap
        //                 && x.IdBaiGiangMoi.HasValue
        //                 && !x.IsDeleted)
        //        .ToListAsync();

        //    if (!baiGiangCuList.Any())
        //        return;

        //    var idsBaiGiangMoi = baiGiangCuList
        //        .Select(x => x.IdBaiGiangMoi!.Value)
        //        .ToList();

        //    var baiGiangMoiList = await _baiGiangService.GetQueryable()
        //        .Where(x => idsBaiGiangMoi.Contains(x.Id))
        //        .ToListAsync();

        //    var baiGiangMoiDict = baiGiangMoiList.ToDictionary(x => x.Id);

        //    var idsBaiGiangCu = baiGiangCuList.Select(x => x.Id).ToList();

        //    var taiLieus = await _taiLieuService.GetQueryable()
        //        .Where(x => idsBaiGiangCu.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //        .ToListAsync();

        //    var taiLieuByBaiGiangCu = taiLieus
        //        .GroupBy(x => x.IdBaiGiang)
        //        .ToDictionary(x => x.Key, x => x.ToList());

        //    foreach (var cu in baiGiangCuList)
        //    {
        //        if (!baiGiangMoiDict.TryGetValue(cu.IdBaiGiangMoi!.Value, out var moi))
        //            continue;

        //        cu.IsDeleted = true;
        //        cu.IsPendingSwap = false;
        //        cu.IdBaiGiangMoi = null;

        //        moi.TrangThai = "HoatDong";
        //        moi.ThuTuSapXep = cu.ThuTuSapXep;
        //        moi.LaBaiGiangFree = cu.LaBaiGiangFree;

        //        if (taiLieuByBaiGiangCu.TryGetValue(cu.Id, out var dsTaiLieu))
        //        {
        //            foreach (var tl in dsTaiLieu)
        //                tl.IdBaiGiang = moi.Id;
        //        }

        //        await _baiGiangService.UpdateAsync(cu);
        //        await _baiGiangService.UpdateAsync(moi);
        //    }

        //    await _taiLieuService.SaveAsync();
        //    await _baiGiangService.SaveAsync();
        //}
        //#endregion

        //#endregion


        //   #region GetLearning with Cache & Realtime


        //   #region Cache Keys
        //   private static class CacheKeys
        //   {
        //       public static string SoHocVien(Guid? khoaHocId) => $"SoHocVien_{khoaHocId}";
        //       public static string SoCauHoiOfQuiz(List<Guid> quizIds) => $"SoCauHoiOfQuiz_{string.Join("_", quizIds.OrderBy(x => x))}";
        //       public static string KhoaHoc(Guid? khoaHocId) => $"KhoaHoc_{khoaHocId}";
        //       public static string PhanHocs(Guid? khoaHocId) => $"PhanHocs_{khoaHocId}";
        //       public static string BaiGiangs(List<Guid> phanIds) => $"BaiGiangs_{string.Join("_", phanIds.OrderBy(x => x))}";
        //       public static string BaiKiemTra(List<Guid> phanIds) => $"BaiKiemTra_{string.Join("_", phanIds.OrderBy(x => x))}";
        //       public static string BaiKiemTraFull(List<Guid> phanIds) => $"BaiKiemTraFull_{string.Join("_", phanIds.OrderBy(x => x))}";
        //       public static string TaiLieus(List<Guid> baiGiangIds) => $"TaiLieus_{string.Join("_", baiGiangIds.OrderBy(x => x))}";
        //   }
        //   #endregion


        //   #region TinhPhanTramHoanThanh (Real-time - NO CACHE)
        //   public async Task<double> TinhPhanTramHoanThanh(Guid? idDangKy, DateTime? ngayDangKy = null)
        //   {
        //       var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //           .Select(x => new { x.IdKhoaHoc, x.IdNguoiDangKi, x.CreatedDate })
        //           .FirstOrDefaultAsync();

        //       if (dangKy == null)
        //           throw new Exception("Bạn chưa đăng ký khóa học này");

        //       var idKhoaHoc = dangKy.IdKhoaHoc;
        //       var userId = dangKy.IdNguoiDangKi;
        //       var ngayDK = ngayDangKy ?? dangKy.CreatedDate;

        //       var phanIds = await GetOrCreateCacheAsync(
        //           CacheKeys.PhanHocs(idKhoaHoc),
        //           async () => await _phanRepository.GetQueryable()
        //               .AsNoTracking()
        //               .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
        //               .Select(x => x.Id)
        //               .ToListAsync(),
        //           TimeSpan.FromMinutes(30));

        //       if (!phanIds.Any())
        //           return 0;

        //       // Lấy tất cả bài giảng GỐC (chuẩn để tính tổng số)
        //       var baiGiangGocIds = await GetOrCreateCacheAsync(
        //           CacheKeys.BaiGiangs(phanIds),
        //           async () => await _baiGiangRepository.GetQueryable()
        //               .AsNoTracking()
        //               .Where(x => phanIds.Contains(x.IdPhan)
        //                        && !x.IsDeleted
        //                        && x.TrangThai == "HoatDong"
        //                        && x.IsBanHienTai == true)
        //               .Select(x => x.Id)
        //               .ToListAsync(),
        //           TimeSpan.FromMinutes(30));

        //       var tongBaiGiang = baiGiangGocIds.Count;

        //       // Lấy tiến độ hoàn thành của user
        //       var tienDoHoanThanhIds = await _tienDoHocTapRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.IdDangKi == idDangKy
        //                    && x.IdBaiGiang.HasValue
        //                    && x.TrangThai == "HoanThanh"
        //                    && !x.IsDeleted)
        //           .Select(x => x.IdBaiGiang!.Value)
        //           .ToListAsync();

        //       // Tách ID gốc và ID swap
        //       var idsKhopGoc = tienDoHoanThanhIds.Where(id => baiGiangGocIds.Contains(id)).ToHashSet();
        //       var idsLa = tienDoHoanThanhIds.Where(id => !baiGiangGocIds.Contains(id)).Distinct().ToList();

        //       var idsGocQuyDoiTuSwap = new HashSet<Guid>();
        //       if (idsLa.Any())
        //       {
        //           var draftMap = await _baiGiangRepository.GetQueryable()
        //               .AsNoTracking()
        //               .Where(x => idsLa.Contains(x.Id)
        //                        && x.IdBanGhiTruoc.HasValue
        //                        && x.IsBanHienTai == false
        //                        && !x.IsDeleted)
        //               .Select(x => new { x.Id, x.IdBanGhiTruoc, x.CreatedDate })
        //               .ToListAsync();

        //           foreach (var d in draftMap)
        //           {
        //               // Nếu swap tạo SAU ngày đăng ký (học viên cũ) => quy đổi về gốc
        //               if (baiGiangGocIds.Contains(d.IdBanGhiTruoc!.Value) && d.CreatedDate > ngayDK)
        //               {
        //                   idsGocQuyDoiTuSwap.Add(d.IdBanGhiTruoc!.Value);
        //               }
        //               // Còn swap tạo trước ngày đăng ký (học viên mới) => giữ nguyên ID swap (không quy đổi)
        //               // Nhưng những ID swap này đã nằm trong idsLa và sẽ không được đếm nếu không quy đổi.
        //               // Vì vậy, nếu swap tạo trước ngày đăng ký, ta cũng cần quy đổi để đếm? 
        //               // KHÔNG: vì tổng số bài giảng là số gốc, nên chỉ đếm khi quy đổi về gốc.
        //               // Nhưng học viên mới đã lưu tiến độ theo swap, nên ta cần quy đổi về gốc để tính đúng.
        //               // => Quy đổi tất cả swap về gốc, không phân biệt ngày.
        //           }
        //           // Sửa: quy đổi tất cả swap về gốc (vì chuẩn là gốc)
        //           // Nếu swap không có IdBanGhiTruoc hợp lệ thì bỏ qua.
        //           foreach (var d in draftMap)
        //           {
        //               if (baiGiangGocIds.Contains(d.IdBanGhiTruoc!.Value))
        //               {
        //                   idsGocQuyDoiTuSwap.Add(d.IdBanGhiTruoc!.Value);
        //               }
        //           }
        //       }

        //       var hoanThanhBaiGiang = idsKhopGoc.Union(idsGocQuyDoiTuSwap).Count();

        //       // Bài kiểm tra
        //       var baiKiemTraTheoPhans = await GetOrCreateCacheAsync(
        //           CacheKeys.BaiKiemTra(phanIds),
        //           async () => await _baiKiemTraRepository.GetQueryable()
        //               .AsNoTracking()
        //               .Where(x => phanIds.Contains(x.IdPhan.Value)
        //                        && !x.IsDeleted
        //                        && x.TrangThai == "HoatDong")
        //               .Select(x => new { x.Id, x.IdPhan, x.DiemDat })
        //               .ToListAsync(),
        //           TimeSpan.FromMinutes(30));

        //       var baiKiemTraIds = baiKiemTraTheoPhans.Select(x => x.Id).ToList();

        //       if (!baiKiemTraIds.Any())
        //       {
        //           var phanTrambg = tongBaiGiang == 0 ? 0 : Math.Round((double)hoanThanhBaiGiang / tongBaiGiang * 100, 2);
        //           if (phanTrambg >= 100)
        //               await SwapPendingBaiGiang(idDangKy.Value, phanIds);
        //           return phanTrambg;
        //       }

        //       // Xử lý quiz tương tự (giữ nguyên)
        //       var lanLamHoanThanhList = await _lanLamBaiKiemTraService.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
        //                    && x.IdNguoiDung == userId
        //                    && x.TrangThai == "HoanThanh"
        //                    && !x.IsDeleted)
        //           .OrderBy(x => x.ThoiGianNop)
        //           .Select(x => new { x.IdBaiKiemTra, x.TongDiemLanKiemTra, x.ThoiGianNop })
        //           .ToListAsync();

        //       var lanLamHoanThanhNhat = lanLamHoanThanhList
        //           .GroupBy(x => x.IdBaiKiemTra)
        //           .Select(g => g.OrderBy(x => x.ThoiGianNop).First())
        //           .ToDictionary(x => x.IdBaiKiemTra!.Value, x => x.TongDiemLanKiemTra);

        //       var diemDatMap = baiKiemTraTheoPhans
        //           .ToDictionary(x => x.Id, x => x.DiemDat ?? 0);

        //       var quizDatIds = lanLamHoanThanhNhat
        //           .Where(x => x.Value >= diemDatMap.GetValueOrDefault(x.Key, 0))
        //           .Select(x => x.Key)
        //           .ToHashSet();

        //       var baiKiemTraByPhan = baiKiemTraTheoPhans
        //           .GroupBy(x => x.IdPhan)
        //           .ToDictionary(x => x.Key, x => x.Select(q => q.Id).ToList());

        //       var soPhanHoanThanhQuiz = baiKiemTraByPhan
        //           .Count(phan => phan.Value.All(quizId => quizDatIds.Contains(quizId)));

        //       var tongPhanCoQuiz = baiKiemTraByPhan.Count;
        //       var tongItem = tongBaiGiang + tongPhanCoQuiz;
        //       var hoanThanhItem = hoanThanhBaiGiang + soPhanHoanThanhQuiz;

        //       var phanTram = tongItem == 0 ? 0 : Math.Round((double)hoanThanhItem / tongItem * 100, 2);

        //       if (phanTram >= 100)
        //       {
        //           await SwapPendingBaiGiang(idDangKy.Value, phanIds);
        //           await SwapPendingBaiKiemTra(idDangKy.Value, phanIds);
        //       }

        //       return phanTram;
        //   }
        //   #endregion


        //   #region GetLearning
        //   public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
        //   {
        //       Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiDangKi);

        //       if (idDangKy == Guid.Empty)
        //           throw new ArgumentException("Id đăng ký không hợp lệ");

        //       var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.Id == idDangKy && !x.IsDeleted && x.IdNguoiDangKi == nguoiDangKi)
        //           .Select(x => new { x.Id, x.IdKhoaHoc, x.IdNguoiDangKi, x.CreatedDate })
        //           .FirstOrDefaultAsync();

        //       if (dangKy == null)
        //           throw new Exception("Bạn chưa đăng ký khóa học này");

        //       var idKhoaHoc = dangKy.IdKhoaHoc;
        //       var userId = nguoiDangKi;
        //       var ngayDangKy = dangKy.CreatedDate;

        //       // Cache: số học viên
        //       var soHocVien = await GetOrCreateCacheAsync(
        //           CacheKeys.SoHocVien(idKhoaHoc),
        //           () => _dangKyKhoaHocRepository.GetQueryable()
        //               .AsNoTracking()
        //               .CountAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted),
        //           TimeSpan.FromMinutes(10));

        //       // Cache: thông tin khóa học
        //       var khoaHoc = await GetOrCreateCacheAsync(
        //           CacheKeys.KhoaHoc(idKhoaHoc),
        //           async () =>
        //           {
        //               var result = await GetAll()
        //                   .AsNoTracking()
        //                   .Where(x => x.Id == idKhoaHoc
        //                           && (x.TrangThaiPheDuyet == "DaDuyet")
        //                           && (x.TrangThai == "HoatDong" || x.TrangThai == "NgungHoatDong")
        //                           && (x.DeletedDate > dangKy.CreatedDate || x.DeletedDate < dangKy.CreatedDate)
        //                           && x.IsBanHienTai == true)
        //                   .Select(x => new KhoaHocDto
        //                   {
        //                       Id = x.Id,
        //                       TieuDe = x.TieuDe,
        //                       MoTa = x.MoTa,
        //                       HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
        //                       LoaiKhoaHoc = x.LoaiKhoaHoc,
        //                       SoLuongHocVien = soHocVien,
        //                       DanhSachPhanHoc = new List<PhanHocDto>()
        //                   })
        //                   .FirstOrDefaultAsync();
        //               return result;
        //           },
        //           TimeSpan.FromMinutes(30));

        //       if (khoaHoc == null)
        //           throw new Exception("Không tìm thấy khóa học");

        //       // Cache: danh sách phần học
        //       var phanHocs = await GetOrCreateCacheAsync(
        //           CacheKeys.PhanHocs(idKhoaHoc),
        //           async () =>
        //           {
        //               var list = await _phanRepository.GetAll()
        //                   .AsNoTracking()
        //                   .Where(x => x.IdKhoaHoc == idKhoaHoc
        //                            && x.TrangThai == "HoatDong"
        //                            && x.TrangThaiPheDuyet == "DaDuyet"
        //                            && x.DeletedId == null &&(x.DeletedDate > dangKy.CreatedDate || x.DeletedDate < dangKy.CreatedDate)
        //                            && x.TrangThai != "BanNhap"
        //                            && x.IsBanHienTai == true)
        //                   .OrderBy(x => x.ThuTuSapXep)
        //                   .Select(x => new PhanHocDto
        //                   {
        //                       Id = x.Id,
        //                       IdKhoaHoc = x.IdKhoaHoc,
        //                       TenPhan = x.TenPhan,
        //                       MieuTa = x.MieuTa,
        //                       ThuTuSapXep = x.ThuTuSapXep,
        //                       DanhSachBaiGiang = new List<BaiGiangDto>()
        //                   })
        //                   .ToListAsync();

        //               for (int i = 0; i < list.Count; i++)
        //                   list[i].ThuTuSapXep = i + 1;

        //               return list;
        //           },
        //           TimeSpan.FromMinutes(30));

        //       khoaHoc.DanhSachPhanHoc = phanHocs;

        //       if (!phanHocs.Any())
        //       {
        //           khoaHoc.PhanTramHoanThanh = 0;
        //           return khoaHoc;
        //       }

        //       var phanIds = phanHocs.Select(x => x.Id).ToList();

        //       // Cache: bài giảng GỐC
        //       var baiGiangsGoc = await GetOrCreateCacheAsync(
        //           CacheKeys.BaiGiangs(phanIds),
        //           () => _baiGiangRepository.GetQueryable()
        //               .AsNoTracking()
        //               .Where(x => phanIds.Contains(x.IdPhan)
        //                        && !x.IsDeleted
        //                        && (x.DeletedDate > dangKy.CreatedDate || x.DeletedDate < dangKy.CreatedDate)
        //                        && x.TrangThai != "ChoDuyet"
        //                        && x.TrangThai != "DangSua"
        //                        && x.IsBanHienTai == true)
        //               .OrderBy(x => x.ThuTuSapXep)
        //               .Select(x => new BaiGiangDto
        //               {
        //                   Id = x.Id,
        //                   IdPhan = x.IdPhan,
        //                   TieuDe = x.TieuDe,
        //                   LoaiBaiGiang = x.LoaiBaiGiang,
        //                   IdVideoBaiGiang = x.IdVideoBaiGiang,
        //                   URLBaiGiang = x.URLBaiGiang,
        //                   ThuTuSapXep = x.ThuTuSapXep,
        //                   ThoiLuong = x.ThoiLuong,
        //                   LaBaiGiangFree = x.LaBaiGiangFree,
        //                   DanhSachTaiLieu = new List<TaiLieuDto>()
        //               })
        //               .ToListAsync(),
        //           TimeSpan.FromMinutes(30));

        //       var baiGiangGocIds = baiGiangsGoc.Select(x => x.Id).ToList();

        //       // Lấy TẤT CẢ swap (không phân biệt ngày tạo)
        //       var allSwaps = await _baiGiangRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.IdBanGhiTruoc.HasValue
        //                    && baiGiangGocIds.Contains(x.IdBanGhiTruoc.Value)
        //                    && x.TrangThaiPheDuyet == "DaDuyet"
        //                    && x.TrangThai == "BanSwap"
        //                    && x.IsBanHienTai == false
        //                    && !x.IsDeleted)
        //           .OrderByDescending(x => x.CreatedDate)
        //           .Select(x => new
        //           {
        //               x.Id,
        //               x.IdBanGhiTruoc,
        //               x.CreatedDate,
        //               x.TieuDe,
        //               x.LoaiBaiGiang,
        //               x.IdVideoBaiGiang,
        //               x.URLBaiGiang,
        //               x.ThoiLuong
        //           })
        //           .ToListAsync();

        //       var swapMoiNhatByGoc = allSwaps
        //           .GroupBy(x => x.IdBanGhiTruoc!.Value)
        //           .ToDictionary(
        //               g => g.Key,
        //               g => g.OrderByDescending(x => x.CreatedDate).First());

        //       // Lấy tiến độ của user trước để biết ID nào đang được dùng
        //       var tienDoRaw = await _tienDoHocTapRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.IdDangKi == idDangKy
        //                    && x.IdBaiGiang.HasValue
        //                    && !x.IsDeleted)
        //           .Select(x => new { x.IdBaiGiang, x.ThoiGianXem, x.TrangThai })
        //           .ToListAsync();

        //       var tienDoIds = tienDoRaw.Select(t => t.IdBaiGiang!.Value).ToHashSet();

        //       // Tạo danh sách bài giảng hiển thị
        //       var baiGiangs = new List<BaiGiangDto>();
        //       foreach (var bgGoc in baiGiangsGoc)
        //       {
        //           BaiGiangDto item;
        //           if (swapMoiNhatByGoc.TryGetValue(bgGoc.Id, out var swap))
        //           {
        //               // Quyết định dùng swap hay gốc:
        //               // 1. Nếu tiến độ đang dùng swap đó -> dùng swap
        //               // 2. Hoặc swap tạo trước/ bằng ngày đăng ký (học viên mới) -> dùng swap
        //               // 3. Ngược lại -> dùng gốc
        //               if (tienDoIds.Contains(swap.Id) || swap.CreatedDate <= ngayDangKy)
        //               {
        //                   // Dùng swap
        //                   item = new BaiGiangDto
        //                   {
        //                       Id = swap.Id,
        //                       IdGoc = bgGoc.Id,
        //                       IdPhan = bgGoc.IdPhan,
        //                       TieuDe = swap.TieuDe,
        //                       LoaiBaiGiang = swap.LoaiBaiGiang,
        //                       IdVideoBaiGiang = swap.IdVideoBaiGiang,
        //                       URLBaiGiang = swap.URLBaiGiang,
        //                       ThuTuSapXep = bgGoc.ThuTuSapXep,
        //                       ThoiLuong = swap.ThoiLuong,
        //                       LaBaiGiangFree = bgGoc.LaBaiGiangFree,
        //                       DanhSachTaiLieu = new List<TaiLieuDto>()
        //                   };
        //               }
        //               else
        //               {
        //                   // Dùng gốc
        //                   item = new BaiGiangDto
        //                   {
        //                       Id = bgGoc.Id,
        //                       IdGoc = bgGoc.Id,
        //                       IdPhan = bgGoc.IdPhan,
        //                       TieuDe = bgGoc.TieuDe,
        //                       LoaiBaiGiang = bgGoc.LoaiBaiGiang,
        //                       IdVideoBaiGiang = bgGoc.IdVideoBaiGiang,
        //                       URLBaiGiang = bgGoc.URLBaiGiang,
        //                       ThuTuSapXep = bgGoc.ThuTuSapXep,
        //                       ThoiLuong = bgGoc.ThoiLuong,
        //                       LaBaiGiangFree = bgGoc.LaBaiGiangFree,
        //                       DanhSachTaiLieu = new List<TaiLieuDto>()
        //                   };
        //               }
        //           }
        //           else
        //           {
        //               // Không có swap
        //               item = new BaiGiangDto
        //               {
        //                   Id = bgGoc.Id,
        //                   IdGoc = bgGoc.Id,
        //                   IdPhan = bgGoc.IdPhan,
        //                   TieuDe = bgGoc.TieuDe,
        //                   LoaiBaiGiang = bgGoc.LoaiBaiGiang,
        //                   IdVideoBaiGiang = bgGoc.IdVideoBaiGiang,
        //                   URLBaiGiang = bgGoc.URLBaiGiang,
        //                   ThuTuSapXep = bgGoc.ThuTuSapXep,
        //                   ThoiLuong = bgGoc.ThoiLuong,
        //                   LaBaiGiangFree = bgGoc.LaBaiGiangFree,
        //                   DanhSachTaiLieu = new List<TaiLieuDto>()
        //               };
        //           }
        //           baiGiangs.Add(item);
        //       }

        //       // Tài liệu cache theo gốc
        //       var taiLieuList = await GetOrCreateCacheAsync(
        //           CacheKeys.TaiLieus(baiGiangGocIds),
        //           () => _taiLieuRepository.GetQueryable()
        //               .AsNoTracking()
        //               .Where(x => baiGiangGocIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //               .Select(x => new TaiLieuDto
        //               {
        //                   Id = x.Id,
        //                   IdBaiGiang = x.IdBaiGiang,
        //                   TenTaiLieu = x.TenTaiLieu,
        //                   LoaiTaiLieu = x.LoaiTaiLieu,
        //                   URL = x.URL
        //               })
        //               .ToListAsync(),
        //           TimeSpan.FromMinutes(60));

        //       var baiKiemTraList = await GetOrCreateCacheAsync(
        //                CacheKeys.BaiKiemTraFull(phanIds),   // ← key riêng, không conflict
        //                async () => await _baiKiemTraRepository.GetQueryable()
        //                    .AsNoTracking()
        //                    .Where(x => phanIds.Contains(x.IdPhan.Value)
        //                             && !x.IsDeleted
        //                             && x.TrangThai == "HoatDong")
        //                    .Select(x => new
        //                    {
        //                        x.Id,
        //                        x.IdPhan,
        //                        x.DiemDat,
        //                        x.TenBaiKiemTra   
        //                    })
        //    .ToListAsync(),
        //TimeSpan.FromMinutes(30));

        //       Console.WriteLine($"=== DEBUG BaiKiemTra ===");
        //       Console.WriteLine($"phanIds: [{string.Join(", ", phanIds)}]");
        //       Console.WriteLine($"baiKiemTraList.Count: {baiKiemTraList.Count}");
        //       foreach (var b in baiKiemTraList)
        //           Console.WriteLine($"  -> Id={b.Id}, IdPhan={b.IdPhan}, TieuDe={b.TenBaiKiemTra}");



        //       var baiKiemTraIds = baiKiemTraList.Select(x => x.Id).ToList();

        //       // Cache: số câu hỏi theo từng bài kiểm tra
        //       var soCauHoiMap = new Dictionary<Guid, int>();
        //       if (baiKiemTraIds.Any())
        //       {
        //           soCauHoiMap = await GetOrCreateCacheAsync(
        //               CacheKeys.SoCauHoiOfQuiz(baiKiemTraIds),
        //               async () =>
        //               {
        //                   var counts = await _cauHoiService.GetQueryable()
        //                       .AsNoTracking()
        //                       .Where(x => x.IdBaiKiemTra.HasValue
        //                                && baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
        //                                && !x.IsDeleted)
        //                       .GroupBy(x => x.IdBaiKiemTra!.Value)  // group theo Guid (không nullable)
        //                       .Select(g => new { IdBaiKiemTra = g.Key, SoCauHoi = g.Count() })
        //                       .ToListAsync();
        //                   return counts.ToDictionary(x => x.IdBaiKiemTra, x => x.SoCauHoi); // Key giờ là Guid
        //               },
        //               TimeSpan.FromMinutes(30));
        //       }

        //       var baiKiemTraByPhan = baiKiemTraList
        //           .Where(x => x.IdPhan.HasValue)
        //           .GroupBy(x => x.IdPhan!.Value)
        //           .ToDictionary(
        //               g => g.Key,
        //               g => g.Select(x => new BaiKiemTraDto
        //               {

        //                   Id = x.Id,
        //                   IdPhan = x.IdPhan,
        //                   TenBaiKiemTra = x.TenBaiKiemTra,
        //                   DiemDat = x.DiemDat,
        //                   SoCauHoi = soCauHoiMap.GetValueOrDefault(x.Id, 0),
        //                   DanhSachCauHois = new List<CauHoiDto>()
        //               }).ToList());

        //       // sau khi build baiKiemTraByPhan
        //       Console.WriteLine($"baiKiemTraByPhan.Keys: [{string.Join(", ", baiKiemTraByPhan.Keys)}]");
        //       Console.WriteLine($"phanHocs Ids: [{string.Join(", ", phanHocs.Select(x => x.Id))}]");

        //       // Map tiến độ: key là ID hiển thị
        //       var tienDoDict = new Dictionary<Guid, (int ThoiGianXem, string TrangThai)>();
        //       var idHienThiSet = baiGiangs.Select(b => b.Id).ToHashSet();
        //       var gocToHienThi = baiGiangs.ToDictionary(b => b.IdGoc, b => b.Id);

        //       foreach (var t in tienDoRaw)
        //       {
        //           var idRaw = t.IdBaiGiang!.Value;
        //           if (idHienThiSet.Contains(idRaw))
        //           {
        //               tienDoDict[idRaw] = (t.ThoiGianXem ?? 0, t.TrangThai);
        //           }
        //           else if (gocToHienThi.TryGetValue(idRaw, out var idHienThi))
        //           {
        //               tienDoDict[idHienThi] = (t.ThoiGianXem ?? 0, t.TrangThai);
        //           }
        //           else
        //           {
        //               // Fallback
        //               tienDoDict[idRaw] = (t.ThoiGianXem ?? 0, t.TrangThai);
        //           }
        //       }

        //       // Tính % hoàn thành
        //       var phanTram = await TinhPhanTramHoanThanh(idDangKy, ngayDangKy);

        //       var taiLieuLookup = taiLieuList
        //           .GroupBy(x => x.IdBaiGiang)
        //           .ToDictionary(x => x.Key, x => x.ToList());

        //       // Gán dữ liệu
        //       int tongBaiGiang = 0, tongThoiLuong = 0, hoanThanhBaiGiang = 0;
        //       foreach (var bg in baiGiangs)
        //       {
        //           tongBaiGiang++;
        //           tongThoiLuong += bg.ThoiLuong ?? 0;
        //           if (tienDoDict.TryGetValue(bg.Id, out var td))
        //           {
        //               bg.DaHoanThanh = td.TrangThai == "HoanThanh";
        //               bg.ThoiGianXem = td.ThoiGianXem;
        //               if (bg.DaHoanThanh) hoanThanhBaiGiang++;
        //           }
        //           // Tài liệu theo ID gốc
        //           if (taiLieuLookup.TryGetValue(bg.IdGoc, out var tls))
        //               bg.DanhSachTaiLieu = tls;
        //       }

        //       // Gắn vào phần học
        //       var baiGiangByPhan = baiGiangs
        //           .GroupBy(x => x.IdPhan)
        //           .ToDictionary(x => x.Key, x => x.ToList());

        //       foreach (var phan in phanHocs)
        //       {
        //           if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
        //               phan.DanhSachBaiGiang = list;

        //           if (baiKiemTraByPhan.TryGetValue(phan.Id, out var listBkt))
        //               phan.DanhSachBaiKiemTra = listBkt;
        //       }

        //       khoaHoc.TongBaiGiang = tongBaiGiang;
        //       khoaHoc.TongThoiLuong = tongThoiLuong;
        //       khoaHoc.SoBaiGiangHoanThanh = hoanThanhBaiGiang;
        //       khoaHoc.PhanTramHoanThanh = phanTram;

        //       return khoaHoc;
        //   }
        //   #endregion


        //   #region SwapPendingBaiGiang
        //   public async Task SwapPendingBaiGiang(Guid idDangKy, List<Guid> phanIds)
        //   {
        //       var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //           .Select(x => new { x.CreatedDate })
        //           .FirstOrDefaultAsync();

        //       if (dangKy == null)
        //           return;

        //       var ngayDangKy = dangKy.CreatedDate;

        //       var baiGiangGocList = await _baiGiangRepository.GetQueryable()
        //           .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted && x.IsBanHienTai == true)
        //           .Select(x => x.Id)
        //           .ToListAsync();

        //       if (!baiGiangGocList.Any())
        //           return;

        //       // Lấy swap tạo SAU ngày đăng ký (chỉ swap cho học viên cũ)
        //       var draftList = await _baiGiangRepository.GetQueryable()
        //           .Where(x => x.IdBanGhiTruoc.HasValue
        //                    && baiGiangGocList.Contains(x.IdBanGhiTruoc.Value)
        //                    && x.TrangThaiPheDuyet == "DaDuyet"
        //                    && x.IsBanHienTai == false
        //                    && !x.IsDeleted
        //                    && x.CreatedDate > ngayDangKy)
        //           .Select(x => new { x.Id, x.IdBanGhiTruoc, x.CreatedDate })
        //           .ToListAsync();

        //       if (!draftList.Any())
        //           return;

        //       var draftMoiNhatByGoc = draftList
        //           .GroupBy(x => x.IdBanGhiTruoc!.Value)
        //           .Select(g => new
        //           {
        //               IdGoc = g.Key,
        //               IdDraftMoiNhat = g.OrderByDescending(x => x.CreatedDate).First().Id
        //           })
        //           .ToDictionary(x => x.IdGoc, x => x.IdDraftMoiNhat);

        //       var draftToGocMap = draftList
        //           .ToDictionary(x => x.Id, x => x.IdBanGhiTruoc!.Value);

        //       var tienDoList = await _tienDoHocTapRepository.GetQueryable()
        //           .Where(x => x.IdDangKi == idDangKy
        //                    && x.IdBaiGiang.HasValue
        //                    && x.TrangThai == "HoanThanh"
        //                    && !x.IsDeleted)
        //           .ToListAsync();

        //       if (!tienDoList.Any())
        //           return;

        //       foreach (var tienDo in tienDoList)
        //       {
        //           var idHienTai = tienDo.IdBaiGiang!.Value;
        //           Guid? idGoc = null;

        //           if (baiGiangGocList.Contains(idHienTai))
        //               idGoc = idHienTai;
        //           else if (draftToGocMap.TryGetValue(idHienTai, out var idGocTuDraft)
        //                 && baiGiangGocList.Contains(idGocTuDraft))
        //               idGoc = idGocTuDraft;

        //           if (!idGoc.HasValue)
        //               continue;

        //           if (draftMoiNhatByGoc.TryGetValue(idGoc.Value, out var idDraftMoiNhat))
        //           {
        //               if (idHienTai == idDraftMoiNhat)
        //                   continue;

        //               Console.WriteLine($"SWAP: {idHienTai} (gốc: {idGoc}) -> {idDraftMoiNhat}");
        //               tienDo.IdBaiGiang = idDraftMoiNhat;
        //               _tienDoHocTapRepository.Update(tienDo);
        //           }
        //       }

        //       await _tienDoHocTapRepository.SaveAsync();
        //   }
        //   #endregion


        //   #region SwapPendingBaiKiemTra
        //   public async Task SwapPendingBaiKiemTra(Guid idDangKy, List<Guid> phanIds)
        //   {
        //       var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //           .AsNoTracking()
        //           .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //           .Select(x => new { x.IdNguoiDangKi, x.CreatedDate })
        //           .FirstOrDefaultAsync();

        //       if (dangKy == null)
        //           return;

        //       var userId = dangKy.IdNguoiDangKi;
        //       var ngayDangKy = dangKy.CreatedDate;

        //       var baiKiemTraGocList = await _baiKiemTraRepository.GetQueryable()
        //           .Where(x => phanIds.Contains(x.IdPhan.Value) && !x.IsDeleted && x.IsBanHienTai == true)
        //           .Select(x => x.Id)
        //           .ToListAsync();

        //       if (!baiKiemTraGocList.Any())
        //           return;

        //       var draftList = await _baiKiemTraRepository.GetQueryable()
        //           .Where(x => x.IdBanGhiTruoc.HasValue
        //                    && baiKiemTraGocList.Contains(x.IdBanGhiTruoc.Value)
        //                    && x.TrangThaiPheDuyet == "DaDuyet"
        //                    && x.IsBanHienTai == false
        //                    && !x.IsDeleted
        //                    && x.CreatedDate > ngayDangKy)
        //           .Select(x => new { x.Id, x.IdBanGhiTruoc, x.CreatedDate })
        //           .ToListAsync();

        //       if (!draftList.Any())
        //           return;

        //       var draftMoiNhatByGoc = draftList
        //           .GroupBy(x => x.IdBanGhiTruoc!.Value)
        //           .Select(g => new
        //           {
        //               IdGoc = g.Key,
        //               IdDraftMoiNhat = g.OrderByDescending(x => x.CreatedDate).First().Id
        //           })
        //           .ToDictionary(x => x.IdGoc, x => x.IdDraftMoiNhat);

        //       var draftToGocMap = draftList
        //           .ToDictionary(x => x.Id, x => x.IdBanGhiTruoc!.Value);

        //       var lanLamList = await _lanLamBaiKiemTraService.GetQueryable()
        //           .Where(x => x.IdNguoiDung == userId
        //                    && x.IdBaiKiemTra.HasValue
        //                    && !x.IsDeleted)
        //           .ToListAsync();

        //       if (!lanLamList.Any())
        //           return;

        //       Guid? ResolveGoc(Guid idHienTai)
        //       {
        //           if (baiKiemTraGocList.Contains(idHienTai))
        //               return idHienTai;
        //           if (draftToGocMap.TryGetValue(idHienTai, out var idGocTuDraft)
        //               && baiKiemTraGocList.Contains(idGocTuDraft))
        //               return idGocTuDraft;
        //           return null;
        //       }

        //       var idsGocDangBiKhoa = lanLamList
        //           .Where(x => x.TrangThai == "DangLam")
        //           .Select(x => ResolveGoc(x.IdBaiKiemTra!.Value))
        //           .Where(id => id.HasValue)
        //           .Select(id => id!.Value)
        //           .ToHashSet();

        //       var lanLamCanSwap = lanLamList
        //           .Where(x => x.TrangThai == "HoanThanh" || x.TrangThai == null)
        //           .ToList();

        //       if (!lanLamCanSwap.Any())
        //           return;

        //       foreach (var lanLam in lanLamCanSwap)
        //       {
        //           var idHienTai = lanLam.IdBaiKiemTra!.Value;
        //           var idGoc = ResolveGoc(idHienTai);
        //           if (!idGoc.HasValue)
        //               continue;
        //           if (idsGocDangBiKhoa.Contains(idGoc.Value))
        //               continue;
        //           if (draftMoiNhatByGoc.TryGetValue(idGoc.Value, out var idDraftMoiNhat))
        //           {
        //               if (idHienTai == idDraftMoiNhat)
        //                   continue;
        //               Console.WriteLine($"SWAP QUIZ: {idHienTai} (gốc: {idGoc}) -> {idDraftMoiNhat}");
        //               lanLam.IdBaiKiemTra = idDraftMoiNhat;
        //               await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
        //           }
        //       }

        //       await _lanLamBaiKiemTraService.SaveAsync();
        //   }
        //   #endregion


        //   #region Helper Methods
        //   private class DraftInfo
        //   {
        //       public Guid Id { get; set; }
        //       public Guid? IdBanGhiTruoc { get; set; }
        //       public string TieuDe { get; set; }
        //       public string LoaiBaiGiang { get; set; }
        //       public string IdVideoBaiGiang { get; set; }
        //       public string URLBaiGiang { get; set; }
        //       public int? ThoiLuong { get; set; }
        //       public DateTime CreatedDate { get; set; }
        //   }

        //   private async Task<T> GetOrCreateCacheAsync<T>(string cacheKey, Func<Task<T>> factory, TimeSpan expiration)
        //   {
        //       if (_memoryCache.TryGetValue(cacheKey, out T cachedData))
        //           return cachedData;

        //       var data = await factory();
        //       _memoryCache.Set(cacheKey, data, new MemoryCacheEntryOptions
        //       {
        //           AbsoluteExpirationRelativeToNow = expiration,
        //           SlidingExpiration = TimeSpan.FromMinutes(5),
        //           Priority = CacheItemPriority.Normal
        //       });
        //       return data;
        //   }

        //   public void InvalidateCourseCache(Guid khoaHocId, List<Guid> phanIds = null)
        //   {
        //       _memoryCache.Remove(CacheKeys.SoHocVien(khoaHocId));
        //       _memoryCache.Remove(CacheKeys.KhoaHoc(khoaHocId));
        //       _memoryCache.Remove(CacheKeys.PhanHocs(khoaHocId));
        //       if (phanIds != null && phanIds.Any())
        //       {
        //           _memoryCache.Remove(CacheKeys.BaiGiangs(phanIds));
        //           _memoryCache.Remove(CacheKeys.BaiKiemTra(phanIds));
        //           _memoryCache.Remove(CacheKeys.BaiKiemTraFull(phanIds));
        //       }
        //   }

        //   public void ClearAllCache()
        //   {
        //       if (_memoryCache is MemoryCache memoryCache)
        //           memoryCache.Compact(1.0);
        //   }
        //   #endregion

        //   #endregion


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

        #region GetLearning (KHÔNG SWAP)
            public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
            {
                Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiDangKi);

                if (idDangKy == Guid.Empty)
                    throw new ArgumentException("Id đăng ký không hợp lệ");

                var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.Id == idDangKy && !x.IsDeleted && x.IdNguoiDangKi == nguoiDangKi)
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
                            DanhSachPhanHoc = new List<PhanHocDto>()
                        })
                        .FirstOrDefaultAsync();
            // THÊM LOG NÀY
            Console.WriteLine($"[DEBUG] Query idKhoaHoc: {idKhoaHoc}");
            Console.WriteLine($"[DEBUG] Result: {(result == null ? "NULL" : result.TieuDe)}");

            // Thử query không có điều kiện để xem data thật
            var check = await GetAll()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc)
                .Select(x => new { x.Id, x.TieuDe, x.TrangThai, x.TrangThaiPheDuyet, x.IsBanHienTai, x.IsDeleted })
                .FirstOrDefaultAsync();
            Console.WriteLine($"[DEBUG] Raw data: {System.Text.Json.JsonSerializer.Serialize(check)}");
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
         && x.TrangThai != "ChoDuyet"
         && x.TrangThai != "DangSua"
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

            if (khoaHoc.CreatedId != userId)
                throw new Exception($"Bạn không có quyền hạn để sửa khóa học: {khoaHoc.Id}");

            var khoaHocNhap = await GetQueryable()
                .Where(kh => kh.IdBanGhiTruoc == khoaHoc.Id && !kh.IsDeleted)
                .FirstOrDefaultAsync();

            var khoaHocToUpdate = new List<KhoaHoc>();
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
                var phanHocIds = phanHocs.Select(p => p.Id).ToList();

                // Bài giảng đang DangSua
                var baiGiangs = await _baiGiangRepository.GetQueryable()
                    .Where(b => phanHocIds.Contains(b.IdPhan) && !b.IsDeleted && b.TrangThaiPheDuyet == "DangSua")
                    .ToListAsync();

                foreach (var bg in baiGiangs)
                {
                    bg.TrangThaiPheDuyet = "ChoDuyet";
                    bg.TrangThai = "ChoDuyet";
                    bg.UpdatedDate = DateTime.UtcNow;
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

            // Nếu không có gì cần cập nhật thì báo luôn, khỏi mở transaction cho tốn công
            if (!khoaHocToUpdate.Any() && !baiGiangToUpdate.Any() && !taiLieuToUpdate.Any()
                && !baiKiemTraToUpdate.Any() && !cauHoiToUpdate.Any() && !dapAnToUpdate.Any())
            {
                throw new Exception("Không có phần nào đang ở trạng thái Đang sửa để chuyển sang Chờ duyệt");
            }

            using (var transaction = await _eduverseContext.Database.BeginTransactionAsync())
            {
                try
                {
                    if (khoaHocToUpdate.Any())
                        await UpdateAsync(khoaHocToUpdate);

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
            }

            return _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHoc);
        }


        public async Task<List<KhoaHocDto>> ChuyenTrangThaiDangSua(BatchIdsRequest request)
        {
            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                throw new UnauthorizedAccessException("Không xác định được người dùng");

            // Lấy bản gốc
            var banGocs = await GetQueryable()
                .Where(x => request.Ids.Contains(x.Id) && !x.IsDeleted)
                .ToListAsync();

            if (!banGocs.Any())
                throw new Exception("Không tìm thấy khóa học nào");

            var invalidOwners = banGocs.Where(x => x.CreatedId != userId).Select(x => x.Id).ToList();
            if (invalidOwners.Any())
                throw new Exception($"Bạn không có quyền hạn để sửa các khóa học: {string.Join(", ", invalidOwners)}");

            var banGocIds = banGocs.Select(x => x.Id).ToList();

            var banNhaps = await GetAll()
                .Where(x => banGocIds.Contains(x.IdBanGhiTruoc ?? Guid.Empty)
                            && !x.IsDeleted
                            && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet"))
                .ToListAsync();

            var khoaHocToUpdate = new List<KhoaHoc>();
            var baiGiangToUpdate = new List<BaiGiang>();
            var taiLieuToUpdate = new List<TaiLieu>();

            var khoaHocIdsToUpdate = new List<Guid>();

            foreach (var banGoc in banGocs)
            {
                var banCanXuLy = banNhaps.FirstOrDefault(x => x.IdBanGhiTruoc == banGoc.Id);
                if (banCanXuLy == null && (banGoc.TrangThaiPheDuyet == "ChoDuyet" || banGoc.TrangThaiPheDuyet == "DangDuyet"))
                {
                    banCanXuLy = banGoc;
                }

                if (banCanXuLy == null)
                    throw new Exception($"Khóa học {banGoc.Id} hiện không ở trạng thái Chờ duyệt hoặc Đang duyệt");

                if (banCanXuLy.TrangThaiPheDuyet == "DangDuyet")
                    throw new Exception($"❌ Khóa học {banGoc.Id} đang được kiểm duyệt. Không thể chuyển sang Đang sửa.");

                // Cập nhật khóa học
                banCanXuLy.TrangThaiPheDuyet = "DangSua";
                banCanXuLy.TrangThai = "DangSua";
                banCanXuLy.UpdatedDate = DateTime.UtcNow;
                khoaHocToUpdate.Add(banCanXuLy);
                khoaHocIdsToUpdate.Add(banCanXuLy.Id);
            }

            // Lấy tất cả phần học thuộc các khóa học này
            if (khoaHocIdsToUpdate.Any())
            {
                var phanHocs = await _phanRepository.GetQueryable()
                    .Where(p => khoaHocIdsToUpdate.Contains(p.IdKhoaHoc.Value) && !p.IsDeleted)
                    .Select(p => p.Id)
                    .ToListAsync();

                if (phanHocs.Any())
                {
                    // Lấy tất cả bài giảng thuộc các phần đó và đang ở trạng thái ChoDuyet hoặc DangDuyet
                    var baiGiangs = await _baiGiangRepository.GetQueryable()
                        .Where(b => phanHocs.Contains(b.IdPhan) && !b.IsDeleted
                                    && (b.TrangThaiPheDuyet == "ChoDuyet" || b.TrangThaiPheDuyet == "DangDuyet"))
                        .ToListAsync();

                    foreach (var bg in baiGiangs)
                    {
                        if (bg.TrangThaiPheDuyet == "DangDuyet")
                            throw new Exception($"❌ Bài giảng {bg.Id} đang được kiểm duyệt. Không thể chuyển.");

                        bg.TrangThaiPheDuyet = "DangSua";
                        bg.TrangThai = "DangSua";
                        bg.UpdatedDate = DateTime.UtcNow;
                        baiGiangToUpdate.Add(bg);
                    }

                    // Lấy tất cả tài liệu thuộc các bài giảng đó và đang ở trạng thái ChoDuyet hoặc DangDuyet
                    var baiGiangIds = baiGiangs.Select(b => b.Id).ToList();
                    if (baiGiangIds.Any())
                    {
                        var taiLieus = await _taiLieuRepository.GetQueryable()
                            .Where(t => baiGiangIds.Contains(t.IdBaiGiang) && !t.IsDeleted
                                        && (t.TrangThaiPheDuyet == "ChoDuyet" || t.TrangThaiPheDuyet == "DangDuyet"))
                            .ToListAsync();

                        foreach (var tl in taiLieus)
                        {
                            if (tl.TrangThaiPheDuyet == "DangDuyet")
                                throw new Exception($"❌ Tài liệu {tl.Id} đang được kiểm duyệt. Không thể chuyển.");

                            tl.TrangThaiPheDuyet = "DangSua";
                            tl.TrangThai = "DangSua";
                            tl.UpdatedDate = DateTime.UtcNow;
                            taiLieuToUpdate.Add(tl);
                        }
                    }
                }
            }

            if (_baiGiangService == null)
                throw new Exception("_baiGiangService chưa được inject");

            if (_taiLieuService == null)
                throw new Exception("_baiGiangService chưa được inject");

            using (var transaction = await _eduverseContext.Database.BeginTransactionAsync())
            {
                try
                {
                    if (khoaHocToUpdate.Any())
                        await UpdateAsync(khoaHocToUpdate);
                    if (baiGiangToUpdate.Any())
                        await _baiGiangService.UpdateAsync(baiGiangToUpdate);
                    if (taiLieuToUpdate.Any())
                        await _taiLieuService.UpdateAsync(taiLieuToUpdate);

                    await _eduverseContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            foreach (var kh in khoaHocToUpdate)
            {
                try { await _elasticsearchService.IndexCourseAsync(kh.Id); } catch {}
            }
            var resultDtos = _mapper.MapList<KhoaHoc, KhoaHocDto>(khoaHocToUpdate);
            return resultDtos.ToList();
        }


        public async Task<GetToUpdateKhoaHoc> GetToUpdateKhoaHoc(Guid idKhoaHoc)
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var nguoiTao);

            var khoaHoc = await GetQueryable()
                .Where(x => x.Id == idKhoaHoc && x.CreatedId == nguoiTao)
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
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học hoặc bạn không có quyền.");

            khoaHoc.DanhSachDanhMuc = await _danhMuc_KhoaHocRepository
                .GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc)
                .Select(x => x.IdDanhMuc)
                .ToListAsync();

            return khoaHoc;
        }


        public async Task<PagedList<KhoaHocDto>> GetListForManager(GetListSearch search)
        {
            // Lấy userId từ token
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            }

            // ── Query lấy tất cả khóa học gốc của user (chưa xóa) ──
            var query = GetQueryable()
                .Where(x => x.CreatedId == userId
                         && x.IsBanHienTai == true
                         && !x.IsDeleted);

            // ── Áp dụng filter ──

            // 1. Filter theo từ khóa
            if (!string.IsNullOrEmpty(search.Keyword))
            {
                query = query.Where(x => x.TieuDe != null && x.TieuDe.Contains(search.Keyword));
            }

            // ── Sắp xếp ──
            if (!string.IsNullOrEmpty(search.SapXep))
            {
                switch (search.SapXep)
                {
                    case "moi-nhat":
                        query = query.OrderByDescending(x => x.CreatedDate);
                        break;
                    case "cu-nhat":
                        query = query.OrderBy(x => x.CreatedDate);
                        break;
                    case "ten-a-z":
                        query = query.OrderBy(x => x.TieuDe ?? "");
                        break;
                    case "ten-z-a":
                        query = query.OrderByDescending(x => x.TieuDe ?? "");
                        break;
                    default:
                        query = query.OrderByDescending(x => x.CreatedDate);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(x => x.CreatedDate);
            }

            // ── Map sang DTO ──
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
                CreatedId = x.CreatedId,
                CreatedDate = x.CreatedDate,
                IsBanHienTai = x.IsBanHienTai,
                IdBanGhiTruoc = x.IdBanGhiTruoc,
            });

            // ── Phân trang ──
            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }


        #region CreateKhoaHoc
        public async Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên khóa học không được để trống");

            if (request.DanhSachDanhMuc == null || !request.DanhSachDanhMuc.Any())
                throw new Exception("Vui lòng chọn danh mục");

            if (request.Gia < 0)
                throw new Exception("Giá không hợp lệ");

            if (request.Gia > 100000000)
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

            var isFree = request.Gia <= 0;

            var khoaHoc = new KhoaHoc
            {
                IsBanHienTai = true,
                TieuDe = request.TieuDe.Trim(),
                MoTa = request.MoTa,
                GiaGoc = request.GiaGoc,
                Gia = request.Gia,
                CapDo = request.CapDo,
                LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí",
                //HinhAnhKhoaHoc = upLoadResult.UrlImg.Trim(),
                //IdHinhAnhKhoaHoc = upLoadResult.PublicId,
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua",

            };

            await CreateAsync(khoaHoc);
            await SaveAsync();

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
                throw new Exception("Không tìm thấy khóa học");

            if (banGoc.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            if (banGoc.HinhAnhKhoaHoc == null && request.Img == null)
                throw new Exception("Vui lòng chọn ảnh cho khóa học");

            if (request.MoTa == null)
                throw new Exception("Vui lòng chọn ảnh cho khóa học");

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
                if(banGoc.HinhAnhKhoaHoc == null)
                {
                    var upload = await _cloudinaryService.UploadImageAsync(request.Img);
                    if (upload == null)
                        throw new Exception("Upload hình ảnh thất bại");

                    hinhAnh = upload.UrlImg;
                    idHinhAnh = upload.PublicId;
                }

                if(banGoc.HinhAnhKhoaHoc != null)
                {
                    var upload = await _cloudinaryService.UpdateImageAsync(banGoc.IdHinhAnhKhoaHoc, request.Img);
                    if (upload == null)
                        throw new Exception("Upload hình ảnh thất bại");

                    hinhAnh = upload.UrlImg;
                    idHinhAnh = upload.PublicId;
                }
            }

            var isFree = request.Gia <= 0;

            if (banGoc.TrangThaiPheDuyet == "DangSua" && banGoc.IsBanHienTai == true && banGoc != null)
            {
                banGoc.TieuDe = request.TieuDe.Trim();
                banGoc.MoTa = request.MoTa?.Trim();
                banGoc.GiaGoc = request.GiaGoc;
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

                return _mapper.Map<KhoaHoc, KhoaHocDto>(banGoc);
            }

            if (banGoc.TrangThaiPheDuyet == "TuChoi" && banGoc.IsBanHienTai == true && banGoc != null)
            {
                banGoc.TieuDe = request.TieuDe.Trim();
                banGoc.MoTa = request.MoTa?.Trim();
                banGoc.Gia = request.Gia;
                banGoc.GiaGoc = request.GiaGoc;
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

                return _mapper.Map<KhoaHoc, KhoaHocDto>(banGoc);
            }




            var banNhap = await GetAll()
                .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id
                                        && !x.IsDeleted
                                        && (x.TrangThaiPheDuyet == "ChoDuyet"
                                            || x.TrangThaiPheDuyet == "DaDuyet"
                                            || x.TrangThaiPheDuyet == "TuChoi"
                                            || x.TrangThaiPheDuyet == "DangDuyet"
                                            || x.TrangThaiPheDuyet == "DangSua"));

            

            

            if (banNhap != null && (banNhap.TrangThaiPheDuyet == "DangSua" || banNhap.TrangThaiPheDuyet == "DaDuyet"))
            {
                if (banNhap.CreatedId != nguoiTao)
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

                

                //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TieuDe);
                //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.MoTa);
                //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.CapDo);

                banNhap.IdBanGhiTruoc = banGoc.Id;
                banNhap.TieuDe = request.TieuDe.Trim();
                banNhap.MoTa = request.MoTa?.Trim();
                banNhap.Gia = request.Gia;
                banNhap.GiaGoc = request.GiaGoc;
                banNhap.CapDo = request.CapDo;
                banNhap.LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí";
                banNhap.HinhAnhKhoaHoc = hinhAnh;
                banNhap.IdHinhAnhKhoaHoc = idHinhAnh;
                banNhap.TrangThaiPheDuyet = "DangSua";
                banNhap.TrangThai = "DangSua";
                banNhap.IsBanHienTai = false;

                await UpdateAsync(banNhap);
                await SaveAsync();
                await UpdateDanhMuc(banNhap.Id, danhMucMoi);
            }
            else if(banGoc.TrangThaiPheDuyet != "DangSua" || banNhap.TrangThaiPheDuyet != "DangSua")
            {
                //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TieuDe);
                //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.MoTa);
                //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.CapDo);

                // ── Chưa có bản nháp → tạo mới ───────────────────
                var banNhapMoi = new KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdBanGhiTruoc = banGoc.Id,
                    IsBanHienTai = false,
                    TieuDe = request.TieuDe.Trim(),
                    MoTa = request.MoTa?.Trim(),
                    Gia = request.Gia,
                    GiaGoc = request.GiaGoc,
                    CapDo = request.CapDo,
                    LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí",
                    HinhAnhKhoaHoc = hinhAnh,
                    IdHinhAnhKhoaHoc = idHinhAnh,
                    TrangThai = "DangSua",
                    TrangThaiPheDuyet = "DangSua",
                };

                await CreateAsync(banNhapMoi);
                await SaveAsync();

                // Copy danh mục từ bản gốc nếu request không truyền danh mục
                var danhMucApDung = danhMucMoi.Any()
                    ? danhMucMoi
                    : await _danhMuc_KhoaHocService.GetQueryable()
                        .Where(x => x.IdKhoaHoc == banGoc.Id && !x.IsDeleted)
                        .Select(x => x.IdDanhMuc)
                        .ToListAsync();

                var danhMucNhap = danhMucApDung.Select(id => new DanhMuc_KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = banNhapMoi.Id,
                    IdDanhMuc = id
                }).ToList();

                if (danhMucNhap.Any())
                {
                    await _danhMuc_KhoaHocService.CreateRange(danhMucNhap);
                    await _danhMuc_KhoaHocService.SaveAsync();
                }

                banNhap = banNhapMoi;
            }


            await SaveAsync();

            try
            {
                if (banGoc != null) await _elasticsearchService.IndexCourseAsync(banGoc.Id);
                if (banNhap != null) await _elasticsearchService.IndexCourseAsync(banNhap.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch Indexing failed during update: {ex.Message}");
            }

            return _mapper.Map<KhoaHoc, KhoaHocDto>(banNhap);
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

            if (KhoaHocRoot.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            if (KhoaHocRoot.TrangThaiPheDuyet == "DangSua")
                throw new Exception("Khóa học khoog hợp lệ để tạo bản nháp");

            if (KhoaHocRoot.TrangThaiPheDuyet == "ChoDuyet")
                throw new Exception("Khóa học đang chờ duyệt, không thể chỉnh sửa!");

            if (KhoaHocRoot.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception(
                    $"❌ KHÓA HỌC ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
                    $"Hệ thống Eduverses đang kiểm duyệt khóa học này.\n" +
                    $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
                    $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
                );

            using var transaction = await _eduverseContext.Database.BeginTransactionAsync();
            try
            {
                KhoaHoc khoaHocDraftEntity;

                // ── Bước 1: Xử lý bản KHÓA HỌC — LUÔN tạo bản ghi mới ──────────
                if (KhoaHocRoot.TrangThaiPheDuyet == "DaDuyet")
                {
                    // Bản gốc đang sống (đã DaDuyet) → tạo NHÁP mới, trỏ về bản gốc đang sống
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
                    // Bản gốc bị từ chối → tạo bản GỐC MỚI thay thế,
                    // Id của bản bị từ chối được chuyển vào IdBanGhiTruoc của bản mới (giữ lịch sử)
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
                        IdBanGhiTruoc = null
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
                        // Phần gốc đang sống → LUÔN tạo nháp mới, trỏ về Phần gốc đang sống
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



                await transaction.CommitAsync();


                //Xóa sau khi tạo bản mới
                if (KhoaHocRoot.TrangThaiPheDuyet == "TuChoi")
                {
                    
                }else if (KhoaHocRoot.TrangThaiPheDuyet == "DaDuyet")
                {
                    KhoaHocRoot.TrangThai = "NgungHoatDong";
                }
                await UpdateAsync(KhoaHocRoot);
                await DeleteAsync(KhoaHocRoot);
                await SaveAsync();

                return new KhoaHocDraftResultDto
                {
                    KhoaHoc = khoaHocResult,
                    DanhSachPhan = danhSachPhanDraft
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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
                        IdBanGhiTruoc = bktRoot.IdBanGhiTruoc
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


        public async Task<bool> DeleteKhoaHoc(Guid idKhoaHoc)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);
            var khoaHoc = await GetByIdAsync(idKhoaHoc);
            if (khoaHoc.CreatedId != nguoiTao)
                throw new Exception("Ban kh có quyền hạn để xóa khóa học này!");

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khoa học");

            if (khoaHoc.TrangThai == "ChoDuyet")
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

            return true;
        }

        // danh sách khóa học đã được duyệt dùng để áp dụng khuyến mãi
        public async Task<List<KhoaHocMiniDto>> GetApprovedListForSelect()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");

            return await GetAll()
                .Where(x => x.CreatedId == userId
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true)
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new KhoaHocMiniDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc
                })
                .ToListAsync();
        }
        public async Task<List<string>> GetSearchSuggestions(string query)
        {
            return await _elasticsearchService.GetSearchSuggestionsAsync(query);
        }

        public async Task SyncElasticsearch()
        {
            await _elasticsearchService.BulkIndexAllCoursesAsync();
        }
    }
}
