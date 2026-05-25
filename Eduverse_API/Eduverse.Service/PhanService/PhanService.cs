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
        private readonly IPhanService _phanService;
        private readonly IBaiGiangService _baiGiangService;
        private readonly IKhoaHocService _khoaHocService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public PhanService(
            IPhanRepository phanRepository,
            IPhanService phanService,
            IBaiGiangService baiGiangService,
            IKhoaHocService khoaHocService,
            ITaiLieuService taiLieuService,
            IHttpContextAccessor httpContextAccessor,
            Service.Core.Mapper.IMapper mapper

            ) : base(phanRepository)
        {
            _mapper = mapper;
            _phanService = phanService;
            _baiGiangService = baiGiangService;
            _khoaHocService = khoaHocService;
            _taiLieuService = taiLieuService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PhanHocDto> CreatePhanHoc(CreatePhanRequest request)
        {
            try
            {

                var KhoaHoc = await _khoaHocService.GetByIdAsync(request.IdKhoaHoc);
                if (KhoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                var maxThuTu = await _phanService
                    .Where(x => x.IdKhoaHoc == KhoaHoc.Id)
                    .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

                var entity = new PhanHocDto
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = request.IdKhoaHoc,
                    TenPhan = request.TenPhan,
                    CreatedDate = DateTime.UtcNow,
                    //CreatedBy =
                    ThuTuSapXep = maxThuTu + 1
                };

                await _phanService.CreateAsync(entity);
                await _phanService.SaveAsync();

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
                var KhoaHoc = await _khoaHocService.GetByIdAsync(request.IdKhoaHoc);
                if (KhoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                var entity = await _phanService.GetByIdAsync(request.Id);
                if (entity == null)throw new Exception("Không tìm thấy phần học");

                var khoaHoc = await _khoaHocService.GetByIdAsync(request.IdKhoaHoc);
                if (khoaHoc == null)throw new Exception("Không tìm thấy khóa học");

                entity.IdKhoaHoc = request.IdKhoaHoc;
                entity.TenPhan = request.TenPhan;
                entity.UpdatedDate = DateTime.UtcNow;
                //entity.UpdatedBy = 
                entity.ThuTuSapXep = request.ThuTuSapXep;

                await _phanService.UpdateAsync(entity);
                await _phanService.SaveAsync();
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
                var phanHoc = await _phanService.GetByIdAsync(id);
                if (phanHoc == null) throw new Exception("Không tìm thấy phần học");

                var khoaHoc = await _khoaHocService.GetByIdAsync(phanHoc.IdKhoaHoc);
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


                await _phanService.DeleteAsync(phanHoc);
                await _phanService.SaveAsync();
                return true;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            } 
        }
    }
}
