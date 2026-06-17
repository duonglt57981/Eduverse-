using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{
    public class LichSuKiemDuyetKhoaHocService : Service<Model.Entities.LichSuKiemDuyetKhoaHoc>, ILichSuKiemDuyetKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IKhoaHocService _khoaHocService;
        private readonly IPhanRepository _phanRepository;
        private readonly IPhanService _phanService;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IBaiKiemTraRepository _kiemTraRepository;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private readonly IBaiGiangService _baiGiangService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDanhMuc_KhoaHocRepository _danhMuc_KhoaHocRepository;
        private readonly IDanhMucRepository _danhMucRepository;
        public LichSuKiemDuyetKhoaHocService(ILichSuKiemDuyetKhoaHocRepository repository,
            IKhoaHocRepository khoaHocRepository,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository,
            IBaiGiangService baiGiangService,
            ITaiLieuRepository taiLieuRepository,
            IBaiKiemTraRepository kiemTraRepository,
            IKhoaHocService khoaHocService,
            IPhanService phanService,
            ITaiLieuService taiLieuService,
            IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository,
            IDanhMucRepository _danhMucRepository,
            IHttpContextAccessor? httpContextAccessor = null) : base(repository)
        {
            _khoaHocRepository = khoaHocRepository;
            _phanRepository = phanRepository;
            _phanService = phanService;
            _baiGiangRepository = baiGiangRepository;
            _taiLieuRepository = taiLieuRepository;
            _kiemTraRepository = kiemTraRepository;
            _khoaHocService = khoaHocService;
            this._httpContextAccessor = httpContextAccessor;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _danhMuc_KhoaHocRepository = danhMuc_KhoaHocRepository;
        }

        #region GetListKhoaHocKiemDuyet
        /// <summary>
        /// Danh sách khóa học đang chờ duyệt (ChoDuyet).
        /// Chỉ trả về bản clone mới nhất, KHÔNG trả về bản gốc đang HoatDong.
        /// </summary>
        public async Task<PagedList<GetListKiemDuyetDto>> GetListKhoaHocKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            search ??= new KhoaHocKiemDuyetSearchDto();

            // Chỉ lấy bản đang chờ duyệt (bản clone mới hoặc khóa học tạo mới lần đầu)
            var query = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(kh => !kh.IsDeleted && kh.TrangThaiPheDuyet == "ChoDuyet");

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                query = query.Where(x =>
                    (x.TieuDe ?? "").Contains(keyword) ||
                    (x.LoaiKhoaHoc ?? "").Contains(keyword));
            }

            var ordered = query.OrderBy(x => x.CreatedDate);

            var totalCount = await ordered.CountAsync();

            var pageData = await ordered
                .Skip((search.PageIndex - 1) * search.PageSize)
                .Take(search.PageSize)
                .Select(kh => new GetListKiemDuyetDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    MoTa = kh.MoTa,
                    LoaiKhoaHoc = kh.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                    CapDo = kh.CapDo,
                    Gia = kh.Gia,
                    GiaGoc = kh.GiaGoc,
                    TrangThai = kh.TrangThai,
                    TrangThaiPheDuyet = kh.TrangThaiPheDuyet,
                    IdBanGhiTruoc = kh.IdBanGhiTruoc,   // null = tạo mới, có giá trị = update
                })
                .ToListAsync();

            if (!pageData.Any())
                return new PagedList<GetListKiemDuyetDto>(new List<GetListKiemDuyetDto>(),
                    search.PageIndex, search.PageSize, totalCount);

            var khoaHocIds = pageData.Select(x => x.Id).ToList();

            // 3 dictionary thống kê — chỉ tính cho trang hiện tại
            var tongBaiGiangDict = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !ph.IsDeleted && !bg.IsDeleted
                group bg by ph.IdKhoaHoc.Value into g
                select new { IdKhoaHoc = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Count);

            var tongTaiLieuDict = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                join tl in _taiLieuRepository.GetQueryable().AsNoTracking()
                    on bg.Id equals tl.IdBaiGiang
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !ph.IsDeleted && !bg.IsDeleted && !tl.IsDeleted
                group tl by ph.IdKhoaHoc.Value into g
                select new { IdKhoaHoc = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Count);

            var tongQizzDict = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join kt in _kiemTraRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals kt.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !ph.IsDeleted && !kt.IsDeleted
                group kt by ph.IdKhoaHoc.Value into g
                select new { IdKhoaHoc = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Count);

            foreach (var item in pageData)
            {
                item.TongBaiGiang = tongBaiGiangDict.GetValueOrDefault(item.Id, 0);
                item.TongTaiLieu = tongTaiLieuDict.GetValueOrDefault(item.Id, 0);
                item.TongQizz = tongQizzDict.GetValueOrDefault(item.Id, 0);
            }

            return new PagedList<GetListKiemDuyetDto>(pageData, search.PageIndex, search.PageSize, totalCount);
        }
        #endregion


        #region GetDetailKhoaHocKiemDuyet
        public async Task<KiemDuyetDetailDto> GetDetailKhoaHocKiemDuyet(Guid idKhoaHoc)
        {
            // 1. Lấy khóa học — ưu tiên bản nháp ChoDuyet, không có thì lấy bản HoatDong
            var khoaHoc = await _khoaHocRepository.GetAll()
                .AsNoTracking()
                .Where(x => (x.Id == idKhoaHoc || x.IdBanGhiTruoc == idKhoaHoc)
                         && !x.IsDeleted
                         && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .OrderByDescending(x => x.TrangThaiPheDuyet == "ChoDuyet") // ưu tiên nháp
                .FirstOrDefaultAsync()
                ?? throw new Exception("Không tìm thấy khóa học.");

            var idGoc = khoaHoc.IdBanGhiTruoc ?? khoaHoc.Id;
            var khoaHocIsDangSua = khoaHoc.IdBanGhiTruoc.HasValue
                                && khoaHoc.TrangThaiPheDuyet == "ChoDuyet";

            // 2. Danh mục
            var danhMucs = await _danhMuc_KhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == khoaHoc.Id && !x.IsDeleted)
                .Join(_danhMucRepository.GetQueryable().AsNoTracking(),
                      dm_kh => dm_kh.IdDanhMuc,
                      dm => dm.Id,
                      (_, dm) => dm.TenDanhMuc)
                .ToListAsync();

            // 3. Lấy tất cả phần: phần gốc + phần nháp (nếu có)
            var tatCaPhan = await _phanRepository.GetAll()
                .AsNoTracking()
                .Where(x => (x.IdKhoaHoc == idGoc || x.IdKhoaHoc == khoaHoc.Id)
                         && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            // Với mỗi IdPhan gốc, nếu có bản nháp thì dùng nháp, không có thì dùng gốc
            var phanNhapByGoc = tatCaPhan
                .Where(x => x.IdBanGhiTruoc.HasValue && x.TrangThai == "ChoDuyet")
                .ToDictionary(x => x.IdBanGhiTruoc!.Value);

            var phanGocs = tatCaPhan
                .Where(x => !x.IdBanGhiTruoc.HasValue)
                .ToList();

            // Chọn phần hiển thị (nháp nếu có, gốc nếu không)
            var phanHienThi = phanGocs.Select(pg =>
            {
                if (phanNhapByGoc.TryGetValue(pg.Id, out var nhap))
                    return (Phan: nhap, IsDangSua: true);
                return (Phan: pg, IsDangSua: false);
            }).ToList();

            // Thêm phần nháp mới (chưa có gốc — GV thêm mới chưa duyệt)
            var phanMoiHoanToan = tatCaPhan
                .Where(x => !x.IdBanGhiTruoc.HasValue
                         && x.IdKhoaHoc == khoaHoc.Id
                         && x.TrangThai == "ChoDuyet")
                .Select(x => (Phan: x, IsDangSua: true))
                .ToList();

            var tatCaPhanHienThi = phanHienThi.Concat(phanMoiHoanToan)
                .OrderBy(x => x.Phan.ThuTuSapXep)
                .ToList();

            var phanIds = tatCaPhanHienThi.Select(x => x.Phan.Id).ToList();

            // 4. Lấy tất cả bài giảng của các phần hiển thị
            var tatCaBaiGiang = await _baiGiangRepository.GetAll()
                .AsNoTracking()
                .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            // Tương tự phần: nếu có nháp thì dùng nháp, không thì dùng gốc
            var bgNhapByGoc = tatCaBaiGiang
                .Where(x => x.IdBanGhiTruoc.HasValue && x.TrangThai == "ChoDuyet")
                .ToDictionary(x => x.IdBanGhiTruoc!.Value);

            var bgGocs = tatCaBaiGiang
                .Where(x => !x.IdBanGhiTruoc.HasValue)
                .ToList();

            var bgHienThi = bgGocs.Select(bg =>
            {
                if (bgNhapByGoc.TryGetValue(bg.Id, out var nhap))
                    return (BaiGiang: nhap, IsDangSua: true);
                return (BaiGiang: bg, IsDangSua: false);
            }).ToList();

            var bgMoiHoanToan = tatCaBaiGiang
                .Where(x => !x.IdBanGhiTruoc.HasValue && x.TrangThai == "ChoDuyet")
                .Select(x => (BaiGiang: x, IsDangSua: true))
                .ToList();

            var tatCaBgHienThi = bgHienThi.Concat(bgMoiHoanToan)
                .OrderBy(x => x.BaiGiang.ThuTuSapXep)
                .ToList();

            var bgIds = tatCaBgHienThi.Select(x => x.BaiGiang.Id).ToList();

            // 5. Tài liệu
            var danhSachTaiLieu = await _taiLieuRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => bgIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                .ToListAsync();

            var taiLieuByBaiGiang = danhSachTaiLieu
                .GroupBy(x => x.IdBaiGiang)
                .ToDictionary(g => g.Key, g => g.ToList());

            // 6. Group bài giảng theo phần
            var bgByPhan = tatCaBgHienThi
                .GroupBy(x => x.BaiGiang.IdPhan)
                .ToDictionary(g => g.Key, g => g.ToList());

            // 7. Build DTO
            var phanDtos = tatCaPhanHienThi.Select(ph => new PhanHocDto
            {
                Id = ph.Phan.Id,
                TenPhan = ph.Phan.TenPhan,
                MieuTa = ph.Phan.MieuTa,
                ThuTuSapXep = ph.Phan.ThuTuSapXep,
                TrangThai = ph.Phan.TrangThai,
                IdBanGhiTruoc = ph.Phan.IdBanGhiTruoc,
                IsDangSua = ph.IsDangSua,
                DanhSachBaiGiang = bgByPhan.GetValueOrDefault(ph.Phan.Id, new())
                    .Select(bg => new BaiGiangDto
                    {
                        Id = bg.BaiGiang.Id,
                        TieuDe = bg.BaiGiang.TieuDe,
                        ThuTuSapXep = bg.BaiGiang.ThuTuSapXep,
                        TrangThai = bg.BaiGiang.TrangThai,
                        LaBaiGiangFree = bg.BaiGiang.LaBaiGiangFree,
                        IdBanGhiTruoc = bg.BaiGiang.IdBanGhiTruoc,
                        IsDangSua = bg.IsDangSua,
                        DanhSachTaiLieu = taiLieuByBaiGiang.GetValueOrDefault(bg.BaiGiang.Id, new())
                            .Select(tl => new TaiLieuDto
                            {
                                Id = tl.Id,
                                TenTaiLieu = tl.TenTaiLieu,
                                LoaiTaiLieu = tl.LoaiTaiLieu,
                                URL = tl.URL
                            }).ToList()
                    }).ToList()
            }).ToList();

            return new KiemDuyetDetailDto
            {
                Id = idGoc,
                TieuDe = khoaHoc.TieuDe,
                MoTa = khoaHoc.MoTa,
                LoaiKhoaHoc = khoaHoc.LoaiKhoaHoc,
                HinhAnhKhoaHoc = khoaHoc.HinhAnhKhoaHoc,
                CapDo = khoaHoc.CapDo,
                Gia = khoaHoc.Gia,
                GiaGoc = khoaHoc.GiaGoc,
                TrangThai = khoaHoc.TrangThai,
                TrangThaiPheDuyet = khoaHoc.TrangThaiPheDuyet,
                CreatedDate = khoaHoc.CreatedDate,
                CreatedBy = khoaHoc.CreatedBy,
                IsDangSua = khoaHocIsDangSua,
                DanhMucs = danhMucs,
                DanhSachPhanHoc = phanDtos
            };
        }
        #endregion


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

            var khoaHoc = await _khoaHocService.GetByIdOrThrowAsync(request.IdKhoaHoc);

            if (khoaHoc.TrangThaiPheDuyet != "ChoDuyet")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var idNguoiDuyet);
            var ngayDuyet = DateTime.Now;

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                khoaHoc.TrangThaiPheDuyet = "TuChoi";

                if (khoaHoc.IdBanGhiTruoc.HasValue)
                {
                    await _khoaHocService.DeleteAsync(khoaHoc);
                }

                await _khoaHocService.UpdateAsync(khoaHoc);
                await _khoaHocService.SaveAsync();
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                var phanIds = await _phanService.GetQueryable()
                    .Where(x => x.IdKhoaHoc == khoaHoc.Id && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                var baiGiangIds = await _baiGiangService.GetQueryable()
                    .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
                if (!khoaHoc.IdBanGhiTruoc.HasValue)
                {
                    khoaHoc.TrangThaiPheDuyet = "DaDuyet";
                    khoaHoc.TrangThai = "HoatDong";
                    khoaHoc.IsBanHienTai = true;

                    await _phanService.GetQueryable()
                        .Where(x => phanIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    await _baiGiangService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    await _taiLieuService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));
                }
                // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
                else
                {
                    var idBanGoc = khoaHoc.IdBanGhiTruoc.Value;

                    var banGoc = await _khoaHocService.GetByIdOrThrowAsync(idBanGoc);

                    // ① Copy field từ bản nháp → bản gốc (giữ Id gốc để FK DangKy không vỡ)
                    banGoc.TieuDe = khoaHoc.TieuDe;
                    banGoc.MoTa = khoaHoc.MoTa;
                    banGoc.HinhAnhKhoaHoc = khoaHoc.HinhAnhKhoaHoc;
                    banGoc.IdHinhAnhKhoaHoc = khoaHoc.IdHinhAnhKhoaHoc;
                    banGoc.Gia = khoaHoc.Gia;
                    banGoc.GiaGoc = khoaHoc.GiaGoc;
                    banGoc.CapDo = khoaHoc.CapDo;
                    banGoc.LoaiKhoaHoc = khoaHoc.LoaiKhoaHoc;
                    banGoc.TrangThaiPheDuyet = "DaDuyet";
                    banGoc.TrangThai = "HoatDong";
                    banGoc.IsBanHienTai = true;
                    banGoc.UpdatedDate = DateTime.UtcNow;

                    // ② Lấy phan/baigiang gốc để soft-delete
                    var phanGocIds = await _phanService.GetQueryable()
                        .Where(x => x.IdKhoaHoc == idBanGoc && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    var baiGiangGocIds = await _baiGiangService.GetQueryable()
                        .Where(x => phanGocIds.Contains(x.IdPhan) && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    // ③ Soft-delete tailieu → baigiang → phan gốc
                    await _taiLieuService.GetQueryable()
                        .Where(x => baiGiangGocIds.Contains(x.IdBaiGiang))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));

                    await _baiGiangService.GetQueryable()
                        .Where(x => baiGiangGocIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));

                    await _phanService.GetQueryable()
                        .Where(x => phanGocIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));

                    // ④ Chuyển phan/baigiang nháp sang IdKhoaHoc gốc + activate
                    await _phanService.GetQueryable()
                        .Where(x => phanIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IdKhoaHoc, idBanGoc)
                            .SetProperty(p => p.TrangThai, "HoatDong"));

                    await _baiGiangService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    await _taiLieuService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    // ⑤ Reset bản nháp (giữ lại, tái sử dụng lần sau)
                    khoaHoc.TrangThaiPheDuyet = "DaDuyet";
                    khoaHoc.TrangThai = "Nhap";
                    khoaHoc.IsBanHienTai = false;
                    khoaHoc.UpdatedDate = DateTime.UtcNow;

                    await _khoaHocService.UpdateAsync(banGoc);
                    await _khoaHocService.UpdateAsync(khoaHoc);
                }

                await _khoaHocService.SaveAsync();
            }

            // ── Ghi lịch sử ─────────────────────────────────────
            var lichSu = new LichSuKiemDuyetKhoaHoc
            {
                Id = Guid.NewGuid(),
                IdKhoaHoc = request.IdKhoaHoc,
                IdNguoiDuyet = idNguoiDuyet,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                LyDo = request.LyDo,
                NgayDuyet = ngayDuyet
            };

            await CreateAsync(lichSu);
            await SaveAsync();

            return new KiemDuyetKhoaHocDto
            {
                IdKhoaHoc = khoaHoc.IdBanGhiTruoc ?? khoaHoc.Id, // trả về Id gốc
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }
        #endregion


        public async Task<List<LichSuKiemDuyetDto>> GetLichSuKiemDuyet(Guid idKhoaHoc)
        {
            return await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .OrderByDescending(x => x.NgayDuyet)
                .Select(x => new LichSuKiemDuyetDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdKhoaHoc,
                    IdNguoiDuyet = x.IdNguoiDuyet,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    LyDo = x.LyDo,
                    NgayDuyet = x.NgayDuyet
                })
                .ToListAsync();
        }
    }
}
