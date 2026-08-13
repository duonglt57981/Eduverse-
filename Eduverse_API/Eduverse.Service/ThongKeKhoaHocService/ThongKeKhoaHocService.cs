using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
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
            double phanGiangVien = doanhThuSauGiam * 0.7;
            double phanHeTong = doanhThuSauGiam * 0.3;

            var doanhThuTheoThang = chiTiets
                .Where(x => x.NgayTao.HasValue)
                .GroupBy(x => new { x.NgayTao!.Value.Year, x.NgayTao!.Value.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new DoanhThuTheoThangDto
                {
                    Nam = g.Key.Year,
                    Thang = g.Key.Month,
                    DoanhThu = g.Sum(x => Math.Max(0,
                        (x.GiaLucDat ?? 0) - giamTheoDonHang.GetValueOrDefault(x.Id, 0))),
                    SoDon = g.Count(),
                }).ToList();

            var giangViens = await _khoaHocGVRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .ToListAsync();

            var gvIds = giangViens.Select(x => x.IdGiangVien).ToList();
            var users = await _appUserService.GetQueryable()
                .Where(x => gvIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            var tongTyLe = giangViens.Sum(x => x.TyLeChiaDoanhThu);
            var phanChia = giangViens.Select(gv =>
            {
                var u = users.FirstOrDefault(x => x.Id == gv.IdGiangVien);
                var tyTrong = tongTyLe > 0 ? gv.TyLeChiaDoanhThu / (double)tongTyLe : 0;
                return new PhanChiaGiangVienDto
                {
                    IdGiangVien = gv.IdGiangVien,
                    HoTen = u?.HoTen,
                    AnhDaiDien = u?.AnhDaiDien,
                    LaChuSoHuu = gv.LaChuSoHuu,
                    TyLeChiaDoanhThu = gv.TyLeChiaDoanhThu,
                    SoTienNhan = Math.Round(phanGiangVien * tyTrong, 0),
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

            var danhSach = new List<HocVienGanDayDto>();
            foreach (var dk in tatCa.OrderByDescending(x => x.ThoiGianDK).Take(50))
            {
                var u = users.FirstOrDefault(x => x.Id == dk.IdNguoiDangKi);

                double phanTram = 0;
                try
                {
                    phanTram = await _khoaHocService.TinhPhanTramHoanThanh(dk.Id, dk.CreatedDate);
                }
                catch
                {
                    // giữ 0% nếu tính lỗi (VD: khóa học chưa có bài giảng)
                }

                danhSach.Add(new HocVienGanDayDto
                {
                    IdHocVien = dk.IdNguoiDangKi ?? Guid.Empty,
                    IdDangKy = dk.Id,
                    HoTen = u?.HoTen,
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
                TongHocVien = tatCa.Count,
                HocVienMoi30Ngay = tatCa.Count(x => x.ThoiGianDK >= now.AddDays(-30)),
                DangHoc = tatCa.Count(x => x.IsDangKy == true && x.NgayHetHan >= now),
                HetHan = tatCa.Count(x => x.NgayHetHan < now),
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
