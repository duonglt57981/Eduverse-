using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.Common;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.PhanService;
using Eduverse.Service.TienDoHocTapService.Dto;
using Eduverse.Service.TienDoHocTapService.Request;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService
{
    public class TienDoHocTapService : Service<TienDoHocTap>, ITienDoHocTapService
    {
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly ITienDoHocTapRepository _tienDoHocTapRepository;
        private readonly IKhoaHocService _khoaHocService;
        private readonly IPhanRepository _phanRepository;
        public TienDoHocTapService(
            ITienDoHocTapRepository tienDoHocTapRepository,
            IBaiGiangRepository baiGiangRepository,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            IKhoaHocService khoaHocService,
            IPhanRepository phanRepository
            ) : base(tienDoHocTapRepository)
        {
            _baiGiangRepository = baiGiangRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository ;
            _tienDoHocTapRepository = tienDoHocTapRepository ;
            _khoaHocService = khoaHocService ;
            _phanRepository = phanRepository ;
        }

        #region UpDateTienDoBaiGiang
        #region Helper: Xác định ID chuẩn
        private async Task<Guid> GetBaiGiangIdChuanChoTienDo(Guid idBaiGiang, DateTime ngayDangKy)
        {
            var baiGiang = await _baiGiangRepository.GetQueryable()
                .Where(x => x.Id == idBaiGiang && !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.IsBanHienTai,
                    x.IdBanGhiTruoc,
                    x.CreatedDate
                })
                .FirstOrDefaultAsync();

            if (baiGiang == null)
                return idBaiGiang;

            if (baiGiang.IsBanHienTai == true)
            {
                var swapTruocDangKy = await _baiGiangRepository.GetQueryable()
                    .Where(x => x.IdBanGhiTruoc == baiGiang.Id
                             && x.IsBanHienTai == false
                             && !x.IsDeleted
                             && x.CreatedDate <= ngayDangKy)
                    .OrderByDescending(x => x.CreatedDate)
                    .Select(x => x.Id)
                    .FirstOrDefaultAsync();

                if (swapTruocDangKy != Guid.Empty)
                    return swapTruocDangKy;
                else
                    return baiGiang.Id;
            }
            else
            {
                var gocId = baiGiang.IdBanGhiTruoc ?? baiGiang.Id;
                if (baiGiang.CreatedDate <= ngayDangKy)
                    return baiGiang.Id;
                else
                    return gocId;
            }
        }
        #endregion

        #region UpdateTienDoBaiGiang
        public async Task UpdateTienDoBaiGiang(UpdateTienDoBaiGiangRequest request)
        {
            if (request.IdDangKyKhoaHoc == Guid.Empty)
                throw new Exception("Id đăng ký không hợp lệ");

            if (request.IdBaiGiang == Guid.Empty)
                throw new Exception("Id bài giảng không hợp lệ");

            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .Where(x => x.Id == request.IdDangKyKhoaHoc && !x.IsDeleted)
                .Select(x => new { x.IdKhoaHoc, x.CreatedDate })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Đăng ký không tồn tại");


            var baiGiangInfo = await _baiGiangRepository.GetQueryable()
                .Where(x => x.Id == request.IdBaiGiang && !x.IsDeleted)
                .Select(x => new { x.ThoiLuong })
                .FirstOrDefaultAsync();

            if (baiGiangInfo == null)
                throw new Exception("Không tìm thấy bài giảng");

            var nguongHoanThanh = (baiGiangInfo.ThoiLuong ?? 0) * 0.9;

            var tienDo = await _tienDoHocTapRepository.GetQueryable()
                .FirstOrDefaultAsync(x =>
                    x.IdDangKi == request.IdDangKyKhoaHoc &&
                    x.IdBaiGiang == request.IdBaiGiang &&
                    !x.IsDeleted);

            var now = DateTime.UtcNow;

            if (tienDo == null)
            {
                tienDo = new TienDoHocTap
                {
                    Id = Guid.NewGuid(),
                    IdDangKi = request.IdDangKyKhoaHoc,
                    IdBaiGiang = request.IdBaiGiang,
                    ThoiGianXem = request.ThoiGianXem,
                    LanCuoiXem = now,
                    TrangThai = request.ThoiGianXem >= nguongHoanThanh ? "HoanThanh" : "DangHoc",
                    CreatedDate = now,
                    UpdatedDate = now
                };

                if (tienDo.TrangThai == "HoanThanh")
                    tienDo.ThoiGianHoanThanh = now;

                 _tienDoHocTapRepository.Add(tienDo);
            }
            else
            {
                if (request.ThoiGianXem > (tienDo.ThoiGianXem ?? 0))
                {
                    tienDo.ThoiGianXem = request.ThoiGianXem;
                    tienDo.LanCuoiXem = now;
                    tienDo.UpdatedDate = now;

                    if (tienDo.ThoiGianXem >= nguongHoanThanh && tienDo.TrangThai != "HoanThanh")
                    {
                        tienDo.TrangThai = "HoanThanh";
                        tienDo.ThoiGianHoanThanh = now;
                    }
                    else if (tienDo.ThoiGianXem < nguongHoanThanh && tienDo.TrangThai != "HoanThanh")
                    {
                        tienDo.TrangThai = "DangHoc";
                    }

                     _tienDoHocTapRepository.Update(tienDo);
                }
            }

            await _tienDoHocTapRepository.SaveAsync();

            var phanTram = await _khoaHocService.TinhPhanTramHoanThanh(request.IdDangKyKhoaHoc, dangKy.CreatedDate);

            if (phanTram >= 100)
            {
                var phanIds = await _phanRepository.GetQueryable()
                    .Where(x => x.IdKhoaHoc == dangKy.IdKhoaHoc && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();
            }
        }
        #endregion 

        #region HoanThanhBaiGiang
        public async Task<double> HoanThanhBaiGiang(Guid? idDangKy, Guid? idBaiGiang, int thoiGianXem)
        {
            if (!idDangKy.HasValue || !idBaiGiang.HasValue)
                throw new Exception("Id không hợp lệ");

            var request = new UpdateTienDoBaiGiangRequest
            {
                IdDangKyKhoaHoc = idDangKy.Value,
                IdBaiGiang = idBaiGiang.Value,
                ThoiGianXem = thoiGianXem
            };

            await UpdateTienDoBaiGiang(request);

            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .Select(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            return await _khoaHocService.TinhPhanTramHoanThanh(idDangKy, dangKy);
        }
        #endregion
        #endregion

        public async Task<TienDoKhoaHocDto> GetTienDoKhoaHoc(Guid idDangKy)
        {
            var danhSachHoanThanh = await GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdDangKi == idDangKy &&
                    x.IdBaiGiang != null &&
                    x.TrangThai == "HoanThanh" &&
                    !x.IsDeleted)
                .Select(x => x.IdBaiGiang!.Value)
                .Distinct()
                .ToListAsync();

            return new TienDoKhoaHocDto
            {
                BaiGiangHoanThanh = danhSachHoanThanh.Count,
                DanhSachBaiGiangHoanThanh = danhSachHoanThanh
            };
        }
    }
}
