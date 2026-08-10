using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DonHang_KhuyenMaiRepository;
using Eduverse.Repository.DonHangChiTietRepository;
using Eduverse.Repository.DonHangRepositoryRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.ThanhToanRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.ThongKeKhoaHocService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThongKeKhoaHocService
{
    public class ThongKeKhoaHocService : IThongKeKhoaHocService
    {
        private readonly IDonHangChiTietRepository _chiTietRepo;
        private readonly IDonHangRepository _donHangRepo;
        private readonly IDonHang_KhuyenMaiRepository _kmRepo;
        private readonly IDangKyKhoaHocRepository _dangKyRepo;
        private readonly IThanhToanRepository _thanhToanRepo;
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepo;
        private readonly IAppUserService _appUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ThongKeKhoaHocService(
        IDonHangChiTietRepository chiTietRepo,
        IDonHangRepository donHangRepo,
        IDonHang_KhuyenMaiRepository kmRepo,
        IDangKyKhoaHocRepository dangKyRepo,
        IThanhToanRepository thanhToanRepo,
        IKhoaHoc_GiangVienRepository khoaHocGVRepo,
        IAppUserService appUserService,
        IHttpContextAccessor httpContextAccessor) 
        {
            _chiTietRepo = chiTietRepo;
            _donHangRepo = donHangRepo;
            _kmRepo = kmRepo;
            _dangKyRepo = dangKyRepo;
            _thanhToanRepo = thanhToanRepo;
            _khoaHocGVRepo = khoaHocGVRepo;
            _appUserService = appUserService;
            _httpContextAccessor = httpContextAccessor;
        }
        private Guid LayUserId()
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User
                    ?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var id);
            return id;
        }
        private bool IsAdmin() =>
    _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;

        // Kiểm tra quyền Performance
        private async Task KiemTraQuyenPerformance(Guid idKhoaHoc)
        {
            if (IsAdmin()) return;
            var userId = LayUserId();
            var gv = await _khoaHocGVRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdGiangVien == userId
                                       && !x.IsDeleted);
            if (gv == null || (!gv.LaChuSoHuu && !gv.Performance))
                throw new Exception("Bạn không có quyền xem thống kê khóa học này");
        }

        public async Task<ThongKeDoanhThuDto> GetThongKeDoanhThu(Guid idKhoaHoc)
        {
            await KiemTraQuyenPerformance(idKhoaHoc);

            // Lấy tất cả DonHangChiTiet của khóa học này
            // chỉ tính đơn hàng đã thanh toán thành công (TrangThai = 1)
            var chiTiets = await (
                from ct in _chiTietRepo.GetQueryable()
                join dh in _donHangRepo.GetQueryable()
                    on ct.IdDonHang equals dh.Id
                join tt in _thanhToanRepo.GetQueryable()
                    on dh.Id equals tt.IdDonHang
                where ct.IdKhoaHoc == idKhoaHoc
                   && !ct.IsDeleted
                   && !dh.IsDeleted
                   && dh.TrangThai == 1          // đã thanh toán
                   && tt.TrangThaiThanhToan == "SUCCESS"
                select new
                {
                    ct.GiaLucDat,
                    dh.Id,
                    dh.NgayTao,
                    dh.IdNguoiDung,
                }
            ).ToListAsync();

            // Khuyến mãi áp dụng cho khóa học này
            var donHangIds = chiTiets.Select(x => x.Id).Distinct().ToList();
            var tongGiam = await _kmRepo.GetQueryable()
                .Where(x => donHangIds.Contains(x.IdDonHang!.Value)
                         && x.IdKhoaHocDuocGiam == idKhoaHoc
                         && !x.IsDeleted)
                .SumAsync(x => x.SoTienGiam ?? 0);

            double tongDoanhThu = chiTiets.Sum(x => x.GiaLucDat ?? 0);
            double doanhThuSauGiam = tongDoanhThu - tongGiam;
            double phanGiangVien = doanhThuSauGiam * 0.7;
            double phanHeTong = doanhThuSauGiam * 0.3;

            // Doanh thu theo tháng
            var doanhThuTheoThang = chiTiets
                .Where(x => x.NgayTao.HasValue)
                .GroupBy(x => new { x.NgayTao!.Value.Year, x.NgayTao!.Value.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new DoanhThuTheoThangDto
                {
                    Nam = g.Key.Year,
                    Thang = g.Key.Month,
                    DoanhThu = g.Sum(x => x.GiaLucDat ?? 0),
                    SoDon = g.Count(),
                }).ToList();

            // Phân chia cho giảng viên
            var giangViens = await _khoaHocGVRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .ToListAsync();

            var gvIds = giangViens.Select(x => x.IdGiangVien).ToList();
            var users = await _appUserService.GetQueryable()
                .Where(x => gvIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            var phanChia = giangViens.Select(gv =>
            {
                var u = users.FirstOrDefault(x => x.Id == gv.IdGiangVien);
                return new PhanChiaGiangVienDto
                {
                    IdGiangVien = gv.IdGiangVien,
                    HoTen = u?.HoTen,
                    AnhDaiDien = u?.AnhDaiDien,
                    LaChuSoHuu = gv.LaChuSoHuu,
                    TyLeChiaDoanhThu = gv.TyLeChiaDoanhThu,
                    SoTienNhan = Math.Round(phanGiangVien * gv.TyLeChiaDoanhThu / 100, 0),
                };
            }).OrderByDescending(x => x.LaChuSoHuu).ThenByDescending(x => x.TyLeChiaDoanhThu).ToList();

            return new ThongKeDoanhThuDto
            {
                TongDoanhThu = tongDoanhThu,
                DoanhThuSauGiam = doanhThuSauGiam,
                PhanGiangVien = phanGiangVien,
                PhanHeTong = phanHeTong,
                TongDonHang = chiTiets.Select(x => x.Id).Distinct().Count(),
                TongHocVien = chiTiets.Select(x => x.IdNguoiDung).Distinct().Count(),
                DoanhThuTheoThang = doanhThuTheoThang,
                PhanChiaGiangVien = phanChia,
            };
        }

        public async Task<ThongKeHocVienDto> GetThongKeHocVien(Guid idKhoaHoc, int? nam = null)
        {
            await KiemTraQuyenPerformance(idKhoaHoc);

            var now = DateTime.Now;
            var query = _dangKyRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted);

            var tatCa = await query.ToListAsync();

            // Học viên theo tháng (lọc theo năm nếu có)
            var theoThang = tatCa
                .Where(x => x.ThoiGianDK.HasValue)
                .Where(x => !nam.HasValue || x.ThoiGianDK!.Value.Year == nam)
                .GroupBy(x => new { x.ThoiGianDK!.Value.Year, x.ThoiGianDK!.Value.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new HocVienTheoThangDto
                {
                    Nam = g.Key.Year,
                    Thang = g.Key.Month,
                    SoLuong = g.Count(),
                }).ToList();

            // Lấy thông tin user
            var hocVienIds = tatCa
                .Where(x => x.IdNguoiDangKi.HasValue)
                .Select(x => x.IdNguoiDangKi!.Value)
                .Distinct().ToList();

            var users = await _appUserService.GetQueryable()
                .Where(x => hocVienIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien, x.Email })
                .ToListAsync();

            var danhSach = tatCa
                .OrderByDescending(x => x.ThoiGianDK)
                .Take(50)  // lấy 50 gần nhất
                .Select(dk =>
                {
                    var u = users.FirstOrDefault(x => x.Id == dk.IdNguoiDangKi);
                    return new HocVienGanDayDto
                    {
                        IdHocVien = dk.IdNguoiDangKi ?? Guid.Empty,
                        HoTen = u?.HoTen,
                        AnhDaiDien = u?.AnhDaiDien,
                        Email = u?.Email,
                        GiaDangKy = dk.GiaDangKy,
                        ThoiGianDK = dk.ThoiGianDK,
                        TrangThai = dk.TrangThai,
                        IsDangKy = dk.IsDangKy,
                        NgayHetHan = dk.NgayHetHan,
                    };
                }).ToList();

            return new ThongKeHocVienDto
            {
                TongHocVien = tatCa.Count,
                HocVienMoi30Ngay = tatCa.Count(x => x.ThoiGianDK >= now.AddDays(-30)),
                DangHoc = tatCa.Count(x => x.IsDangKy == true && x.NgayHetHan >= now),
                HetHan = tatCa.Count(x => x.NgayHetHan < now),
                HocVienTheoThang = theoThang,
                DanhSachHocVien = danhSach,
            };
        }
    }
}
