using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DonHang_GiangVienRepository;
using Eduverse.Repository.DonHang_KhuyenMaiRepository;
using Eduverse.Repository.DonHangChiTietRepository;
using Eduverse.Repository.DonHangRepositoryRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.ThanhToanRepository;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.KhoaHocService;
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
        private readonly IKhoaHocService _khoaHocService;
        private readonly IPhanRepository _phanRepo; 
        private readonly ITienDoHocTapRepository _tienDoRepo;
        private readonly IBaiGiangRepository _baiGiangRepo;
        private readonly IDonHang_GiangVienRepository _donHangGiangVienRepo;

        public ThongKeKhoaHocService(
        IDonHangChiTietRepository chiTietRepo,
        IDonHangRepository donHangRepo,
        IDonHang_KhuyenMaiRepository kmRepo,
        IDangKyKhoaHocRepository dangKyRepo,
        IThanhToanRepository thanhToanRepo,
        IKhoaHoc_GiangVienRepository khoaHocGVRepo,
        IAppUserService appUserService,
        IHttpContextAccessor httpContextAccessor,
        IPhanRepository phanRepo,
        ITienDoHocTapRepository tienDoRepo,
        IBaiGiangRepository baiGiangRepo,
        IDonHang_GiangVienRepository donHangGiangVienRepo,
        IKhoaHocService khoaHocService) 
        {
            _chiTietRepo = chiTietRepo;
            _donHangRepo = donHangRepo;
            _kmRepo = kmRepo;
            _dangKyRepo = dangKyRepo;
            _thanhToanRepo = thanhToanRepo;
            _khoaHocGVRepo = khoaHocGVRepo;
            _appUserService = appUserService;
            _httpContextAccessor = httpContextAccessor;
            _khoaHocService = khoaHocService;
            _phanRepo = phanRepo;
            _tienDoRepo = tienDoRepo;
            _baiGiangRepo = baiGiangRepo;
            _donHangGiangVienRepo = donHangGiangVienRepo;
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

            var userId = LayUserId();
            await KiemTraQuyenPerformance(idKhoaHoc);

            var chiTiets = await (
                from ct in _chiTietRepo.GetQueryable()
                join dh in _donHangRepo.GetQueryable()
                    on ct.IdDonHang equals dh.Id
                join tt in _thanhToanRepo.GetQueryable()
                    on dh.Id equals tt.IdDonHang
                where ct.IdKhoaHoc == idKhoaHoc
                   && !ct.IsDeleted
                   && !dh.IsDeleted
                   && dh.TrangThai == 1 
                   && tt.TrangThaiThanhToan == "SUCCESS"
                select new
                {
                    ct.GiaLucDat,
                    dh.Id,
                    dh.NgayTao,
                    dh.IdNguoiDung,
                }
            ).ToListAsync();

            var donHangIds = chiTiets.Select(x => x.Id).Distinct().ToList();
            var giamTheoDonHang = await _kmRepo.GetQueryable()
                .Where(x => donHangIds.Contains(x.IdDonHang!.Value)
                         && x.IdKhoaHocDuocGiam == idKhoaHoc
                         && !x.IsDeleted)
                .GroupBy(x => x.IdDonHang!.Value)
                .Select(g => new { IdDonHang = g.Key, SoTienGiam = g.Sum(x => x.SoTienGiam ?? 0) })
                .ToDictionaryAsync(x => x.IdDonHang, x => x.SoTienGiam);

            var tongGiam = giamTheoDonHang.Values.Sum();

            double tongDoanhThu = chiTiets.Sum(x => x.GiaLucDat ?? 0);
            double doanhThuSauGiam = tongDoanhThu - tongGiam;
            double phanHeTong = doanhThuSauGiam * 0.3;

            var banGhi = await _donHangGiangVienRepo.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .ToListAsync();

            var doanhThuTheoThang = banGhi
                 .GroupBy(x => new { x.NgayGhiNhan.Year, x.NgayGhiNhan.Month })
                 .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                 .Select(g =>
                 {
                     var banGhiCuaNguoiXem = IsAdmin() ? g.AsEnumerable() : g.Where(x => x.IdGiangVien == userId);
                     return new DoanhThuTheoThangDto
                     {
                         Nam = g.Key.Year,
                         Thang = g.Key.Month,
                         DoanhThu = banGhiCuaNguoiXem.Sum(x => x.SoTienNhan),
                         SoDon = banGhiCuaNguoiXem.Select(x => x.IdDonHang).Distinct().Count(),
                     };
                 })
                 .ToList();

            var gvIds = banGhi
                .Select(x => x.IdGiangVien)
                .Distinct()
                .ToList();

            var users = await _appUserService.GetQueryable()
                .Where(x => gvIds.Contains(x.Id))
                .Select(x => new
                {
                    x.Id,
                    x.HoTen,
                    x.AnhDaiDien
                })
                .ToListAsync();

            var nguon = IsAdmin()
                ? banGhi
                : banGhi.Where(x => x.IdGiangVien == userId).ToList();

            var phanChia = nguon
                .GroupBy(x => x.IdGiangVien)
                .Select(g =>
                {
                    var u = users.FirstOrDefault(x => x.Id == g.Key);
                    var moiNhat = g
                        .OrderByDescending(x => x.NgayGhiNhan)
                        .First();

                    return new PhanChiaGiangVienDto
                    {
                        IdGiangVien = g.Key,
                        HoTen = u?.HoTen,
                        AnhDaiDien = u?.AnhDaiDien,
                        LaChuSoHuu = moiNhat.LaChuSoHuu,
                        TyLeChiaDoanhThu = moiNhat.TyLeChiaDoanhThu,
                        SoTienNhan = Math.Round(g.Sum(x => x.SoTienNhan), 0),
                    };
                })
                .OrderByDescending(x => x.LaChuSoHuu)
                .ThenByDescending(x => x.SoTienNhan)
                .ToList();

            return new ThongKeDoanhThuDto
            {
                TongDoanhThu = tongDoanhThu,
                DoanhThuSauGiam = doanhThuSauGiam,
                PhanGiangVien = IsAdmin()
                    ? Math.Round(banGhi.Sum(x => x.SoTienNhan), 0)
                    : (phanChia.FirstOrDefault()?.SoTienNhan ?? 0),
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
                    SoLuong = g.Where(x => x.IdNguoiDangKi.HasValue).Select(x => x.IdNguoiDangKi!.Value).Distinct().Count(),
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

            var danhSach = new List<HocVienGanDayDto>();
            foreach (var dk in tatCa.OrderByDescending(x => x.ThoiGianDK).Take(50))
            {
                var u = users.FirstOrDefault(x => x.Id == dk.IdNguoiDangKi);

                double phanTram = 0;
                try
                {
                    var map = await LayMapBaiGiangHienTai(idKhoaHoc);
                    var listTienDo = await _tienDoRepo.GetQueryable()
                        .Where(x => x.IdDangKi == dk.Id && !x.IsDeleted)
                        .Select(x => new { x.IdBaiGiang, x.TrangThai })
                        .ToListAsync();

                    var baiGiangHoanThanhHienTai = listTienDo
                        .Where(x => x.TrangThai == "HoanThanh" && x.IdBaiGiang.HasValue)
                        .Select(x => map.idVeHienTai.TryGetValue(x.IdBaiGiang!.Value, out var hienTai) ? hienTai : x.IdBaiGiang.Value)
                        .Where(id => map.baiGiangHienTaiIds.Contains(id))
                        .Distinct()
                        .Count();

                    phanTram = map.tongSoBaiGiang > 0
                        ? (double)baiGiangHoanThanhHienTai / map.tongSoBaiGiang * 100
                        : 0;
                }
                catch { }

                danhSach.Add(new HocVienGanDayDto
                {
                    IdHocVien = dk.IdNguoiDangKi ?? Guid.Empty,
                    IdDangKy = dk.Id,
                    HoTen = u?.HoTen ?? "Học viên",
                    AnhDaiDien = u?.AnhDaiDien,
                    Email = u?.Email,
                    GiaDangKy = dk.GiaDangKy,
                    ThoiGianDK = dk.ThoiGianDK,
                    TrangThai = dk.TrangThai,
                    IsDangKy = dk.IsDangKy,
                    NgayHetHan = dk.NgayHetHan,
                    PhanTramHoanThanh = Math.Round(phanTram, 1),
                });
            }

            return new ThongKeHocVienDto
            {
                TongHocVien = tatCa.Where(x => x.IdNguoiDangKi.HasValue).Select(x => x.IdNguoiDangKi!.Value).Distinct().Count(),
                HocVienMoi30Ngay = tatCa.Where(x => x.ThoiGianDK >= now.AddDays(-30) && x.IdNguoiDangKi.HasValue).Select(x => x.IdNguoiDangKi!.Value).Distinct().Count(),
                DangHoc = tatCa.Where(x => x.IsDangKy == true && x.NgayHetHan >= now && x.IdNguoiDangKi.HasValue).Select(x => x.IdNguoiDangKi!.Value).Distinct().Count(),
                HetHan = tatCa.Where(x => x.NgayHetHan < now && x.IdNguoiDangKi.HasValue).Select(x => x.IdNguoiDangKi!.Value).Distinct().Count(),
                HocVienTheoThang = theoThang,
                DanhSachHocVien = danhSach,
            };
        }


        private async Task<(List<Guid> baiGiangHienTaiIds, Dictionary<Guid, Guid> idVeHienTai, int tongSoBaiGiang)>
    LayMapBaiGiangHienTai(Guid idKhoaHoc)
        {
            var phanIds = await _phanRepo.GetQueryable()
                .Where(p => p.IdKhoaHoc == idKhoaHoc && p.IsBanHienTai && !p.IsDeleted)
                .Select(p => p.Id)
                .ToListAsync();

            // Lấy TẤT CẢ version của bài giảng thuộc các Phan này (không lọc IsBanHienTai)
            var tatCaBanGhi = await _baiGiangRepo.GetQueryable()
                .Where(bg => phanIds.Contains(bg.IdPhan) && !bg.IsDeleted)
                .Select(bg => new { bg.Id, bg.IdBanGhiTruoc, bg.IsBanHienTai })
                .ToListAsync();

            var baiGiangHienTaiIds = tatCaBanGhi.Where(x => x.IsBanHienTai).Select(x => x.Id).ToList();

            // map id cũ -> id hiện tại (chuỗi swap có thể nhiều cấp, nên lặp cho tới khi ổn định)
            var idVeHienTai = new Dictionary<Guid, Guid>();
            foreach (var id in baiGiangHienTaiIds) idVeHienTai[id] = id;

            bool coThayDoi = true;
            int guard = 0; // chặn vòng lặp vô hạn nếu dữ liệu lỗi (link tròn)
            while (coThayDoi && guard++ < 20)
            {
                coThayDoi = false;
                foreach (var bg in tatCaBanGhi)
                {
                    if (!idVeHienTai.ContainsKey(bg.Id)
                        && bg.IdBanGhiTruoc.HasValue
                        && idVeHienTai.TryGetValue(bg.IdBanGhiTruoc.Value, out var hienTai))
                    {
                        idVeHienTai[bg.Id] = hienTai;
                        coThayDoi = true;
                    }
                }
            }

            // bản nào không tìm được bản hiện tại nào cả (mồ côi) -> tự quy về chính nó,
            // để không bị lỗi KeyNotFound khi tra map (dù sẽ không match bài nào trong danh sách hiển thị)
            foreach (var bg in tatCaBanGhi)
                if (!idVeHienTai.ContainsKey(bg.Id))
                    idVeHienTai[bg.Id] = bg.Id;

            return (baiGiangHienTaiIds, idVeHienTai, baiGiangHienTaiIds.Count);
        }

        public async Task<List<BaiGiangEngagementDto>> GetThongKeBaiGiang(Guid idKhoaHoc)
        {
            await KiemTraQuyenPerformance(idKhoaHoc);

            var tongDangKy = await _dangKyRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .CountAsync();

            if (tongDangKy == 0)
                return new List<BaiGiangEngagementDto>();

            var (baiGiangHienTaiIds, idVeHienTai, _) = await LayMapBaiGiangHienTai(idKhoaHoc);

            var baiGiangHienTai = await _baiGiangRepo.GetQueryable()
                .Where(bg => baiGiangHienTaiIds.Contains(bg.Id) && bg.TrangThaiPheDuyet == "DaDuyet")
                .OrderBy(bg => bg.ThuTuSapXep)
                .Select(bg => new { bg.Id, bg.TieuDe, bg.ThuTuSapXep })
                .ToListAsync();

            var tienDos = await (
                from td in _tienDoRepo.GetQueryable()
                join dk in _dangKyRepo.GetQueryable() on td.IdDangKi equals dk.Id
                where td.IdBaiGiang.HasValue
                   && dk.IdKhoaHoc == idKhoaHoc
                   && !dk.IsDeleted
                   && !td.IsDeleted
                select new { td.IdDangKi, td.IdBaiGiang, td.TrangThai }
            ).ToListAsync();

            var ketQua = baiGiangHienTai.Select(bg =>
            {
                var xemBai = tienDos
                    .Where(t => idVeHienTai.TryGetValue(t.IdBaiGiang!.Value, out var quyVe) && quyVe == bg.Id)
                    .ToList();

                var soHocVienXem = xemBai.Select(x => x.IdDangKi).Distinct().Count();
                var soHoanThanh = xemBai.Count(t => t.TrangThai == "HoanThanh");

                return new BaiGiangEngagementDto
                {
                    IdBaiGiang = bg.Id,
                    TenBaiGiang = bg.TieuDe,
                    ThuTu = bg.ThuTuSapXep ?? 0,
                    LuotXem = soHocVienXem,
                    TyLeHoanThanh = Math.Round(soHoanThanh * 100.0 / tongDangKy, 0),
                };
            }).ToList();

            return ketQua;
        }

        public async Task<CourseEngagementDto> GetCourseEngagement(Guid idKhoaHoc)
        {
            await KiemTraQuyenPerformance(idKhoaHoc);

            var dangKys = await _dangKyRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .Select(x => x.Id)
                .ToListAsync();

            var tongDangKy = dangKys.Count;
            if (tongDangKy == 0) return new CourseEngagementDto();

            var (_, _, tongSoBaiGiang) = await LayMapBaiGiangHienTai(idKhoaHoc);

            var tienDos = await _tienDoRepo.GetQueryable()
                .Where(x => dangKys.Contains(x.IdDangKi!.Value) && !x.IsDeleted)
                .Select(x => new { x.IdDangKi, x.ThoiGianXem, x.TrangThai, x.LanCuoiXem })
                .ToListAsync();

            var now = DateTime.Now;

            var hocVienDaBatDau = tienDos.Select(x => x.IdDangKi).Distinct().Count();
            var tongGio = tienDos.Sum(x => x.ThoiGianXem ?? 0) / 3600.0;

            var hocVienHoatDong = tienDos
                .Where(x => x.LanCuoiXem >= now.AddDays(-7))
                .Select(x => x.IdDangKi).Distinct().Count();

            // Tỷ lệ hoàn thành trung bình: mỗi học viên = (số bài đã hoàn thành / tổng số bài) rồi lấy trung bình toàn khóa
            double tyLeHoanThanhTrungBinh = 0;
            if (tongSoBaiGiang > 0)
            {
                var phanTramMoiHocVien = tienDos
                    .GroupBy(x => x.IdDangKi)
                    .Select(g => g.Count(x => x.TrangThai == "HoanThanh") * 100.0 / tongSoBaiGiang);

                // học viên chưa có bản ghi tiến độ nào (chưa bắt đầu học) tính là 0%,
                // và phải tính trên TỔNG học viên đăng ký, không chỉ học viên đã bắt đầu học
                var tongPhanTram = phanTramMoiHocVien.Sum();
                tyLeHoanThanhTrungBinh = tongPhanTram / tongDangKy;
            }

            return new CourseEngagementDto
            {
                HocVienDaDangKy = tongDangKy,
                HocVienDaBatDauHoc = hocVienDaBatDau,
                TongThoiGianHocGio = Math.Round(tongGio, 0),
                LuotXemBaiGiang = tienDos.Count,
                TyLeHoanThanhTrungBinh = Math.Round(tyLeHoanThanhTrungBinh, 0),
                HocVienDangHoatDong = hocVienHoatDong,
            };
        }
        
    }
}
