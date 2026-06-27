using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.Common;
using Eduverse.Service.DangKyKhoaHocService;
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
        private readonly IBaiGiangService _baiGiangService;
        ////private readonly IDangKyKhoaHocService _dangKyKhoaHocService;
        //private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IPhanService _phanService;
        public TienDoHocTapService(
            ITienDoHocTapRepository tienDoHocTapRepository,
            IBaiGiangService baiGiangService,
            IPhanService phanService
            //IDangKyKhoaHocService dangKyKhoaHocService,
            //IDangKyKhoaHocRepository dangKyKhoaHocRepository
            ) : base(tienDoHocTapRepository)
        {
            _baiGiangService = baiGiangService;
            //_dangKyKhoaHocService = dangKyKhoaHocService;
            _phanService = phanService;
            //_dangKyKhoaHocRepository = dangKyKhoaHocRepository;
        }

        public async Task UpdateTienDoBaiGiang(UpdateTienDoBaiGiangRequest request)
        {
            if (request.IdDangKyKhoaHoc == Guid.Empty)
                throw new Exception("Id đăng ký không hợp lệ");

            if (request.IdBaiGiang == Guid.Empty)
                throw new Exception("Id bài giảng không hợp lệ");

            var baiGiang = await _baiGiangService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.Id == request.IdBaiGiang &&
                    !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.ThoiLuong
                })
                .FirstOrDefaultAsync();

            if (baiGiang == null)
                throw new Exception("Không tìm thấy bài giảng");

            var tienDo = await GetQueryable()
                .FirstOrDefaultAsync(x =>
                    x.IdDangKi == request.IdDangKyKhoaHoc &&
                    x.IdBaiGiang == request.IdBaiGiang &&
                    !x.IsDeleted);

            var now = DateTime.UtcNow;

            var nguongHoanThanh = (baiGiang.ThoiLuong ?? 0) * 0.9;

            if (tienDo == null)
            {
                tienDo = new TienDoHocTap
                {
                    Id = Guid.NewGuid(),
                    IdDangKi = request.IdDangKyKhoaHoc,
                    IdBaiGiang = request.IdBaiGiang,
                    ThoiGianXem = request.ThoiGianXem,
                    LanCuoiXem = now,
                    TrangThai = "DangHoc",
                    CreatedDate = now,
                    UpdatedDate = now
                };

                if (request.ThoiGianXem >= nguongHoanThanh)
                {
                    tienDo.TrangThai = "HoanThanh";
                    tienDo.ThoiGianHoanThanh = now;
                }

                await CreateAsync(tienDo);
            }
            else
            {
                tienDo.ThoiGianXem = Math.Max( tienDo.ThoiGianXem ?? 0, request.ThoiGianXem);

                tienDo.LanCuoiXem = now;

                if (tienDo.ThoiGianXem >= nguongHoanThanh)
                {
                    tienDo.TrangThai = "HoanThanh";
                    tienDo.ThoiGianHoanThanh ??= now;
                }
                else
                {
                    tienDo.TrangThai = "DangHoc";
                }

                tienDo.UpdatedDate = now;

                await UpdateAsync(tienDo);
            }

            await SaveAsync();
        }

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
