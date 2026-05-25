using AutoMapper;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.PhanService.Request;
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
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public PhanService(
            IPhanRepository phanRepository, 
            IKhoaHocRepository khoaHocRepository, 
            IBaiGiangRepository baiGiangRepository,
            IHttpContextAccessor httpContextAccessor,
            Service.Core.Mapper.IMapper mapper

            ) : base(phanRepository)
        {
            _mapper = mapper;
            _phanRepository = phanRepository;
            _baiGiangRepository = baiGiangRepository;
            _khoaHocRepository = khoaHocRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PhanHocDto> CreatePhanHoc(CreatePhanRequest request)
        {
            try
            {

                var KhoaHoc = await _khoaHocRepository.GetByIdAsync(request.IdKhoaHoc);
                if (KhoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                var maxThuTu = await _phanRepository
                    .Where(x => x.IdKhoaHoc == KhoaHoc.Id)
                    .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

                var entity = new PhanHocDto
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = request.IdKhoaHoc,
                    TenPhan = request.TenPhan,
                    CreatedDate = DateTime.UtcNow,
                    CreatedBy = request.CreatedBy,
                    ThuTuSapXep = maxThuTu + 1
                };

                _phanRepository.Add(entity);
                await _phanRepository.SaveAsync();

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
                var entity = await _phanRepository.GetByIdAsync(request.Id);

                if (entity == null)
                    throw new Exception("Không tìm thấy phần học");

                var khoaHoc = await _khoaHocRepository
                    .GetByIdAsync(request.IdKhoaHoc);

                if (khoaHoc == null)
                    throw new Exception("Không tìm thấy khóa học");

                entity.IdKhoaHoc = request.IdKhoaHoc;
                entity.TenPhan = request.TenPhan;
                entity.UpdatedDate = DateTime.UtcNow;
                entity.UpdatedBy = request.UpdatedBy;
                entity.ThuTuSapXep = request.ThuTuSapXep;

                _phanRepository.Update(entity);

                await _phanRepository.SaveAsync();

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
                var phanHoc = await _phanRepository.GetByIdAsync(id);
                if (phanHoc == null) throw new Exception("Không tìm thấy phần học");

                var khoaHoc = await _khoaHocRepository.GetByIdAsync(phanHoc.IdKhoaHoc);
                if (khoaHoc == null) throw new Exception("Không tìm thấy khóa học");

                var dsBaiGiang = await _baiGiangRepository.GetQueryable()
                    .Where(x => x.IdPhan == phanHoc.Id).ToListAsync();
                

                foreach (var baiGiang in dsBaiGiang)
                {
                    baiGiang.IsDeleted = true;
                    baiGiang.DeletedDate = DateTime.UtcNow;
                    //taiLieu.DeletedId = ;

                    _baiGiangRepository.Update(baiGiang);
                }

                phanHoc.IsDeleted = true;
                _phanRepository.Update(phanHoc);

                await _phanRepository.SaveAsync();
                return true;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            } 
        }
    }
}
