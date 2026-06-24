using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.TienDoHocTapRepository;
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
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TienDoHocTapService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;



namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
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
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService
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
                from td in _tienDoHocTapRepository.GetQueryable().AsNoTracking()
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
        /// Tính % hoàn thành. Bài giảng GỐC (IsBanHienTai=true) là CHUẨN duy nhất
        /// để tính tổng số (tongBaiGiang) và đếm hoàn thành (hoanThanhBaiGiang).
        /// Việc tạo/duyệt bản nháp (update) KHÔNG được phép làm thay đổi 2 số này,
        /// vì draft không nằm trong baiGiangIds (luôn lọc IsBanHienTai=true).
        ///
        /// Lưu ý: sau khi user hoàn thành 100%, TienDoHocTap.IdBaiGiang của RIÊNG
        /// họ có thể đã bị đổi sang id bản nháp (SwapPendingBaiGiang). Khi đếm lại
        /// hoanThanhBaiGiang, phải quy đổi id draft -> id gốc (qua IdBanGhiTruoc)
        /// để không bị đếm thiếu / tính sai % do swap.
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

            // ── Bài giảng GỐC (cache) - CHUẨN duy nhất, draft KHÔNG được lọt vào đây ──
            var baiGiangIds = await GetOrCreateCacheAsync(
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

            var tongBaiGiang = baiGiangIds.Count;

            // REAL-TIME: lấy hết tiến độ HoanThanh của registration này
            var tienDoHoanThanhIds = await _tienDoHocTapRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang.HasValue
                         && x.TrangThai == "HoanThanh"
                         && !x.IsDeleted)
                .Select(x => x.IdBaiGiang!.Value)
                .ToListAsync();

            // Tách 2 nhóm: id đã khớp thẳng với bản gốc, và id "lạ" (nghi là draft do đã swap)
            var idsKhopGoc = tienDoHoanThanhIds.Where(id => baiGiangIds.Contains(id)).ToHashSet();
            var idsLa = tienDoHoanThanhIds.Where(id => !baiGiangIds.Contains(id)).Distinct().ToList();

            var idsGocQuyDoiTuDraft = new HashSet<Guid>();
            if (idsLa.Any())
            {
                var draftMap = await _baiGiangRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => idsLa.Contains(x.Id) && x.IdBanGhiTruoc.HasValue)
                    .Select(x => new { x.Id, x.IdBanGhiTruoc })
                    .ToListAsync();

                foreach (var d in draftMap)
                    if (baiGiangIds.Contains(d.IdBanGhiTruoc!.Value))
                        idsGocQuyDoiTuDraft.Add(d.IdBanGhiTruoc!.Value);
            }

            // Số bài giảng đã hoàn thành
            var hoanThanhBaiGiang = idsKhopGoc.Union(idsGocQuyDoiTuDraft).Count();

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

            // ⭐🔥 QUAN TRỌNG: Nếu KHÔNG có quiz nào → chỉ tính % dựa trên bài giảng
            if (!baiKiemTraIds.Any())
            {
                // Chỉ tính dựa trên bài giảng
                var phanTrambg = tongBaiGiang == 0 ? 0 : Math.Round((double)hoanThanhBaiGiang / tongBaiGiang * 100, 2);

                // Đạt 100% → gắn id bản nháp mới nhất
                if (phanTrambg >= 100)
                {
                    await SwapPendingBaiGiang(idDangKy.Value, phanIds);
                }

                return phanTrambg;
            }

            // ── CÓ QUIZ: tính cả bài giảng + quiz ──

            // Lấy lần làm quiz hoàn thành cũ nhất
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

            // Tính số phần hoàn thành (có quiz)
            var baiKiemTraByPhan = baiKiemTraTheoPhans
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.Select(q => q.Id).ToList());

            var soPhanHoanThanhQuiz = baiKiemTraByPhan
                .Count(phan => phan.Value.All(quizId => quizDatIds.Contains(quizId)));

            // Phần không có quiz → KHÔNG tính vào tiến độ
            // Chỉ tính những phần CÓ QUIZ đã hoàn thành
            var tongPhanHoanThanhQuiz = soPhanHoanThanhQuiz;

            // ── Tính % hoàn thành (chỉ tính những phần có quiz) ──
            var tongPhanCoQuiz = baiKiemTraByPhan.Count;
            var tongItem = tongBaiGiang + tongPhanCoQuiz;  // ⭐ Chỉ tính phần có quiz
            var hoanThanhItem = hoanThanhBaiGiang + tongPhanHoanThanhQuiz;

            var phanTram = tongItem == 0 ? 0 : Math.Round((double)hoanThanhItem / tongItem * 100, 2);

            // ── Đạt 100% → gắn id bản nháp mới nhất ──
            if (phanTram >= 100)
            {
                await SwapPendingBaiGiang(idDangKy.Value, phanIds);
                await SwapPendingBaiKiemTra(idDangKy.Value, phanIds);
            }

            return phanTram;
        }
        #endregion

        #region GetLearning (Cache dữ liệu tĩnh, realtime dữ liệu động)
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
            var userId = nguoiDangKi;

            // 🚀 CACHE 1: Số học viên
            var soHocVien = await GetOrCreateCacheAsync(
                CacheKeys.SoHocVien(idKhoaHoc),
                () => _dangKyKhoaHocRepository.GetQueryable()
                    .AsNoTracking()
                    .CountAsync(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted),
                TimeSpan.FromMinutes(10));

            // 🚀 CACHE 2: Thông tin khóa học
            var khoaHoc = await GetOrCreateCacheAsync(
                CacheKeys.KhoaHoc(idKhoaHoc),
                async () =>
                {
                    var result = await GetAll()
                        .AsNoTracking()
                        .Where(x => x.Id == idKhoaHoc
                        && (x.TrangThaiPheDuyet == "DaDuyet")
                        && (x.TrangThai == "HoatDong" || x.TrangThai == "NgungHoatDong")
                        && (x.DeletedDate > dangKy.CreatedDate || x.DeletedDate < dangKy.CreatedDate)
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
                    return result;
                },
                TimeSpan.FromMinutes(30));

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            // 🚀 CACHE 3: Danh sách phần học
            var phanHocs = await GetOrCreateCacheAsync(
                CacheKeys.PhanHocs(idKhoaHoc),
                async () =>
                {
                    var list = await _phanRepository.GetAll()
                        .AsNoTracking()
                        .Where(x => x.IdKhoaHoc == idKhoaHoc
                                        && x.TrangThai == "HoatDong" 
                                        && x.TrangThaiPheDuyet == "DaDuyet"
                                        && (x.DeletedDate > dangKy.CreatedDate || x.DeletedDate < dangKy.CreatedDate)
                                        && x.TrangThai != "BanNhap"
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

            // 🚀 CACHE 4: Bài giảng GỐC (IsBanHienTai=true) - hiển thị mặc định cho mọi người
            var baiGiangs = await GetOrCreateCacheAsync(
                CacheKeys.BaiGiangs(phanIds),
                () => _baiGiangRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => phanIds.Contains(x.IdPhan)
                             && !x.IsDeleted
                             && (x.DeletedDate > dangKy.CreatedDate || x.DeletedDate < dangKy.CreatedDate)
                             && x.TrangThai != "ChoDuyet"
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

            var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();

            // 🚀 CACHE 5: Tài liệu - LUÔN theo id GỐC, không đổi theo draft
            var taiLieuList = await GetOrCreateCacheAsync(
                CacheKeys.TaiLieus(baiGiangIds),
                () => _taiLieuRepository.GetQueryable()
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

            // ⚡ REAL-TIME: tiến độ học tập của user - id có thể là gốc hoặc draft (nếu đã swap)
            var tienDoRaw = await _tienDoHocTapRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang.HasValue
                         && !x.IsDeleted)
                .Select(x => new { x.IdBaiGiang, x.ThoiGianXem, x.TrangThai })
                .ToListAsync();

            // Những id KHÔNG khớp bản gốc -> nghi là draft do đã swap, cần quy đổi để biết tiến độ thuộc bài giảng gốc nào
            var idsLa = tienDoRaw
                .Select(x => x.IdBaiGiang!.Value)
                .Where(id => !baiGiangIds.Contains(id))
                .Distinct()
                .ToList();

            var draftInfoList = idsLa.Any()
    ? await _baiGiangRepository.GetQueryable()
        .AsNoTracking()
        .Where(x => idsLa.Contains(x.Id) && x.IdBanGhiTruoc.HasValue)
        .Select(x => new DraftInfo
        {
            Id = x.Id,
            IdBanGhiTruoc = x.IdBanGhiTruoc,
            TieuDe = x.TieuDe,
            LoaiBaiGiang = x.LoaiBaiGiang,
            IdVideoBaiGiang = x.IdVideoBaiGiang,
            URLBaiGiang = x.URLBaiGiang,
            ThoiLuong = x.ThoiLuong
        })
        .ToListAsync()
    : new List<DraftInfo>();

            var draftById = draftInfoList.ToDictionary(d => (Guid)d.Id, d => d);

            // dict: idGoc -> (ThoiGianXem, TrangThai), đã quy đổi từ id draft về id gốc nếu cần
            var tienDoDict = new Dictionary<Guid, (int ThoiGianXem, string TrangThai)>();
            // dict: idGoc -> nội dung bản nháp tương ứng (chỉ override hiển thị, KHÔNG đổi TaiLieu)
            var noiDungDraftByGoc = new Dictionary<Guid, dynamic>();

            foreach (var t in tienDoRaw)
            {
                var idRaw = t.IdBaiGiang!.Value;

                if (baiGiangIds.Contains(idRaw))
                {
                    // Tiến độ khớp thẳng bản gốc - trường hợp bình thường (chưa swap)
                    tienDoDict[idRaw] = (t.ThoiGianXem ?? 0, t.TrangThai);
                    continue;
                }

                // idRaw là id draft (đã swap) -> quy về id gốc
                if (draftById.TryGetValue(idRaw, out var draft) && baiGiangIds.Contains((Guid)draft.IdBanGhiTruoc!))
                {
                    var idGoc = (Guid)draft.IdBanGhiTruoc!;
                    tienDoDict[idGoc] = (t.ThoiGianXem ?? 0, t.TrangThai);
                    noiDungDraftByGoc[idGoc] = draft;
                }
                // Nếu không map được về gốc nào (dữ liệu rác) -> bỏ qua, không tính
            }

            // ⚡ REAL-TIME: % hoàn thành (luồng tính riêng, không phụ thuộc tienDoDict ở trên)
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
                    bg.ThoiGianXem = td.ThoiGianXem;
                    if (bg.DaHoanThanh) hoanThanhBaiGiang++;
                }

                // Đã hoàn thành VÀ có bản nháp mới hơn -> hiển thị nội dung bản nháp cho RIÊNG user này
                if (bg.DaHoanThanh && noiDungDraftByGoc.TryGetValue(bg.Id, out var draftContent))
                {
                    bg.TieuDe = draftContent.TieuDe;
                    bg.LoaiBaiGiang = draftContent.LoaiBaiGiang;
                    bg.IdVideoBaiGiang = draftContent.IdVideoBaiGiang;
                    bg.URLBaiGiang = draftContent.URLBaiGiang;
                    bg.ThoiLuong = draftContent.ThoiLuong;
                    // TaiLieu giữ nguyên theo bg.Id (id gốc) ở dưới - KHÔNG đổi theo draft
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
        public async Task<double> HoanThanhBaiGiang(Guid? idDangKy, Guid? idBaiGiang, int thoiGianXem)
        {
            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var baiGiang = await _baiGiangRepository.GetQueryable()
                .Where(x => x.Id == idBaiGiang && !x.IsDeleted)
                .Select(x => new { x.Id, x.ThoiLuong })
                .FirstOrDefaultAsync();

            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            bool daHoanThanh =
                baiGiang.ThoiLuong.HasValue &&
                thoiGianXem >= Math.Max(0, baiGiang.ThoiLuong.Value - 20);

            var tienDo = await _tienDoHocTapRepository.GetQueryable()
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

                _tienDoHocTapRepository.Add(tienDo);
            }
            else
            {
                tienDo.ThoiGianXem = thoiGianXem;

                if (daHoanThanh)
                    tienDo.TrangThai = "HoanThanh";

                _tienDoHocTapRepository.Update(tienDo);
            }

            await _tienDoHocTapRepository.SaveAsync();

            return await TinhPhanTramHoanThanh(idDangKy);
        }
        #endregion

        #region NopBaiKiemTra (Real-time + Invalidate Cache)
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
        private class DraftInfo
        {
            public Guid Id { get; set; }
            public Guid? IdBanGhiTruoc { get; set; }
            public string TieuDe { get; set; }
            public string LoaiBaiGiang { get; set; }
            public string IdVideoBaiGiang { get; set; }
            public string URLBaiGiang { get; set; }
            public int? ThoiLuong { get; set; }
        }

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

        private void ClearAllCache()
        {
            if (_memoryCache is MemoryCache memoryCache)
            {
                memoryCache.Compact(1.0);
            }
        }
        #endregion

        #region SwapPendingBaiGiang
        private async Task SwapPendingBaiGiang(Guid idDangKy, List<Guid> phanIds)
        {
            var baiGiangGocList = await _baiGiangRepository.GetQueryable()
                .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted && x.IsBanHienTai == true)
                .Select(x => x.Id)
                .ToListAsync();

            if (!baiGiangGocList.Any())
                return;

            // Lấy tất cả draft đã duyệt
            var draftList = await _baiGiangRepository.GetQueryable()
                .Where(x => x.IdBanGhiTruoc.HasValue
                         && baiGiangGocList.Contains(x.IdBanGhiTruoc.Value)
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == false
                         && !x.IsDeleted)
                .Select(x => new { x.Id, x.IdBanGhiTruoc, x.CreatedDate })
                .ToListAsync();

            if (!draftList.Any())
                return;

            // Map: IdBanGhiTruoc (gốc) -> Id draft mới nhất
            var draftMoiNhatByGoc = draftList
                .GroupBy(x => x.IdBanGhiTruoc!.Value)
                .Select(g => new
                {
                    IdGoc = g.Key,
                    IdDraftMoiNhat = g.OrderByDescending(x => x.CreatedDate).First().Id
                })
                .ToDictionary(x => x.IdGoc, x => x.IdDraftMoiNhat);

            // Map: Id draft -> Id gốc (để truy ngược từ draft cũ về gốc)
            var draftToGocMap = draftList
                .ToDictionary(x => x.Id, x => x.IdBanGhiTruoc!.Value);

            // Lấy tất cả TienDo của user này
            var tienDoList = await _tienDoHocTapRepository.GetQueryable()
                .Where(x => x.IdDangKi == idDangKy
                         && x.IdBaiGiang.HasValue
                         && x.TrangThai == "HoanThanh"
                         && !x.IsDeleted)
                .ToListAsync();

            if (!tienDoList.Any())
                return;

            foreach (var tienDo in tienDoList)
            {
                var idHienTai = tienDo.IdBaiGiang!.Value;
                Guid? idGoc = null;

                // TRƯỜNG HỢP 1: Id hiện tại là ID GỐC
                if (baiGiangGocList.Contains(idHienTai))
                {
                    idGoc = idHienTai;
                }
                // TRƯỜNG HỢP 2: Id hiện tại là DRAFT (đã swap lần trước)
                else if (draftToGocMap.TryGetValue(idHienTai, out var idGocTuDraft))
                {
                    // Kiểm tra xem draft này có thuộc bản gốc nào trong danh sách không
                    if (baiGiangGocList.Contains(idGocTuDraft))
                    {
                        idGoc = idGocTuDraft;
                    }
                }

                // Nếu không tìm thấy ID gốc -> bỏ qua
                if (!idGoc.HasValue)
                    continue;

                // Lấy draft mới nhất của bản gốc này
                if (draftMoiNhatByGoc.TryGetValue(idGoc.Value, out var idDraftMoiNhat))
                {
                    // Nếu đã là draft mới nhất rồi thì bỏ qua
                    if (idHienTai == idDraftMoiNhat)
                        continue;

                    // Swap sang draft mới nhất
                    Console.WriteLine($"SWAP: {idHienTai} (gốc: {idGoc}) -> {idDraftMoiNhat}");
                    tienDo.IdBaiGiang = idDraftMoiNhat;
                    _tienDoHocTapRepository.Update(tienDo);
                }
            }

            await _tienDoHocTapRepository.SaveAsync();
        }
        #endregion

        #region SwapPendingBaiKiemTra
        private async Task SwapPendingBaiKiemTra(Guid idDangKy, List<Guid> phanIds)
        {
            var userId = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .Select(x => x.IdNguoiDangKi)
                .FirstOrDefaultAsync();

            var baiKiemTraGocList = await _baiKiemTraRepository.GetQueryable()
                .Where(x => phanIds.Contains(x.IdPhan.Value) && !x.IsDeleted && x.IsBanHienTai == true)
                .Select(x => x.Id)
                .ToListAsync();

            if (!baiKiemTraGocList.Any())
                return;

            // Lấy tất cả draft đã duyệt
            var draftList = await _baiKiemTraRepository.GetQueryable()
                .Where(x => x.IdBanGhiTruoc.HasValue
                         && baiKiemTraGocList.Contains(x.IdBanGhiTruoc.Value)
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == false
                         && !x.IsDeleted)
                .Select(x => new { x.Id, x.IdBanGhiTruoc, x.CreatedDate })
                .ToListAsync();

            if (!draftList.Any())
                return;

            // Map: IdBanGhiTruoc (gốc) -> Id draft mới nhất
            var draftMoiNhatByGoc = draftList
                .GroupBy(x => x.IdBanGhiTruoc!.Value)
                .Select(g => new
                {
                    IdGoc = g.Key,
                    IdDraftMoiNhat = g.OrderByDescending(x => x.CreatedDate).First().Id
                })
                .ToDictionary(x => x.IdGoc, x => x.IdDraftMoiNhat);

            // Map: Id draft -> Id gốc (để truy ngược từ draft cũ về gốc)
            var draftToGocMap = draftList
                .ToDictionary(x => x.Id, x => x.IdBanGhiTruoc!.Value);

            // Lấy TẤT CẢ lần làm của user (mọi trạng thái) để kiểm tra DangLam
            var lanLamList = await _lanLamBaiKiemTraService.GetQueryable()
                .Where(x => x.IdNguoiDung == userId
                         && x.IdBaiKiemTra.HasValue
                         && !x.IsDeleted)
                .ToListAsync();

            if (!lanLamList.Any())
                return;

            // Quy đổi mọi id (gốc hoặc draft) đang xuất hiện trong lanLamList về id gốc
            Guid? ResolveGoc(Guid idHienTai)
            {
                if (baiKiemTraGocList.Contains(idHienTai))
                    return idHienTai;

                if (draftToGocMap.TryGetValue(idHienTai, out var idGocTuDraft)
                    && baiKiemTraGocList.Contains(idGocTuDraft))
                    return idGocTuDraft;

                return null;
            }

            // Những bản gốc đang có lần làm ở trạng thái DangLam -> KHÔNG được swap
            var idsGocDangBiKhoa = lanLamList
                .Where(x => x.TrangThai == "DangLam")
                .Select(x => ResolveGoc(x.IdBaiKiemTra!.Value))
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .ToHashSet();

            // Chỉ swap các lần làm HoanThanh hoặc chưa có trạng thái (null) - mặc định giống SwapPendingBaiGiang
            var lanLamCanSwap = lanLamList
                .Where(x => x.TrangThai == "HoanThanh" || x.TrangThai == null)
                .ToList();

            if (!lanLamCanSwap.Any())
                return;

            foreach (var lanLam in lanLamCanSwap)
            {
                var idHienTai = lanLam.IdBaiKiemTra!.Value;
                var idGoc = ResolveGoc(idHienTai);

                // Không tìm được id gốc -> bỏ qua
                if (!idGoc.HasValue)
                    continue;

                // Bản gốc này đang bị khóa do còn lần làm DangLam -> KHÔNG swap
                if (idsGocDangBiKhoa.Contains(idGoc.Value))
                    continue;

                // Lấy draft mới nhất của bản gốc này
                if (draftMoiNhatByGoc.TryGetValue(idGoc.Value, out var idDraftMoiNhat))
                {
                    // Nếu đã là draft mới nhất rồi thì bỏ qua
                    if (idHienTai == idDraftMoiNhat)
                        continue;

                    Console.WriteLine($"SWAP QUIZ: {idHienTai} (gốc: {idGoc}) -> {idDraftMoiNhat}");
                    lanLam.IdBaiKiemTra = idDraftMoiNhat;
                    await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
                }
            }

            await _lanLamBaiKiemTraService.SaveAsync();
        }
        #endregion
        #endregion


        public async Task<KhoaHocDto> ChuyenTrangThaiDangSua(Guid  IdKhoaHoc)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            if (IdKhoaHoc == null || IdKhoaHoc == Guid.Empty)
                throw new Exception("Id khóa học không hợp lệ");

            // ── Lấy bản gốc (IsBanHienTai = true) ───────────────
            var banGoc = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == IdKhoaHoc  && !x.IsDeleted);

            if (banGoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (banGoc.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            // ── Tìm bản đang chờ xử lý kiểm duyệt (nháp hoặc gốc) ──
            var banCanXuLy = await GetAll()
                .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id
                                        && !x.IsDeleted
                                        && (x.TrangThaiPheDuyet == "ChoDuyet"
                                            || x.TrangThaiPheDuyet == "DangDuyet"));

            // Nếu không có bản nháp nào đang chờ/đang duyệt, kiểm tra luôn bản gốc
            if (banCanXuLy == null &&
                (banGoc.TrangThaiPheDuyet == "ChoDuyet" || banGoc.TrangThaiPheDuyet == "DangDuyet"))
            {
                banCanXuLy = banGoc;
            }

            if (banCanXuLy == null)
                throw new Exception("Khóa học hiện không ở trạng thái chờ duyệt nên không thể chuyển sang ĐANG SỬA ");

            // ── Nếu đang được admin kiểm duyệt → chặn, báo cho biết ──
            if (banCanXuLy.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception(
                    $"❌ KHÓA HỌC ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
                    $"Hệ thống Eduverses đang kiểm duyệt khóa học này. " +
                    $"Bạn KHÔNG THỂ chuyển sang trạng thái Đang sửa trong khi admin đang xem xét.\n" +
                    $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
                );

            // ── Đang ChoDuyet → cho phép chuyển sang DangSua ──
            banCanXuLy.TrangThaiPheDuyet = "DangSua";
            banCanXuLy.TrangThai = "DangSua";
            banCanXuLy.UpdatedDate = DateTime.UtcNow;

            await UpdateAsync(banCanXuLy);
            await SaveAsync();

            return _mapper.Map<KhoaHoc, KhoaHocDto>(banCanXuLy);
        }


        public async Task<KhoaHocDto> ChuyenTrangThaiChoDuyet(Guid IdKhoaHoc)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            if (IdKhoaHoc == Guid.Empty)
                throw new Exception("Id khóa học không hợp lệ");

            // ── Lấy bản gốc (IsBanHienTai = true) ───────────────
            var banGoc = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == IdKhoaHoc && !x.IsDeleted);

            if (banGoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (banGoc.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa khóa học này");

            // ── Chỉ tìm bản đang ở DangSua: ưu tiên bản nháp, không có thì xét bản gốc ──
            var banCanXuLy = await GetAll()
                .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id
                                        && !x.IsDeleted
                                        && x.TrangThaiPheDuyet == "DangSua");

            if (banCanXuLy == null && banGoc.TrangThaiPheDuyet == "DangSua")
                banCanXuLy = banGoc;

            if (banCanXuLy == null)
                throw new Exception("Khóa học hiện không ở trạng thái Đang sửa nên không thể gửi CHỜ DUYỆT");

            // ── Chuyển sang ChoDuyet ──
            banCanXuLy.TrangThaiPheDuyet = "ChoDuyet";
            banCanXuLy.TrangThai = "ChoDuyet";
            banCanXuLy.UpdatedDate = DateTime.UtcNow;

            await UpdateAsync(banCanXuLy);
            await SaveAsync();

            return _mapper.Map<KhoaHoc, KhoaHocDto>(banCanXuLy);
        }


        public async Task<GetToUpdateKhoaHoc> GetToUpdateKhoaHoc(Guid idKhoaHoc)
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var nguoiTao);

            var khoaHoc = await GetQueryable()
                .Where(x => x.Id == idKhoaHoc
                         && x.IsBanHienTai
                         && !x.IsDeleted
                         && x.TrangThaiPheDuyet == "DaDuyet"
                         && x.TrangThai == "HoatDong"
                         && x.CreatedId == nguoiTao)
                .Select(x => new GetToUpdateKhoaHoc
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    Gia = x.Gia,
                    GiaGoc = x.GiaGoc,
                    CapDo = x.CapDo,
                    UrlHinhAnh = x.HinhAnhKhoaHoc
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học hoặc bạn không có quyền.");

            return khoaHoc;
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

            if (request.GiaGoc < request.Gia)
                throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

            if (request.Img == null)
                throw new Exception("Vui lòng chọn ảnh cho khóa học");

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

            //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.TieuDe);
            //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.MoTa);
            //await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(request.CapDo);

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
            return KhoaHocDto;
        }
        #endregion


        #region UpdateKhoaHoc
        #region UpdateKhoaHoc
        public async Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            // ── Lấy bản gốc (IsBanHienTai = true) ───────────────
            var banGoc = await GetQueryable()
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
                var upload = await _cloudinaryService.UpdateImageAsync(banGoc.IdHinhAnhKhoaHoc, request.Img);
                if (upload == null)
                    throw new Exception("Upload hình ảnh thất bại");

                hinhAnh = upload.UrlImg;
                idHinhAnh = upload.PublicId;
            }

            var isFree = request.Gia <= 0;

            if (banGoc.TrangThaiPheDuyet == "DangSua" && banGoc.IsBanHienTai == true && banGoc != null)
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


        public async Task<bool> DeleteKhoaHoc(Guid id)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);
            var khoaHoc = await GetByIdAsync(id);
            if (khoaHoc.CreatedId != nguoiTao)
                throw new Exception("Ban kh có quyền hạn để xóa khóa học này!");

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khoa học");

            var coNguoiHoc = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == id);

            khoaHoc.TrangThai = coNguoiHoc == null ? "DaXoa" : "NgungHoatDong";// nếu isdele = true + DaXoa  coi như kh ai co thể nhìn thấy(xóa khi chưa có ai đăng kí)
                                                                               //nếu isdele = true + NgungHoatDong nhưng người đăng kí trước ngày xóa vẫn xem đc

            await DeleteAsync(khoaHoc);
            await SaveAsync();
            return true;
        }
    }
}
