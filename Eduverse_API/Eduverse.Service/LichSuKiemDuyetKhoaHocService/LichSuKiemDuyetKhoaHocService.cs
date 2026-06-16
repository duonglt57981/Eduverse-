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


        //#region GetDetailKhoaHocKiemDuyet
        ///// <summary>
        ///// Chi tiết khóa học chờ duyệt gồm toàn bộ Phan → BaiGiang → TaiLieu.
        ///// Nếu là bản update (IdBanGhiTruoc != null) thì kèm snapshot bản gốc để admin so sánh.
        ///// </summary>
        //public async Task<KiemDuyetDetailDto> GetDetailKhoaHocKiemDuyet(Guid idKhoaHoc)
        //{
        //    // 1. Lấy khóa học chờ duyệt
        //    var khoaHoc = await _khoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idKhoaHoc && !x.IsDeleted && x.TrangThaiPheDuyet == "ChoDuyet")
        //        .FirstOrDefaultAsync()
        //        ?? throw new Exception("Không tìm thấy khóa học hoặc khóa học không ở trạng thái chờ duyệt.");

        //    // 2. Danh mục
        //    var danhMucs = await _danhMuc_KhoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
        //        .Join(_danhMucRepository.GetQueryable().AsNoTracking(),
        //              dm_kh => dm_kh.IdDanhMuc,
        //              dm => dm.Id,
        //              (_, dm) => dm.TenDanhMuc)
        //        .ToListAsync();

        //    // 3. Phần học (chỉ bản pending của khóa học này)
        //    var danhSachPhan = await _phanRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
        //        .OrderBy(x => x.ThuTuSapXep)
        //        .ToListAsync();

        //    var phanIds = danhSachPhan.Select(x => x.Id).ToList();

        //    // 4. Bài giảng của các phần
        //    var danhSachBaiGiang = await _baiGiangRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
        //        .OrderBy(x => x.ThuTuSapXep)
        //        .ToListAsync();

        //    var baiGiangIds = danhSachBaiGiang.Select(x => x.Id).ToList();

        //    // 5. Tài liệu của các bài giảng
        //    var danhSachTaiLieu = await _taiLieuRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //        .ToListAsync();

        //    // 6. Group lại theo phần
        //    var taiLieuByBaiGiang = danhSachTaiLieu
        //        .GroupBy(x => x.IdBaiGiang)
        //        .ToDictionary(g => g.Key, g => g.ToList());

        //    var baiGiangByPhan = danhSachBaiGiang
        //        .GroupBy(x => x.IdPhan)
        //        .ToDictionary(g => g.Key, g => g.ToList());

        //    var phanDtos = danhSachPhan.Select(ph => new PhanHocDto
        //    {
        //        Id = ph.Id,
        //        TenPhan = ph.TenPhan,
        //        ThuTuSapXep = ph.ThuTuSapXep,
        //        TrangThai = ph.TrangThai,
        //        IdBanGhiTruoc = ph.IdBanGhiTruoc,
        //        DanhSachBaiGiang = baiGiangByPhan.GetValueOrDefault(ph.Id, new())
        //            .Select(bg => new BaiGiangDto
        //            {
        //                Id = bg.Id,
        //                TieuDe = bg.TieuDe,
        //                ThuTuSapXep = bg.ThuTuSapXep,
        //                TrangThai = bg.TrangThai,
        //                LaBaiGiangFree = bg.LaBaiGiangFree,
        //                IdBanGhiTruoc = bg.IdBanGhiTruoc,
        //                DanhSachTaiLieu = taiLieuByBaiGiang.GetValueOrDefault(bg.Id, new())
        //                    .Select(tl => new TaiLieuDto
        //                    {
        //                        Id = tl.Id,
        //                        TenTaiLieu = tl.TenTaiLieu,
        //                        LoaiTaiLieu = tl.LoaiTaiLieu,
        //                        URL = tl.URL
        //                    }).ToList()
        //            }).ToList()
        //    }).ToList();

        //    var result = new KiemDuyetDetailDto
        //    {
        //        Id = khoaHoc.Id,
        //        TieuDe = khoaHoc.TieuDe,
        //        MoTa = khoaHoc.MoTa,
        //        LoaiKhoaHoc = khoaHoc.LoaiKhoaHoc,
        //        HinhAnhKhoaHoc = khoaHoc.HinhAnhKhoaHoc,
        //        CapDo = khoaHoc.CapDo,
        //        Gia = khoaHoc.Gia,
        //        GiaGoc = khoaHoc.GiaGoc,
        //        TrangThai = khoaHoc.TrangThai,
        //        TrangThaiPheDuyet = khoaHoc.TrangThaiPheDuyet,
        //        CreatedDate = khoaHoc.CreatedDate,
        //        CreatedBy = khoaHoc.CreatedBy,
        //        IdBanGhiTruoc = khoaHoc.IdBanGhiTruoc,
        //        DanhMucs = danhMucs,
        //        DanhSachPhan = phanDtos
        //    };

        //    // 7. Nếu là bản update → kèm snapshot bản gốc đang HoatDong
        //    if (khoaHoc.IdBanGhiTruoc.HasValue)
        //    {
        //        var banGoc = await _khoaHocRepository.GetQueryable()
        //            .AsNoTracking()
        //            .Where(x => x.Id == khoaHoc.IdBanGhiTruoc.Value && !x.IsDeleted)
        //            .Select(x => new KhoaHocDto
        //            {
        //                Id = x.Id,
        //                TieuDe = x.TieuDe,
        //                MoTa = x.MoTa,
        //                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
        //                Gia = x.Gia,
        //                GiaGoc = x.GiaGoc,
        //                CapDo = x.CapDo
        //            })
        //            .FirstOrDefaultAsync();

        //        result.BanGhiTruoc = banGoc;
        //    }

        //    return result;
        //}
        //#endregion


        #region KiemDuyetKhoaHoc
        /// <summary>
        /// Admin duyệt / từ chối khóa học.
        /// Khi DaDuyet:
        ///   - Bản clone (ChoDuyet) → TrangThaiPheDuyet = DaDuyet, TrangThai = HoatDong, IsBanHienTai = true
        ///   - Bản gốc cũ (IdBanGhiTruoc) → IsBanHienTai = false, IsDeleted = true (soft delete)
        ///   - Phan/BaiGiang clone (ChoDuyetS) → TrangThai = HoatDong
        ///   - Phan/BaiGiang gốc → IsDeleted = true
        /// </summary>
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

            // ── Lấy bản clone chờ duyệt ─────────────────────────
            var khoaHocMoi = await _khoaHocService.GetByIdOrThrowAsync(request.IdKhoaHoc);

            if (khoaHocMoi.TrangThaiPheDuyet != "ChoDuyet")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDuyet);
            var ngayDuyet = DateTime.Now;

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                khoaHocMoi.TrangThaiPheDuyet = "TuChoi";
                await _khoaHocService.UpdateAsync(khoaHocMoi);
                await _khoaHocService.SaveAsync();
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                // Lấy các phần của bản clone
                var phanMoiIds = await _phanService.GetQueryable()
                    .Where(x => x.IdKhoaHoc == khoaHocMoi.Id && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                // Lấy các bài giảng của bản clone
                var baiGiangMoiIds = await _baiGiangService.GetQueryable()
                    .Where(x => phanMoiIds.Contains(x.IdPhan) && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                // ① Activate bản clone
                khoaHocMoi.TrangThaiPheDuyet = "DaDuyet";
                khoaHocMoi.TrangThai = "HoatDong";
                khoaHocMoi.IsBanHienTai = true;

                await _phanService.GetQueryable()
                    .Where(x => phanMoiIds.Contains(x.Id))
                    .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                await _baiGiangService.GetQueryable()
                    .Where(x => baiGiangMoiIds.Contains(x.Id))
                    .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                await _taiLieuService.GetQueryable()
                    .Where(x => baiGiangMoiIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                    .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                // ② Nếu là bản update → soft-delete bản gốc cũ
                if (khoaHocMoi.IdBanGhiTruoc.HasValue)
                {
                    var idBanGoc = khoaHocMoi.IdBanGhiTruoc.Value;

                    // Lấy Phan gốc (dựa vào IdBanGhiTruoc của Phan trỏ về phan cũ thuộc khóa gốc)
                    var phanGocIds = await _phanService.GetQueryable()
                        .Where(x => x.IdKhoaHoc == idBanGoc && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    var baiGiangGocIds = await _baiGiangService.GetQueryable()
                        .Where(x => phanGocIds.Contains(x.IdPhan) && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    // Soft-delete tài liệu → bài giảng → phần → khóa học gốc
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

                    // Soft-delete khóa học gốc
                    await _khoaHocService.GetQueryable()
                        .Where(x => x.Id == idBanGoc)
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.IsBanHienTai, false)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));
                }

                await _khoaHocService.UpdateAsync(khoaHocMoi);
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
                IdKhoaHoc = khoaHocMoi.Id,
                TrangThaiPheDuyet = khoaHocMoi.TrangThaiPheDuyet,
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
