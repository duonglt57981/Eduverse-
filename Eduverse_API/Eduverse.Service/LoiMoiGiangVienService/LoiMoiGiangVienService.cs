using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.DonHang_GiangVienRepository;
using Eduverse.Repository.DonHang_KhuyenMaiRepository;
using Eduverse.Repository.DonHangChiTietRepository;
using Eduverse.Repository.DonHangRepositoryRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhuyenMai_KhoaHocRepository;
using Eduverse.Repository.KhuyenMaiRepository;
using Eduverse.Repository.LoiMoiGiangVienRepository;
using Eduverse.Repository.ThanhToanRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhuyenMaiService.Dto;
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
        private readonly IDonHang_GiangVienRepository _donHangGiangVienRepo;
        private readonly IDonHangRepository _donHangRepo;
        private readonly IDonHangChiTietRepository _chiTietRepo;
        private readonly IThanhToanRepository _thanhToanRepo;
        private readonly IDonHang_KhuyenMaiRepository _kmDHRepo;
        private readonly IKhuyenMai_KhoaHocRepository _kmKhoaHocRepo;
        private readonly IKhuyenMaiRepository _kmRepo;
        public LoiMoiGiangVienService(ILoiMoiGiangVienRepository loiMoiGiangVienRepository,
            IKhoaHoc_GiangVienRepository khoaHoc_GiangVienRepository,
            IKhoaHocRepository khoaHocRepo,
            IAppUserService appUserService,
            INotificationPublisher notificationPublisher,
            IDonHang_GiangVienRepository donHangGiangVienRepo,
            IDonHangRepository donHangRepo,
            IDonHangChiTietRepository donHangChiTietRepository,
            IThanhToanRepository thanhToanRepository,
            IDonHang_KhuyenMaiRepository khuyenMaiDHRepository,
            IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository,
            IKhuyenMaiRepository khuyenMaiRepository,
            IHttpContextAccessor httpContextAccessor) : base(loiMoiGiangVienRepository)
        {
            _loiMoiRepo = loiMoiGiangVienRepository;
            _khoaHocGVRepo = khoaHoc_GiangVienRepository;
            _khoaHocRepo = khoaHocRepo;
            _appUserService = appUserService;
            _notificationPublisher = notificationPublisher;
            _httpContextAccessor = httpContextAccessor;
            _donHangGiangVienRepo = donHangGiangVienRepo;
            _donHangRepo = donHangRepo;
            _chiTietRepo = donHangChiTietRepository;
            _thanhToanRepo = thanhToanRepository;
            _kmDHRepo = khuyenMaiDHRepository;
            _kmKhoaHocRepo = khuyenMai_KhoaHocRepository;
            _kmRepo = khuyenMaiRepository;
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


        private bool LaAdmin() =>
            _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;

        public async Task<QuyenCuaToiDto> GetQuyenCuaToi(Guid idKhoaHoc)
        {
            var userId = LayUserId();

            var allKhoaHocIds = new List<Guid> { idKhoaHoc };
            var kh = await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(k => k.Id == idKhoaHoc);
            if (kh != null)
            {
                if (kh.IdBanGhiTruoc.HasValue) allKhoaHocIds.Add(kh.IdBanGhiTruoc.Value);
                var relatedIds = await _khoaHocRepo.GetQueryable()
                    .Where(k => (k.IdBanGhiTruoc == idKhoaHoc || (kh.IdBanGhiTruoc.HasValue && k.IdBanGhiTruoc == kh.IdBanGhiTruoc.Value)) && !k.IsDeleted)
                    .Select(k => k.Id)
                    .ToListAsync();
                allKhoaHocIds.AddRange(relatedIds);
                allKhoaHocIds = allKhoaHocIds.Distinct().ToList();
            }

            var ctv = await _khoaHocGVRepo.GetQueryable()
                .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                         && x.IdGiangVien == userId
                         && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            var user = await _appUserService.GetQueryable()
                .Where(u => u.Id == userId)
                .Select(u => new { u.HoTen, u.Email, u.AnhDaiDien })
                .FirstOrDefaultAsync();

            if (ctv == null)
            {
                if (kh != null && kh.CreatedId == userId)
                {
                    return new QuyenCuaToiDto
                    {
                        IdGiangVien = userId,
                        HoTen = user?.HoTen,
                        Email = user?.Email,
                        AnhDaiDien = user?.AnhDaiDien,
                        LaChuSoHuu = true,
                        TyLeChiaDoanhThu = 100,
                        Visible = true,
                        Manage = true,
                        Performance = true,
                        QnA = true,
                        Reviews = true,
                        Assignments = true,
                        Materials = true,
                        Promotions = true,
                    };
                }
                throw new Exception("Bạn không thuộc khóa học này");
            }

            var tyLeCuaToi = ctv.TyLeChiaDoanhThu;
            if (tyLeCuaToi == 0 && !ctv.LaChuSoHuu)
            {
                var acceptedLoiMoi = await _loiMoiRepo.GetQueryable()
                    .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                             && x.IdNguoiDuocMoi == userId
                             && !x.IdKhuyenMai.HasValue
                             && !x.IsDeleted)
                    .OrderByDescending(x => x.CreatedDate)
                    .FirstOrDefaultAsync();
                if (acceptedLoiMoi != null && acceptedLoiMoi.TyLeChiaDoanhThu > 0)
                {
                    tyLeCuaToi = acceptedLoiMoi.TyLeChiaDoanhThu;
                }
            }

            return new QuyenCuaToiDto
            {
                IdGiangVien = ctv.IdGiangVien,
                HoTen = user?.HoTen,
                Email = user?.Email,
                AnhDaiDien = user?.AnhDaiDien,
                LaChuSoHuu = ctv.LaChuSoHuu,
                TyLeChiaDoanhThu = tyLeCuaToi,
                Visible = ctv.Visible,
                Manage = ctv.Manage,
                Performance = ctv.Performance,
                QnA = ctv.QnA,
                Reviews = ctv.Reviews,
                Assignments = ctv.Assignments,
                Materials = ctv.Materials,
                Promotions = ctv.Promotions,
            };
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
                         && !x.IdKhuyenMai.HasValue         
                         && x.IdNguoiMoi != x.IdNguoiDuocMoi
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

            var khoaHoc = await _khoaHocRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc);

            var tyLeHoanLai = congTacVien.TyLeChiaDoanhThu;

            _khoaHocGVRepo.Delete(congTacVien);

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdNguoiDuocMoi == idGiangVien
                                       && !x.IsDeleted);
            if (loiMoi != null) _loiMoiRepo.Delete(loiMoi);

            // ── Hoàn lại % cho chủ sở hữu ─────────────────────────
            if (tyLeHoanLai > 0)
            {
                var chuSoHuu = await _khoaHocGVRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                           && x.IdGiangVien == userId
                                           && x.LaChuSoHuu
                                           && !x.IsDeleted);
                if (chuSoHuu != null)
                {
                    chuSoHuu.TyLeChiaDoanhThu += tyLeHoanLai;
                    _khoaHocGVRepo.Update(chuSoHuu);
                }
            }

            await _khoaHocGVRepo.SaveAsync();

            await _notificationPublisher.NotifyUserAsync(idGiangVien, new NotificationPayload
            {
                TieuDe = "Bạn đã bị xóa khỏi khóa học",
                NoiDung = $"Bạn không còn là giảng viên cộng tác của khóa học \"{khoaHoc?.TieuDe}\".",
                LoaiThongBao = "XoaKhoiKhoaHoc",
                Link = "/instructor/manager-courses",
                FromUser = userId,
                ItemId = idKhoaHoc,
                ItemName = khoaHoc?.TieuDe
            });
        }

        public async Task<LoiMoiGiangVienDto> GuiLoiMoi(GuiLoiMoiRequest request)
        {
            var userId = LayUserId();
            var emailChuan = request.Email?.Trim().ToLower();

            var khoaHoc = await _khoaHocRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdKhoaHoc && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy khóa học");

            if (khoaHoc.TrangThaiPheDuyet == "DaDuyet")
                throw new Exception("Khóa học đã được duyệt, không thể mời thêm giảng viên mới. Bạn vẫn có thể chỉnh sửa quyền của giảng viên hiện có.");

            var laChu = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                            && x.IdGiangVien == userId
                            && x.LaChuSoHuu
                            && !x.IsDeleted);
            if (!laChu)
                throw new Exception("Chỉ chủ sở hữu mới được mời giảng viên");

            var nguoiDuocMoi = await _appUserService.GetQueryable()
                .FirstOrDefaultAsync(x => x.Email.ToLower() == emailChuan && !x.IsDeleted)
                ?? throw new Exception("Email này chưa có tài khoản giảng viên trên hệ thống");

            if (nguoiDuocMoi.Id == userId)
                throw new Exception("Bạn không thể mời chính mình");

            var daTonTai = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                            && x.IdGiangVien == nguoiDuocMoi.Id
                            && !x.IsDeleted);
            if (daTonTai)
                throw new Exception("Giảng viên này đã tham gia khóa học");

            var loiMoiCu = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                                       && x.IdNguoiDuocMoi == nguoiDuocMoi.Id
                                       && x.TrangThai == "Pending"
                                       && !x.IsDeleted);
            if (loiMoiCu != null)
                throw new Exception("Đã có lời mời đang chờ xác nhận với giảng viên này");

            // Chỉ cần validate % hợp lệ (0-100) — KHÔNG dùng KiemTraTongTyLe ở đây,
            // vì % mời mới là "chuyển nhượng" từ chủ sở hữu, không phải "cộng thêm"
            // vào tổng. Việc trừ % chủ sở hữu bên dưới đã tự đảm bảo tổng ≤ 100%.
            KiemTraTyLeHopLe(request.TyLeChiaDoanhThu);

            // ── Tự động trừ % vừa mời từ chủ sở hữu ─────────────────────────
            var chuSoHuu = await _khoaHocGVRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == request.IdKhoaHoc
                                       && x.IdGiangVien == userId
                                       && x.LaChuSoHuu
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy thông tin chủ sở hữu khóa học");

            bool daTruChuSoHuu = false;

            if (request.TyLeChiaDoanhThu > 0)
            {
                if (chuSoHuu.TyLeChiaDoanhThu <= 0)
                    throw new Exception("Chủ sở hữu đã chia hết 100% doanh thu (đang ở 0%). Vui lòng điều chỉnh lại tỷ lệ chia doanh thu của các giảng viên hiện có trước khi mời thêm.");

                if (chuSoHuu.TyLeChiaDoanhThu < request.TyLeChiaDoanhThu)
                    throw new Exception($"Chủ sở hữu chỉ còn {chuSoHuu.TyLeChiaDoanhThu}% khả dụng, không đủ để chia {request.TyLeChiaDoanhThu}% cho giảng viên mới.");

                chuSoHuu.TyLeChiaDoanhThu -= request.TyLeChiaDoanhThu;
                _khoaHocGVRepo.Update(chuSoHuu);
                await _khoaHocGVRepo.SaveAsync();
                daTruChuSoHuu = true;
            }

            var loiMoi = new LoiMoiGiangVien
            {
                IdKhoaHoc = request.IdKhoaHoc,
                IdNguoiMoi = userId,
                IdNguoiDuocMoi = nguoiDuocMoi.Id,
                EmailDuocMoi = nguoiDuocMoi.Email,
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

            try
            {
                _loiMoiRepo.Add(loiMoi);
                await _loiMoiRepo.SaveAsync();
            }
            catch
            {
                if (daTruChuSoHuu)
                {
                    chuSoHuu.TyLeChiaDoanhThu += request.TyLeChiaDoanhThu;
                    _khoaHocGVRepo.Update(chuSoHuu);
                    await _khoaHocGVRepo.SaveAsync();
                }
                throw;
            }

            await _notificationPublisher.NotifyUserAsync(nguoiDuocMoi.Id, new NotificationPayload
            {
                TieuDe = "Lời mời đồng giảng dạy",
                NoiDung = $"Bạn được mời tham gia giảng dạy khóa học \"{khoaHoc.TieuDe}\".",
                LoaiThongBao = "LoiMoiDongGiangVien",
                Link = "/instructor/invites",
                FromUser = userId,
                ItemId = loiMoi.Id,
                ItemName = khoaHoc.TieuDe
            });

            return new LoiMoiGiangVienDto
            {
                Id = loiMoi.Id,
                IdKhoaHoc = loiMoi.IdKhoaHoc,
                EmailDuocMoi = loiMoi.EmailDuocMoi,
                TrangThai = loiMoi.TrangThai,
                Visible = loiMoi.Visible,
                TyLeChiaDoanhThu = loiMoi.TyLeChiaDoanhThu,
                Manage = loiMoi.Manage,
                Performance = loiMoi.Performance,
                QnA = loiMoi.QnA,
                Reviews = loiMoi.Reviews,
                Assignments = loiMoi.Assignments,
                Materials = loiMoi.Materials,
                Promotions = loiMoi.Promotions,
                NgayMoi = loiMoi.CreatedDate,
                NgayPhanHoi = loiMoi.NgayPhanHoi,
            };
        }

        public async Task PhanHoi(Guid idLoiMoi, bool dongY)
        {
            var userId = LayUserId();

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLoiMoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy lời mời");

            if (loiMoi.IdKhuyenMai.HasValue)
                throw new Exception("Đây là lời mời áp dụng khuyến mãi, vui lòng dùng chức năng phản hồi khuyến mãi");

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
            else
            {
                // ── Từ chối → hoàn lại % đã bị trừ từ chủ sở hữu lúc gửi lời mời ──
                if (loiMoi.TyLeChiaDoanhThu > 0)
                {
                    var chuSoHuu = await _khoaHocGVRepo.GetQueryable()
                        .FirstOrDefaultAsync(x => x.IdKhoaHoc == loiMoi.IdKhoaHoc
                                               && x.IdGiangVien == loiMoi.IdNguoiMoi
                                               && x.LaChuSoHuu
                                               && !x.IsDeleted);
                    if (chuSoHuu != null)
                    {
                        chuSoHuu.TyLeChiaDoanhThu += loiMoi.TyLeChiaDoanhThu;
                        _khoaHocGVRepo.Update(chuSoHuu);
                    }
                }
            }

            await _khoaHocGVRepo.SaveAsync();
        }
        public async Task<List<LoiMoiChoXacNhanDto>> GetLoiMoiCuaToi()
        {
            var userId = LayUserId();

            var loiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdNguoiDuocMoi == userId
                         && !x.IdKhuyenMai.HasValue
                         && x.IdNguoiMoi != x.IdNguoiDuocMoi
                         && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            if (!loiMois.Any()) return new List<LoiMoiChoXacNhanDto>();

            var khoaHocIds = loiMois.Select(x => x.IdKhoaHoc).Distinct().ToList();
            var nguoiMoiIds = loiMois.Select(x => x.IdNguoiMoi).Distinct().ToList();

            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(x => khoaHocIds.Contains(x.Id) && !x.IsDeleted && x.TrangThai != "DaXoa")
                .Select(x => new { x.Id, x.TieuDe, x.HinhAnhKhoaHoc })
                .ToListAsync();

            var nguoiMois = await _appUserService.GetQueryable()
                .Where(x => nguoiMoiIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            return loiMois
                .Select(lm =>
                {
                    var kh = khoaHocs.FirstOrDefault(k => k.Id == lm.IdKhoaHoc);
                    var nm = nguoiMois.FirstOrDefault(n => n.Id == lm.IdNguoiMoi);
                    if (kh == null) return null;

                    return new LoiMoiChoXacNhanDto
                    {
                        Id = lm.Id,
                        IdKhoaHoc = lm.IdKhoaHoc,
                        IdNguoiMoi = lm.IdNguoiMoi,
                        TenKhoaHoc = kh.TieuDe,
                        HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
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
                })
                .Where(x => x != null)!
                .ToList();
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

        public async Task CapNhatQuyenHangLoat(Guid idKhoaHoc, CapNhatQuyenHangLoatRequest request)
        {
            var userId = LayUserId();

            var allKhoaHocIds = new List<Guid> { idKhoaHoc };
            var kh = await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(k => k.Id == idKhoaHoc);
            if (kh != null)
            {
                if (kh.IdBanGhiTruoc.HasValue) allKhoaHocIds.Add(kh.IdBanGhiTruoc.Value);
                var relatedIds = await _khoaHocRepo.GetQueryable()
                    .Where(k => (k.IdBanGhiTruoc == idKhoaHoc || (kh.IdBanGhiTruoc.HasValue && k.IdBanGhiTruoc == kh.IdBanGhiTruoc.Value)) && !k.IsDeleted)
                    .Select(k => k.Id)
                    .ToListAsync();
                allKhoaHocIds.AddRange(relatedIds);
                allKhoaHocIds = allKhoaHocIds.Distinct().ToList();
            }

            // Chỉ chủ sở hữu mới được sửa
            var laChu = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                            && x.IdGiangVien == userId
                            && x.LaChuSoHuu
                            && !x.IsDeleted);
            if (!laChu && kh != null && kh.CreatedId == userId) laChu = true;
            if (!laChu) throw new Exception("Chỉ chủ sở hữu mới được cập nhật quyền");

            if (request.DanhSach == null || !request.DanhSach.Any())
                throw new Exception("Danh sách cập nhật trống");

            // Không cho trùng idGiangVien trong cùng 1 lần gửi
            if (request.DanhSach.Select(x => x.IdGiangVien).Distinct().Count() != request.DanhSach.Count)
                throw new Exception("Danh sách có giảng viên bị trùng lặp");

            foreach (var item in request.DanhSach)
                KiemTraTyLeHopLe(item.TyLeChiaDoanhThu);

            var idGiangViensCanSua = request.DanhSach.Select(x => x.IdGiangVien).ToList();

            // ── Validate tổng % TOÀN BỘ khóa học trong 1 lần, không cộng dồn với DB cũ của các bản ghi sắp bị ghi đè ──
            var tongCongTacVienKhongDoi = await _khoaHocGVRepo.GetQueryable()
                .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                         && !x.IsDeleted
                         && !idGiangViensCanSua.Contains(x.IdGiangVien))
                .SumAsync(x => x.TyLeChiaDoanhThu);

            var tongPendingKhongDoi = await _loiMoiRepo.GetQueryable()
                .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted)
                .SumAsync(x => x.TyLeChiaDoanhThu);

            var tongMoiTrongBatch = request.DanhSach.Sum(x => x.TyLeChiaDoanhThu);

            var tongSauKhiSua = tongCongTacVienKhongDoi + tongPendingKhongDoi + tongMoiTrongBatch;
            if (tongSauKhiSua > 100)
                throw new Exception(
                    $"Tổng tỷ lệ chia doanh thu không được vượt quá 100%. " +
                    $"Các giảng viên khác (không nằm trong lần sửa này) đang chiếm {tongCongTacVienKhongDoi + tongPendingKhongDoi}%, " +
                    $"bạn chỉ có thể phân bổ tối đa {100 - tongCongTacVienKhongDoi - tongPendingKhongDoi}% cho {request.DanhSach.Count} giảng viên đang sửa.");

            // ── Ghi đè 1 lần, cập nhật toàn bộ bản ghi liên kết ──
            var congTacViens = await _khoaHocGVRepo.GetQueryable()
                .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                         && idGiangViensCanSua.Contains(x.IdGiangVien)
                         && !x.IsDeleted)
                .ToListAsync();

            foreach (var item in request.DanhSach)
            {
                var matchingCtvs = congTacViens.Where(x => x.IdGiangVien == item.IdGiangVien).ToList();
                if (!matchingCtvs.Any())
                {
                    // Tạo bản ghi cho idKhoaHoc hiện tại nếu chưa có
                    var newCtv = new KhoaHoc_GiangVien
                    {
                        Id = Guid.NewGuid(),
                        IdKhoaHoc = idKhoaHoc,
                        IdGiangVien = item.IdGiangVien,
                        LaChuSoHuu = (kh != null && kh.CreatedId == item.IdGiangVien),
                        Visible = item.Visible,
                        TyLeChiaDoanhThu = item.TyLeChiaDoanhThu,
                        Manage = item.Manage,
                        Performance = item.Performance,
                        QnA = item.QnA,
                        Reviews = item.Reviews,
                        Assignments = item.Assignments,
                        Materials = item.Materials,
                        Promotions = item.Promotions,
                    };
                    _khoaHocGVRepo.Add(newCtv);
                }
                else
                {
                    foreach (var ctv in matchingCtvs)
                    {
                        if (ctv.LaChuSoHuu)
                        {
                            ctv.TyLeChiaDoanhThu = item.TyLeChiaDoanhThu;
                            _khoaHocGVRepo.Update(ctv);
                            continue;
                        }

                        ctv.Visible = item.Visible;
                        ctv.TyLeChiaDoanhThu = item.TyLeChiaDoanhThu;
                        ctv.Manage = item.Manage;
                        ctv.Performance = item.Performance;
                        ctv.QnA = item.QnA;
                        ctv.Reviews = item.Reviews;
                        ctv.Assignments = item.Assignments;
                        ctv.Materials = item.Materials;
                        ctv.Promotions = item.Promotions;

                        _khoaHocGVRepo.Update(ctv);
                    }
                }

                // Sync lại lời mời gốc nếu còn tồn tại
                var loiMoiList = await _loiMoiRepo.GetQueryable()
                    .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                             && x.IdNguoiDuocMoi == item.IdGiangVien
                             && !x.IsDeleted)
                    .ToListAsync();
                foreach (var loiMoi in loiMoiList)
                {
                    loiMoi.Visible = item.Visible;
                    loiMoi.TyLeChiaDoanhThu = item.TyLeChiaDoanhThu;
                    loiMoi.Manage = item.Manage;
                    loiMoi.Performance = item.Performance;
                    loiMoi.QnA = item.QnA;
                    loiMoi.Reviews = item.Reviews;
                    loiMoi.Assignments = item.Assignments;
                    loiMoi.Materials = item.Materials;
                    loiMoi.Promotions = item.Promotions;
                    _loiMoiRepo.Update(loiMoi);
                }
            }

            await _khoaHocGVRepo.SaveAsync();
            await _loiMoiRepo.SaveAsync();
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

            if (loiMoi.TrangThai == "Accepted")
            {
                // Nếu đã Accepted → soft-delete luôn cộng tác viên
                var congTacVien = await _khoaHocGVRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdKhoaHoc == loiMoi.IdKhoaHoc
                                           && x.IdGiangVien == loiMoi.IdNguoiDuocMoi
                                           && !x.IsDeleted);
                if (congTacVien != null)
                    _khoaHocGVRepo.Delete(congTacVien);
            }

            // ── Hoàn lại % vừa bị trừ cho chủ sở hữu ─────────────────────────
            // CHỈ hoàn khi lời mời đang Pending hoặc Accepted — % của những
            // trạng thái đó vẫn còn "kẹt" ở lời mời. Nếu đã Rejected, PhanHoi
            // đã hoàn % rồi — hoàn lại lần nữa ở đây sẽ bị double-refund.
            bool canHoanTyLe = loiMoi.TrangThai == "Pending" || loiMoi.TrangThai == "Accepted";

            if (canHoanTyLe
                && loiMoi.TyLeChiaDoanhThu > 0
                && !loiMoi.IdKhuyenMai.HasValue
                && loiMoi.IdNguoiMoi != loiMoi.IdNguoiDuocMoi)
            {
                var chuSoHuu = await _khoaHocGVRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdKhoaHoc == loiMoi.IdKhoaHoc
                                           && x.IdGiangVien == loiMoi.IdNguoiMoi
                                           && x.LaChuSoHuu
                                           && !x.IsDeleted);
                if (chuSoHuu != null)
                {
                    chuSoHuu.TyLeChiaDoanhThu += loiMoi.TyLeChiaDoanhThu;
                    _khoaHocGVRepo.Update(chuSoHuu);
                }
            }

            await _khoaHocGVRepo.SaveAsync();

            await _notificationPublisher.NotifyUserAsync(loiMoi.IdNguoiDuocMoi, new NotificationPayload
            {
                TieuDe = "Lời mời đã bị hủy",
                NoiDung = "Lời mời đồng giảng dạy của bạn đã bị chủ sở hữu khóa học hủy.",
                LoaiThongBao = "HuyLoiMoi",
                FromUser = userId,
                ItemId = loiMoi.IdKhoaHoc,
            });
        }

        public async Task<DanhSachGiangVienDto> GetDanhSachGiangVien(Guid idKhoaHoc)
        {
            var userId = LayUserId();
            var laAdmin = LaAdmin();

            var allKhoaHocIds = new List<Guid> { idKhoaHoc };
            var kh = await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(k => k.Id == idKhoaHoc);
            if (kh != null)
            {
                if (kh.IdBanGhiTruoc.HasValue) allKhoaHocIds.Add(kh.IdBanGhiTruoc.Value);
                var relatedIds = await _khoaHocRepo.GetQueryable()
                    .Where(k => (k.IdBanGhiTruoc == idKhoaHoc || (kh.IdBanGhiTruoc.HasValue && k.IdBanGhiTruoc == kh.IdBanGhiTruoc.Value)) && !k.IsDeleted)
                    .Select(k => k.Id)
                    .ToListAsync();
                allKhoaHocIds.AddRange(relatedIds);
                allKhoaHocIds = allKhoaHocIds.Distinct().ToList();
            }

            var laChu = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                            && x.IdGiangVien == userId
                            && x.LaChuSoHuu
                            && !x.IsDeleted);

            if (!laChu && kh != null && kh.CreatedId == userId) laChu = true;

            var laThanhVien = laChu || laAdmin || await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                            && x.IdGiangVien == userId
                            && !x.IsDeleted);

            if (!laThanhVien)
                throw new Exception("Bạn không có quyền truy cập khóa học này");

            // ── Danh sách đã accepted ────────────────────────────────────────
            var danhSach = await _khoaHocGVRepo.GetQueryable()
                .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc) && !x.IsDeleted)
                .ToListAsync();

            // Nhóm theo IdGiangVien để lấy bản ghi mới nhất nếu có nhiều version
            danhSach = danhSach
                .GroupBy(x => x.IdGiangVien)
                .Select(g => g.OrderByDescending(x => x.CreatedDate).First())
                .ToList();

            // Nếu không có chủ sở hữu trong danhSach nhưng biết kh.CreatedId:
            if (!danhSach.Any(x => x.LaChuSoHuu) && kh?.CreatedId != null)
            {
                var tongCongTac = danhSach.Where(x => !x.LaChuSoHuu).Sum(x => x.TyLeChiaDoanhThu);
                danhSach.Insert(0, new KhoaHoc_GiangVien
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = idKhoaHoc,
                    IdGiangVien = kh.CreatedId.Value,
                    LaChuSoHuu = true,
                    Visible = true,
                    TyLeChiaDoanhThu = Math.Max(0, 100 - tongCongTac),
                    Manage = true,
                    Performance = true,
                    QnA = true,
                    Reviews = true,
                    Assignments = true,
                    Materials = true,
                    Promotions = true,
                });
            }

            // Nếu không phải chủ sở hữu và không phải admin: Chỉ lấy thông tin của chính mình
            if (!laChu && !laAdmin)
            {
                danhSach = danhSach.Where(x => x.IdGiangVien == userId).ToList();
            }

            var giangVienIds = danhSach.Select(x => x.IdGiangVien).Distinct().ToList();
            var users = await _appUserService.GetQueryable()
                .Where(x => giangVienIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien, x.Email })
                .ToListAsync();

            var acceptedLoiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                         && !x.IdKhuyenMai.HasValue
                         && !x.IsDeleted)
                .ToListAsync();

            var congTacList = danhSach.Select(gv =>
            {
                var user = users.FirstOrDefault(u => u.Id == gv.IdGiangVien);
                var tyLe = gv.TyLeChiaDoanhThu;
                if (tyLe == 0 && !gv.LaChuSoHuu)
                {
                    var lm = acceptedLoiMois.FirstOrDefault(x => x.IdNguoiDuocMoi == gv.IdGiangVien);
                    if (lm != null && lm.TyLeChiaDoanhThu > 0) tyLe = lm.TyLeChiaDoanhThu;
                }
                return new GiangVienCongTacDto
                {
                    IdGiangVien = gv.IdGiangVien,
                    HoTen = user?.HoTen,
                    AnhDaiDien = user?.AnhDaiDien,
                    Email = user?.Email,
                    LaChuSoHuu = gv.LaChuSoHuu,
                    Visible = gv.Visible,
                    TyLeChiaDoanhThu = tyLe,
                    Manage = gv.Manage,
                    Performance = gv.Performance,
                    QnA = gv.QnA,
                    Reviews = gv.Reviews,
                    Assignments = gv.Assignments,
                    Materials = gv.Materials,
                    Promotions = gv.Promotions,
                };
            }).ToList();

            // ── Danh sách đang Pending: Chỉ chủ sở hữu và Admin mới xem được ──
            var dangMoiList = new List<LoiMoiDangChoDto>();
            if (laChu || laAdmin)
            {
                var pendingList = await _loiMoiRepo.GetQueryable()
                    .Where(x => allKhoaHocIds.Contains(x.IdKhoaHoc)
                             && x.TrangThai == "Pending"
                             && !x.IdKhuyenMai.HasValue   
                             && x.IdNguoiMoi != x.IdNguoiDuocMoi
                             && !x.IsDeleted)
                    .ToListAsync();

                var pendingUserIds = pendingList.Select(x => x.IdNguoiDuocMoi).Distinct().ToList();
                var pendingUsers = await _appUserService.GetQueryable()
                    .Where(x => pendingUserIds.Contains(x.Id))
                    .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                    .ToListAsync();

                dangMoiList = pendingList.Select(lm =>
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
            }

            return new DanhSachGiangVienDto
            {
                DanhSachCongTac = congTacList,
                DanhSachDangMoi = dangMoiList,
            };
        }
        // ── Lịch sử doanh thu theo giảng viên 
        public async Task<List<LichSuNhanTheoDonDto>> GetLichSuDonHang(Guid idKhoaHoc, Guid idGiangVien)
        {
            var userId = LayUserId();
            var coQuyenXem = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == userId && !x.IsDeleted
                            && (x.LaChuSoHuu || x.Performance));
            if (!coQuyenXem) throw new Exception("Bạn không có quyền xem lịch sử doanh thu của khóa học này");

            var ds = await _donHangGiangVienRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == idGiangVien && !x.IsDeleted)
                .OrderByDescending(x => x.NgayGhiNhan)
                .ToListAsync();

            return ds.Select(x => new LichSuNhanTheoDonDto
            {
                IdDonHang = x.IdDonHang,
                TyLeChiaDoanhThu = x.TyLeChiaDoanhThu,
                GiaLucDat = x.GiaLucDat,
                SoTienGiam = x.SoTienGiam,
                SoTienNhan = x.SoTienNhan,
                NgayGhiNhan = x.NgayGhiNhan,
            }).ToList();
        }

        public async Task<List<LichSuThayDoiTyLeDto>> GetLichSuThayDoiTyLe(Guid idKhoaHoc, Guid idGiangVien)
        {
            var userId = LayUserId();
            var coQuyenXem = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == userId && !x.IsDeleted
                            && (x.LaChuSoHuu || x.Performance));
            if (!coQuyenXem) throw new Exception("Bạn không có quyền xem lịch sử doanh thu của khóa học này");

            var donHangs = await _donHangGiangVienRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == idGiangVien && !x.IsDeleted)
                .OrderBy(x => x.NgayGhiNhan)
                .ToListAsync();

            var ketQua = new List<LichSuThayDoiTyLeDto>();
            int? tyLeTruoc = null;

            foreach (var dh in donHangs)
            {
                if (tyLeTruoc.HasValue && tyLeTruoc.Value != dh.TyLeChiaDoanhThu)
                {
                    ketQua.Add(new LichSuThayDoiTyLeDto
                    {
                        TyLeCu = tyLeTruoc.Value,
                        TyLeMoi = dh.TyLeChiaDoanhThu,
                        NgayThayDoi = dh.NgayGhiNhan,
                    });
                }
                tyLeTruoc = dh.TyLeChiaDoanhThu;
            }

            ketQua.Reverse();
            return ketQua;
        }


        private void KiemTraTyLeHopLe(int tyLe)
        {
            if (tyLe < 0 || tyLe > 100)
                throw new Exception("Tỷ lệ chia doanh thu phải trong khoảng 0-100%");
        }
        public async Task<int> BackfillDonHangGiangVienAsync()
        {
            var donHangDaXuLyIds = await _donHangGiangVienRepo.GetQueryable()
                .Where(x => !x.IsDeleted)
                .Select(x => x.IdDonHang)
                .Distinct()
                .ToListAsync();

            var chiTiets = await (
                from ct in _chiTietRepo.GetQueryable()
                join dh in _donHangRepo.GetQueryable() on ct.IdDonHang equals dh.Id
                join tt in _thanhToanRepo.GetQueryable() on dh.Id equals tt.IdDonHang
                where !ct.IsDeleted && !dh.IsDeleted
                   && dh.TrangThai == 1
                   && tt.TrangThaiThanhToan == "SUCCESS"
                   && !donHangDaXuLyIds.Contains(dh.Id)
                select new { ct.Id, ct.IdDonHang, ct.IdKhoaHoc, ct.GiaLucDat, dh.NgayTao }
            ).ToListAsync();

            if (!chiTiets.Any()) return 0;

            var khoaHocIds = chiTiets.Select(x => x.IdKhoaHoc).Distinct().ToList();
            var donHangIds = chiTiets.Select(x => x.IdDonHang!.Value).Distinct().ToList();

            var vouchers = await _kmDHRepo.GetQueryable()
                .Where(x => donHangIds.Contains(x.IdDonHang!.Value) && !x.IsDeleted)
                .ToListAsync();

            // ⚠️ Không có log tỷ lệ theo thời gian trước đây, nên buộc phải xấp xỉ
            // bằng tỷ lệ HIỆN TẠI trong KhoaHoc_GiangVien — chấp nhận sai số với các
            // khóa học đã từng đổi % chia doanh thu qua nhiều lần.
            var thanhViens = await _khoaHocGVRepo.GetQueryable()
                .Where(x => khoaHocIds.Contains(x.IdKhoaHoc) && !x.IsDeleted)
                .ToListAsync();

            var banGhiMoi = new List<DonHang_GiangVien>();
            foreach (var ct in chiTiets)
            {
                if (!ct.IdKhoaHoc.HasValue)
                    continue;

                var idKhoaHoc = ct.IdKhoaHoc.Value;

                var giamGia = vouchers
                    .Where(v =>
                        v.IdDonHang == ct.IdDonHang &&
                        v.IdKhoaHocDuocGiam == idKhoaHoc)
                    .Sum(v => v.SoTienGiam ?? 0);

                var tienThucThu = Math.Max(
                    0,
                    (ct.GiaLucDat ?? 0) - giamGia
                );

                var phanGiangVien70 = tienThucThu * 0.7;

                foreach (var gv in thanhViens.Where(t => t.IdKhoaHoc == idKhoaHoc))
                {
                    banGhiMoi.Add(new DonHang_GiangVien
                    {
                        IdDonHang = ct.IdDonHang!.Value,
                        IdDonHangChiTiet = ct.Id,
                        IdKhoaHoc = idKhoaHoc,
                        IdGiangVien = gv.IdGiangVien,
                        LaChuSoHuu = gv.LaChuSoHuu,
                        TyLeChiaDoanhThu = gv.TyLeChiaDoanhThu,
                        GiaLucDat = ct.GiaLucDat ?? 0,
                        SoTienGiam = giamGia,
                        SoTienNhan = Math.Round(
                            phanGiangVien70 * gv.TyLeChiaDoanhThu / 100.0,
                            0
                        ),
                        NgayGhiNhan = ct.NgayTao ?? DateTime.UtcNow,
                    });
                }
            }

            foreach (var item in banGhiMoi) _donHangGiangVienRepo.Add(item);
            await _donHangGiangVienRepo.SaveAsync();
            return banGhiMoi.Count;
        }

        private async Task<Guid?> TimNguoiDuyetPromotion(Guid idKhoaHoc, KhoaHoc? khoaHoc = null)
        {
            var thanhViens = await _khoaHocGVRepo.GetQueryable()
          .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted
                   && (x.LaChuSoHuu || x.Promotions))
          .ToListAsync();

            var owner = thanhViens.FirstOrDefault(x => x.LaChuSoHuu) ?? thanhViens.FirstOrDefault();
            // ★ FIX: loại cả trường hợp IdGiangVien = Guid.Empty (dữ liệu hỏng),
            // không chỉ null — nếu không sẽ tạo lời mời gửi cho "không ai cả".
            if (owner != null && owner.IdGiangVien != Guid.Empty)
                return owner.IdGiangVien;

            khoaHoc ??= await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc);

            // ★ FIX: CreatedId là Guid không nullable → mặc định Guid.Empty chứ
            // không phải null khi chưa từng được set. Phải chặn ở đây, nếu không
            // "khoaHoc?.CreatedId" vẫn trả về Guid.Empty (có giá trị) và lọt qua
            // check "== null" ở TaoLoiMoiApDungKhuyenMai, tạo ra lời mời không ai
            // nhận được (IdNguoiDuocMoi = Guid.Empty).
            if (khoaHoc != null && khoaHoc.CreatedId != Guid.Empty)
                return khoaHoc.CreatedId;

            return null;
        }

        public async Task<List<Guid>> TaoLoiMoiApDungKhuyenMai(Guid idKhuyenMai, List<Guid> idsKhoaHoc)
        {
            var userId = LayUserId(); // Admin đang tạo/sửa khuyến mãi

            var idsTaoMoi = new List<Guid>();

            foreach (var idKhoaHoc in idsKhoaHoc.Distinct())
            {
                var daCoPending = await _loiMoiRepo.GetQueryable()
                    .AnyAsync(x => x.IdKhuyenMai == idKhuyenMai
                                && x.IdKhoaHoc == idKhoaHoc
                                && x.TrangThai == "Pending"
                                && !x.IsDeleted);
                if (daCoPending) continue;

                var khoaHoc = await _khoaHocRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == idKhoaHoc);
                if (khoaHoc == null) continue;

                var idNguoiDuyet = await TimNguoiDuyetPromotion(idKhoaHoc, khoaHoc);
                if (idNguoiDuyet == null)
                {
                    Console.WriteLine($"[KhuyenMai] Bỏ qua khóa học {idKhoaHoc}: không xác định được người duyệt (không có KhoaHoc_GiangVien lẫn CreatedId).");
                    continue;
                }

                var loiMoi = new Model.Entities.LoiMoiGiangVien
                {
                    IdKhuyenMai = idKhuyenMai,
                    IdKhoaHoc = idKhoaHoc,
                    IdNguoiMoi = userId,
                    IdNguoiDuocMoi = idNguoiDuyet.Value,
                    EmailDuocMoi = string.Empty,
                    TrangThai = "Pending",
                    NgayPhanHoi = (DateTime?)null,
                    Visible = false,
                    TyLeChiaDoanhThu = 0,
                    Manage = false,
                    Performance = false,
                    QnA = false,
                    Reviews = false,
                    Assignments = false,
                    Materials = false,
                    Promotions = true,
                };

                _loiMoiRepo.Add(loiMoi);
                idsTaoMoi.Add(idKhoaHoc);
                try
                {
                    await _loiMoiRepo.SaveAsync();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("=== LỖI TẠO LỜI MỜI KHUYẾN MÃI ===");
                    Console.WriteLine(ex.ToString());
                    throw;
                }

                await _notificationPublisher.NotifyUserAsync(idNguoiDuyet.Value, new NotificationPayload
                {
                    TieuDe = "Yêu cầu áp dụng mã khuyến mãi",
                    NoiDung = $"Quản trị viên muốn áp dụng mã khuyến mãi cho khóa học \"{khoaHoc.TieuDe}\". Vui lòng xem và xác nhận.",
                    LoaiThongBao = "LoiMoiApDungKhuyenMai",
                    Link = "/instructor/invites",
                    FromUser = userId,
                    ItemId = loiMoi.Id,
                    ItemName = khoaHoc.TieuDe
                });
            }

            return idsTaoMoi;
        }

        public async Task<List<LoiMoiKhuyenMaiChoXacNhanDto>> GetLoiMoiKhuyenMaiCuaToi()
        {
            var userId = LayUserId();

            var loiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdNguoiDuocMoi == userId
                         && x.IdKhuyenMai.HasValue
                         && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            if (!loiMois.Any()) return new List<LoiMoiKhuyenMaiChoXacNhanDto>();

            var khuyenMaiIds = loiMois.Select(x => x.IdKhuyenMai!.Value).Distinct().ToList();
            var khoaHocIds = loiMois.Select(x => x.IdKhoaHoc).Distinct().ToList();
            var nguoiMoiIds = loiMois.Select(x => x.IdNguoiMoi).Distinct().ToList();

            var khuyenMais = await _kmRepo.GetQueryable()
                .Where(x => khuyenMaiIds.Contains(x.Id))
                .Select(x => new { x.Id, x.MaGiamGia, x.PhanTramGiam, x.NgayBatDau, x.NgayKetThuc })
                .ToListAsync();

            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(x => khoaHocIds.Contains(x.Id) && !x.IsDeleted && x.TrangThai != "DaXoa")
                .Select(x => new { x.Id, x.TieuDe, x.HinhAnhKhoaHoc })
                .ToListAsync();

            var nguoiMois = await _appUserService.GetQueryable()
                .Where(x => nguoiMoiIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            return loiMois
                .Select(lm =>
                {
                    var km = khuyenMais.FirstOrDefault(k => k.Id == lm.IdKhuyenMai);
                    var kh = khoaHocs.FirstOrDefault(k => k.Id == lm.IdKhoaHoc);
                    var nm = nguoiMois.FirstOrDefault(n => n.Id == lm.IdNguoiMoi);
                    if (kh == null) return null;

                    return new LoiMoiKhuyenMaiChoXacNhanDto
                    {
                        Id = lm.Id,
                        IdKhuyenMai = lm.IdKhuyenMai!.Value,
                        MaGiamGia = km?.MaGiamGia,
                        PhanTramGiam = km?.PhanTramGiam,
                        NgayBatDauKM = km?.NgayBatDau,
                        NgayKetThucKM = km?.NgayKetThuc,
                        IdKhoaHoc = lm.IdKhoaHoc,
                        TenKhoaHoc = kh.TieuDe,
                        HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                        TenNguoiMoi = nm?.HoTen,
                        AnhNguoiMoi = nm?.AnhDaiDien,
                        TrangThai = lm.TrangThai,
                        NgayMoi = lm.CreatedDate,
                    };
                })
                .Where(x => x != null)!
                .ToList();
        }

        public async Task PhanHoiKhuyenMai(Guid idLoiMoi, bool dongY)
        {
            var userId = LayUserId();

            var loiMoi = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLoiMoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy lời mời");

            if (!loiMoi.IdKhuyenMai.HasValue)
                throw new Exception("Đây không phải lời mời áp dụng khuyến mãi");

            if (loiMoi.IdNguoiDuocMoi != userId)
                throw new Exception("Lời mời này không dành cho bạn");

            if (loiMoi.TrangThai != "Pending")
                throw new Exception("Lời mời đã được xử lý trước đó");

            // Xác nhận lại quyền Promotions tại thời điểm duyệt (đề phòng bị
            // gỡ quyền / gỡ khỏi khóa học giữa lúc lời mời còn Pending)
            var coQuyen = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == loiMoi.IdKhoaHoc
                            && x.IdGiangVien == userId
                            && !x.IsDeleted
                            && (x.LaChuSoHuu || x.Promotions));
            if (!coQuyen)
                throw new Exception("Bạn không còn quyền quản lý khuyến mãi cho khóa học này");

            loiMoi.TrangThai = dongY ? "Accepted" : "Rejected";
            loiMoi.NgayPhanHoi = DateTime.UtcNow;
            _loiMoiRepo.Update(loiMoi);
            await _loiMoiRepo.SaveAsync();

            if (dongY)
            {
                // Khóa học đã ở trạng thái DaDuyet mới cho gắn khuyến mãi —
                // kiểm tra lại để tránh trường hợp khóa học bị gỡ duyệt
                // trong lúc lời mời còn treo.
                var khoaHoc = await _khoaHocRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == loiMoi.IdKhoaHoc);
                if (khoaHoc == null || khoaHoc.TrangThaiPheDuyet != "DaDuyet")
                    throw new Exception("Khóa học hiện không ở trạng thái đã duyệt, không thể áp dụng khuyến mãi");

                var daCoLink = await _kmKhoaHocRepo.GetQueryable()
                    .AnyAsync(x => x.IdKhuyenMai == loiMoi.IdKhuyenMai && x.IdKhoaHoc == loiMoi.IdKhoaHoc);

                if (!daCoLink)
                {
                    _kmKhoaHocRepo.Add(new KhuyenMai_KhoaHoc
                    {
                        IdKhuyenMai = loiMoi.IdKhuyenMai,
                        IdKhoaHoc = loiMoi.IdKhoaHoc,
                    });
                    await _kmKhoaHocRepo.SaveAsync();
                }
                // Đã liên kết khóa học thành công với mã giảm giá
            }

            // Báo lại cho Admin đã gửi lời mời biết kết quả
            await _notificationPublisher.NotifyUserAsync(loiMoi.IdNguoiMoi, new NotificationPayload
            {
                TieuDe = dongY ? "Khuyến mãi đã được chấp nhận" : "Khuyến mãi đã bị từ chối",
                NoiDung = $"Giảng viên đã {(dongY ? "đồng ý" : "từ chối")} áp dụng mã giảm giá cho khóa học.",
                LoaiThongBao = "PhanHoiApDungKhuyenMai",
                Link = "/admin/promotions",
                FromUser = userId,
                ItemId = loiMoi.IdKhuyenMai,
            });
        }

        private static bool LaKhoaHocKhongHopLeChoKhuyenMai(KhoaHoc kh) =>
            kh.IsDeleted
            || kh.TrangThaiPheDuyet != "DaDuyet"
            || LaKhoaHocMienPhi(kh);

        public async Task<List<LoiMoiApDungKhuyenMaiDto>> GetLoiMoiApDungTheoKhuyenMai(Guid idKhuyenMai)
        {
            var loiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhuyenMai == idKhuyenMai && !x.IsDeleted)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            if (!loiMois.Any()) return new List<LoiMoiApDungKhuyenMaiDto>();

            var khoaHocIds = loiMois.Select(x => x.IdKhoaHoc).Distinct().ToList();
            var giangVienIds = loiMois.Select(x => x.IdNguoiDuocMoi).Distinct().ToList();

            var khoaHocsRaw = await _khoaHocRepo.GetQueryable()
        .Where(x => khoaHocIds.Contains(x.Id))
        .ToListAsync();

            // ★ MỚI: tự huỷ lời mời Pending trỏ tới khóa học không còn hợp lệ (đã
            // xoá / mất duyệt / chuyển miễn phí / xoá cứng khỏi DB) — chỉ cần khóa
            // học không đủ điều kiện là tự rớt khỏi danh sách chờ duyệt của Admin,
            // không cần ai vào xử lý tay.
            var idsTonTai = khoaHocsRaw.Select(x => x.Id).ToHashSet();
            var idsMatHan = khoaHocIds.Except(idsTonTai).ToHashSet(); // xoá cứng, không còn row
            var idsKhongHopLe = khoaHocsRaw
                .Where(LaKhoaHocKhongHopLeChoKhuyenMai)
                .Select(x => x.Id)
                .ToHashSet();
            idsKhongHopLe.UnionWith(idsMatHan);

            if (idsKhongHopLe.Any())
            {
                var loiMoiCanHuy = loiMois
                    .Where(x => x.TrangThai == "Pending" && idsKhongHopLe.Contains(x.IdKhoaHoc))
                    .ToList();
                if (loiMoiCanHuy.Any())
                {
                    _loiMoiRepo.Delete(loiMoiCanHuy);
                    await _loiMoiRepo.SaveAsync();
                    loiMois = loiMois.Except(loiMoiCanHuy).ToList();
                }
            }

            // học sau đó có mất hợp lệ — chỉ Pending mới bị huỷ ở trên.
            var khoaHocs = khoaHocsRaw
                .Select(x => new { x.Id, x.TieuDe, x.HinhAnhKhoaHoc })
                .ToList();

            var giangViens = await _appUserService.GetQueryable()
                .Where(x => giangVienIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen })
                .ToListAsync();

            return loiMois.Select(lm =>
            {
                var kh = khoaHocs.FirstOrDefault(k => k.Id == lm.IdKhoaHoc);
                var gv = giangViens.FirstOrDefault(g => g.Id == lm.IdNguoiDuocMoi);
                return new LoiMoiApDungKhuyenMaiDto
                {
                    IdLoiMoi = lm.Id,
                    IdKhoaHoc = lm.IdKhoaHoc,
                    TenKhoaHoc = kh?.TieuDe,
                    HinhAnhKhoaHoc = kh?.HinhAnhKhoaHoc,
                    IdGiangVienDuocMoi = lm.IdNguoiDuocMoi,
                    TenGiangVien = gv?.HoTen,
                    TrangThai = lm.TrangThai,
                    NgayMoi = lm.CreatedDate,
                    NgayPhanHoi = lm.NgayPhanHoi,
                };
            }).ToList();
        }

        public async Task HuyLoiMoiApDungKhuyenMaiTheoMa(Guid idKhuyenMai)
        {
            var loiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhuyenMai == idKhuyenMai
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted)
                .ToListAsync();

            if (!loiMois.Any()) return;

            _loiMoiRepo.Delete(loiMois);
            await _loiMoiRepo.SaveAsync();
        }

        private async Task<bool> CoQuyenEduverseDeals(Guid idKhoaHoc, Guid userId)
        {
            if (LaAdmin()) return true;

            var khoaHoc = await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc);
            if (khoaHoc == null) return false;
            if (khoaHoc.CreatedId == userId) return true;

            var laChuSoHuu = await _khoaHocGVRepo.GetQueryable()
            .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                    && x.IdGiangVien == userId
                    && x.LaChuSoHuu
                    && !x.IsDeleted);

            return laChuSoHuu;
        }

        private async Task<bool> DaThamGiaEduverseDeals(Guid idKhoaHoc)
        {
            return await _loiMoiRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdNguoiMoi == x.IdNguoiDuocMoi
                            && x.TrangThai == "Accepted"
                            && !x.IsDeleted);
        }

        public async Task<bool> LayTrangThaiEduverseDeals(Guid idKhoaHoc)
        {
            var userId = LayUserId();
            if (!await CoQuyenEduverseDeals(idKhoaHoc, userId))
                throw new Exception("Bạn không có quyền xem trạng thái Eduverse Deals của khóa học này");

            return await DaThamGiaEduverseDeals(idKhoaHoc);
        }

        private static bool LaKhoaHocMienPhi(KhoaHoc kh) =>
            (kh.Gia ?? 0) <= 0
            || kh.LoaiKhoaHoc == "Khóa học miễn phí"
            || kh.LoaiKhoaHoc == "MienPhi";

        public async Task ThamGiaEduverseDeals(Guid idKhoaHoc)
        {
            var userId = LayUserId();
            if (!await CoQuyenEduverseDeals(idKhoaHoc, userId))
                throw new Exception("Bạn không có quyền tham gia Eduverse Deals cho khóa học này");

            var khoaHoc = await _khoaHocRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy khóa học");

            if (LaKhoaHocMienPhi(khoaHoc))
                throw new Exception("Chỉ áp dụng Eduverse Deals cho khóa học có phí");

            _ = await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy khóa học");

            await DanhDauThamGiaEduverseDeals(idKhoaHoc, userId);
            // Idempotent — đã tham gia rồi thì thôi, tránh tạo trùng dòng Accepted
            var daThamGia = await _loiMoiRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdNguoiMoi == userId
                            && x.IdNguoiDuocMoi == userId
                            && x.TrangThai == "Accepted"
                            && !x.IsDeleted);
            if (daThamGia) return;

            var moi = new Model.Entities.LoiMoiGiangVien
            {
                IdKhoaHoc = idKhoaHoc,
                IdNguoiMoi = userId,
                IdNguoiDuocMoi = userId,
                EmailDuocMoi = string.Empty,
                TrangThai = "Accepted",
                NgayPhanHoi = DateTime.UtcNow,
                Visible = false,
                TyLeChiaDoanhThu = 0,
                Manage = false,
                Performance = false,
                QnA = false,
                Reviews = false,
                Assignments = false,
                Materials = false,
                Promotions = false,
            };
            _loiMoiRepo.Add(moi);
            await _loiMoiRepo.SaveAsync();
        }

        public async Task HuyEduverseDeals(Guid idKhoaHoc)
        {
            var userId = LayUserId();
            if (!await CoQuyenEduverseDeals(idKhoaHoc, userId))
                throw new Exception("Bạn không có quyền huỷ Eduverse Deals cho khóa học này");

            var dong = await _loiMoiRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                        && x.IdNguoiMoi == x.IdNguoiDuocMoi
                                        && x.TrangThai == "Accepted"
                                        && !x.IsDeleted);
            if (dong == null) return; // chưa từng tham gia / đã huỷ rồi — coi như thành công
            await GoKhoiKhuyenMaiKhiTatEduverseDeals(idKhoaHoc);
            _loiMoiRepo.Delete(dong); // soft-delete, giống HuyLoiMoi
            await _loiMoiRepo.SaveAsync();
        }

        private async Task DanhDauThamGiaEduverseDeals(Guid idKhoaHoc, Guid userId)
        {
            var daThamGia = await _loiMoiRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdNguoiMoi == userId
                            && x.IdNguoiDuocMoi == userId
                            && x.TrangThai == "Accepted"
                            && !x.IsDeleted);
            if (daThamGia) return;

            var moi = new Model.Entities.LoiMoiGiangVien
            {
                IdKhoaHoc = idKhoaHoc,
                IdNguoiMoi = userId,
                IdNguoiDuocMoi = userId,
                EmailDuocMoi = string.Empty,
                TrangThai = "Accepted",
                NgayPhanHoi = DateTime.UtcNow,
                Visible = false,
                TyLeChiaDoanhThu = 0,
                Manage = false,
                Performance = false,
                QnA = false,
                Reviews = false,
                Assignments = false,
                Materials = false,
                Promotions = false,
            };
            _loiMoiRepo.Add(moi);
            await _loiMoiRepo.SaveAsync();

            // ★ MỚI: bật Eduverse Deals lần đầu (dù bật trực tiếp qua ThamGiaEduverseDeals
            // hay gián tiếp qua việc đồng ý 1 lời mời khuyến mãi cụ thể trong PhanHoiKhuyenMai)
            // coi như giảng viên đã đồng ý áp TẤT CẢ khuyến mãi Admin gửi cho khóa học này —
            // không bắt phải vào từng lời mời cũ bấm "Đồng ý" riêng nữa.
            await TuDongDuyetLoiMoiKhuyenMaiDangCho(idKhoaHoc, userId);
        }

        // ── Tự động duyệt các lời mời áp dụng khuyến mãi đang Pending sẵn có của
        // khóa học khi Eduverse Deals vừa được bật lần đầu ──────────────────────
        private async Task TuDongDuyetLoiMoiKhuyenMaiDangCho(Guid idKhoaHoc, Guid userId)
        {
            var loiMoiDangCho = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && x.IdKhuyenMai.HasValue
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted)
                .ToListAsync();

            if (!loiMoiDangCho.Any()) return;

            var khoaHoc = await _khoaHocRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc);
            // Khóa học không còn ở trạng thái đã duyệt thì không tự động áp — giữ
            // nguyên Pending, để logic dọn dẹp ở GetLoiMoiApDungTheoKhuyenMai xử lý sau.
            if (khoaHoc == null || khoaHoc.TrangThaiPheDuyet != "DaDuyet")
                return;

            foreach (var lm in loiMoiDangCho)
            {
                lm.TrangThai = "Accepted";
                lm.NgayPhanHoi = DateTime.UtcNow;
                _loiMoiRepo.Update(lm);

                var daCoLink = await _kmKhoaHocRepo.GetQueryable()
                    .AnyAsync(x => x.IdKhuyenMai == lm.IdKhuyenMai && x.IdKhoaHoc == idKhoaHoc);
                if (!daCoLink)
                {
                    _kmKhoaHocRepo.Add(new KhuyenMai_KhoaHoc
                    {
                        IdKhuyenMai = lm.IdKhuyenMai,
                        IdKhoaHoc = idKhoaHoc,
                    });
                }

                await _notificationPublisher.NotifyUserAsync(lm.IdNguoiMoi, new NotificationPayload
                {
                    TieuDe = "Khuyến mãi đã được áp dụng tự động",
                    NoiDung = $"Khóa học \"{khoaHoc.TieuDe}\" vừa bật Eduverse Deals nên khuyến mãi đang chờ trước đó được áp dụng tự động, không cần xác nhận riêng.",
                    LoaiThongBao = "PhanHoiApDungKhuyenMai",
                    FromUser = userId,
                    ItemId = lm.IdKhuyenMai,
                    ItemName = khoaHoc.TieuDe,
                });
            }

            await _loiMoiRepo.SaveAsync();
            await _kmKhoaHocRepo.SaveAsync();
        }

        // ── Gỡ khóa học khỏi các mã khuyến mãi đến từ lời mời Admin khi
        // giảng viên tắt Eduverse Deals ──────────────────────────────────
        private async Task GoKhoiKhuyenMaiKhiTatEduverseDeals(Guid idKhoaHoc)
        {
            var idsKhuyenMaiDaDuyet = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && x.IdKhuyenMai.HasValue
                         && x.TrangThai == "Accepted"
                         && !x.IsDeleted)
                .Select(x => x.IdKhuyenMai!.Value)
                .Distinct()
                .ToListAsync();

            if (idsKhuyenMaiDaDuyet.Any())
            {
                var lienKets = await _kmKhoaHocRepo.GetQueryable()
                    .Where(x => x.IdKhoaHoc == idKhoaHoc
                             && x.IdKhuyenMai.HasValue
                             && idsKhuyenMaiDaDuyet.Contains(x.IdKhuyenMai!.Value))
                    .ToListAsync();
                if (lienKets.Any())
                {
                    _kmKhoaHocRepo.Delete(lienKets);
                    await _kmKhoaHocRepo.SaveAsync();
                }
            }

            // Huỷ luôn các lời mời đang Pending — đã tắt Eduverse Deals thì
            // không còn lý do chờ duyệt tiếp.
            var loiMoiDangCho = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                         && x.IdKhuyenMai.HasValue
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted)
                .ToListAsync();
            if (loiMoiDangCho.Any())
            {
                _loiMoiRepo.Delete(loiMoiDangCho);
                await _loiMoiRepo.SaveAsync();
            }
        }

        public async Task<List<KhoaHocMiniDto>> GetKhoaHocDuocThamGiaEduverseDeals()
        {
            var userId = LayUserId();
            var isAdmin = LaAdmin();

            var query = _khoaHocRepo.GetQueryable()
                .Where(x => x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true
                         && !x.IsDeleted
                         && x.TrangThai == "HoatDong"
                         && (x.Gia ?? 0) > 0 
                         && x.LoaiKhoaHoc != "Khóa học miễn phí"      
                         && x.LoaiKhoaHoc != "MienPhi"); 

            if (!isAdmin)
            {
                var idsCoQuyen = await _khoaHocGVRepo.GetQueryable()
                    .Where(x => x.IdGiangVien == userId && x.LaChuSoHuu && !x.IsDeleted)
                    .Select(x => x.IdKhoaHoc)
                    .Distinct()
                    .ToListAsync();

                // Gộp thêm khóa học tự tạo mà chưa từng có bản ghi KhoaHoc_GiangVien
                // nào (trường hợp chưa từng mời cộng tác viên nào cả).
                var idsTuTao = await _khoaHocRepo.GetQueryable()
                    .Where(x => x.CreatedId == userId)
                    .Select(x => x.Id)
                    .ToListAsync();

                var idsGop = idsCoQuyen.Union(idsTuTao).ToList();
                query = query.Where(x => idsGop.Contains(x.Id));
            }

            return await query
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new KhoaHocMiniDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc
                })
                .ToListAsync();
        }

        public async Task HuyLoiMoiApDungKhuyenMaiTheoKhoaHoc(Guid idKhuyenMai, List<Guid> idsKhoaHoc)
        {
            if (idsKhoaHoc == null || !idsKhoaHoc.Any()) return;

            var loiMois = await _loiMoiRepo.GetQueryable()
                .Where(x => x.IdKhuyenMai == idKhuyenMai
                         && idsKhoaHoc.Contains(x.IdKhoaHoc)
                         && x.TrangThai == "Pending"
                         && !x.IsDeleted)
                .ToListAsync();

            if (!loiMois.Any()) return;

            _loiMoiRepo.Delete(loiMois);
            await _loiMoiRepo.SaveAsync();
        }
    }
}
