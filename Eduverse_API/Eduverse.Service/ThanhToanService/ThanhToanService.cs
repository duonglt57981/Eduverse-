
using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DonHang_KhuyenMaiRepository;
using Eduverse.Repository.DonHangChiTietRepository;
using Eduverse.Repository.DonHangRepositoryRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhuyenMai_KhoaHocRepository;
using Eduverse.Repository.KhuyenMaiRepository;
using Eduverse.Repository.ThanhToanRepository;
using Eduverse.Service.Common;
using Eduverse.Service.EmailService;
using Eduverse.Service.ThanhToanService.Dto;
using Eduverse.Service.ThongBaoService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PayOS;
using PayOS.Models;
using PayOS.Models.V2.PaymentRequests;
using PayOS.Models.Webhooks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ThanhToanService
{
    public class ThanhToanService : Service<Model.Entities.ThanhToan>, IThanhToanService
    {
        private readonly IThanhToanRepository _thanhToanRepo;
        private readonly IDonHangRepository _donHangRepo;
        private readonly IDonHangChiTietRepository _donHangChiTietRepo;
        private readonly IDangKyKhoaHocRepository _dangKyRepo;
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly IGioHangRepository _gioHangRepo;
        private readonly IGioHangChiTietRepository _gioHangChiTietRepo;
        private readonly IKhuyenMai_KhoaHocRepository _khuyenMai_KhoaHocRepository;
        private readonly IEmailService _emailService;
        private readonly IKhuyenMaiRepository _khuyenMaiRepository;
        private readonly IAppUserRepository _userRepository;
        private readonly IDonHang_KhuyenMaiRepository _donHangKhuyenMaiRepo;
        private readonly IKhuyenMaiRepository _khuyenMaiRepo;
        private readonly UserManager<AppUser> _userManager;
        private readonly PayOSClient _payOS;
        private readonly IConfiguration _config;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly INotificationPublisher _notificationPublisher;
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepository;

        public ThanhToanService(
            IThanhToanRepository thanhToanRepo,
            IDonHangRepository donHangRepo,
            IDonHangChiTietRepository donHangChiTietRepo,
            IDangKyKhoaHocRepository dangKyRepo,
            IKhoaHocRepository khoaHocRepo,
            IGioHangRepository gioHangRepo,
            IGioHangChiTietRepository gioHangChiTietRepo,
            IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository,
            IEmailService emailService,
            IKhuyenMaiRepository khuyenMaiRepository,
            IAppUserRepository userRepository,
            IDonHang_KhuyenMaiRepository donHangKhuyenMaiRepo,
            IKhuyenMaiRepository khuyenMaiRepo,
            UserManager<AppUser> userManager,
            PayOSClient payOS,
            IConfiguration config,
            IHttpContextAccessor httpContextAccessor,
            INotificationPublisher notificationPublisher,
            IKhoaHoc_GiangVienRepository khoaHocGVRepository
        ) : base(thanhToanRepo)
        {
            _thanhToanRepo = thanhToanRepo;
            _donHangRepo = donHangRepo;
            _donHangChiTietRepo = donHangChiTietRepo;
            _dangKyRepo = dangKyRepo;
            _khoaHocRepo = khoaHocRepo;
            _gioHangRepo = gioHangRepo;
            _gioHangChiTietRepo = gioHangChiTietRepo;
            _emailService = emailService;
            _khuyenMaiRepository = khuyenMaiRepository;
            _khuyenMai_KhoaHocRepository = khuyenMai_KhoaHocRepository;
            _userRepository = userRepository;
            _donHangKhuyenMaiRepo = donHangKhuyenMaiRepo;
            _khuyenMaiRepo = khuyenMaiRepo;
            _userManager = userManager;
            _payOS = payOS;
            _config = config;
            _httpContextAccessor = httpContextAccessor;
            _notificationPublisher = notificationPublisher;
            _khoaHocGVRepository = khoaHocGVRepository;
        }

        public async Task<TaoThanhToanResponseDto> TaoThanhToanAsync(Guid userId, TaoThanhToanDto dto)
        {
            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(k => dto.KhoaHocIds.Contains(k.Id))
                .ToListAsync();

            if (!khoaHocs.Any())
                throw new Exception("Không tìm thấy khóa học");

           

            double tongTien = khoaHocs.Sum(k => k.Gia ?? 0);
            var ketQuaMa = new ApDungNhieuMaGiamGiaResponseDto
            {
                KetQua = new List<KetQuaApDungMaDto>(),
                TongSoTienGiam = 0,
                SoTienGoc = tongTien,
                SoTienSauGiam = tongTien
            };
            double giamGia = 0;

            if (dto.DanhSachMaGiamGia != null && dto.DanhSachMaGiamGia.Any())
            {
                ketQuaMa = await TinhKetQuaNhieuMaGiamGiaAsync(dto.DanhSachMaGiamGia, khoaHocs);
            }
            giamGia = ketQuaMa.TongSoTienGiam;

            double thanhToan = tongTien - giamGia;
            long orderCode = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var maGiaoDich = $"EDU{orderCode}";

            var donHang = new DonHang
            {
                MaGiaoDich = maGiaoDich,
                SoTienGiamGia = giamGia,
                SoTienThanhToan = thanhToan,
                TrangThai = 0,
                IdNguoiDung = userId,
                NgayTao = DateTime.Now,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            try
            {
                _donHangRepo.Add(donHang);

                foreach (var kh in khoaHocs)
                {
                    _donHangChiTietRepo.Add(new DonHangChiTiet
                    {
                        Id = Guid.NewGuid(),
                        IdDonHang = donHang.Id,
                        IdKhoaHoc = kh.Id,
                        GiaLucDat = kh.Gia,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });
                }

                await _donHangRepo.SaveAsync();

                foreach (var kq in ketQuaMa.KetQua
                .Where(k => k.HopLe && k.IdKhoaHocDuocGiam.HasValue))
                {
                    var voucher = await _khuyenMaiRepo.GetQueryable()
                        .FirstOrDefaultAsync(x => x.MaGiamGia == kq.MaGiamGia);
                    if (voucher == null) continue;

                    _donHangKhuyenMaiRepo.Add(new DonHang_KhuyenMai
                    {
                        IdDonHang = donHang.Id,
                        IdKhuyenMai = voucher.Id,
                        SoTienGiam = kq.SoTienGiam,
                        IdKhoaHocDuocGiam = kq.IdKhoaHocDuocGiam,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });
                }
                await _donHangKhuyenMaiRepo.SaveAsync();

            }
            catch (Exception ex)
            {
                var msg = ex.InnerException?.InnerException?.Message
                       ?? ex.InnerException?.Message
                       ?? ex.Message;
                throw new Exception($"LỖI CHI TIẾT: {msg}");
            }
            var beUrl = _config["BackendUrl"] ?? "http://localhost:5002";
            var feUrl = _config["FrontendUrl"] ?? "http://localhost:3000";

            var paymentRequest = new CreatePaymentLinkRequest
            {
                OrderCode = orderCode,
                Amount = (int)thanhToan,
                Description = "Thanh toan",
                ReturnUrl = $"{beUrl}/api/thanhtoan/payment-return",
                CancelUrl = $"{beUrl}/api/thanhtoan/payment-cancel"
            };

            var paymentLink = await _payOS.PaymentRequests.CreateAsync(paymentRequest);

            return new TaoThanhToanResponseDto
            {
                DonHangId = donHang.Id,
                MaGiaoDich = maGiaoDich,
                CheckoutUrl = paymentLink.CheckoutUrl,
                QrCode = paymentLink.QrCode,
                SoTien = tongTien
            };
        }

        public async Task<ApDungNhieuMaGiamGiaResponseDto> KiemTraMaGiamGiaAsync(ApDungMaGiamGiaDto dto)
        {
            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(k => dto.KhoaHocIds.Contains(k.Id))
                .ToListAsync();

            return await TinhKetQuaNhieuMaGiamGiaAsync(dto.DanhSachMa, khoaHocs);
        }


        public async Task<bool> XuLyWebhookAsync(Webhook webhook)
        {
            try
            {
                if (webhook == null) return false;
                WebhookData webhookData;
                try
                {
                    webhookData = await _payOS.Webhooks.VerifyAsync(webhook);
                }
                catch (Exception)
                {
                    Console.WriteLine("[WEBHOOK] SIGNATURE KHONG HOP LE - co the la gia mao!");
                    return false;
                }
                var maGiaoDich = $"EDU{webhookData.OrderCode}";

                var donHang = await _donHangRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.MaGiaoDich == maGiaoDich
                                           && x.IsDeleted == false);
                if (donHang == null) return false;

                var daThanhToan = await _thanhToanRepo.GetQueryable()
                .AnyAsync(x =>
                    x.IdDonHang == donHang.Id &&
                    x.TrangThaiThanhToan == "SUCCESS");

                if (daThanhToan)
                {
                    Console.WriteLine($"[WEBHOOK] Đơn hàng {donHang.Id} đã thanh toán, bỏ qua webhook trùng.");
                    return true;
                }


                if (webhookData.Code == "00")
                {
                    if ((double)webhookData.Amount < donHang.SoTienThanhToan)
                    {

                        donHang.TrangThai = 2;
                        donHang.UpdatedDate = DateTime.Now;
                        _donHangRepo.Update(donHang);
                        await _donHangRepo.SaveAsync();
                        return false;
                    }
                    donHang.TrangThai = 1;
                    donHang.UpdatedDate = DateTime.Now;
                    _donHangRepo.Update(donHang);
                    await _donHangRepo.SaveAsync();
                    var dsVoucher = await _donHangKhuyenMaiRepo.GetQueryable()
                    .Where(x => x.IdDonHang == donHang.Id)
                    .ToListAsync();

                    foreach (var item in dsVoucher)
                    {
                        if (!item.IdKhuyenMai.HasValue) continue;
                        var km = await _khuyenMaiRepo.GetQueryable().FirstOrDefaultAsync(x => x.Id == item.IdKhuyenMai.Value);

                        if (km != null && km.SoLuongHieuLuc.HasValue)
                        {
                            km.SoLuongHieuLuc--;
                            km.UpdatedDate = DateTime.Now;
                            _khuyenMaiRepo.Update(km);
                        }
                    }

                    await _khuyenMaiRepo.SaveAsync();

                    _thanhToanRepo.Add(new ThanhToan
                    {
                        MaGiaoDich = maGiaoDich,
                        SoTien = (double)webhookData.Amount,
                        TrangThaiThanhToan = "SUCCESS",
                        NgayThanhToan = DateTime.Now,
                        IdDonHang = donHang.Id,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    });
                    await _thanhToanRepo.SaveAsync();

                    var chiTiets = await _donHangChiTietRepo.GetQueryable()
                        .Where(x => x.IdDonHang == donHang.Id && x.IsDeleted == false)
                        .ToListAsync();

                    foreach (var ct in chiTiets)
                    {
                        var daDangKy = await _dangKyRepo.AnyAsync(
                            x => x.IdNguoiDangKi == donHang.IdNguoiDung
                              && x.IdKhoaHoc == ct.IdKhoaHoc
                              && x.IsDeleted == false);

                        if (!daDangKy)
                        {
                            _dangKyRepo.Add(new DangKyKhoaHoc
                            {
                                IdNguoiDangKi = donHang.IdNguoiDung,
                                IdKhoaHoc = ct.IdKhoaHoc,
                                GiaDangKy = ct.GiaLucDat,
                                TrangThai = "Hoạt động",
                                IsDangKy = true,
                                ThoiGianDK = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now,
                                NgayHetHan = DateTime.Now.AddMonths(6)
                            });
                        }
                    }
                    await _dangKyRepo.SaveAsync();

                    var enrolledCourseIds = chiTiets
                        .Where(detail => detail.IdKhoaHoc.HasValue)
                        .Select(detail => detail.IdKhoaHoc!.Value)
                        .Distinct()
                        .ToList();

                    var enrollmentCounts = await _dangKyRepo.GetQueryable()
                        .AsNoTracking()
                        .Where(registration =>
                            registration.IdKhoaHoc.HasValue &&
                            enrolledCourseIds.Contains(registration.IdKhoaHoc.Value) &&
                            !registration.IsDeleted &&
                            registration.IsDangKy != false &&
                            registration.IdNguoiDangKi.HasValue)
                        .GroupBy(registration => registration.IdKhoaHoc!.Value)
                        .Select(group => new
                        {
                            CourseId = group.Key,
                            Count = group
                                .Select(registration => registration.IdNguoiDangKi)
                                .Distinct()
                                .Count()
                        })
                        .ToDictionaryAsync(item => item.CourseId, item => item.Count);

                    var enrolledCourses = await _khoaHocRepo.GetQueryable()
                        .Where(course => enrolledCourseIds.Contains(course.Id))
                        .ToListAsync();

                    foreach (var enrolledCourse in enrolledCourses)
                    {
                        enrolledCourse.SoLuongHocVien =
                            enrollmentCounts.GetValueOrDefault(enrolledCourse.Id);
                        _khoaHocRepo.Update(enrolledCourse);
                    }

                    await _khoaHocRepo.SaveAsync();

                    var donHangVouchers = await _donHangKhuyenMaiRepo.GetQueryable()
                        .AsNoTracking()
                        .Where(x => x.IdDonHang == donHang.Id && !x.IsDeleted)
                        .ToListAsync();

                    // Không cần biết voucher do Admin hay Giảng viên tạo nữa —
                    // chỉ cần biết mỗi khóa học được giảm bao nhiêu tiền để trừ ra
                    // số tiền thực thu, rồi mới chia 30/70 trên số thực thu đó.
                    var courseDiscountInfo = new Dictionary<Guid, double>();
                    foreach (var dkm in donHangVouchers)
                    {
                        if (!dkm.IdKhoaHocDuocGiam.HasValue || !dkm.SoTienGiam.HasValue) continue;

                        courseDiscountInfo[dkm.IdKhoaHocDuocGiam.Value] = dkm.SoTienGiam.Value;
                    }

                    // ── Tính doanh thu giảng viên theo từng khóa học ────────────────────
                    foreach (var ct in chiTiets)
                    {
                        var khoaHoc = await _khoaHocRepo.GetQueryable()
                            .FirstOrDefaultAsync(k => k.Id == ct.IdKhoaHoc);

                        if (khoaHoc?.CreatedId == null || (ct.GiaLucDat ?? 0) <= 0)
                            continue;

                        var giaGoc = ct.GiaLucDat ?? 0;
                        var giam = ct.IdKhoaHoc.HasValue
                            && courseDiscountInfo.TryGetValue(ct.IdKhoaHoc.Value, out var soTienGiam)
                                ? soTienGiam
                                : 0;

                        // Áp voucher trước để ra số tiền thực thu (không quan tâm voucher
                        // do ai tạo), rồi mới chia Admin 30% / Giảng viên 70% trên số đó
                        var tienThucThu = Math.Max(0, giaGoc - giam);
                        var instructorRevenue = tienThucThu * 0.7;

                        if (instructorRevenue <= 0) continue;

                        var thanhVienList = await _khoaHocGVRepository.GetQueryable()
                            .AsNoTracking()
                            .Where(x => x.IdKhoaHoc == ct.IdKhoaHoc && !x.IsDeleted)
                            .ToListAsync();

                        if (!thanhVienList.Any())
                        {
                            var giangVienFallback = await _userRepository.GetQueryable()
                                .FirstOrDefaultAsync(u => u.Id == khoaHoc.CreatedId);

                            if (giangVienFallback != null)
                            {
                                giangVienFallback.SoDuTaiKhoan = (giangVienFallback.SoDuTaiKhoan ?? 0) + (decimal)instructorRevenue;
                                giangVienFallback.UpdatedDate = DateTime.Now;
                                _userRepository.Update(giangVienFallback);

                                await _notificationPublisher.NotifyUserAsync(giangVienFallback.Id, new NotificationPayload
                                {
                                    TieuDe = "Bạn vừa nhận được doanh thu mới",
                                    NoiDung = $"Học viên vừa mua khóa học '{khoaHoc.TieuDe}'. Bạn nhận được {instructorRevenue:N0}đ.",
                                    LoaiThongBao = "DoanhThu",
                                    Link = "/instructor/revenue",
                                    ItemId = khoaHoc.Id,
                                    ItemName = khoaHoc.TieuDe
                                });
                            }
                            continue;
                        }

                        // Chia theo đúng tỷ lệ TyLeChiaDoanhThu của từng người (tổng có thể không tròn 100
                        // nếu dữ liệu lệch, nên chia theo tỷ trọng thực tế thay vì giả định tổng = 100)
                        var tongTyLe = thanhVienList.Sum(x => x.TyLeChiaDoanhThu);
                        if (tongTyLe <= 0) continue;

                        foreach (var tv in thanhVienList)
                        {
                            var phanChia = instructorRevenue * (tv.TyLeChiaDoanhThu / (double)tongTyLe);
                            if (phanChia <= 0) continue;

                            var giangVien = await _userRepository.GetQueryable()
                                .FirstOrDefaultAsync(u => u.Id == tv.IdGiangVien);

                            if (giangVien == null) continue;

                            giangVien.SoDuTaiKhoan = (giangVien.SoDuTaiKhoan ?? 0) + (decimal)phanChia;
                            giangVien.UpdatedDate = DateTime.Now;
                            _userRepository.Update(giangVien);

                            await _notificationPublisher.NotifyUserAsync(giangVien.Id, new NotificationPayload
                            {
                                TieuDe = "Bạn vừa nhận được doanh thu mới",
                                NoiDung = $"Học viên vừa mua khóa học '{khoaHoc.TieuDe}'. " +
                                               $"Bạn nhận được {phanChia:N0}đ ({tv.TyLeChiaDoanhThu}% doanh thu giảng viên).",
                                LoaiThongBao = "DoanhThu",
                                Link = "/instructor/revenue",
                                ItemId = khoaHoc.Id,
                                ItemName = khoaHoc.TieuDe
                            });
                        }
                    }
                    await _userRepository.SaveAsync();

                    var courseNames = enrolledCourses.Select(course => course.TieuDe).ToList();
                    var courseSummary = string.Join(", ", courseNames.Select(name => $"'{name}'"));
                    await _notificationPublisher.NotifyUserAsync(donHang.IdNguoiDung!.Value, new NotificationPayload
                    {
                        TieuDe = "Mua khóa học thành công",
                        NoiDung = $"Thanh toán thành công {donHang.SoTienThanhToan:N0}đ cho {courseSummary}.",
                        LoaiThongBao = "MuaKhoaHocThanhCong",
                        Link = "/student/courses/my-courses",
                        ItemId = donHang.Id,
                        ItemName = courseSummary
                    });

                    var buyer = await _userRepository.GetByIdAsync(donHang.IdNguoiDung);
                    await _notificationPublisher.NotifyRoleAsync("Admin", new NotificationPayload
                    {
                        TieuDe = "Đơn mua khóa học mới",
                        NoiDung = $"{buyer?.HoTen ?? buyer?.UserName ?? "Học viên"} đã thanh toán {donHang.SoTienThanhToan:N0}đ cho {courseSummary}.",
                        LoaiThongBao = "MuaKhoaHoc",
                        Link = "/admin/payments",
                        FromUser = donHang.IdNguoiDung,
                        ItemId = donHang.Id,
                        ItemName = courseSummary
                    }, new[] { donHang.IdNguoiDung!.Value });

                    var gioHang = await _gioHangRepo.GetQueryable()
                        .FirstOrDefaultAsync(x => x.IdNguoiDung == donHang.IdNguoiDung
                                               && x.IsDeleted == false);

                    if (gioHang != null)
                    {
                        var khoaHocIds = chiTiets.Select(x => x.IdKhoaHoc).ToList();

                        var gioHangChiTiets = await _gioHangChiTietRepo.GetQueryable()
                            .Where(x => x.IdGioHang == gioHang.Id
                                     && khoaHocIds.Contains(x.IdKhoaHoc)
                                     && x.IsDeleted == false)
                            .ToListAsync();

                        foreach (var ghct in gioHangChiTiets)
                        {
                            ghct.DaMua = true;
                            ghct.UpdatedDate = DateTime.Now;
                            _gioHangChiTietRepo.Update(ghct);
                        }
                        await _gioHangChiTietRepo.SaveAsync();
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WEBHOOK] ERROR: {ex.Message}");
                Console.WriteLine($"[WEBHOOK] INNER: {ex.InnerException?.Message}");
                return false;
            }
        }

        public async Task<List<DonHangDto>> GetDonHangByUserAsync(Guid userId)
        {
            var query = await (
                from dh in _donHangRepo.GetQueryable().AsNoTracking()
                where dh.IdNguoiDung == userId && !dh.IsDeleted
                select new DonHangDto
                {
                    Id = dh.Id,
                    MaGiaoDich = dh.MaGiaoDich,
                    SoTienThanhToan = dh.SoTienThanhToan,
                    SoTienGiamGia = dh.SoTienGiamGia,
                    TrangThai = dh.TrangThai,
                    NgayTao = dh.NgayTao,
                    ChiTiets =
                    (
                        from ct in _donHangChiTietRepo.GetQueryable()
                        join kh in _khoaHocRepo.GetQueryable()
                            on ct.IdKhoaHoc equals kh.Id

                        join dk in _dangKyRepo.GetQueryable()
                            on new
                            {
                                IdKhoaHoc = ct.IdKhoaHoc,
                                IdNguoiDangKi = dh.IdNguoiDung
                            }
                            equals new
                            {
                                dk.IdKhoaHoc,
                                dk.IdNguoiDangKi
                            }
                            into dangKyGroup

                        from dk in dangKyGroup.DefaultIfEmpty()

                        where ct.IdDonHang == dh.Id && !ct.IsDeleted

                        select new DonHangChiTietDto
                        {
                            IdKhoaHoc = ct.IdKhoaHoc,
                            TenKhoaHoc = kh.TieuDe,
                            GiaLucDat = ct.GiaLucDat,
                            IdDangKi = dk != null ? dk.Id : Guid.Empty
                        }
                    ).ToList()
                }
            ).ToListAsync();

            return query;
        }

        public async Task<DonHangDto?> GetDonHangByIdAsync(Guid id, Guid? nguoiDungHienTai = null, bool laAdmin = false)
        {
            var result = await (
                from dh in _donHangRepo.GetQueryable().AsNoTracking()
                where dh.Id == id && dh.IsDeleted == false
                      && (laAdmin || !nguoiDungHienTai.HasValue || dh.IdNguoiDung == nguoiDungHienTai)
                join ct in _donHangChiTietRepo.GetQueryable().AsNoTracking()
                    on dh.Id equals ct.IdDonHang into ctGroup
                from ct in ctGroup.DefaultIfEmpty()
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on ct.IdKhoaHoc equals k.Id into kGroup
                from k in kGroup.DefaultIfEmpty()
                group new { ct, k } by new
                {
                    dh.Id,
                    dh.MaGiaoDich,
                    dh.SoTienThanhToan,
                    dh.SoTienGiamGia,
                    dh.TrangThai,
                    dh.NgayTao
                } into g
                select new DonHangDto
                {
                    Id = g.Key.Id,
                    MaGiaoDich = g.Key.MaGiaoDich,
                    SoTienThanhToan = g.Key.SoTienThanhToan,
                    SoTienGiamGia = g.Key.SoTienGiamGia,
                    TrangThai = g.Key.TrangThai,
                    NgayTao = g.Key.NgayTao,
                    ChiTiets = g.Select(x => new DonHangChiTietDto
                    {
                        IdKhoaHoc = x.ct != null ? x.ct.IdKhoaHoc : null,
                        TenKhoaHoc = x.k != null ? x.k.TieuDe : null,
                        GiaLucDat = x.ct != null ? x.ct.GiaLucDat : null
                    }).ToList()
                }
            ).FirstOrDefaultAsync();

            return result;
        }
        private async Task<ApDungNhieuMaGiamGiaResponseDto> TinhKetQuaNhieuMaGiamGiaAsync(
            List<string> danhSachMa, List<KhoaHoc> khoaHocsTrongGio)
        {
            var soTienGoc = khoaHocsTrongGio.Sum(k => k.Gia ?? 0);
            var ketQua = new List<KetQuaApDungMaDto>();
            var idsDaDuocGiam = new HashSet<Guid>();

            var now = DateTime.Now;
            var maCodeList = (danhSachMa ?? new List<string>())
                .Where(m => !string.IsNullOrWhiteSpace(m))
                .Select(m => m.Trim().ToUpper())
                .Distinct()
                .ToList();

            foreach (var ma in maCodeList)
            {
                var km = await _khuyenMaiRepository.GetQueryable()
                    .FirstOrDefaultAsync(x =>
                        x.MaGiamGia == ma &&
                        !x.IsDeleted &&
                        (x.NgayBatDau == null || x.NgayBatDau <= now) &&
                        (x.NgayKetThuc == null || x.NgayKetThuc >= now) &&
                        (x.SoLuongHieuLuc == null || x.SoLuongHieuLuc > 0));

                if (km == null)
                {
                    ketQua.Add(new KetQuaApDungMaDto
                    {
                        MaGiamGia = ma,
                        HopLe = false,
                        ThongBao = "Mã không hợp lệ hoặc đã hết hạn"
                    });
                    continue;
                }

                var idsKhoaHocApDung = await _khuyenMai_KhoaHocRepository.GetQueryable()
                    .Where(x => x.IdKhuyenMai == km.Id)
                    .Select(x => x.IdKhoaHoc)
                    .ToListAsync();

                var ungVien = khoaHocsTrongGio
                    .Where(k => idsKhoaHocApDung.Contains(k.Id) && !idsDaDuocGiam.Contains(k.Id))
                    .OrderByDescending(k => k.Gia ?? 0)
                    .ToList();

                if (!ungVien.Any())
                {
                    ketQua.Add(new KetQuaApDungMaDto
                    {
                        MaGiamGia = ma,
                        HopLe = false,
                        ThongBao = "Mã không áp dụng được cho khóa học nào còn lại trong giỏ"
                    });
                    continue;
                }

                var khoaHocDuocChon = ungVien.First();
                var soTienGiam = (khoaHocDuocChon.Gia ?? 0) * (km.PhanTramGiam ?? 0) / 100.0;

                idsDaDuocGiam.Add(khoaHocDuocChon.Id);

                ketQua.Add(new KetQuaApDungMaDto
                {
                    MaGiamGia = ma,
                    HopLe = true,
                    ThongBao = $"Giảm {km.PhanTramGiam}% cho \"{khoaHocDuocChon.TieuDe}\"",
                    PhanTramGiam = km.PhanTramGiam ?? 0,
                    IdKhoaHocDuocGiam = khoaHocDuocChon.Id,
                    TenKhoaHocDuocGiam = khoaHocDuocChon.TieuDe,
                    SoTienGiam = soTienGiam
                });
            }

            var tongGiam = ketQua.Where(k => k.HopLe).Sum(k => k.SoTienGiam);

            return new ApDungNhieuMaGiamGiaResponseDto
            {
                KetQua = ketQua,
                SoTienGoc = soTienGoc,
                TongSoTienGiam = tongGiam,
                SoTienSauGiam = soTienGoc - tongGiam
            };
        }

        public async Task<double> GetTongDoanhThuNenTangAsync()
        {
            var tongThanhToan = await _donHangRepo.GetQueryable()
             .Where(x => !x.IsDeleted && x.TrangThai == 1)
             .SumAsync(x => (double?)x.SoTienThanhToan ?? 0);

            return Math.Round(tongThanhToan * 0.3, 0);
        }   


    }
}

