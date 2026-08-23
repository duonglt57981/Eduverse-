
using Eduverse.IService.DanhSachYeuThichService;
using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Repository.DanhSachYeuThichRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DanhSachYeuThichService.Dto;
using Eduverse.Service.DanhSachYeuThichService.Request;
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Service.DanhSachYeuThichService
{
    public class DanhSachYeuThichService
        : Service<DanhSachYeuThich>, IDanhSachYeuThichService
    {
        private readonly IDanhSachYeuThichRepository _danhSachYeuThichRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IAppUserRepository _appUserRepository;
        private readonly IMapper _mapper;
        private readonly IDanhGiaRepository _danhGiaRepository;

        public DanhSachYeuThichService(
            IDanhSachYeuThichRepository danhSachYeuThichRepository,
            IKhoaHocRepository khoaHocRepository,
            IAppUserRepository appUserRepository,
            IDanhGiaRepository danhGiaRepository,
            IMapper mapper
        ) : base(danhSachYeuThichRepository)
        {
            _danhSachYeuThichRepository = danhSachYeuThichRepository;
            _khoaHocRepository = khoaHocRepository;
            _appUserRepository = appUserRepository;
            _danhGiaRepository = danhGiaRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<DanhSachYeuThichResponse>> GetData(DanhSachYeuThichSearch search)
        {
            search ??= new DanhSachYeuThichSearch();
            IQueryable<DanhSachYeuThich> query = GetQueryable()
                .AsNoTracking()
                .Where(x => !x.IsDeleted);

            if (search.IdNguoiDung.HasValue)
                query = query.Where(x => x.IdNguoiDung == search.IdNguoiDung);
            if (search.IdKhoaHoc.HasValue)
                query = query.Where(x => x.IdKhoaHoc == search.IdKhoaHoc);

            query = query.OrderByDescending(x => x.CreatedDate);

            var dtoQuery = query.Select(x => new DanhSachYeuThichResponse
            {
                Id = x.Id,
                IdNguoiDung = x.IdNguoiDung,
                IdKhoaHoc = x.IdKhoaHoc,
                CreatedDate = x.CreatedDate,
                TenNguoiDung = _appUserRepository.GetQueryable()
                    .Where(u => u.Id == x.IdNguoiDung)
                    .Select(u => u.HoTen)
                    .FirstOrDefault(),
                TenKhoaHoc = _khoaHocRepository.GetQueryable()
                    .Where(kh => kh.Id == x.IdKhoaHoc)
                    .Select(kh => kh.TieuDe)
                    .FirstOrDefault(),
                MoTa = _khoaHocRepository.GetQueryable()
                    .Where(kh => kh.Id == x.IdKhoaHoc)
                    .Select(kh => kh.MoTa)
                    .FirstOrDefault(),
                HinhAnh = _khoaHocRepository.GetQueryable()
                    .Where(kh => kh.Id == x.IdKhoaHoc)
                    .Select(kh => kh.HinhAnhKhoaHoc)
                    .FirstOrDefault(),
                GiangVien = _appUserRepository.GetQueryable()
                    .Where(u => u.Id == _khoaHocRepository.GetQueryable()
                        .Where(kh => kh.Id == x.IdKhoaHoc)
                        .Select(kh => kh.CreatedId)
                        .FirstOrDefault())
                    .Select(u => u.HoTen)
                    .FirstOrDefault() ?? _khoaHocRepository.GetQueryable()
                        .Where(kh => kh.Id == x.IdKhoaHoc)
                        .Select(kh => kh.CreatedBy)
                        .FirstOrDefault(),
                GiaTien = _khoaHocRepository.GetQueryable()
                    .Where(kh => kh.Id == x.IdKhoaHoc)
                    .Select(kh => kh.Gia)
                    .FirstOrDefault(),
                CapDo = _khoaHocRepository.GetQueryable()             // ← THÊM (component cần cho "level")
                    .Where(kh => kh.Id == x.IdKhoaHoc)
                    .Select(kh => kh.CapDo)
                    .FirstOrDefault(),
                SoLuongHocVien = _khoaHocRepository.GetQueryable()     // ← THÊM
                    .Where(kh => kh.Id == x.IdKhoaHoc)
                    .Select(kh => kh.SoLuongHocVien)
                    .FirstOrDefault() ?? 0
            });

            var paged = await PagedList<DanhSachYeuThichResponse>.CreateAsync(dtoQuery, search);

            // ── Gắn rating thật, join theo IdKhoaHoc ────────────────────
            await GanDanhGiaAsync(paged.Items);

            return paged;
        }

        private async Task GanDanhGiaAsync(IEnumerable<DanhSachYeuThichResponse> items)
        {
            var khoaHocIds = items
                .Where(x => x.IdKhoaHoc.HasValue)
                .Select(x => x.IdKhoaHoc!.Value)
                .Distinct()
                .ToList();
            if (!khoaHocIds.Any()) return;

            var danhGiaList = await _danhGiaRepository.GetQueryable()
                .AsNoTracking()
                .Where(d => d.IdKhoaHoc.HasValue
                         && khoaHocIds.Contains(d.IdKhoaHoc.Value)
                         && !d.IsDeleted
                         && d.TrangThai == "HienThi")
                .Select(d => new { d.IdKhoaHoc, d.SoSao })
                .ToListAsync();

            var thongKe = danhGiaList
                .GroupBy(d => d.IdKhoaHoc!.Value)
                .ToDictionary(
                    g => g.Key,
                    g => new { SoLuong = g.Count(), TrungBinh = Math.Round(g.Average(x => (double)(x.SoSao ?? 0)), 1) }
                );

            foreach (var item in items)
            {
                if (item.IdKhoaHoc.HasValue && thongKe.TryGetValue(item.IdKhoaHoc.Value, out var tk))
                {
                    item.DiemDanhGiaTrungBinh = tk.TrungBinh;
                    item.SoLuongDanhGia = tk.SoLuong;
                }
                else
                {
                    item.DiemDanhGiaTrungBinh = null;
                    item.SoLuongDanhGia = 0;
                }
            }
        }

        public async Task<DanhSachYeuThich> ThemYeuThich(Guid userId, Guid khoaHocId)
        {
            var exists = await _danhSachYeuThichRepository.GetQueryable()
                .AnyAsync(x => x.IdNguoiDung == userId && x.IdKhoaHoc == khoaHocId && !x.IsDeleted);
            if (exists) return null;
            var yeuThich = new DanhSachYeuThich
            {
                Id = Guid.NewGuid(),
                IdNguoiDung = userId,
                IdKhoaHoc = khoaHocId,
                CreatedDate = DateTime.Now,
                IsDeleted = false
            };
            await CreateAsync(yeuThich);
            return yeuThich;
        }

        public async Task<DanhSachYeuThich> XoaYeuThich(Guid id)
        {
            var entity = await _danhSachYeuThichRepository.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted) return null;
            entity.IsDeleted = true;
            entity.DeletedDate = DateTime.Now;
            await DeleteAsync(entity);
            await SaveAsync();
            return entity;
        }
    }
}