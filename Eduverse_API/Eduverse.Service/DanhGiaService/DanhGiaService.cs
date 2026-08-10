using Eduverse.Model.Entities;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.PhanHoiDanhGiaRepository;
using Eduverse.Service.AppUserService;
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
        private readonly IPhanHoiDanhGiaRepository _phanHoiRepo;
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepo;
        private readonly IAppUserService _appUserService;
        public DanhGiaService(
        IDanhGiaRepository danhGiaRepo,
        IDangKyKhoaHocRepository dangKyRepo,
        IPhanHoiDanhGiaRepository phanHoiRepo,
        IKhoaHoc_GiangVienRepository khoaHocGVRepo,
        IAppUserService appUserService
        ) : base(danhGiaRepo)
        {
            _danhGiaRepo = danhGiaRepo;
            _dangKyRepo = dangKyRepo;
            _phanHoiRepo = phanHoiRepo;
            _khoaHocGVRepo = khoaHocGVRepo;
            _appUserService = appUserService;
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

            var userIds = danhSach
                .Where(x => x.CreatedId.HasValue)
                .Select(x => x.CreatedId!.Value).Distinct().ToList();

            var users = await _appUserService.GetQueryable()
                .Where(x => userIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            var danhGiaIds = danhSach.Select(x => x.Id).ToList();
            var phanHois = await _phanHoiRepo.GetQueryable()
                .Where(x => danhGiaIds.Contains(x.IdDanhGia) && !x.IsDeleted)
                .ToListAsync();

            var phanHoiUserIds = phanHois
                .Where(x => x.CreatedId.HasValue)
                .Select(x => x.CreatedId!.Value).Distinct().ToList();

            var phanHoiUsers = await _appUserService.GetQueryable()
                .Where(x => phanHoiUserIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
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
                DanhSach = danhSach.Select(x =>
                {
                    var u = users.FirstOrDefault(u => u.Id == x.CreatedId);
                    var ph = phanHois.FirstOrDefault(p => p.IdDanhGia == x.Id);
                    var phUser = ph != null
                        ? phanHoiUsers.FirstOrDefault(u => u.Id == ph.CreatedId)
                        : null;
                    return new DanhGiaDto
                    {
                        Id = x.Id,
                        SoSao = x.SoSao ?? 0,
                        NoiDung = x.NoiDung,
                        NgayTao = x.CreatedDate,
                        IdNguoiDung = x.CreatedId,
                        HoTenNguoiDung = u?.HoTen,
                        AnhNguoiDung = u?.AnhDaiDien,
                        PhanHoi = ph == null ? null : new PhanHoiDanhGiaDto
                        {
                            Id = ph.Id,
                            NoiDung = ph.NoiDung,
                            NgayTao = ph.CreatedDate,
                            HoTenGV = phUser?.HoTen,
                            AnhGV = phUser?.AnhDaiDien,
                        },
                    };
                }).ToList(),
            };
        }

        public async Task PhanHoiDanhGia(Guid userId, TaoPhanHoiDto dto)
        {
            var danhGia = await _danhGiaRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == dto.IdDanhGia && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy đánh giá");

            // Kiểm tra GV có quyền với khóa học này
            var laGV = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == danhGia.IdKhoaHoc
                            && x.IdGiangVien == userId
                            && !x.IsDeleted);
            if (!laGV) throw new Exception("Bạn không có quyền phản hồi đánh giá này");

            // Chỉ 1 phản hồi / đánh giá
            var daTonTai = await _phanHoiRepo.GetQueryable()
                .AnyAsync(x => x.IdDanhGia == dto.IdDanhGia && !x.IsDeleted);
            if (daTonTai) throw new Exception("Đánh giá này đã được phản hồi");

            _phanHoiRepo.Add(new PhanHoiDanhGia
            {
                IdDanhGia = dto.IdDanhGia,
                NoiDung = dto.NoiDung.Trim(),
                CreatedId = userId,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
            });
            await _phanHoiRepo.SaveAsync();
        }

        public async Task SuaPhanHoi(Guid userId, Guid idPhanHoi, string noiDung)
        {
            var phanHoi = await _phanHoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idPhanHoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy phản hồi");

            if (phanHoi.CreatedId != userId)
                throw new Exception("Bạn không có quyền sửa phản hồi này");

            phanHoi.NoiDung = noiDung.Trim();
            phanHoi.UpdatedDate = DateTime.Now;
            _phanHoiRepo.Update(phanHoi);
            await _phanHoiRepo.SaveAsync();
        }

        public async Task XoaPhanHoi(Guid userId, Guid idPhanHoi)
        {
            var phanHoi = await _phanHoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idPhanHoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy phản hồi");

            if (phanHoi.CreatedId != userId)
                throw new Exception("Bạn không có quyền xóa phản hồi này");

            _phanHoiRepo.Delete(phanHoi);
            await _phanHoiRepo.SaveAsync();
        }
    }
}
