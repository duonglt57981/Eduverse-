using CloudinaryDotNet.Actions;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiGiangService.Request;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.PhanService;
using Eduverse.Service.TaiLieuService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiGiangService
{
    public class BaiGiangService : Service<Model.Entities.BaiGiang>, IBaiGiangService
    {
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IPhanRepository _phanRepository;
        private readonly IMapper _mapper; 
        
        public BaiGiangService(
            IBaiGiangRepository baiGiangRepository,
            ICloudinaryService cloudinaryService,
            ITaiLieuService taiLieuService,
            IPhanRepository phanRepository,
            IMapper mapper) : base(baiGiangRepository)
        {
            _cloudinaryService = cloudinaryService;
            _taiLieuService = taiLieuService;
            _phanRepository = phanRepository;
            _mapper = mapper;
        }


        public async Task<BaiGiangDto> CreateBaiGiang(CreateBaiGiangRequest request)
        {
            try
            {
                var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan);
                if (phanHoc == null) throw new Exception("Không tim thấy phần học");

                if (request.Video == null)
                    throw new Exception("Vui lòng chọn video");

                if (string.IsNullOrWhiteSpace(request.TieuDe))
                    throw new Exception("Tên bài giảng không được để trống");

                var upLoadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

                int thoiLuongBaiGiang = (int)upLoadResult.ThoiLuong;

                var maxThuTu = await GetQueryable()
                        .Where(x => x.IdPhan == phanHoc.Id)
                        .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

                var entity = new BaiGiang
                {
                    IdPhan = request.IdPhan,
                    TieuDe = request.TieuDe,
                    LoaiBaiGiang = request.Video == null ? "Bài giảng doccument" : "Bài giảng video",
                    IdVideoBaiGiang = upLoadResult.IdVideoBaiGiang,
                    URLBaiGiang = upLoadResult.URLBaiGiang,
                    ThuTuSapXep = maxThuTu + 1,
                    ThoiLuong = thoiLuongBaiGiang,
                    LaBaiGiangFree = request.LaBaiGiangFree,
                    IsDeleted = false,
                    TrangThai = request.TrangThai
                };

                await CreateAsync(entity);
                await SaveAsync();
                return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

      
        public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        {
            try
            {
                var entity = await GetByIdAsync(request.Id);
                if (entity == null)throw new Exception("Không tìm thấy bài giảng");

                if((entity.URLBaiGiang == null && entity.IdVideoBaiGiang == null) || request.Video == null)
                {
                    throw new Exception("Chưa có bài giảng");
                }

                if (string.IsNullOrWhiteSpace(request.TieuDe)) throw new Exception("Tên bài giảng không được để trống");

                var oldThoiLuong = entity.ThoiLuong;

                if (request.Video != null)
                {
                    var (newPublicId, newUrl, thoiLuong) = await _cloudinaryService.UpdateVideoAsync(request.Video, entity.IdVideoBaiGiang);

                    entity.IdVideoBaiGiang = newPublicId;
                    entity.URLBaiGiang = newUrl;
                    entity.ThoiLuong = thoiLuong;
                    entity.LoaiBaiGiang = "Bài giảng video";
                }

                if (request.IdPhan.HasValue && request.IdPhan != entity.IdPhan)
                {
                    var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
                    if (phanHoc == null)
                        throw new Exception("Không tìm thấy phần học");

                    entity.IdPhan = phanHoc.Id;
                }
                else
                {
                    entity.IdVideoBaiGiang = entity.IdVideoBaiGiang;
                    entity.URLBaiGiang = entity.URLBaiGiang;
                    entity.ThoiLuong = entity.ThoiLuong;
                    entity.LoaiBaiGiang = entity.LoaiBaiGiang;
                }

                var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                x.IdPhan == request.IdPhan &&
                x.ThuTuSapXep == request.ThuTuSapXep &&
                x.Id != request.Id &&
                !x.IsDeleted);

                if (thuTuDaTon)
                    throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại bài giảng này");

                entity.TieuDe = request.TieuDe;
                entity.ThuTuSapXep = request.ThuTuSapXep;
                entity.LaBaiGiangFree = request.LaBaiGiangFree;
                entity.TrangThai = request.TrangThai;

                await UpdateAsync(entity);
                await SaveAsync();

                return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            try
            {
                var baiGiang = await GetByIdAsync(id);
                if (baiGiang == null) throw new Exception("Không tìm thấy bài giảng");

                var taiLieus = await _taiLieuService.GetQueryable()
                    .Where(x => x.IdBaiGiang == baiGiang.Id)
                    .ToListAsync();

                await _taiLieuService.DeleteRange(taiLieus);
                await DeleteAsync(baiGiang);
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
