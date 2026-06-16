using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using Eduverse.Service.PhanService;
using Eduverse.Service.TaiLieuService;
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
        }

        public async Task<PagedList<GetListKiemDuyetDto>> GetListKhoaHocKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            search ??= new KhoaHocKiemDuyetSearchDto();

            var query = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(kh => kh.TrangThaiPheDuyet == "ChoDuyet");

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                query = query.Where(x =>
                    (x.TieuDe ?? "").Contains(keyword) ||
                    (x.LoaiKhoaHoc ?? "").Contains(keyword));
            }

            var ordered = query.OrderBy(x => x.CreatedDate);

            // ── Phân trang ngay trên SQL (chỉ KhoaHoc) ──
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
                    TrangThaiPheDuyet = kh.TrangThaiPheDuyet
                })
                .ToListAsync();

            if (!pageData.Any())
            {
                return new PagedList<GetListKiemDuyetDto>(
                    new List<GetListKiemDuyetDto>(), search.PageIndex, search.PageSize, totalCount);
            }

            var khoaHocIds = pageData.Select(x => x.Id).ToList();

            // ── 3 dictionary chỉ tính cho khóaHocIds của TRANG NÀY ──
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

            return new PagedList<GetListKiemDuyetDto>(
                pageData, search.PageIndex, search.PageSize, totalCount);
        }


        public async Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        {
            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin")
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt khóa học.");

            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            var khoaHoc = await _khoaHocService.GetByIdOrThrowAsync(request.IdKhoaHoc);

            if (khoaHoc.TrangThaiPheDuyet != "ChoDuyet" && khoaHoc.TrangThaiPheDuyet != "TuChoi"&& khoaHoc.TrangThaiPheDuyet != "ChoDuyetS")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối khóa học.");

            // Lấy userId từ JWT (giống SaveChangesAsync)
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),out var idNguoiDuyet);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Surname);

            var ngayDuyet = DateTime.Now;

            khoaHoc.TrangThaiPheDuyet = request.TrangThaiPheDuyet;

            if (request.TrangThaiPheDuyet == "DaDuyet")
            {
                var daCoLichSu = await GetQueryable()
                    .AnyAsync(x => x.IdKhoaHoc == khoaHoc.Id);

                khoaHoc.TrangThai = daCoLichSu ? khoaHoc.TrangThai : "HoatDong";

                await _phanService.GetQueryable()
                    .Where(x => x.IdKhoaHoc == khoaHoc.Id && x.TrangThai == "ChoDuyet")
                    .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                var phanIds = await _phanService.GetQueryable()
                    .Where(x => x.IdKhoaHoc == khoaHoc.Id && x.TrangThai == "ChoDuyetS")
                    .Select(x => x.Id)
                    .ToListAsync();
                await _baiGiangService.GetQueryable()
                    .Where(x => phanIds.Contains(x.IdPhan) && x.TrangThai == "ChoDuyetS")
                    .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                var baiGiangIds = await _baiGiangService.GetQueryable()
                    .Where(x => phanIds.Contains(x.IdPhan) && x.TrangThai == "ChoDuyetS")
                    .Select(x => x.Id)
                    .ToListAsync();
                await _taiLieuService.GetQueryable()
                    .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && x.TrangThai == "ChoDuyet")
                    .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));
            }
                

            await _khoaHocService.UpdateAsync(khoaHoc);
            await _khoaHocService.SaveAsync();

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
                IdKhoaHoc = khoaHoc.Id,
                TrangThaiPheDuyet = khoaHoc.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }


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
