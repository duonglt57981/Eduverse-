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
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.IdPhan == null)
                throw new Exception("Id phần học không hợp lệ");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            if (request.Video == null)
                throw new Exception("Vui lòng chọn video");

            var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
            if (phanHoc == null)
                throw new Exception("Không tìm thấy phần học");

            var uploadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

            int thoiLuongBaiGiang = (int)uploadResult.ThoiLuong;

            var query = GetQueryable();

            var maxThuTu = await query
                .Where(x => x.IdPhan == request.IdPhan.Value)
                .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

            var entity = new BaiGiang
            {
                IdPhan = request.IdPhan.Value,
                TieuDe = request.TieuDe.Trim(),
                LoaiBaiGiang = "Bài giảng video",
                IdVideoBaiGiang = uploadResult.IdVideoBaiGiang,
                URLBaiGiang = uploadResult.URLBaiGiang,
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


        public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            if (request.IdPhan == null)
                throw new Exception("Id phần học không hợp lệ");

            var entity = await GetByIdAsync(request.Id);
            if (entity == null)
                throw new Exception("Không tìm thấy bài giảng");

            var phanHoc = await _phanRepository.GetByIdAsync(request.IdPhan.Value);
            if (phanHoc == null)
                throw new Exception("Không tìm thấy phần học");

            var thuTuDaTon = await GetQueryable()
                .AnyAsync(x =>
                    x.IdPhan == request.IdPhan &&
                    x.ThuTuSapXep == request.ThuTuSapXep &&
                    x.Id != request.Id &&
                    !x.IsDeleted);

            if (thuTuDaTon)
                throw new Exception($"Thứ tự {request.ThuTuSapXep} đã tồn tại bài giảng này");

            if (request.Video != null)
            {
                var (newPublicId, newUrl, thoiLuong) =
                    await _cloudinaryService.UpdateVideoAsync(request.Video, entity.IdVideoBaiGiang);

                entity.IdVideoBaiGiang = newPublicId;
                entity.URLBaiGiang = newUrl;
                entity.ThoiLuong = (int)thoiLuong;
                entity.LoaiBaiGiang = "Bài giảng video";
            }

            entity.IdPhan = request.IdPhan.Value;
            entity.TieuDe = request.TieuDe.Trim();
            entity.ThuTuSapXep = request.ThuTuSapXep;
            entity.LaBaiGiangFree = request.LaBaiGiangFree;
            entity.TrangThai = request.TrangThai;

            await UpdateAsync(entity);
            await SaveAsync();

            return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
        }


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            var exists = await GetQueryable()
                .AnyAsync(x => x.Id == id && !x.IsDeleted);

            if (!exists)
                throw new Exception("Không tìm thấy bài giảng");

            // soft delete tài liệu
            var taiLieus = await _taiLieuService.GetQueryable()
                .Where(x => x.IdBaiGiang == id && !x.IsDeleted)
                .ToListAsync();

            foreach (var tl in taiLieus)
            {
                tl.DeletedDate = DateTime.UtcNow;
            }

            await _taiLieuService.DeleteRange(taiLieus);

            // soft delete bài giảng
            var baiGiang = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == id);

            baiGiang.DeletedDate = DateTime.UtcNow;

            await DeleteAsync(baiGiang);
            await SaveAsync();

            return true;
        }
    }
}
