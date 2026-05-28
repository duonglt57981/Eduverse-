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
            try
            {
                var KhoaHoc = await _khoaHocRepository.GetByIdAsync(request.IdKhoaHoc);
                if (KhoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                if (string.IsNullOrWhiteSpace(request.TenPhan))
                    throw new Exception("Vui lòng nhập tên phần học");

                var maxThuTu = await GetQueryable()
                    .Where(x => x.IdKhoaHoc == KhoaHoc.Id)
                    .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

                var entity = new PhanHocDto
                {
                    IdKhoaHoc = request.IdKhoaHoc,
                    TenPhan = request.TenPhan,
                    ThuTuSapXep = maxThuTu + 1
                };

                await CreateAsync(entity);
                await SaveAsync();

                return _mapper.Map<Phan,PhanHocDto>(entity);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<PhanHocDto> UpdatePhanHoc(UpdatePhanRequest request)
        {
            try
            {
                var KhoaHoc = await _khoaHocRepository.GetByIdAsync(request.IdKhoaHoc);
                if (KhoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                var entity = await GetByIdAsync(request.Id);
                if (entity == null)throw new Exception("Không tìm thấy phần học");

                if (string.IsNullOrWhiteSpace(request.TenPhan))
                    throw new Exception("Vui lòng nhập tên phần học");

                var thuTuDaTon = await GetQueryable().AnyAsync(x =>
                x.IdKhoaHoc == request.IdKhoaHoc &&
                x.ThuTuSapXep == request.ThuTuSapXep &&
                x.Id != request.Id &&
                !x.IsDeleted);

                if (thuTuDaTon)
                    throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại trong phần học này");


                entity.IdKhoaHoc = request.IdKhoaHoc;
                entity.TenPhan = request.TenPhan;
                entity.ThuTuSapXep = request.ThuTuSapXep;

                await UpdateAsync(entity);
                await SaveAsync();
                return _mapper.Map<Phan,PhanHocDto>(entity);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<bool> DeletePhanHoc(Guid id)
        {
            try
            {
                var phanHoc = await GetByIdAsync(id);
                if (phanHoc == null) throw new Exception("Không tìm thấy phần học");

                var khoaHoc = await GetByIdAsync(phanHoc.IdKhoaHoc);
                if (khoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                var BaiGiangs = await _baiGiangService
                    .GetQueryable()
                    .Where(x => x.IdPhan == phanHoc.Id)
                    .ToListAsync();
                await _baiGiangService.DeleteAsync(BaiGiangs);


                var BaiGiangIds = BaiGiangs.Select(x => x.Id).ToList();
                var taiLieus = await _taiLieuService
                    .GetQueryable()
                    .Where(x => BaiGiangIds.Contains(x.IdBaiGiang.Value))
                    .ToListAsync();
                await _taiLieuService.DeleteAsync(taiLieus);


                await DeleteAsync(phanHoc);
                await SaveAsync();
                return true;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            } 
        }
    }
}
