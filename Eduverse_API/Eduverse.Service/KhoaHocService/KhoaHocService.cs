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
            return await GetListFromDatabaseAsync(search);
        }
        #endregion

        #region SearchKhoaHocWithElasticsearch
        public async Task<PagedList<KhoaHocDto>> SearchWithElasticsearch(KhoaHocSearch search)
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
            // The public catalog intentionally shows every course row stored in the database,
            // including drafts, inactive courses, old versions, and soft-deleted records.
            var query = GetAll();

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

            if (search.DanhMucId.HasValue)
            {
                var danhMucId = search.DanhMucId.Value;
                var courseIds = _eduverseContext.danhMuc_KhoaHocs
                    .Where(x => x.IdDanhMuc == danhMucId && !x.IsDeleted)
                    .Select(x => x.IdKhoaHoc);
                query = query.Where(x => courseIds.Contains(x.Id));
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
                join kh in GetQueryable()
                   on dk.IdKhoaHoc equals kh.Id
                where dk.IdNguoiDangKi == userId
                && (kh.IsDeleted == false)
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
                from ph in _phanRepository.GetAll().AsNoTracking()
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
                    DanhSachPhanHoc = new List<PhanHocDto>()
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            var soHocVien = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .CountAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted);
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

        #region GetLearning (KHÔNG SWAP)
            public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
            {
                Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiDangKi);

                if (idDangKy == Guid.Empty)
                    throw new ArgumentException("Id đăng ký không hợp lệ");

                var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.Id == idDangKy && !x.IsDeleted && x.  IdNguoiDangKi == nguoiDangKi)
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

                    if (phanUpdate.Any())
                    {
                        foreach(var ph in phanUpdate)
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

            var query = GetQueryable()
                .Where(x => x.CreatedId == userId
                         && x.IsBanHienTai == true
                         && !x.IsDeleted);

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

            // 3. Cuối cùng: Số lượng học viên (nếu yêu cầu)
            if (search.SapXepHocVienNhieuNhat == true)
            {
                var dangKyQuery = _dangKyKhoaHocRepository.GetQueryable();
                if (hasSort)
                {
                    orderedQuery = orderedQuery.ThenByDescending(x => dangKyQuery.Count(d => d.IdKhoaHoc == x.Id));
                }
                else
                {
                    orderedQuery = query.OrderByDescending(x => dangKyQuery.Count(d => d.IdKhoaHoc == x.Id));
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
                CreatedId = x.CreatedId,
                CreatedDate = x.CreatedDate,
                IsBanHienTai = x.IsBanHienTai,
                IdBanGhiTruoc = x.IdBanGhiTruoc,
            });

            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }


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

            if (banGoc.TrangThaiPheDuyet == "DaDuyet")
                throw new Exception("Khóa học đang ở chế độ Đã Duyệt không thể sửa");

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

            var isFree = request.GiaGoc <= 0;

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
            }
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
                        IdBanGhiTruoc = KhoaHocRoot.IdBanGhiTruoc.Value
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



                await transaction.CommitAsync();


                //Xóa sau khi tạo bản mới
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
