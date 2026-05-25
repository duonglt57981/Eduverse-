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
        private readonly IBaiGiangService _baiGiangService;
        private readonly IPhanService _phanService;
        private readonly IKhoaHocService _khoaHocService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IMapper _mapper; 
        
        public BaiGiangService(
            IBaiGiangRepository baiGiangRepository,
            IPhanService phanService,
            IKhoaHocService khoaHocService,
            IHttpContextAccessor httpContextAccessor,
            ICloudinaryService cloudinaryService,
            ITaiLieuService taiLieuService,
            IMapper mapper
            ) : base(baiGiangRepository)
        {
            _phanService = phanService;
            _khoaHocService = khoaHocService;
            _httpContextAccessor = httpContextAccessor;
            _cloudinaryService = cloudinaryService;
            _taiLieuService = taiLieuService;
            _mapper = mapper;
            _taiLieuService = taiLieuService;
        }


        public async Task<BaiGiangDto> CreateBaiGiang(CreateBaiGiangRequest request)
        {
            var phanHoc = await _phanService.GetByIdAsync(request.IdPhan);
            if (phanHoc == null) throw new Exception("Không tim thấy phần học");

            if (request.Video == null)
                throw new Exception("Vui lòng chọn video");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            var upLoadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

            int thoiLuongBaiGiang = (int)upLoadResult.ThoiLuong;

            var maxThuTu = await _baiGiangService
                    .Where(x => x.IdPhan == phanHoc.Id)
                    .MaxAsync(x => (int?)x.ThuTuSapXep) ?? 0;

            var entity = new BaiGiangDto
            {
                IdPhan = request.IdPhan,
                TieuDe = request.TieuDe,
                LoaiBaiGiang = request.Video == null ? "Bài giảng doccument" : "Bài giảng video",
                IdVideoBaiGiang = upLoadResult.IdVideoBaiGiang,
                URLBaiGiang = upLoadResult.URLBaiGiang,
                ThuTuSapXep = maxThuTu + 1,
                ThoiLuong = thoiLuongBaiGiang,
                CreatedDate = DateTime.UtcNow,
                //CreatedBy = request.CreatedBy,
                LaBaiGiangFree = request.LaBaiGiangFree,
                IsDeleted = false,
                TrangThai = request.TrangThai
            };

            await _baiGiangService.CreateAsync(entity);
            await _baiGiangService.SaveAsync();
            return _mapper.Map<BaiGiang,BaiGiangDto>(entity);
        }


        public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        {
            var entity = await _baiGiangService.GetByIdAsync(request.Id);
            if (entity == null) throw new Exception("Không tìm thấy bài giảng");

            var phanHoc = await _phanService.GetByIdAsync(request.Id);
            if (phanHoc == null) throw new Exception("Không tim thấy phần học");

            if (request.Video == null)
                throw new Exception("Vui lòng chọn video");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            int? oldThoiLuong = entity.ThoiLuong;

            var upLoadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

            int thoiLuongBaiGiang = (int)upLoadResult.ThoiLuong;

            entity.IdPhan = phanHoc.Id;
            entity.TieuDe = request.TieuDe;
            entity.LoaiBaiGiang = request.Video == null ? "Bài giảng doccument" : "Bài giảng video";
            entity.IdVideoBaiGiang = upLoadResult.IdVideoBaiGiang;
            entity.URLBaiGiang = upLoadResult.URLBaiGiang;
            entity.ThuTuSapXep = request.ThuTuSapXep;
            entity.ThoiLuong = thoiLuongBaiGiang;
            entity.CreatedDate = DateTime.UtcNow;
            //entity.CreatedBy = request.CreatedBy;
            entity.LaBaiGiangFree = request.LaBaiGiangFree;
            entity.TrangThai = request.TrangThai;

            await _baiGiangService.SaveAsync();
            return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
        }


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            var baiGiang = await _baiGiangService.GetByIdAsync(id);
            if (baiGiang == null)throw new Exception("Không tìm thấy bài giảng");

            var phanHoc = await _phanService.GetByIdAsync(baiGiang.IdPhan);
            if (phanHoc == null)throw new Exception("Không tìm thấy phần học");

            var taiLieus = await _taiLieuService.GetQueryable()
                .Where(x => x.IdBaiGiang == baiGiang.Id)
                .ToListAsync();

            await _taiLieuService.DeleteRange(taiLieus);
            await _baiGiangService.DeleteAsync(baiGiang);
            await _baiGiangService.SaveAsync();
            return true;
        }
    }
}
