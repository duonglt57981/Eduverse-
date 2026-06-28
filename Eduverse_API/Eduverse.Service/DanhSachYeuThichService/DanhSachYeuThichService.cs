
using Eduverse.IService.DanhSachYeuThichService;
using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
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

        public DanhSachYeuThichService(
            IDanhSachYeuThichRepository danhSachYeuThichRepository,
            IKhoaHocRepository khoaHocRepository,
            IAppUserRepository appUserRepository,
            IMapper mapper
        ) : base(danhSachYeuThichRepository)
        {
            _danhSachYeuThichRepository = danhSachYeuThichRepository;
            _khoaHocRepository = khoaHocRepository;
            _appUserRepository = appUserRepository;
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
                    .FirstOrDefault()
            });

            return await PagedList<DanhSachYeuThichResponse>.CreateAsync(dtoQuery, search);
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