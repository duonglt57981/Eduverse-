using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LoiMoiGiangVienRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.Common;
using Eduverse.Service.LoiMoiGiangVienService.Dto;
using Eduverse.Service.LoiMoiGiangVienService.Request;
using Eduverse.Service.ThanhToanService;
using Eduverse.Service.ThongBaoService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LoiMoiGiangVienService
{
    public class LoiMoiGiangVienService : Service<Model.Entities.LoiMoiGiangVien>, ILoiMoiGiangVienService
    {
        private readonly ILoiMoiGiangVienRepository _loiMoiRepo;
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepo;
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly IAppUserService _appUserService;
        private readonly INotificationPublisher _notificationPublisher;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LoiMoiGiangVienService (ILoiMoiGiangVienRepository loiMoiGiangVienRepository,
            IKhoaHoc_GiangVienRepository khoaHoc_GiangVienRepository,
            IKhoaHocRepository khoaHocRepo,
            IAppUserService appUserService,
            INotificationPublisher notificationPublisher,
            IHttpContextAccessor httpContextAccessor) : base(loiMoiGiangVienRepository)
        {
            _loiMoiRepo = loiMoiGiangVienRepository;
            _khoaHocGVRepo = khoaHoc_GiangVienRepository;
            _khoaHocRepo = khoaHocRepo;
            _appUserService = appUserService;
            _notificationPublisher = notificationPublisher;
            _httpContextAccessor = httpContextAccessor;
        }

        // constructor inject đủ các dependency trên

        // ── Helper lấy userId hiện tại ───────────────────────────────────
        private Guid LayUserId()
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId);
            return userId;
        }

        // ── Helper kiểm tra tổng % ≤ 100 ─────────────────────────────────
        private async Task KiemTraTongTyLe(
        Guid idKhoaHoc,
        int tyLeMoi,
        Guid? ngoaiTruCongTacVienId = null,
        Guid? ngoaiTruLoiMoiId = null)
        {
            var tongAccepted = await _khoaHocGVRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && !x.IsDeleted
                         && (ngoaiTruCongTacVienId == null || x.Id != ngoaiTruCongTacVienId))
                .SumAsync(x => x.TyLeChiaDoanhThu);

            var tongPending = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted
                         && (ngoaiTruLoiMoiId == null || x.Id != ngoaiTruLoiMoiId))
                .SumAsync(x => x.TyLeChiaDoanhThu);

            var tongHienTai = tongAccepted + tongPending;

            if (tongHienTai + tyLeMoi > 100)
            {
                var tyLeConLai = 100 - tongHienTai;
                throw new Exception($"Tổng tỷ lệ chia doanh thu không được vượt quá 100%. Hiện tại đã phân bổ {tongHienTai}% (bao gồm các lời mời đang chờ). Bạn chỉ có thể thiết lập tối đa thêm {tyLeConLai}%.");
            }
        }

        public async Task CapNhatQuyenTheoGiangVien(Guid idKhoaHoc, Guid idGiangVien, CapNhatQuyenRequest request)
        {
            var userId = LayUserId();

            // Chỉ chủ sở hữu mới được sửa
            var laChu = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdGiangVien == userId
                            && x.LaChuSoHuu
                            && !x.IsDeleted);
            if (!laChu) throw new Exception("Chỉ chủ sở hữu mới được cập nhật quyền");

            var congTacVien = await _khoaHocGVRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdGiangVien == idGiangVien
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy giảng viên trong khóa học");

            KiemTraTyLeHopLe(request.TyLeChiaDoanhThu);
            await KiemTraTongTyLe(
                        idKhoaHoc,
                        request.TyLeChiaDoanhThu,
                        ngoaiTruCongTacVienId: congTacVien.Id);

            congTacVien.Visible = request.Visible;
            congTacVien.TyLeChiaDoanhThu = request.TyLeChiaDoanhThu;
            congTacVien.Manage = request.Manage;
            congTacVien.Performance = request.Performance;
            congTacVien.QnA = request.QnA;
            congTacVien.Reviews = request.Reviews;
            congTacVien.Assignments = request.Assignments;
            congTacVien.Materials = request.Materials;
            congTacVien.Promotions = request.Promotions;
            _khoaHocGVRepo.Update(congTacVien);

            // Sync lại lời mời nếu có
            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdNguoiDuocMoi == idGiangVien
                                       && !x.IsDeleted);
            if (loiMoi != null)
            {
                loiMoi.Visible = request.Visible;
                loiMoi.TyLeChiaDoanhThu = request.TyLeChiaDoanhThu;
                loiMoi.Manage = request.Manage;
                loiMoi.Performance = request.Performance;
                loiMoi.QnA = request.QnA;
                loiMoi.Reviews = request.Reviews;
                loiMoi.Assignments = request.Assignments;
                loiMoi.Materials = request.Materials;
                loiMoi.Promotions = request.Promotions;
                _loiMoiRepo.Update(loiMoi);
            }

            await _khoaHocGVRepo.SaveAsync();
        }

        public async Task HuyTheoGiangVien(Guid idKhoaHoc, Guid idGiangVien)
        {
            var userId = LayUserId();

            var laChu = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdGiangVien == userId
                            && x.LaChuSoHuu
                            && !x.IsDeleted);
            if (!laChu) throw new Exception("Chỉ chủ sở hữu mới được xóa giảng viên");

            var congTacVien = await _khoaHocGVRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdGiangVien == idGiangVien
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy giảng viên");

            if (congTacVien.LaChuSoHuu)
                throw new Exception("Không thể xóa chủ sở hữu khóa học");

             _khoaHocGVRepo.Delete(congTacVien);

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdNguoiDuocMoi == idGiangVien
                                       && !x.IsDeleted);
            if (loiMoi != null) _loiMoiRepo.Delete(loiMoi);

            await _khoaHocGVRepo.SaveAsync();
        }

        public async Task<LoiMoiGiangVienDto> GuiLoiMoi(GuiLoiMoiRequest request)
        {
            var userId = LayUserId();

            var khoaHoc = await _khoaHocRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdKhoaHoc && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy khóa học");

            // Chỉ chủ sở hữu mới được mời
            var laChu = await _khoaHocGVRepo.GetQueryable()
            .AnyAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                        && x.IdGiangVien == userId
                        && x.LaChuSoHuu
                        && !x.IsDeleted);
            if (!laChu)
                throw new Exception("Chỉ chủ sở hữu mới được mời giảng viên");

            // Tìm tài khoản theo email
            var nguoiDuocMoi = await _appUserService.GetQueryable()
                .FirstOrDefaultAsync(x => x.Email == request.Email && !x.IsDeleted)
                ?? throw new Exception("Email này chưa có tài khoản giảng viên trên hệ thống");

            // Không mời chính mình
            if (nguoiDuocMoi.Id == userId)
                throw new Exception("Bạn không thể mời chính mình");

            // Không mời người đã có trong khóa học
            var daTonTai = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                            && x.IdGiangVien == nguoiDuocMoi.Id
                            && !x.IsDeleted);
            if (daTonTai)
                throw new Exception("Giảng viên này đã tham gia khóa học");

            // Không mời người đang có lời mời Pending
            var loiMoiCu = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                                       && x.IdNguoiDuocMoi == nguoiDuocMoi.Id
                                       && x.TrangThai == "Pending"
                                       && !x.IsDeleted);
            if (loiMoiCu != null)
                throw new Exception("Đã có lời mời đang chờ xác nhận với giảng viên này");

            // Kiểm tra tổng % không vượt 100
            KiemTraTyLeHopLe(request.TyLeChiaDoanhThu);
            await KiemTraTongTyLe(
                    request.IdKhoaHoc,
                    request.TyLeChiaDoanhThu);

            var loiMoi = new LoiMoiGiangVien
            {
                IdKhoaHoc = request.IdKhoaHoc,
                IdNguoiMoi = userId,
                IdNguoiDuocMoi = nguoiDuocMoi.Id,
                EmailDuocMoi = request.Email,
                TrangThai = "Pending",
                Visible = request.Visible,
                TyLeChiaDoanhThu = request.TyLeChiaDoanhThu,
                Manage = request.Manage,
                Performance = request.Performance,
                QnA = request.QnA,
                Reviews = request.Reviews,
                Assignments = request.Assignments,
                Materials = request.Materials,
                Promotions = request.Promotions,
            };

            _loiMoiRepo.Add(loiMoi);
            await _loiMoiRepo.SaveAsync();

            // Gửi thông báo
            await _notificationPublisher.NotifyUserAsync(nguoiDuocMoi.Id, new NotificationPayload
            {
                TieuDe = "Lời mời đồng giảng dạy",
                NoiDung = $"Bạn được mời tham gia giảng dạy khóa học \"{khoaHoc.TieuDe}\".",
                LoaiThongBao = "LoiMoiDongGiangVien",
                Link = $"/instructor/invites/{loiMoi.Id}",
                FromUser = userId,
                ItemId = loiMoi.Id,
                ItemName = khoaHoc.TieuDe
            });

            return new LoiMoiGiangVienDto { /* map */ };
        }

        public async Task PhanHoi(Guid idLoiMoi, bool dongY)
        {
            var userId = LayUserId();

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLoiMoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy lời mời");

            if (loiMoi.IdNguoiDuocMoi != userId)
                throw new Exception("Lời mời này không dành cho bạn");

            if (loiMoi.TrangThai != "Pending")
                throw new Exception("Lời mời đã được xử lý trước đó");

            loiMoi.TrangThai = dongY ? "Accepted" : "Rejected";
            loiMoi.NgayPhanHoi = DateTime.UtcNow;
            _loiMoiRepo.Update(loiMoi);

            if (dongY)
            {
                // Kiểm tra lại tổng % tại thời điểm accept (tránh race condition)
                await KiemTraTongTyLe(
                        loiMoi.IdKhoaHoc,
                        loiMoi.TyLeChiaDoanhThu,
                        ngoaiTruLoiMoiId: loiMoi.Id);

                var congTacVien = new KhoaHoc_GiangVien
                {
                    IdKhoaHoc = loiMoi.IdKhoaHoc,
                    IdGiangVien = loiMoi.IdNguoiDuocMoi,
                    LaChuSoHuu = false,
                    Visible = loiMoi.Visible,
                    TyLeChiaDoanhThu = loiMoi.TyLeChiaDoanhThu,
                    Manage = loiMoi.Manage,
                    Performance = loiMoi.Performance,
                    QnA = loiMoi.QnA,
                    Reviews = loiMoi.Reviews,
                    Assignments = loiMoi.Assignments,
                    Materials = loiMoi.Materials,
                    Promotions = loiMoi.Promotions,
                };
                _khoaHocGVRepo.Add(congTacVien);
            }

            await _khoaHocGVRepo.SaveAsync();
        }
        public async Task<List<LoiMoiChoXacNhanDto>> GetLoiMoiCuaToi()
        {
            var userId = LayUserId();

            var loiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdNguoiDuocMoi == userId && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            if (!loiMois.Any()) return new List<LoiMoiChoXacNhanDto>();

            var khoaHocIds = loiMois.Select(x => x.IdKhoaHoc).Distinct().ToList();
            var nguoiMoiIds = loiMois.Select(x => x.IdNguoiMoi).Distinct().ToList();

            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(x => khoaHocIds.Contains(x.Id) && !x.IsDeleted)
                .Select(x => new { x.Id, x.TieuDe, x.HinhAnhKhoaHoc })
                .ToListAsync();

            var nguoiMois = await _appUserService.GetQueryable()
                .Where(x => nguoiMoiIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            return loiMois.Select(lm =>
            {
                var kh = khoaHocs.FirstOrDefault(k => k.Id == lm.IdKhoaHoc);
                var nm = nguoiMois.FirstOrDefault(n => n.Id == lm.IdNguoiMoi);
                return new LoiMoiChoXacNhanDto
                {
                    Id = lm.Id,
                    IdKhoaHoc = lm.IdKhoaHoc,
                    TenKhoaHoc = kh?.TieuDe,
                    HinhAnhKhoaHoc = kh?.HinhAnhKhoaHoc,
                    TenNguoiMoi = nm?.HoTen,
                    AnhNguoiMoi = nm?.AnhDaiDien,
                    TrangThai = lm.TrangThai,
                    Visible = lm.Visible,
                    TyLeChiaDoanhThu = lm.TyLeChiaDoanhThu,
                    Manage = lm.Manage,
                    Performance = lm.Performance,
                    QnA = lm.QnA,
                    Reviews = lm.Reviews,
                    Assignments = lm.Assignments,
                    Materials = lm.Materials,
                    Promotions = lm.Promotions,
                    NgayMoi = lm.CreatedDate,
                };
            }).ToList();
        }

        public async Task CapNhatQuyen(Guid idLoiMoi, CapNhatQuyenRequest request)
        {
            var userId = LayUserId();

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLoiMoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy lời mời");

            if (loiMoi.IdNguoiMoi != userId)
                throw new Exception("Bạn không có quyền cập nhật lời mời này");

            KiemTraTyLeHopLe(request.TyLeChiaDoanhThu);

            KhoaHoc_GiangVien congTacVien = null;
            if (loiMoi.TrangThai == "Accepted")
            {
                congTacVien = await _khoaHocGVRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdKhoaHoc == loiMoi.IdKhoaHoc
                                           && x.IdGiangVien == loiMoi.IdNguoiDuocMoi
                                           && !x.IsDeleted);
                if (congTacVien != null)
                    await KiemTraTongTyLe(
                            loiMoi.IdKhoaHoc,
                            request.TyLeChiaDoanhThu,
                            congTacVien.Id);
            }
            else
            {
                await KiemTraTongTyLe(
                            loiMoi.IdKhoaHoc,
                            request.TyLeChiaDoanhThu,
                            ngoaiTruLoiMoiId: loiMoi.Id);
            }

            loiMoi.Visible = request.Visible;
            loiMoi.TyLeChiaDoanhThu = request.TyLeChiaDoanhThu;
            loiMoi.Manage = request.Manage;
            loiMoi.Performance = request.Performance;
            loiMoi.QnA = request.QnA;
            loiMoi.Reviews = request.Reviews;
            loiMoi.Assignments = request.Assignments;
            loiMoi.Materials = request.Materials;
            loiMoi.Promotions = request.Promotions;
            _loiMoiRepo.Update(loiMoi);

            // Nếu đã Accepted → sync sang KhoaHoc_GiangVien
            if (congTacVien != null)
            {
                congTacVien.Visible = request.Visible;
                congTacVien.TyLeChiaDoanhThu = request.TyLeChiaDoanhThu;
                congTacVien.Manage = request.Manage;
                congTacVien.Performance = request.Performance;
                congTacVien.QnA = request.QnA;
                congTacVien.Reviews = request.Reviews;
                congTacVien.Assignments = request.Assignments;
                congTacVien.Materials = request.Materials;
                congTacVien.Promotions = request.Promotions;
                _khoaHocGVRepo.Update(congTacVien);
            }

            await _khoaHocGVRepo.SaveAsync();
        }

        public async Task HuyLoiMoi(Guid idLoiMoi)
        {
            var userId = LayUserId();

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLoiMoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy lời mời");

            if (loiMoi.IdNguoiMoi != userId)
                throw new Exception("Bạn không có quyền hủy lời mời này");

            // Soft-delete lời mời
            _loiMoiRepo.Delete(loiMoi);

            // Nếu đã Accepted → soft-delete luôn cộng tác viên
            if (loiMoi.TrangThai == "Accepted")
            {
                var congTacVien = await _khoaHocGVRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdKhoaHoc == loiMoi.IdKhoaHoc
                                           && x.IdGiangVien == loiMoi.IdNguoiDuocMoi
                                           && !x.IsDeleted);
                if (congTacVien != null)
                    _khoaHocGVRepo.Delete(congTacVien);
            }

            await _khoaHocGVRepo.SaveAsync();
        }

        public async Task<DanhSachGiangVienDto> GetDanhSachGiangVien(Guid idKhoaHoc)
        {
            var userId = LayUserId();

            var laCongTacVien = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdGiangVien == userId
                            && !x.IsDeleted);
            if (!laCongTacVien)
                throw new Exception("Bạn không thuộc khóa học này");

            // ── Danh sách đã accepted ────────────────────────────────────────
            var danhSach = await _khoaHocGVRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .ToListAsync();

            var giangVienIds = danhSach.Select(x => x.IdGiangVien).Distinct().ToList();
            var users = await _appUserService.GetQueryable()
                .Where(x => giangVienIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien, x.Email })
                .ToListAsync();

            var congTacList = danhSach.Select(gv =>
            {
                var user = users.FirstOrDefault(u => u.Id == gv.IdGiangVien);
                return new GiangVienCongTacDto
                {
                    IdGiangVien = gv.IdGiangVien,
                    HoTen = user?.HoTen,
                    AnhDaiDien = user?.AnhDaiDien,
                    Email = user?.Email,
                    LaChuSoHuu = gv.LaChuSoHuu,
                    Visible = gv.Visible,
                    TyLeChiaDoanhThu = gv.TyLeChiaDoanhThu,
                    Manage = gv.Manage,
                    Performance = gv.Performance,
                    QnA = gv.QnA,
                    Reviews = gv.Reviews,
                    Assignments = gv.Assignments,
                    Materials = gv.Materials,
                    Promotions = gv.Promotions,
                };
            }).ToList();

            // ── Danh sách đang Pending ───────────────────────────────────────
            var pendingList = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted)
                .ToListAsync();

            var pendingUserIds = pendingList.Select(x => x.IdNguoiDuocMoi).Distinct().ToList();
            var pendingUsers = await _appUserService.GetQueryable()
                .Where(x => pendingUserIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            var dangMoiList = pendingList.Select(lm =>
            {
                var u = pendingUsers.FirstOrDefault(x => x.Id == lm.IdNguoiDuocMoi);
                return new LoiMoiDangChoDto
                {
                    IdLoiMoi = lm.Id,
                    EmailDuocMoi = lm.EmailDuocMoi,
                    HoTenDuocMoi = u?.HoTen,
                    AnhDaiDienDuocMoi = u?.AnhDaiDien,
                    Visible = lm.Visible,
                    TyLeChiaDoanhThu = lm.TyLeChiaDoanhThu,
                    Manage = lm.Manage,
                    Performance = lm.Performance,
                    QnA = lm.QnA,
                    Reviews = lm.Reviews,
                    Assignments = lm.Assignments,
                    Materials = lm.Materials,
                    Promotions = lm.Promotions,
                    NgayMoi = lm.CreatedDate,
                };
            }).ToList();

            return new DanhSachGiangVienDto
            {
                DanhSachCongTac = congTacList,
                DanhSachDangMoi = dangMoiList,
            };
        }

        private void KiemTraTyLeHopLe(int tyLe)
        {
            if (tyLe < 0 || tyLe > 100)
                throw new Exception("Tỷ lệ chia doanh thu phải trong khoảng 0-100%");
        }
    }
}
