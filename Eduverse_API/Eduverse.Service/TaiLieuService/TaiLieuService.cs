using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TaiLieuService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TaiLieuService
{
    public class TaiLieuService : Service<Model.Entities.TaiLieu>, ITaiLieuService
    {
        private readonly IMapper _mapper;
        private IBaiGiangRepository _baiGiangRepository;
        public TaiLieuService( 
            IBaiGiangRepository baiGiangRepository,
            ITaiLieuRepository taiLieuRepository,
            IMapper mapper) : base(taiLieuRepository)
        {
            _baiGiangRepository = baiGiangRepository;
            _mapper = mapper;
        }

        public async Task<TaiLieuDto> CreateTaiLieu(CreateTaiLieuRequest request)
        {
            var baiGiang = await _baiGiangRepository.GetByIdAsync(request.IdBaiGiang);
            if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");

            if (string.IsNullOrWhiteSpace(request.TenTaiLieu)) { }

            var entity = new TaiLieu
            {
                IdBaiGiang = request.IdBaiGiang,
                TenTaiLieu = request.TenTaiLieu,
                URL = request.URL,
                LoaiTaiLieu = request.LoaiTaiLieu,
                TrangThai = request.TrangThai
            };

            await CreateAsync(entity);
            await SaveAsync();
            return _mapper.Map<TaiLieu, TaiLieuDto>(entity);
        }


        public async Task<TaiLieuDto> UpdateTaiLieu(UpdateTaiLieuRequest request)
        {
            var baiGiang = await GetByIdAsync(request.IdBaiGiang);
            if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");

            var entity = await GetByIdAsync(request.Id);
            if (entity == null) throw new Exception("Không tìm thấy tài liệu");

            entity.IdBaiGiang = request.IdBaiGiang;
            entity.TenTaiLieu = request.TenTaiLieu;
            entity.URL = request.URL;
            entity.LoaiTaiLieu = request.LoaiTaiLieu;
            entity.TrangThai = request.TrangThai;

            await CreateAsync(entity);
            await SaveAsync();
            return _mapper.Map<TaiLieu, TaiLieuDto>(entity);
        }


        public async Task<bool> DeleteTaiLieu(Guid id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null) throw new Exception("Không tìm thấy tài liệu");

            await DeleteAsync(entity);
            await SaveAsync();
            return true;

        }
    }
}
