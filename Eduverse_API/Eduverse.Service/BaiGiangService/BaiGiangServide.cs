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
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly IPhanRepository _phanRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IMapper _mapper; 
        
        public BaiGiangService(
            IBaiGiangRepository baiGiangRepository, 
            IPhanRepository phanRepository, 
            IKhoaHocRepository khoaHocRepository,
            IHttpContextAccessor httpContextAccessor,
            ICloudinaryService cloudinaryService,
            ITaiLieuRepository taiLieuRepository,
            IMapper mapper
            ) : base(baiGiangRepository)
        {
            _baiGiangRepository = baiGiangRepository;
            _phanRepository = phanRepository;
            _khoaHocRepository = khoaHocRepository;
            _httpContextAccessor = httpContextAccessor;
            _cloudinaryService = cloudinaryService;
            _taiLieuRepository = taiLieuRepository;
            _mapper = mapper;
        }


        public async Task<BaiGiangDto> CreateBaiGiang(CreateBaiGiangRequest request)
        {
            var phanHoc = await _phanRepository.GetByIdAsync(request.Id);
            if (phanHoc == null) throw new Exception("Không tim thấy phần học");

            var khoaHoc = await  _khoaHocRepository.GetByIdAsync(request.Id);
            if (phanHoc == null) throw new Exception("Không tim thấy phần học");

            if (request.Video == null)
                throw new Exception("Vui lòng chọn video");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên bài giảng không được để trống");

            var upLoadResult = await _cloudinaryService.UploadVideoBaiGiangAsync(request.Video);

            int thoiLuongBaiGiang = (int)upLoadResult.ThoiLuong;

            var maxThuTu = await _baiGiangRepository
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
                CreatedBy = request.CreatedBy,
                LaBaiGiangFree = request.LaBaiGiangFree,
                TrangThai = request.TrangThai
            }; 

            _baiGiangRepository.Add(entity);

            //update tổng bài giảng và tổng thời lượng của khóa học
            khoaHoc.TongBaiGiang += 1;
            khoaHoc.TongThoiLuong += thoiLuongBaiGiang;
            _khoaHocRepository.Update(khoaHoc);


            await _baiGiangRepository.SaveAsync();
            return _mapper.Map<BaiGiang,BaiGiangDto>(entity);
        }


        public async Task<BaiGiangDto> UpdateBaiGiang(UpdateBaiGiangRequest request)
        {
            var entity = await _baiGiangRepository.GetByIdAsync(request.Id);
            if (entity == null) throw new Exception("Không tìm thấy bài giảng");

            var phanHoc = await _phanRepository.GetByIdAsync(request.Id);
            if (phanHoc == null) throw new Exception("Không tim thấy phần học");

            var khoaHoc = await _khoaHocRepository.GetByIdAsync(request.Id);
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
            entity.CreatedBy = request.CreatedBy;
            entity.LaBaiGiangFree = request.LaBaiGiangFree;
            entity.TrangThai = request.TrangThai;

            int? chenhlenh = entity.ThoiLuong - oldThoiLuong;
            khoaHoc.TongThoiLuong += chenhlenh;
            _khoaHocRepository.Update(khoaHoc);

            await _baiGiangRepository.SaveAsync();
            return _mapper.Map<BaiGiang, BaiGiangDto>(entity);
        }


        public async Task<bool> DeleteBaiGiang(Guid id)
        {
            var baiGiang = await _baiGiangRepository.GetByIdAsync(id);
            if (baiGiang == null)throw new Exception("Không tìm thấy bài giảng");

            var phanHoc = await _phanRepository.GetByIdAsync(baiGiang.IdPhan);
            if (phanHoc == null)throw new Exception("Không tìm thấy phần học");

            var khoaHoc = await _khoaHocRepository.GetByIdAsync(phanHoc.IdKhoaHoc);
            if (khoaHoc == null)throw new Exception("Không tìm thấy khóa học");


            var taiLieus = await _taiLieuRepository.GetQueryable()
                .Where(x => x.IdBaiGiang == baiGiang.Id)
                .ToListAsync();

            foreach (var taiLieu in taiLieus)
            {
                taiLieu.IsDeleted = true;
                taiLieu.DeletedDate = DateTime.UtcNow;
                //taiLieu.DeletedId = ;

                _taiLieuRepository.Update(taiLieu);
            }

            khoaHoc.TongBaiGiang -= 1;
            khoaHoc.TongThoiLuong -= baiGiang.ThoiLuong;
            _khoaHocRepository.Update(khoaHoc);

            baiGiang.IsDeleted = true;
            _baiGiangRepository.Update(baiGiang);
            await _baiGiangRepository.SaveAsync();
            return true;
        }
    }
}
