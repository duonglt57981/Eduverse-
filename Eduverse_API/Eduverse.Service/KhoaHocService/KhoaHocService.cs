using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TienDoHocTapService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;



namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly IBaiGiangService _baiGiangService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;
        private readonly ITienDoHocTapService _tienDoHocTapService;
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IBaiKiemTraRepository _baiKiemTraRepository ;
        private readonly ILanLamBaiKiemTraService _lanLamBaiKiemTraService;

        public KhoaHocService(
            IMemoryCache memoryCache,
            IKhoaHocRepository khoaHocRepository,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IDangKyKhoaHocService dangKyKhoaHocService,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IHttpContextAccessor httpContextAccessor,
            ICloudinaryService cloudinaryService,
            IDanhMucRepository danhMucRepository,
            IMapper mapper,
            ITienDoHocTapService tienDoHocTapService,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            IBaiKiemTraRepository baiKiemTraRepository,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService

        ) : base(khoaHocRepository)
        {
            _memoryCache = memoryCache;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _cloudinaryService = cloudinaryService;
            _danhMucRepository = danhMucRepository;
            _tienDoHocTapService = tienDoHocTapService;
            _phanRepository = phanRepository;
            _baiGiangRepository = baiGiangRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _baiKiemTraRepository = baiKiemTraRepository;
            _lanLamBaiKiemTraService = lanLamBaiKiemTraService;
        }


        #region GetListKhoaHoc
        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search)
        {
            search ??= new KhoaHocSearch();

            IQueryable<KhoaHoc> query = GetQueryable()
                .Where(x => x.TrangThai == "HoatDong" && x.TrangThaiPheDuyet == "DaDuyet");

            // Keyword
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();

                query = query.Where(x =>
                    x.TieuDe.Contains(keyword) ||
                    x.LoaiKhoaHoc.Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                var tieuDe = search.TieuDe.Trim();

                query = query.Where(x =>
                    x.TieuDe.Contains(tieuDe));
            }

            if (!string.IsNullOrWhiteSpace(search.CapDo))
            {
                query = query.Where(x =>
                    x.CapDo == search.CapDo);
            }

            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
            {
                query = query.Where(x =>
                    x.LoaiKhoaHoc == search.LoaiKhoaHoc);
            }

            if (search.GiaFrom.HasValue)
            {
                query = query.Where(x =>
                    x.Gia >= search.GiaFrom.Value);
            }

            if (search.GiaTo.HasValue)
            {
                query = query.Where(x =>
                    x.Gia <= search.GiaTo.Value);
            }

            if (search.TongBaiGiangFrom.HasValue)
            {
                query = query.Where(x =>
                    x.TongBaiGiang >= search.TongBaiGiangFrom.Value);
            }

            if (search.TongBaiGiangTo.HasValue)
            {
                query = query.Where(x =>
                    x.TongBaiGiang <= search.TongBaiGiangTo.Value);
            }

            if (search.IsFree == true)
            {
                query = query.Where(x => x.Gia == 0);
            }

            // Validate
            if (search.GiaFrom > search.GiaTo)
            {
                throw new Exception("Giá bắt đầu không được lớn hơn giá kết thúc");
            }

            if (search.TongBaiGiangFrom > search.TongBaiGiangTo)
            {
                throw new Exception("Số bài giảng bắt đầu không được lớn hơn số bài giảng kết thúc");
            }

            // Sort
            query = search.SortPrice?.ToLower() switch
            {
                "asc" => query.OrderBy(x => x.Gia),
                "desc" => query.OrderByDescending(x => x.Gia),
                _ => query.OrderByDescending(x => x.NgayTao)
            };

            var dtoQuery = query.Select(kh => new KhoaHocDto
            {
                Id = kh.Id,
                TieuDe = kh.TieuDe,
                MoTa = kh.MoTa,
                Gia = kh.Gia,
                GiaGoc = kh.GiaGoc,
                LoaiKhoaHoc = kh.LoaiKhoaHoc,
                HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                URLViewPreviewKhoaHoc = kh.URLViewPreviewKhoaHoc,
                CapDo = kh.CapDo,
                TongThoiLuong = kh.TongThoiLuong,
                TongBaiGiang = kh.TongBaiGiang,
                SoLuongHocVien = kh.SoLuongHocVien,
                NgayTao = kh.NgayTao,

                DaDangKy = false
            });

            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }
        #endregion


        #region GetListKhoaHocByUser
        public async Task<PagedList<KhoaHocDto>> GetListByUser(KhoaHocSearch search)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không hợp lệ");

            search ??= new KhoaHocSearch();

            IQueryable<KhoaHoc> query = GetQueryable()
                 .AsNoTracking()
                 .Where(kh => (kh.TrangThai == "HoatDong")
                            && kh.TrangThaiPheDuyet == "DaDuyet"
                            && !_dangKyKhoaHocRepository
                                .GetQueryable()
                                .Any(dk => dk.IdNguoiDangKi == userId&& dk.IdKhoaHoc == kh.Id));

            // Keyword
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();

                query = query.Where(x =>
                    x.TieuDe.Contains(keyword) ||
                    x.LoaiKhoaHoc.Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                var tieuDe = search.TieuDe.Trim();

                query = query.Where(x =>
                    x.TieuDe.Contains(tieuDe));
            }

            if (!string.IsNullOrWhiteSpace(search.CapDo))
            {
                query = query.Where(x =>
                    x.CapDo == search.CapDo);
            }

            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
            {
                query = query.Where(x =>
                    x.LoaiKhoaHoc == search.LoaiKhoaHoc);
            }

            if (search.GiaFrom.HasValue)
            {
                query = query.Where(x =>
                    x.Gia >= search.GiaFrom.Value);
            }

            if (search.GiaTo.HasValue)
            {
                query = query.Where(x =>
                    x.Gia <= search.GiaTo.Value);
            }

            if (search.TongBaiGiangFrom.HasValue)
            {
                query = query.Where(x =>
                    x.TongBaiGiang >= search.TongBaiGiangFrom.Value);
            }
            
            if (search.TongBaiGiangTo.HasValue)
            {
                query = query.Where(x =>
                    x.TongBaiGiang <= search.TongBaiGiangTo.Value);
            }

            if (search.IsFree == true)
            {
                query = query.Where(x => x.Gia == 0);
            }

            // Validate
            if (search.GiaFrom > search.GiaTo)
            {
                throw new Exception("Giá bắt đầu không được lớn hơn giá kết thúc");
            }

            if (search.TongBaiGiangFrom > search.TongBaiGiangTo)
            {
                throw new Exception("Số bài giảng bắt đầu không được lớn hơn số bài giảng kết thúc");
            }

            // Sort
            query = search.SortPrice?.ToLower() switch
            {
                "asc" => query.OrderBy(x => x.Gia),
                "desc" => query.OrderByDescending(x => x.Gia),
                _ => query.OrderByDescending(x => x.NgayTao)
            };

            var dtoQuery = query.Select(kh => new KhoaHocDto
            {
                Id = kh.Id,
                TieuDe = kh.TieuDe,
                MoTa = kh.MoTa,
                Gia = kh.Gia,
                GiaGoc = kh.GiaGoc,
                LoaiKhoaHoc = kh.LoaiKhoaHoc,
                HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                URLViewPreviewKhoaHoc = kh.URLViewPreviewKhoaHoc,
                CapDo = kh.CapDo,
                TongThoiLuong = kh.TongThoiLuong,
                TongBaiGiang = kh.TongBaiGiang,
                SoLuongHocVien = kh.SoLuongHocVien,
                NgayTao = kh.NgayTao,

                DaDangKy = false
            });

            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }
        #endregion



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
                && (kh.TrangThaiPheDuyet == "DaDuyet" || kh.TrangThaiPheDuyet == "ChoDuyetS")
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

            var khoaHocIds = pageData
                .Select(x => x.Id)
                .Distinct()
                .ToList();

            var dangKyIds = pageData
                .Select(x => x.DangKyId)
                .Distinct()
                .ToList();

            var tongBaiGiangDict = await (
                from ph in _phanRepository.GetAll().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                group bg by ph.IdKhoaHoc.Value into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    TongBaiGiang = g.Count()
                })
                .ToDictionaryAsync(
                    x => x.IdKhoaHoc,
                    x => x.TongBaiGiang);

            var tienDoDict = await (
                from td in _tienDoHocTapService.GetQueryable().AsNoTracking()
                where td.IdDangKi.HasValue&& dangKyIds.Contains(td.IdDangKi.Value)&& td.TrangThai == "HoanThanh"
                group td by td.IdDangKi.Value into g
                select new
                {
                    IdDangKy = g.Key,
                    SoBaiGiangHoanThanh = g
                        .Select(x => x.IdBaiGiang)
                        .Distinct()
                        .Count()
                }).ToDictionaryAsync(x => x.IdDangKy,x => x.SoBaiGiangHoanThanh);

            var tongThoiLuongDict = await (
                from ph in _phanRepository.GetAll().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !bg.IsDeleted
                      && bg.TrangThai != "ChoDuyet"
                group bg by ph.IdKhoaHoc.Value into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    TongThoiLuong = g.Sum(x => x.ThoiLuong ?? 0)
                })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.TongThoiLuong);

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
                        PhanTramHoanThanh = tongBaiGiang > 0? Math.Round((double)soBaiDaHoc * 100 / tongBaiGiang) : 0
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



        #region GetLearning with Cache & Realtime

        #region Cache Keys
        private static class CacheKeys
        {
            public static string SoHocVien(Guid? khoaHocId) => $"SoHocVien_{khoaHocId}";
            public static string KhoaHoc(Guid? khoaHocId) => $"KhoaHoc_{khoaHocId}";
            public static string PhanHocs(Guid? khoaHocId) => $"PhanHocs_{khoaHocId}";
            public static string BaiGiangs(List<Guid> phanIds) => $"BaiGiangs_{string.Join("_", phanIds.OrderBy(x => x))}";
            public static string BaiKiemTra(List<Guid> phanIds) => $"BaiKiemTra_{string.Join("_", phanIds.OrderBy(x => x))}";
            public static string TaiLieus(List<Guid> baiGiangIds) => $"TaiLieus_{string.Join("_", baiGiangIds.OrderBy(x => x))}";
        }
        #endregion

        #region TinhPhanTramHoanThanh (Real-time - NO CACHE)
        /// <summary>
        /// Tính % hoàn thành khóa học cho 1 đăng ký, dựa trên:
        /// - Bài giảng: đã hoàn thành (TienDoHocTap.TrangThai == "HoanThanh")
        /// - Phần: TẤT CẢ quiz trong phần phải có ÍT NHẤT 1 lần làm đạt DiemDat (không quan tâm cũ/mới)
        /// - Phần không có quiz → tự động tính là hoàn thành
        /// % = (SoBaiGiangHoanThanh + SoPhanHoanThanh) / (TongBaiGiang + TongPhan) * 100
        /// 
        /// Hàm này không cache, tính trực tiếp mỗi lần gọi để đảm bảo realtime.
        /// </summary>
        public async Task<double> TinhPhanTramHoanThanh(Guid? idDangKy)
        {
            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .Select(x => new { x.IdKhoaHoc, x.IdNguoiDangKi })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var idKhoaHoc = dangKy.IdKhoaHoc;
            var userId = dangKy.IdNguoiDangKi;

            // Cache cho dữ liệu tĩnh (phần học, bài giảng, bài kiểm tra)
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

            // ── Bài giảng (cache) ─────────────────────────────────────────
            var baiGiangIds = await GetOrCreateCacheAsync(
                CacheKeys.BaiGiangs(phanIds),
                async () => await _baiGiangService.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan)
                             && !x.IsDeleted
                             && x.TrangThai != "ChoDuyet")
                    .Select(x => x.Id)
                    .ToListAsync(),
                TimeSpan.FromMinutes(30));

            var tongBaiGiang = baiGiangIds.Count;

            // REAL-TIME: Không cache - query trực tiếp tiến độ học tập
            var hoanThanhBaiGiang = await _tienDoHocTapService.GetQueryable()
                .AsNoTracking()
                .CountAsync(x => x.IdDangKi == idDangKy
                               && x.IdBaiGiang.HasValue
                               && baiGiangIds.Contains(x.IdBaiGiang.Value)
                               && x.TrangThai == "HoanThanh"
                               && !x.IsDeleted);

            // ── Bài kiểm tra (cache) ─────────────────────────────────────
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

            var tongPhan = phanIds.Count;
            int tongPhanHoanThanhQuiz;

            if (!baiKiemTraIds.Any())
            {
                tongPhanHoanThanhQuiz = tongPhan;
            }
            else
            {
                // REAL-TIME: Không cache - query trực tiếp kết quả làm bài
                var lanLamList = await _lanLamBaiKiemTraService.GetQueryable()
                    .AsNoTracking()
                    .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
                             && x.IdNguoiDung == userId
                             && x.ThoiGianNop != null
                             && !x.IsDeleted)
                    .Select(x => new { x.IdBaiKiemTra, x.TongDiemLanKiemTra })
                    .ToListAsync();

                var diemDatMap = baiKiemTraTheoPhans
                    .ToDictionary(x => x.Id, x => x.DiemDat ?? 0);

                var quizDatIds = lanLamList
                    .Where(x => x.TongDiemLanKiemTra >= diemDatMap.GetValueOrDefault(x.IdBaiKiemTra!.Value, 0))
                    .Select(x => x.IdBaiKiemTra!.Value)
                    .ToHashSet();

                var baiKiemTraByPhan = baiKiemTraTheoPhans
                    .GroupBy(x => x.IdPhan)
                    .ToDictionary(x => x.Key, x => x.Select(q => q.Id).ToList());

                var soPhanHoanThanhQuiz = baiKiemTraByPhan
                    .Count(phan => phan.Value.All(quizId => quizDatIds.Contains(quizId)));

                var phanKhongCoQuiz = phanIds
                    .Count(pId => !baiKiemTraByPhan.ContainsKey(pId));

                tongPhanHoanThanhQuiz = soPhanHoanThanhQuiz + phanKhongCoQuiz;
            }

            // ── Tính % hoàn thành ─────────────────────────────────────────
            var tongItem = tongBaiGiang + tongPhan;
            var hoanThanhItem = hoanThanhBaiGiang + tongPhanHoanThanhQuiz;

            var phanTram = tongItem == 0? 0 : Math.Round((double)hoanThanhItem / tongItem * 100, 2);

            // ── AUTO-SWAP: 100% → kích hoạt bài giảng mới ────────────────
            if (phanTram >= 100)
            {
                await SwapPendingBaiGiang(phanIds);
                // Sau khi swap, xóa cache liên quan để lần sau lấy dữ liệu mới
                InvalidateCourseCache(idKhoaHoc.Value, phanIds);
            }

            return phanTram;
        }
        #endregion

        #region GetLearning (Cache dữ liệu tĩnh, realtime dữ liệu động)
        public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
        {
            if (idDangKy == Guid.Empty)
                throw new ArgumentException("Id đăng ký không hợp lệ");

            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .Select(x => new { x.Id, x.IdKhoaHoc, x.IdNguoiDangKi, x.CreatedDate })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var idKhoaHoc = dangKy.IdKhoaHoc;
            var userId = dangKy.IdNguoiDangKi;

            // 🚀 CACHE 1: Số học viên (ít thay đổi - cache 10 phút)
            var soHocVien = await GetOrCreateCacheAsync(
                CacheKeys.SoHocVien(idKhoaHoc),
                () => _dangKyKhoaHocRepository.GetQueryable()
                    .AsNoTracking()
                    .CountAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted),
                TimeSpan.FromMinutes(10));

            // 🚀 CACHE 2: Thông tin khóa học (ít thay đổi - cache 30 phút)
            var khoaHoc = await GetOrCreateCacheAsync(
                CacheKeys.KhoaHoc(idKhoaHoc),
                async () =>
                {
                    var result = await GetAll()
                        .AsNoTracking()
                        .Where(x => x.Id == idKhoaHoc 
                        && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "ChoDuyetS") 
                        && (x.TrangThai == "HoatDong" || x.TrangThai == "NgungHoatDong"))
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
                    return result;
                },
                TimeSpan.FromMinutes(30));

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            // 🚀 CACHE 3: Danh sách phần học (ít thay đổi - cache 30 phút)
            var phanHocs = await GetOrCreateCacheAsync(
                CacheKeys.PhanHocs(idKhoaHoc),
                async () =>
                {
                    var list = await _phanRepository.GetAll()
                        .AsNoTracking()
                        .Where(x => x.IdKhoaHoc == idKhoaHoc 
                                        && (!x.IsDeleted||(x.IsDeleted && x.TrangThai == "HoatDong"&& x.DeletedDate > dangKy.CreatedDate)) && x.TrangThai != "ChoDuyet")
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

                    // Reorder trên client sau khi đã ToListAsync
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

            // 🚀 CACHE 4: Bài giảng (ít thay đổi - cache 30 phút)
            var baiGiangs = await GetOrCreateCacheAsync(
                CacheKeys.BaiGiangs(phanIds),
                () => _baiGiangService.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan)
                             && !x.IsDeleted
                             && x.TrangThai != "ChoDuyet")
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

            var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();

            // 🚀 CACHE 5: Tài liệu (ít thay đổi - cache 60 phút)
            var taiLieuList = await GetOrCreateCacheAsync(
                CacheKeys.TaiLieus(baiGiangIds),
                () => _taiLieuService.GetQueryable()
                    .AsNoTracking()
                    .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
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

            // ⚡ REAL-TIME: Không cache - lấy tiến độ học tập trực tiếp
            var tienDoDict = await _tienDoHocTapService.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang.HasValue
                         && baiGiangIds.Contains(x.IdBaiGiang.Value)
                         && !x.IsDeleted)
                .Select(x => new { x.IdBaiGiang, x.ThoiGianXem, x.TrangThai })
                .ToDictionaryAsync(x => x.IdBaiGiang!.Value);

            // ⚡ REAL-TIME: Tính % hoàn thành (real-time)
            var phanTram = await TinhPhanTramHoanThanh(idDangKy);

            var taiLieuLookup = taiLieuList
                .GroupBy(x => x.IdBaiGiang)
                .ToDictionary(x => x.Key, x => x.ToList());

            // ── Gán dữ liệu + thống kê bài giảng ─────────────────────────
            int tongBaiGiang = 0, tongThoiLuong = 0, hoanThanhBaiGiang = 0;

            foreach (var bg in baiGiangs)
            {
                tongBaiGiang++;
                tongThoiLuong += bg.ThoiLuong ?? 0;

                if (tienDoDict.TryGetValue(bg.Id, out var td))
                {
                    bg.DaHoanThanh = td.TrangThai == "HoanThanh";
                    bg.ThoiGianXem = td.ThoiGianXem ?? 0;
                    if (bg.DaHoanThanh) hoanThanhBaiGiang++;
                }

                if (taiLieuLookup.TryGetValue(bg.Id, out var tls))
                    bg.DanhSachTaiLieu = tls;
            }

            // ── Gắn bài giảng vào phần học ───────────────────────────────
            var baiGiangByPhan = baiGiangs
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var phan in phanHocs)
            {
                if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
                    phan.DanhSachBaiGiang = list;
            }

            khoaHoc.TongBaiGiang = tongBaiGiang;
            khoaHoc.TongThoiLuong = tongThoiLuong;
            khoaHoc.SoBaiGiangHoanThanh = hoanThanhBaiGiang;
            khoaHoc.PhanTramHoanThanh = phanTram;

            return khoaHoc;
        }
        #endregion

        #region HoanThanhBaiGiang (Real-time + Invalidate Cache)
        /// <summary>
        /// Gọi khi user xem hết / đánh dấu hoàn thành 1 bài giảng.
        /// Trả về % mới để FE update progress bar ngay, không cần gọi lại GetLearning.
        /// </summary>
        public async Task<double> HoanThanhBaiGiang(Guid? idDangKy,Guid? idBaiGiang,int thoiGianXem)
        {
            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var baiGiang = await _baiGiangService.GetQueryable()
                .Where(x => x.Id == idBaiGiang && !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.ThoiLuong
                })
                .FirstOrDefaultAsync();

            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            // Hoàn thành khi còn <= 20 giây cuối
            bool daHoanThanh =
                baiGiang.ThoiLuong.HasValue &&
                thoiGianXem >= Math.Max(0, baiGiang.ThoiLuong.Value - 20);

            var tienDo = await _tienDoHocTapService.GetQueryable()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang == idBaiGiang
                         && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (tienDo == null)
            {
                tienDo = new TienDoHocTap
                {
                    Id = Guid.NewGuid(),
                    IdDangKi = idDangKy,
                    IdBaiGiang = idBaiGiang,
                    ThoiGianXem = thoiGianXem,
                    TrangThai = daHoanThanh ? "HoanThanh" : "DangHoc"
                };

                await _tienDoHocTapService.CreateAsync(tienDo);
            }
            else
            {
                tienDo.ThoiGianXem = thoiGianXem;

                if (daHoanThanh)
                    tienDo.TrangThai = "HoanThanh";

                await _tienDoHocTapService.UpdateAsync(tienDo);
            }

            await _tienDoHocTapService.SaveAsync();

            return await TinhPhanTramHoanThanh(idDangKy);
        }
        #endregion

        #region NopBaiKiemTra (Real-time + Invalidate Cache)
        /// <summary>
        /// Gọi khi user nộp bài kiểm tra.
        /// Trả về % mới để FE update progress bar ngay, không cần gọi lại GetLearning.
        /// </summary>
        public async Task<NopBaiKiemTraResultDto> NopBaiKiemTra(Guid? idDangKy, Guid? idBaiKiemTra, double tongDiem)
        {
            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var baiKiemTra = await _baiKiemTraRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idBaiKiemTra && !x.IsDeleted)
                .Select(x => new { x.DiemDat })
                .FirstOrDefaultAsync();

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra");

            // Lưu lần làm bài
            var lanLam = new LanLamBaiKiemTra
            {
                Id = Guid.NewGuid(),
                IdBaiKiemTra = idBaiKiemTra,
                IdNguoiDung = dangKy.IdNguoiDangKi,
                TongDiemLanKiemTra = tongDiem,
                ThoiGianNop = DateTime.UtcNow
            };

            await _lanLamBaiKiemTraService.CreateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            var daDat = tongDiem >= (baiKiemTra.DiemDat ?? 0);

            // ⚡ REAL-TIME: Tính lại % (kèm auto-swap nếu đạt 100%)
            var phanTram = await TinhPhanTramHoanThanh(idDangKy);

            return new NopBaiKiemTraResultDto
            {
                DiemSo = tongDiem,
                DaDat = daDat,
                PhanTramHoanThanh = phanTram
            };
        }
        #endregion

        #region Helper Methods
        /// <summary>
        /// Helper method để lấy dữ liệu từ cache hoặc tạo mới nếu chưa có
        /// </summary>
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

        /// <summary>
        /// Xóa cache của khóa học (gọi khi dữ liệu tĩnh thay đổi)
        /// </summary>
        private void InvalidateCourseCache(Guid khoaHocId, List<Guid> phanIds = null)
        {
            _memoryCache.Remove(CacheKeys.SoHocVien(khoaHocId));
            _memoryCache.Remove(CacheKeys.KhoaHoc(khoaHocId));
            _memoryCache.Remove(CacheKeys.PhanHocs(khoaHocId));

            if (phanIds != null && phanIds.Any())
            {
                _memoryCache.Remove(CacheKeys.BaiGiangs(phanIds));
                _memoryCache.Remove(CacheKeys.BaiKiemTra(phanIds));
            }
        }

        /// <summary>
        /// Xóa toàn bộ cache (dùng khi cần refresh toàn bộ)
        /// </summary>
        private void ClearAllCache()
        {
            // Nếu dùng IMemoryCache đơn giản, không có cách clear all
            // Có thể implement bằng ConcurrentDictionary hoặc dùng MemoryCache compact
            if (_memoryCache is MemoryCache memoryCache)
            {
                memoryCache.Compact(1.0); // Xóa toàn bộ
            }
        }
        #endregion

        #region SwapPendingBaiGiang
        private async Task SwapPendingBaiGiang(List<Guid> phanIds)
        {
            var baiGiangCuList = await _baiGiangService.GetQueryable()
                .Where(x => phanIds.Contains(x.IdPhan)
                         && x.IsPendingSwap
                         && x.IdBaiGiangMoi.HasValue
                         && !x.IsDeleted)
                .ToListAsync();

            if (!baiGiangCuList.Any())
                return;

            var idsBaiGiangMoi = baiGiangCuList
                .Select(x => x.IdBaiGiangMoi!.Value)
                .ToList();

            var baiGiangMoiList = await _baiGiangService.GetQueryable()
                .Where(x => idsBaiGiangMoi.Contains(x.Id))
                .ToListAsync();

            var baiGiangMoiDict = baiGiangMoiList.ToDictionary(x => x.Id);

            var idsBaiGiangCu = baiGiangCuList.Select(x => x.Id).ToList();

            var taiLieus = await _taiLieuService.GetQueryable()
                .Where(x => idsBaiGiangCu.Contains(x.IdBaiGiang) && !x.IsDeleted)
                .ToListAsync();

            var taiLieuByBaiGiangCu = taiLieus
                .GroupBy(x => x.IdBaiGiang)
                .ToDictionary(x => x.Key, x => x.ToList());

            // Lấy IdKhoaHoc từ phần học đầu tiên
            Guid khoaHocId = Guid.Empty;
            if (phanIds.Any())
            {
                var firstPhan = await _phanRepository.GetQueryable()
                    .Where(x => x.Id == phanIds.First() && !x.IsDeleted)
                    .Select(x => x.IdKhoaHoc)
                    .FirstOrDefaultAsync();
                khoaHocId = firstPhan.Value;
            }

            foreach (var cu in baiGiangCuList)
            {
                if (!baiGiangMoiDict.TryGetValue(cu.IdBaiGiangMoi!.Value, out var moi))
                    continue;

                cu.IsDeleted = true;
                cu.IsPendingSwap = false;
                cu.IdBaiGiangMoi = null;

                moi.TrangThai = "HoatDong";
                moi.ThuTuSapXep = cu.ThuTuSapXep;
                moi.LaBaiGiangFree = cu.LaBaiGiangFree;

                if (taiLieuByBaiGiangCu.TryGetValue(cu.Id, out var dsTaiLieu))
                {
                    foreach (var tl in dsTaiLieu)
                        tl.IdBaiGiang = moi.Id;
                }

                await _baiGiangService.UpdateAsync(cu);
                await _baiGiangService.UpdateAsync(moi);
            }

            await _taiLieuService.SaveAsync();
            await _baiGiangService.SaveAsync();

            // Xóa cache sau khi swap để lần sau lấy dữ liệu mới
            if (khoaHocId != Guid.Empty)
            {
                InvalidateCourseCache(khoaHocId, phanIds);
            }
        }
        #endregion

        #endregion



        #region CreateKhoaHoc
        public async Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên khóa học không được để trống");

            if (request.DanhSachDanhMuc == null || !request.DanhSachDanhMuc.Any())
                throw new Exception("Vui lòng chọn danh mục");

            if (request.Gia < 0)
                throw new Exception("Giá không hợp lệ");

            if (request.GiaGoc < request.Gia)
                throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

            //if (request.Img == null)
            //    throw new Exception("Vui lòng chọn ảnh cho khóa học");    

            var danhMucIds = request.DanhSachDanhMuc.Distinct().ToList();


            var invalidIds = danhMucIds
                .Except(await _danhMucRepository.GetQueryable()
                    .Where(x => danhMucIds.Contains(x.Id))
                    .Select(x => x.Id)
                    .ToListAsync())
                .ToList();

            if (invalidIds.Any())
                throw new Exception($"Danh mục không tồn tại: {string.Join(",", invalidIds)}");

            var upLoadResult = await _cloudinaryService.UploadImageAsync(request.Img);

            var isFree = request.Gia <= 0;

            var khoaHoc = new KhoaHoc
            {
                IsBanHienTai = true,
                TieuDe = request.TieuDe.Trim(),
                MoTa = request.MoTa.Trim(),
                GiaGoc = request.GiaGoc,
                Gia = request.Gia,
                CapDo = request.CapDo,
                LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí",
                HinhAnhKhoaHoc = upLoadResult.UrlImg.Trim(),
                IdHinhAnhKhoaHoc = upLoadResult.PublicId,
                CreatedDate = DateTime.UtcNow,
                TrangThai = "Nhap",
                TrangThaiPheDuyet = "ChoDuyet"

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
            return KhoaHocDto;
        }
        #endregion



        #region  UpdateKhoaHoc
        public async Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request)
        {
            var entity = await GetByIdAsync(request.IdKhoaHoc);
            if (entity == null || entity.IsDeleted)
                throw new Exception("Không tìm thấy khóa học");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên khóa học không được để trống");

            if (request.Gia < 0)
                throw new Exception("Giá không hợp lệ");

            if (request.GiaGoc < request.Gia)
                throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

            var danhMucMoi = (request.DanhSachDanhMuc ?? new List<Guid>())
                .Distinct()
                .ToList();

            if (danhMucMoi.Any())
            {
                var danhMucTonTai = await _danhMucRepository.GetQueryable()
                    .Where(x => danhMucMoi.Contains(x.Id) && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                var danhMucKhongTonTai = danhMucMoi
                    .Except(danhMucTonTai)
                    .ToList();

                if (danhMucKhongTonTai.Any())
                    throw new Exception($"Danh mục không tồn tại: {string.Join(", ", danhMucKhongTonTai)}");
            }

            if (request.Img != null)
            {
                var upload = await _cloudinaryService.UpdateImageAsync(entity.IdHinhAnhKhoaHoc, request.Img);

                if (upload == null)
                    throw new Exception("Upload hình ảnh thất bại");

                entity.HinhAnhKhoaHoc = upload.UrlImg;
                entity.IdHinhAnhKhoaHoc = upload.PublicId;
            }
            entity.Id = Guid.NewGuid();
            entity.IdBanGhiTruoc = request.IdKhoaHoc;
            entity.TieuDe = request.TieuDe;
            entity.MoTa = request.MoTa;
            entity.Gia = request.Gia;
            entity.GiaGoc = request.GiaGoc;
            entity.CapDo = request.CapDo;
            entity.LoaiKhoaHoc = request.Gia <= 0 ? "Khóa học miễn phí" : "Khóa học trả phí";
            entity.UpdatedDate = DateTime.UtcNow;
            entity.TrangThai = "Nhap";
            entity.TrangThaiPheDuyet = "ChoDuyet";

            await CreateAsync(entity);

            var danhMucCu = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == entity.Id && !x.IsDeleted)
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
                    IdKhoaHoc = entity.Id,
                    IdDanhMuc = id,
                })
                .ToList();

            if (canThem.Any())
            {
                await _danhMuc_KhoaHocService.CreateRange(canThem);
                await _danhMuc_KhoaHocService.SaveAsync();
            }
                

            await SaveAsync();
            return _mapper.Map<KhoaHoc, KhoaHocDto>(entity);
        }
        #endregion



        public async Task<bool> DeleteKhoaHoc(Guid id)
        {
            var khoaHoc = await GetByIdAsync(id);
            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khoa học");

            khoaHoc.TrangThai = "NgungHoatDong";

            await DeleteAsync(khoaHoc);
            await SaveAsync();
            return true;
        }
    }
}
