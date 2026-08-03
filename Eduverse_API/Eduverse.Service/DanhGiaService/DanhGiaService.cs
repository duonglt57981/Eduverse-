using Eduverse.Model.Entities;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Service.Common;
using Eduverse.Service.DanhGiaService.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhGiaService
{
    public class DanhGiaService : Service<Model.Entities.DanhGia>, IDanhGiaService
    {
        private readonly IDanhGiaRepository _danhGiaRepo;
        private readonly IDangKyKhoaHocRepository _dangKyRepo;
        public DanhGiaService(
        IDanhGiaRepository danhGiaRepo,
        IDangKyKhoaHocRepository dangKyRepo
        ) : base(danhGiaRepo)
        {
            _danhGiaRepo = danhGiaRepo;
            _dangKyRepo = dangKyRepo;
        }
        public async Task<bool> KiemTraDaMuaAsync(Guid userId, Guid idKhoaHoc)
        {
            return await _dangKyRepo.AnyAsync(x =>
                x.IdNguoiDangKi == userId &&
                x.IdKhoaHoc == idKhoaHoc &&
                x.IsDangKy == true &&
                !x.IsDeleted);
        }

        // Kiểm tra đã đánh giá chưa
        public async Task<bool> KiemTraDaDanhGiaAsync(Guid userId, Guid idKhoaHoc)
        {
            return await _danhGiaRepo.AnyAsync(x =>
                x.CreatedId == userId &&
                x.IdKhoaHoc == idKhoaHoc &&
                !x.IsDeleted);
        }

        // Tạo đánh giá
        public async Task TaoDanhGiaAsync(Guid userId, TaoDanhGiaDto dto)
        {
            var daMua = await KiemTraDaMuaAsync(userId, dto.IdKhoaHoc);
            if (!daMua)
                throw new Exception("Bạn cần mua khóa học trước khi đánh giá");

            var daDanhGia = await KiemTraDaDanhGiaAsync(userId, dto.IdKhoaHoc);
            if (daDanhGia)
                throw new Exception("Bạn đã đánh giá khóa học này rồi");

            if (dto.SoSao < 1 || dto.SoSao > 5)
                throw new Exception("Số sao phải từ 1 đến 5");

            var danhGia = new DanhGia
            {
                IdKhoaHoc = dto.IdKhoaHoc,
                SoSao = dto.SoSao,
                NoiDung = dto.NoiDung?.Trim(),
                TrangThai = "HienThi",
                CreatedId = userId,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
            };
            _danhGiaRepo.Add(danhGia);
            await _danhGiaRepo.SaveAsync();
        }

        // Lấy danh sách đánh giá theo khóa học
        public async Task<DanhGiaKhoaHocDto> GetDanhGiaByKhoaHocAsync(Guid idKhoaHoc)
        {
            var danhSach = await _danhGiaRepo.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted && x.TrangThai == "HienThi")
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            var tongSao = danhSach.Any() ? danhSach.Average(x => x.SoSao ?? 0) : 0;

            return new DanhGiaKhoaHocDto
            {
                TongSoDanhGia = danhSach.Count,
                DiemTrungBinh = Math.Round(tongSao, 1),
                PhanBoSao = Enumerable.Range(1, 5).ToDictionary(
                    s => s,
                    s => danhSach.Count(x => x.SoSao == s)
                ),
                DanhSach = danhSach.Select(x => new DanhGiaDto
                {
                    Id = x.Id,
                    SoSao = x.SoSao ?? 0,
                    NoiDung = x.NoiDung,
                    NgayTao = x.CreatedDate,
                    IdNguoiDung = x.CreatedId,
                }).ToList()
            };
        }
    }
}
