using Eduverse.Model.Entities;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Service.Common;
using Eduverse.Service.DanhMucService.Dto;
using Eduverse.Service.DanhMucService.Request;
using Microsoft.EntityFrameworkCore;
using Eduverse.Service.Core.Mapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMucService
{
    public class DanhMucService : Service<Model.Entities.DanhMuc>, IDanhMucService
    {
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IMapper _mapper;
        public DanhMucService(IDanhMucRepository danhMucRepository, IMapper mapper) : base(danhMucRepository)
        {
            _danhMucRepository = danhMucRepository;
            _mapper = mapper;
        }

        public async Task<DanhMucDto> Create(CreateDanhMucRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TenDanhMuc))
                throw new Exception("Tên danh mục không được để trống");

            var exists = await GetQueryable()
                .AnyAsync(x => x.TenDanhMuc != null && x.TenDanhMuc.ToLower() == request.TenDanhMuc.ToLower() && !x.IsDeleted);

            if (exists)
                throw new Exception("Tên danh mục đã tồn tại");

            var danhMuc = new DanhMuc
            {
                Id = Guid.NewGuid(),
                TenDanhMuc = request.TenDanhMuc,
                NgayTao = DateTime.UtcNow,
                TrangThai = "HDH",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            await CreateAsync(danhMuc);
            await SaveAsync();

            return _mapper.Map<DanhMuc, DanhMucDto>(danhMuc);
        }

        public async Task<bool> Delete(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null || entity.IsDeleted)
                throw new Exception("Không tìm thấy danh mục");

            entity.IsDeleted = true;
            entity.TrangThai = "KHD";
            entity.DeletedDate = DateTime.UtcNow;

            await UpdateAsync(entity);
            await SaveAsync();

            return true;
        }

        public async Task<DanhMucDto?> GetById(Guid id)
        {
            var entity = await GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (entity == null) return null;

            return _mapper.Map<DanhMuc, DanhMucDto>(entity);
        }

        public async Task<PagedList<DanhMucDto>> GetList(DanhMucSearch search)
        {
            search ??= new DanhMucSearch();

            IQueryable<DanhMuc> query = GetQueryable()
                .AsNoTracking()
                .Where(x => !x.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                query = query.Where(x => x.TenDanhMuc != null && x.TenDanhMuc.Contains(keyword));
            }

            query = query.OrderByDescending(x => x.NgayTao);

            var dtoQuery = query.Select(x => new DanhMucDto
            {
                Id = x.Id,
                TenDanhMuc = x.TenDanhMuc,
                NgayTao = x.NgayTao,
                TrangThai = x.TrangThai
            });

            return await PagedList<DanhMucDto>.CreateAsync(dtoQuery, search);
        }

        public async Task<DanhMucDto> Update(UpdateDanhMucRequest request)
        {
            var entity = await GetByIdAsync(request.Id);
            if (entity == null || entity.IsDeleted)
                throw new Exception("Không tìm thấy danh mục");

            if (string.IsNullOrWhiteSpace(request.TenDanhMuc))
                throw new Exception("Tên danh mục không được để trống");

            var duplicate = await GetQueryable()
                .AnyAsync(x => x.Id != request.Id
                               && x.TenDanhMuc != null
                               && x.TenDanhMuc.ToLower() == request.TenDanhMuc.ToLower()
                               && !x.IsDeleted);

            if (duplicate)
                throw new Exception("Tên danh mục đã tồn tại");

            entity.TenDanhMuc = request.TenDanhMuc;
            entity.UpdatedDate = DateTime.UtcNow;

            await UpdateAsync(entity);
            await SaveAsync();

            return _mapper.Map<DanhMuc, DanhMucDto>(entity);
        }
    }
}
