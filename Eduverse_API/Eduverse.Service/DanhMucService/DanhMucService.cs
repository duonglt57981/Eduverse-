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
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhMucService
{
    public class DanhMucService : Service<Model.Entities.DanhMuc>, IDanhMucService
    {
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IMapper _mapper;
        private static readonly Regex MaDanhMucRegex = new Regex(@"^[A-Z]{2,10}[0-9]{3}$", RegexOptions.Compiled);

        public DanhMucService(IDanhMucRepository danhMucRepository, IMapper mapper) : base(danhMucRepository)
        {
            _danhMucRepository = danhMucRepository;
            _mapper = mapper;
        }

        private void ValidateMaDanhMuc(string maDanhMuc)
        {
            if (!MaDanhMucRegex.IsMatch(maDanhMuc))
                throw new Exception("Mã danh mục không hợp lệ. Định dạng yêu cầu: chữ hoa + 3 chữ số (VD: IT001, AI001, DM001)");
        }

        private async Task<string> GenerateNextDMCode()
        {
            var allCodes = await GetQueryable()
                .Where(x => !x.IsDeleted && x.MaDanhMuc != null && x.MaDanhMuc.StartsWith("DM"))
                .Select(x => x.MaDanhMuc!)
                .ToListAsync();

            int maxNumber = 0;
            var dmRegex = new Regex(@"^DM(\d{3})$");
            foreach (var code in allCodes)
            {
                var match = dmRegex.Match(code);
                if (match.Success)
                {
                    int num = int.Parse(match.Groups[1].Value);
                    if (num > maxNumber) maxNumber = num;
                }
            }

            return $"DM{(maxNumber + 1).ToString("D3")}";
        }

        public async Task<DanhMucDto> Create(CreateDanhMucRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TenDanhMuc))
                throw new Exception("Tên danh mục không được để trống");

            var exists = await GetQueryable()
                .AnyAsync(x => x.TenDanhMuc != null && x.TenDanhMuc.ToLower() == request.TenDanhMuc.ToLower() && !x.IsDeleted);

            if (exists)
                throw new Exception("Tên danh mục đã tồn tại");

            string maDanhMuc;
            if (!string.IsNullOrWhiteSpace(request.MaDanhMuc))
            {
                maDanhMuc = request.MaDanhMuc.Trim().ToUpper();
                ValidateMaDanhMuc(maDanhMuc);

                var codeDuplicate = await GetQueryable()
                    .AnyAsync(x => x.MaDanhMuc != null && x.MaDanhMuc == maDanhMuc && !x.IsDeleted);
                if (codeDuplicate)
                    throw new Exception($"Mã danh mục '{maDanhMuc}' đã tồn tại");
            }
            else
            {
                maDanhMuc = await GenerateNextDMCode();
            }

            var danhMuc = new DanhMuc
            {
                Id = Guid.NewGuid(),
                MaDanhMuc = maDanhMuc,
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
                MaDanhMuc = x.MaDanhMuc,
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

            if (!string.IsNullOrWhiteSpace(request.MaDanhMuc))
            {
                var newCode = request.MaDanhMuc.Trim().ToUpper();
                ValidateMaDanhMuc(newCode);

                var codeDuplicate = await GetQueryable()
                    .AnyAsync(x => x.Id != request.Id
                                   && x.MaDanhMuc != null
                                   && x.MaDanhMuc == newCode
                                   && !x.IsDeleted);
                if (codeDuplicate)
                    throw new Exception($"Mã danh mục '{newCode}' đã tồn tại");

                entity.MaDanhMuc = newCode;
            }

            entity.UpdatedDate = DateTime.UtcNow;

            await UpdateAsync(entity);
            await SaveAsync();

            return _mapper.Map<DanhMuc, DanhMucDto>(entity);
        }
    }
}
