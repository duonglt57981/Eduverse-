
using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DonHangChiTietRepository;
using Eduverse.Repository.DonHangRepositoryRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhuyenMai_KhoaHocRepository;
using Eduverse.Repository.KhuyenMaiRepository;
using Eduverse.Repository.ThanhToanRepository;
using Eduverse.Repository.ThongBao;
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
        private readonly IKhuyenMai_KhoaHocRepository _khuyenMai_KhoaHocRepository;
        private readonly IEmailService _emailService;
        private readonly IKhuyenMaiRepository _khuyenMaiRepository;
        private readonly IThongBaoRepository _thongBaoRepository;
        private readonly IAppUserRepository _userRepository;
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
            IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository,
            IEmailService emailService,
            IKhuyenMaiRepository khuyenMaiRepository,
            IThongBaoRepository thongBaoRepository,
            IAppUserRepository userRepository,
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
            _khuyenMai_KhoaHocRepository = khuyenMai_KhoaHocRepository;
            _thongBaoRepository = thongBaoRepository;
            _userRepository = userRepository;
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

            if (dto.DanhSachMaGiamGia != null && dto.DanhSachMaGiamGia.Any())
            {
                var ketQuaMa = await TinhKetQuaNhieuMaGiamGiaAsync(dto.DanhSachMaGiamGia, khoaHocs);
                giamGia = ketQuaMa.TongSoTienGiam;

                var maCodeHopLe = ketQuaMa.KetQua.Where(k => k.HopLe).Select(k => k.MaGiamGia).ToList();
                if (maCodeHopLe.Any())
                {
                    var khuyenMaisDaDung = await _khuyenMaiRepository.GetQueryable()
                        .Where(x => maCodeHopLe.Contains(x.MaGiamGia))
                        .ToListAsync();

                    foreach (var km in khuyenMaisDaDung)
                    {
                        if (km.SoLuongHieuLuc.HasValue)
                        {
                            km.SoLuongHieuLuc -= 1;
                            km.UpdatedDate = DateTime.Now;
                            _khuyenMaiRepository.Update(km);
                        }
                    }
                    await _khuyenMaiRepository.SaveAsync();
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
                    //webhookData = await _payOS.Webhooks.VerifyAsync(webhook);
                    webhookData = webhook.Data;
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
                                ThoiGianDK = DateTime.Now,
                                CreatedDate = DateTime.Now,
                                UpdatedDate = DateTime.Now
                            });
                        }
                    }
                    await _dangKyRepo.SaveAsync();
                    foreach (var ct in chiTiets)
                    {
                        var khoaHoc = await _khoaHocRepo.GetQueryable()
                            .FirstOrDefaultAsync(k => k.Id == ct.IdKhoaHoc);

                        if (khoaHoc?.CreatedId != null && ct.GiaLucDat > 0)
                        {
                            var giangVien = await _userRepository.GetQueryable()
                                .FirstOrDefaultAsync(u => u.Id == khoaHoc.CreatedId);

                            if (giangVien != null)
                            {
                                double doanhThuGiangVien = (ct.GiaLucDat ?? 0) * 0.7; // 70%
                                giangVien.SoDuTaiKhoan = (giangVien.SoDuTaiKhoan ?? 0) + (decimal)doanhThuGiangVien;
                                giangVien.UpdatedDate = DateTime.Now;
                                _userRepository.Update(giangVien);

                                _thongBaoRepository.Add(new ThongBao
                                {
                                    TieuDe = "Bạn vừa nhận được doanh thu mới",
                                    NoiDung = $"Học viên vừa mua khóa học '{khoaHoc.TieuDe}'. Bạn nhận được {doanhThuGiangVien.ToString("N0")}đ (70%).",
                                    DaDoc = false,
                                    ThoiGianTao = DateTime.Now,
                                    TrangThai = "MoiNhan",
                                    LoaiThongBao = "DoanhThu",
                                    IdNguoiDung = giangVien.Id,
                                    CreatedDate = DateTime.Now,
                                    UpdatedDate = DateTime.Now
                                });
                            }
                        }
                    }
                    await _userRepository.SaveAsync();

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

    }
}

