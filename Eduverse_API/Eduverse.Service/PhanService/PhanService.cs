using AutoMapper;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService
{
    public class PhanService : Service<Phan>, IPhanService
    {
        private readonly Service.Core.Mapper.IMapper _mapper;
        private readonly IBaiGiangService _baiGiangService;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly ITaiLieuService _taiLieuService;

        
        public PhanService(
            IPhanRepository phanRepository,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IKhoaHocRepository khoaHocRepository,
            Service.Core.Mapper.IMapper mapper

            ) : base(phanRepository)
        {
            _mapper = mapper;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _khoaHocRepository = khoaHocRepository;
        }

        public async Task<PhanHocDto> CreatePhanHoc(CreatePhanRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.TenPhan))
                throw new Exception("Vui lòng nhập tên phần học");

            var khoaHocExists = await _khoaHocRepository
                .GetQueryable()
                .AsNoTracking()
                .AnyAsync(x => x.Id == request.IdKhoaHoc);

            if (!khoaHocExists)
                throw new Exception("Không tìm thấy khóa học");

            var maxThuTu = await GetQueryable()
                .Where(x => x.IdKhoaHoc == request.IdKhoaHoc)
                .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

            var entity = new Phan
            {
                IdKhoaHoc = request.IdKhoaHoc,
                TenPhan = request.TenPhan.Trim(),
                ThuTuSapXep = maxThuTu + 1
            };

            await CreateAsync(entity);
            await SaveAsync();

            return _mapper.Map<Phan,PhanHocDto>(entity);
        }


        public async Task<PhanHocDto> UpdatePhanHoc(UpdatePhanRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            if (string.IsNullOrWhiteSpace(request.TenPhan))
                throw new Exception("Vui lòng nhập tên phần học");

            var khoaHocExistsTask = _khoaHocRepository
                .GetQueryable()
                .AnyAsync(x => x.Id == request.IdKhoaHoc);

            var entityTask = GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted);

            await Task.WhenAll(khoaHocExistsTask, entityTask);

            if (!khoaHocExistsTask.Result)
                throw new Exception("Không tìm thấy khóa học");

            var entity = entityTask.Result;
            if (entity == null)
                throw new Exception("Không tìm thấy phần học");

            var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                    x.IdKhoaHoc == request.IdKhoaHoc &&
                    x.ThuTuSapXep == request.ThuTuSapXep &&
                    x.Id != request.Id &&
                    !x.IsDeleted);

            if (thuTuDaTon)
                throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại trong phần học này");


            entity.IdKhoaHoc = request.IdKhoaHoc;
            entity.TenPhan = request.TenPhan.Trim();
            entity.ThuTuSapXep = request.ThuTuSapXep;

            await UpdateAsync(entity);
            await SaveAsync();

            return _mapper.Map<Phan, PhanHocDto>(entity);
        }


        public async Task<bool> DeletePhanHoc(Guid id)
        {
            var exists = await GetQueryable()
                .AnyAsync(x => x.Id == id);

            if (!exists)
                throw new Exception("Không tìm thấy phần học");

            var taiLieus = await (
                from tl in _taiLieuService.GetQueryable()
                join bg in _baiGiangService.GetQueryable()
                    on tl.IdBaiGiang equals bg.Id
                where bg.IdPhan == id && !tl.IsDeleted
                select tl
            ).ToListAsync();

            if (taiLieus.Any())
            {
                await _taiLieuService.DeleteAsync(taiLieus);
            }

            await DeleteAsync(new Phan { Id = id });
            await SaveAsync();

            return true;
        }
    }
}
