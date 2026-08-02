using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.Common;
using Eduverse.Repository.KetQuaBaiThiRepository;
using Eduverse.Repository.YeuCauRutTienRepository;
using Eduverse.Service.Common;
using Eduverse.Service.EmailService;
using Eduverse.Service.KetQuaBaiThiService;
using Eduverse.Service.YeuCauRutTienService.Dto;
using Eduverse.Service.YeuCauRutTienService.Request;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using PayOS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.YeuCauRutTienService
{
    public class YeuCauRutTienService : Service<YeuCauRutTien>, IYeuCauRutTienService
    {
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly IRepository<YeuCauRutTien> _repo;
        private readonly IRepository<NganHang> _nganHangRepo;
        private readonly IAppUserRepository _userRepo;
        private readonly IRepository<ThongBao> _thongBaoRepo;
        private readonly PayOSClient _payOS;
        private readonly PayOSClient _payOSPayout;

        public YeuCauRutTienService(
            IRepository<YeuCauRutTien> repo,
            IRepository<NganHang> nganHangRepo,
            IAppUserRepository userRepo,
            IMemoryCache cache,
            IEmailService emailService,
            IRepository<ThongBao> thongBaoRepo,
            PayOSClient payOS,
            [FromKeyedServices("payout")] PayOSClient payOSPayout
            ) : base(repo)
        {
            _repo = repo;
            _emailService = emailService;
            _cache = cache;
            _nganHangRepo = nganHangRepo;
            _userRepo = userRepo;
            _thongBaoRepo = thongBaoRepo;
            _payOS = payOS;
            _payOSPayout = payOSPayout;
        }
        private static string OtpCacheKey(Guid userId) => $"OTP_RUT_TIEN_{userId}";
        private record OtpData(string Code, decimal SoTienRut, Guid IdNganHang, DateTime Expiry);

        public async Task GuiOtpAsync(Guid userId, GuiOtpRutTienRequest request)
        {

            var user = await _userRepo.GetByIdAsync(userId)
                ?? throw new Exception("Không tìm thấy người dùng");

            if (string.IsNullOrEmpty(user.Email))
                throw new Exception("Tài khoản chưa có email. Vui lòng cập nhật email.");

            if (request.SoTienRut <= 0)
                throw new Exception("Số tiền rút phải lớn hơn 0");

            if (request.SoTienRut < 10000)
                throw new Exception("Số tiền rút tối thiểu là 10.000đ");

            if (request.SoTienRut > (user.SoDuTaiKhoan ?? 0))
                throw new Exception($"Số dư không đủ. Hiện có: {user.SoDuTaiKhoan:N0}đ");

            var nganHang = await _nganHangRepo.GetByIdAsync(request.IdNganHang)
                ?? throw new Exception("Không tìm thấy tài khoản ngân hàng");

            if (nganHang.IdNguoiDung != userId)
                throw new Exception("Tài khoản ngân hàng không thuộc về bạn");

            // Tạo OTP 6 số
            var otp = new Random().Next(100000, 999999).ToString();
            Console.WriteLine($"[OTP SET] Key={OtpCacheKey(userId)}, OTP={otp}");
            // Lưu vào cache 5 phút
            var otpData = new OtpData(otp, request.SoTienRut, request.IdNganHang, DateTime.Now.AddMinutes(5));
            _cache.Set(OtpCacheKey(userId), otpData, TimeSpan.FromMinutes(5));

            // Gửi email
            var subject = $"[EduVerse] Mã xác nhận rút tiền - {otp}";
            var body = $@"
        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;'>
            <h2 style='color: #8D1313;'>🔐 Xác nhận rút tiền</h2>
            <p>Xin chào <strong>{user.HoTen}</strong>,</p>
            <p>Bạn vừa yêu cầu rút tiền từ EduVerse:</p>
            <div style='background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;'>
                <p>💰 <strong>Số tiền:</strong> {request.SoTienRut:N0}đ</p>
                <p>🏦 <strong>Tài khoản nhận:</strong> {nganHang.SoTaiKhoan} - {nganHang.TenTaiKhoan}</p>
            </div>
            <div style='background: #fff3cd; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;'>
                <p style='margin: 0; font-size: 14px;'>Mã OTP của bạn:</p>
                <h1 style='color: #8D1313; font-size: 42px; letter-spacing: 10px; margin: 10px 0;'>{otp}</h1>
                <p style='margin: 0; font-size: 13px; color: #666;'>⏰ Hiệu lực trong <strong>5 phút</strong></p>
            </div>
            <p style='color: #dc3545;'>⚠️ Nếu không phải bạn thực hiện, hãy bỏ qua email này và đổi mật khẩu ngay.</p>
            <hr/>
            <p style='color: #999; font-size: 12px;'>EduVerse - Nền tảng học trực tuyến</p>
        </div>
    ";

            await _emailService.SendAsync(user.Email, subject, body);
        }

        public async Task<decimal> GetSoDuAsync(Guid userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            return user?.SoDuTaiKhoan ?? 0;
        }

        public async Task<List<YeuCauRutTienDto>> GetByUserAsync(Guid userId)
        {
            return await (
                from y in GetQueryable().Where(x => x.IdNguoiDung == userId)
                join n in _nganHangRepo.GetQueryable()
                    on y.IdNganHang equals n.Id into nGroup
                from n in nGroup.DefaultIfEmpty()
                orderby y.NgayYeuCau descending
                select new YeuCauRutTienDto
                {
                    Id = y.Id,
                    SoTienRut = y.SoTienRut,
                    TrangThai = y.TrangThai,
                    NgayYeuCau = y.NgayYeuCau,
                    NgayXuLy = y.NgayXuLy,
                    TenNganHang = n != null ? n.TenNganHang : null,
                    SoTaiKhoan = n != null ? n.SoTaiKhoan : null,
                    TenTaiKhoan = n != null ? n.TenTaiKhoan : null
                }
            ).ToListAsync();
        }

        public async Task<List<YeuCauRutTienDto>> GetAllAsync()
        {
            return await (
                from y in GetQueryable()
                join n in _nganHangRepo.GetQueryable()
                    on y.IdNganHang equals n.Id into nGroup
                from n in nGroup.DefaultIfEmpty()
                join u in _userRepo.GetQueryable()
                    on y.IdNguoiDung equals u.Id into uGroup
                from u in uGroup.DefaultIfEmpty()
                orderby y.NgayYeuCau descending
                select new YeuCauRutTienDto
                {
                    Id = y.Id,
                    SoTienRut = y.SoTienRut,
                    TrangThai = y.TrangThai,
                    NgayYeuCau = y.NgayYeuCau,
                    NgayXuLy = y.NgayXuLy,
                    TenNganHang = n != null ? n.TenNganHang : null,
                    SoTaiKhoan = n != null ? n.SoTaiKhoan : null,
                    TenTaiKhoan = n != null ? n.TenTaiKhoan : null,
                    TenGiangVien = u != null ? u.HoTen : null,
                    SoDuHienTai = u != null ? u.SoDuTaiKhoan : null,
                    HinhAnhQR = n != null ? n.HinhAnhQR : null,
                }
            ).ToListAsync();
        }

        public async Task TaoYeuCauAsync(Guid userId, TaoYeuCauRutTienDto dto)
        {

            // ── VERIFY OTP ──
            var cacheKey = OtpCacheKey(userId);

            Console.WriteLine($"[OTP GET] Key={cacheKey}");

            var exists = _cache.TryGetValue(cacheKey, out OtpData? otpData);

            Console.WriteLine($"[OTP FOUND] = {exists}");

            if (!exists)
                throw new Exception("Mã OTP đã hết hạn hoặc chưa được gửi. Vui lòng yêu cầu mã mới.");

            if (otpData!.Code != dto.Otp.Trim())
                throw new Exception("Mã OTP không đúng. Vui lòng kiểm tra lại.");

            if (DateTime.Now > otpData.Expiry)
            {
                _cache.Remove(cacheKey);
                throw new Exception("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            }

            // Kiểm tra số tiền khớp
            if (dto.SoTienRut != otpData.SoTienRut || dto.IdNganHang != otpData.IdNganHang)
                throw new Exception("Thông tin rút tiền không khớp với OTP đã gửi.");

            // Xóa OTP sau khi dùng
            _cache.Remove(cacheKey);

            // ... code TaoYeuCau cũ bên dưới (trừ số dư và nganHang đã validate rồi)
            var user = await _userRepo.GetByIdAsync(userId)
                ?? throw new Exception("Không tìm thấy người dùng");

            var dangCho = await AnyAsync(x =>
                x.IdNguoiDung == userId && x.TrangThai == "ChoDuyet" && !x.IsDeleted);
            if (dangCho)
                throw new Exception("Bạn đang có yêu cầu chờ duyệt, vui lòng đợi xử lý xong");

            // Trừ số dư
            user.SoDuTaiKhoan -= dto.SoTienRut;
            user.UpdatedDate = DateTime.Now;
            _userRepo.Update(user);
            await _userRepo.SaveAsync();

            // Tạo yêu cầu
            var entity = new YeuCauRutTien
            {
                SoTienRut = dto.SoTienRut,
                TrangThai = "ChoDuyet",
                NgayYeuCau = DateTime.Now,
                IdNguoiDung = userId,
                IdNganHang = dto.IdNganHang,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };
            await CreateAsync(entity);

            // Thông báo admin
            _thongBaoRepo.Add(new ThongBao
            {
                TieuDe = "Yêu cầu rút tiền mới",
                NoiDung = $"Giảng viên {user.HoTen} yêu cầu rút {dto.SoTienRut:N0}đ",
                DaDoc = false,
                ThoiGianTao = DateTime.Now,
                TrangThai = "MoiNhan",
                LoaiThongBao = "YeuCauRutTien",
                IdNguoiDung = null,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            });
            await _thongBaoRepo.SaveAsync();
        }

        public async Task HuyYeuCauAsync(Guid id, Guid userId)
        {
            var yeuCau = await GetByIdAsync(id)
                ?? throw new Exception("Không tìm thấy yêu cầu");

            if (yeuCau.IdNguoiDung != userId)
                throw new Exception("Bạn không có quyền hủy yêu cầu này");

            if (yeuCau.TrangThai != "ChoDuyet")
                throw new Exception("Chỉ có thể hủy yêu cầu đang chờ duyệt");

            // Hoàn tiền lại
            var user = await _userRepo.GetByIdAsync(userId)
                ?? throw new Exception("Không tìm thấy người dùng");

            user.SoDuTaiKhoan += yeuCau.SoTienRut ?? 0;
            user.UpdatedDate = DateTime.Now;
            _userRepo.Update(user);
            await _userRepo.SaveAsync();

            yeuCau.TrangThai = "DaHuy";
            yeuCau.NgayXuLy = DateTime.Now;
            yeuCau.UpdatedDate = DateTime.Now;
            await UpdateAsync(yeuCau);
        }

        public async Task XuLyYeuCauAsync(Guid id, XuLyYeuCauDto dto)
        {
            var yeuCau = await GetByIdAsync(id)
                ?? throw new Exception("Không tìm thấy yêu cầu");

            if (yeuCau.TrangThai != "ChoDuyet")
                throw new Exception("Yêu cầu đã được xử lý");

            var nganHang = await _nganHangRepo.GetByIdAsync(yeuCau.IdNganHang)
                ?? throw new Exception("Không tìm thấy tài khoản ngân hàng");

            var user = await _userRepo.GetByIdAsync(yeuCau.IdNguoiDung)
                ?? throw new Exception("Không tìm thấy giảng viên");


            if (dto.TrangThai == "DaDuyet")
            {
                yeuCau.TrangThai = "DaChuyenTien";

                _thongBaoRepo.Add(new ThongBao
                {
                    TieuDe = "Yêu cầu rút tiền được duyệt",
                    NoiDung = $"Yêu cầu rút {yeuCau.SoTienRut:N0}đ đã được duyệt và chuyển vào tài khoản {nganHang.SoTaiKhoan}.",
                    DaDoc = false,
                    ThoiGianTao = DateTime.Now,
                    TrangThai = "MoiNhan",
                    LoaiThongBao = "RutTienThanhCong",
                    IdNguoiDung = yeuCau.IdNguoiDung,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                });
            }
            else // TuChoi
            {
                user.SoDuTaiKhoan += yeuCau.SoTienRut ?? 0;
                user.UpdatedDate = DateTime.Now;
                _userRepo.Update(user);
                await _userRepo.SaveAsync();

                yeuCau.TrangThai = "TuChoi";

                _thongBaoRepo.Add(new ThongBao
                {
                    TieuDe = "Yêu cầu rút tiền bị từ chối",
                    NoiDung = $"Yêu cầu rút {yeuCau.SoTienRut:N0}đ đã bị từ chối. Lý do: {dto.GhiChu}. Số tiền đã được hoàn lại vào số dư.",
                    DaDoc = false,
                    ThoiGianTao = DateTime.Now,
                    TrangThai = "MoiNhan",
                    LoaiThongBao = "RutTienTuChoi",
                    IdNguoiDung = yeuCau.IdNguoiDung,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                });
            }

            yeuCau.NgayXuLy = DateTime.Now;
            yeuCau.UpdatedDate = DateTime.Now;
            await UpdateAsync(yeuCau);
            await _thongBaoRepo.SaveAsync();
        }

    }
}
