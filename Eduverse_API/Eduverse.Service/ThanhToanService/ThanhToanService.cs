
using Eduverse.Model.Entities;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DonHangChiTietRepository;
using Eduverse.Repository.DonHangRepositoryRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhuyenMaiRepository;
using Eduverse.Repository.ThanhToanRepository;
using Eduverse.Service.Common;
using Eduverse.Service.EmailService;
using Eduverse.Service.ThanhToanService.Dto;
using Microsoft.AspNetCore.Http.HttpResults;
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
        private readonly IEmailService _emailService;
        private readonly IKhuyenMaiRepository _khuyenMaiRepository;
        private readonly PayOSClient _payOS;
        private readonly IConfiguration _config;

        public ThanhToanService(
            IThanhToanRepository thanhToanRepo,
            IDonHangRepository donHangRepo,
            IDonHangChiTietRepository donHangChiTietRepo,
            IDangKyKhoaHocRepository dangKyRepo,
            IKhoaHocRepository khoaHocRepo,
            IGioHangRepository gioHangRepo,
            IGioHangChiTietRepository gioHangChiTietRepo,
            IEmailService emailService,
            IKhuyenMaiRepository khuyenMaiRepository,
            PayOSClient payOS,
            IConfiguration config
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
            _payOS = payOS;
            _config = config;
        }

        public async Task<TaoThanhToanResponseDto> TaoThanhToanAsync(Guid userId, TaoThanhToanDto dto)
        {
            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(k => dto.KhoaHocIds.Contains(k.Id))
                .ToListAsync();

            if (!khoaHocs.Any())
                throw new Exception("Không tìm thấy khóa học");

            double tongTien = khoaHocs.Sum(k => k.Gia ?? 0);
            double giamGia = 0;
            if (!string.IsNullOrEmpty(dto.MaGiamGia))
            {
                var now = DateTime.Now;
                var km = await _khuyenMaiRepository.GetQueryable()
                    .FirstOrDefaultAsync(x =>
                        x.MaGiamGia == dto.MaGiamGia &&
                        !x.IsDeleted &&
                        x.NgayBatDau <= now &&
                        x.NgayKetThuc >= now &&
                        x.SoLuongHieuLuc > 0);

                if (km != null)
                {
                    giamGia = tongTien * (km.PhanTramGiam ?? 0) / 100.0;
                    // Giảm số lượng hiệu lực
                    km.SoLuongHieuLuc -= 1;
                    km.UpdatedDate = DateTime.Now;
                    _khuyenMaiRepository.Update(km);
                }
            }

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
        public async Task<ApDungMaGiamGiaResponseDto> KiemTraMaGiamGiaAsync(ApDungMaGiamGiaDto dto)
        {
            var khoaHocs = await _khoaHocRepo.GetQueryable()
                .Where(k => dto.KhoaHocIds.Contains(k.Id))
                .ToListAsync();

            double soTienGoc = khoaHocs.Sum(k => k.Gia ?? 0);

            if (string.IsNullOrEmpty(dto.MaGiamGia))
                return new ApDungMaGiamGiaResponseDto
                {
                    HopLe = false,
                    ThongBao = "Vui lòng nhập mã giảm giá",
                    SoTienGoc = soTienGoc,
                    SoTienSauGiam = soTienGoc
                };

            var now = DateTime.Now;
            var km = await _khuyenMaiRepository.GetQueryable()
                .FirstOrDefaultAsync(x =>
                    x.MaGiamGia == dto.MaGiamGia &&
                    !x.IsDeleted &&
                    x.NgayBatDau <= now &&
                    x.NgayKetThuc >= now &&
                    x.SoLuongHieuLuc > 0);

            if (km == null)
                return new ApDungMaGiamGiaResponseDto
                {
                    HopLe = false,
                    ThongBao = "Mã giảm giá không hợp lệ hoặc đã hết hạn",
                    SoTienGoc = soTienGoc,
                    SoTienSauGiam = soTienGoc
                };

            double soTienGiam = soTienGoc * (km.PhanTramGiam ?? 0) / 100.0;
            return new ApDungMaGiamGiaResponseDto
            {
                HopLe = true,
                ThongBao = $"Áp dụng thành công! Giảm {km.PhanTramGiam}%",
                PhanTramGiam = km.PhanTramGiam ?? 0,
                SoTienGoc = soTienGoc,
                SoTienGiam = soTienGiam,
                SoTienSauGiam = soTienGoc - soTienGiam
            };
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
                Console.WriteLine(
                    $"ORDER CODE NHAN DUOC: {webhookData.OrderCode}"
                );
                var maGiaoDich = $"EDU{webhookData.OrderCode}";

                var donHang = await _donHangRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.MaGiaoDich == maGiaoDich
                                           && x.IsDeleted == false);
                if (donHang == null) return false;


                if (webhookData.Code == "00")
                {
                    if ((double)webhookData.Amount < donHang.SoTienThanhToan)
                    {
                        Console.WriteLine($"[WEBHOOK] SO TIEN KHONG KHOP! " +
                            $"Can: {donHang.SoTienThanhToan}, Nhan: {webhookData.Amount}");

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
                              && x.IdDangKi == ct.IdKhoaHoc
                              && x.IsDeleted == false);

                        if (!daDangKy)
                        {
                            _dangKyRepo.Add(new DangKyKhoaHoc
                            {
                                IdNguoiDangKi = donHang.IdNguoiDung,
                                IdDangKi = ct.IdKhoaHoc,
                                GiaDangKy = ct.GiaLucDat,
                                TrangThai = "Hoạt động",
                                ThoiGianDK = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now
                            });
                        }
                    }
                    await _dangKyRepo.SaveAsync();

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
                where dh.IdNguoiDung == userId && dh.IsDeleted == false
                select new DonHangDto
                {
                    Id = dh.Id,
                    MaGiaoDich = dh.MaGiaoDich,
                    SoTienThanhToan = dh.SoTienThanhToan,
                    SoTienGiamGia = dh.SoTienGiamGia,
                    TrangThai = dh.TrangThai,
                    NgayTao = dh.NgayTao,
                    ChiTiets = _donHangChiTietRepo.GetQueryable()
                        .Where(ct => ct.IdDonHang == dh.Id && ct.IsDeleted == false)
                        .Join(
                            _khoaHocRepo.GetQueryable(),
                            ct => ct.IdKhoaHoc,
                            k => k.Id,
                            (ct, k) => new DonHangChiTietDto
                            {
                                IdKhoaHoc = ct.IdKhoaHoc,
                                TenKhoaHoc = k.TieuDe,
                                GiaLucDat = ct.GiaLucDat
                            }
                        ).ToList()
                }
            ).ToListAsync();

            return query;
        }

        public async Task<DonHangDto?> GetDonHangByIdAsync(Guid id)
        {
            var result = await (
                from dh in _donHangRepo.GetQueryable().AsNoTracking()
                where dh.Id == id && dh.IsDeleted == false
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
        
    }
}

