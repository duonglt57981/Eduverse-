
using Eduverse.Model.Entities;
using Eduverse.Repository.AuthRepository;
using Eduverse.Service.EmailService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;

namespace Eduverse.Service.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IAuthRepository _authRepo;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<AppUser> userManager,
            IAuthRepository authRepo,
            IConfiguration config,
            IEmailService emailService)
        {
            _userManager = userManager;
            _authRepo = authRepo;
            _config = config;
            _emailService = emailService;
        }

        // ══════════════════════════════════════════════
        // REGISTER + GỬI EMAIL VERIFY
        // ══════════════════════════════════════════════
        public async Task<string> RegisterAsync(RegisterRequest request)
        {
            // Check trùng username
            var existingUser = await _userManager.FindByNameAsync(request.UserName);
            if (existingUser is not null)
                throw new Exception("Tên đăng nhập đã được sử dụng");

            // Check trùng email
            var existingEmail = await _userManager.FindByEmailAsync(request.Email);
            if (existingEmail is not null)
                throw new Exception("Email này đã được đăng ký");

            // Check trùng số điện thoại (nếu có nhập)
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                // Validate format: 10 số, bắt đầu bằng 0
                if (!System.Text.RegularExpressions.Regex.IsMatch(request.PhoneNumber, @"^0[0-9]{9}$"))
                    throw new Exception("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0");

                var phoneExists = _userManager.Users.Any(u => u.PhoneNumber == request.PhoneNumber);
                if (phoneExists)
                    throw new Exception("Số điện thoại này đã được đăng ký");
            }

            // Validate mật khẩu: ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
            if (request.Password.Length < 8)
                throw new Exception("Mật khẩu phải có ít nhất 8 ký tự");
            if (!request.Password.Any(char.IsUpper))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 chữ in hoa");
            if (!request.Password.Any(char.IsLower))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 chữ thường");
            if (!request.Password.Any(char.IsDigit))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 chữ số");
            if (request.Password.All(c => char.IsLetterOrDigit(c)))
                throw new Exception("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");

            var user = new AppUser
            {
                UserName = request.UserName,
                Email = request.Email,
                HoTen = request.HoTen,
                PhoneNumber = request.PhoneNumber,
                ChucVu = request.ChucVu,
                GioiTinh = request.GioiTinh
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Mặc định gán role HocVien
            await _userManager.AddToRoleAsync(user, "HocVien");

            return "Đăng ký thành công!";
        }

        // ══════════════════════════════════════════════
        // VERIFY EMAIL
        // ══════════════════════════════════════════════
        public async Task<string> VerifyEmailAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                throw new Exception("Tài khoản không tồn tại");

            var decodedToken = Uri.UnescapeDataString(token);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
            if (!result.Succeeded)
                throw new Exception("Link xác thực không hợp lệ hoặc đã hết hạn");

            return "Xác thực email thành công! Bạn có thể đăng nhập.";
        }

        // ══════════════════════════════════════════════
        // LOGIN — đầy đủ bảo mật
        // ══════════════════════════════════════════════
        public async Task<AuthResponse> LoginAsync(LoginRequest request, HttpResponse httpResponse)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user is null)
                throw new Exception("Tên đăng nhập hoặc mật khẩu không đúng");

            // Check bị khóa chưa
            if (await _userManager.IsLockedOutAsync(user))
            {
                var lockoutEnd = user.LockoutEnd!.Value.ToLocalTime();
                throw new Exception($"Tài khoản bị khóa đến {lockoutEnd:HH:mm dd/MM/yyyy} do đăng nhập sai quá nhiều lần");
            }

            var isValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isValid)
            {
                // Tăng AccessFailedCount
                await _userManager.AccessFailedAsync(user);

                var failCount = await _userManager.GetAccessFailedCountAsync(user);
                var maxFail = _userManager.Options.Lockout.MaxFailedAccessAttempts;
                var remaining = maxFail - failCount;

                if (remaining <= 0)
                    throw new Exception("Tài khoản bị khóa 15 phút do đăng nhập sai quá nhiều lần");

                throw new Exception($"Mật khẩu không đúng. Còn {remaining} lần thử.");
            }

            // Reset AccessFailedCount khi login thành công
            await _userManager.ResetAccessFailedCountAsync(user);

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = GenerateAccessToken(user);
            var refreshTokenStr = GenerateRefreshToken();

            await _authRepo.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshTokenStr,
                NgayTao = DateTime.UtcNow,
                NgayHetHan = DateTime.UtcNow.AddDays(7),
                DaBiThuHoi = false,
                AppUserId = user.Id
            });
            await _authRepo.SaveChangesAsync();

            SetRefreshTokenCookie(httpResponse, refreshTokenStr);

            return new AuthResponse
            {
                AccessToken = accessToken,
                UserName = user.UserName!,
                HoTen = user.HoTen,
                Email = user.Email,
                Roles = roles.ToList()
            };
        }

        // ══════════════════════════════════════════════
        // REFRESH TOKEN
        // ══════════════════════════════════════════════
        public async Task<AuthResponse> RefreshTokenAsync(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var oldTokenStr = httpRequest.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(oldTokenStr))
                throw new Exception("Không tìm thấy refresh token");

            var tokenEntity = await _authRepo.GetRefreshTokenAsync(oldTokenStr);
            if (tokenEntity is null)
                throw new Exception("Refresh token không hợp lệ");

            if (tokenEntity.NgayHetHan < DateTime.UtcNow)
                throw new Exception("Phiên đăng nhập đã hết hạn");

            await _authRepo.RevokeRefreshTokenAsync(tokenEntity);

            var newAccessToken = GenerateAccessToken(tokenEntity.AppUser);
            var newRefreshTokenStr = GenerateRefreshToken();
            var roles = await _userManager.GetRolesAsync(tokenEntity.AppUser);

            await _authRepo.AddRefreshTokenAsync(new RefreshToken
            {
                Token = newRefreshTokenStr,
                NgayTao = DateTime.UtcNow,
                NgayHetHan = DateTime.UtcNow.AddDays(7),
                DaBiThuHoi = false,
                AppUserId = tokenEntity.AppUserId
            });
            await _authRepo.SaveChangesAsync();

            SetRefreshTokenCookie(httpResponse, newRefreshTokenStr);

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                UserName = tokenEntity.AppUser.UserName!,
                HoTen = tokenEntity.AppUser.HoTen,
                Email = tokenEntity.AppUser.Email,
                Roles = roles.ToList()
            };
        }

        // ══════════════════════════════════════════════
        // LOGOUT
        // ══════════════════════════════════════════════
        public async Task LogoutAsync(HttpRequest httpRequest, HttpResponse httpResponse)
        {
            var tokenStr = httpRequest.Cookies["refreshToken"];
            if (!string.IsNullOrEmpty(tokenStr))
            {
                var tokenEntity = await _authRepo.GetRefreshTokenAsync(tokenStr);
                if (tokenEntity is not null)
                {
                    await _authRepo.RevokeRefreshTokenAsync(tokenEntity);
                    await _authRepo.SaveChangesAsync();
                }
            }
            httpResponse.Cookies.Delete("refreshToken");
        }

        // ══════════════════════════════════════════════
        // ĐỔI MẬT KHẨU → LOGOUT MỌI THIẾT BỊ
        // ══════════════════════════════════════════════
        public async Task<string> ChangePasswordAsync(ChangePasswordRequest request, Guid userId, HttpResponse httpResponse)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user is null)
                throw new Exception("Tài khoản không tồn tại");

            var result = await _userManager.ChangePasswordAsync(user, request.OldPassword, request.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Revoke TẤT CẢ refresh token của user → logout mọi thiết bị
            await _authRepo.RevokeAllRefreshTokensByUserIdAsync(userId);
            await _authRepo.SaveChangesAsync();

            // Xóa cookie thiết bị hiện tại
            httpResponse.Cookies.Delete("refreshToken");

            // Cập nhật SecurityStamp → invalidate tất cả JWT cũ
            await _userManager.UpdateSecurityStampAsync(user);

            return "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
        }

        // ══════════════════════════════════════════════
        // FORGOT PASSWORD — gửi mã OTP về email
        // ══════════════════════════════════════════════
        public async Task<string> ForgotPasswordAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new Exception("Email không được để trống");

            var user = await _userManager.FindByEmailAsync(email);
            if (user is null) 
                throw new Exception("Tài khoản với Email này không tồn tại trên hệ thống");

            // Tạo mã OTP ngẫu nhiên gồm 6 chữ số
            var random = new Random();
            var otpCode = random.Next(100000, 999999).ToString();

            // Lưu OTP và Expiry (5 phút) vào User Tokens
            await _userManager.SetAuthenticationTokenAsync(user, "ForgotPassword", "OTP", otpCode);
            await _userManager.SetAuthenticationTokenAsync(user, "ForgotPassword", "OTPExpiry", DateTime.UtcNow.AddMinutes(5).ToString("o"));

            // Thử gửi email, nếu SMTP chưa cấu hình thì trả OTP trực tiếp
            try
            {
                await _emailService.SendAsync(
                    to: email,
                    subject: "Mã OTP đặt lại mật khẩu EduVerse",
                    body: $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                            <div style='text-align: center; margin-bottom: 20px;'>
                                <h2 style='color: #7f1d1d; margin: 0; font-size: 24px; font-weight: bold;'>EduVerse</h2>
                            </div>
                            <hr style='border: none; border-top: 1px solid #f0f0f0; margin-bottom: 20px;' />
                            <p style='font-size: 16px; color: #333333; line-height: 1.5;'>Chào bạn,</p>
                            <p style='font-size: 16px; color: #333333; line-height: 1.5;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên hệ thống học tập trực tuyến <strong>EduVerse</strong>.</p>
                            <p style='font-size: 16px; color: #333333; line-height: 1.5;'>Vui lòng sử dụng mã xác thực OTP bên dưới để tiếp tục khôi phục mật khẩu mới:</p>
                            
                            <div style='background: #f9f8f6; border: 1px dashed #7f1d1d; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0;'>
                                <span style='font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7f1d1d;'>{otpCode}</span>
                            </div>
                            
                            <p style='font-size: 14px; color: #666666; line-height: 1.5;'>Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>. Vì lý do bảo mật, vui lòng tuyệt đối không chia sẻ mã này với bất kỳ ai.</p>
                            <p style='font-size: 14px; color: #666666; line-height: 1.5;'>Nếu bạn không thực hiện yêu cầu này, bạn có thể an tâm bỏ qua email này.</p>
                            
                            <hr style='border: none; border-top: 1px solid #f0f0f0; margin: 25px 0;' />
                            <div style='text-align: center;'>
                                <p style='font-size: 12px; color: #999999; margin: 0;'>Đây là email tự động, vui lòng không phản hồi email này.</p>
                                <p style='font-size: 12px; color: #999999; margin: 5px 0 0 0;'>&copy; {DateTime.Now.Year} EduVerse. All rights reserved.</p>
                            </div>
                        </div>
                    "
                );

                return "Mã OTP khôi phục mật khẩu đã được gửi về email của bạn";
            }
            catch
            {
                // Email chưa cấu hình SMTP → trả OTP trực tiếp trong response
                return $"Mã OTP của bạn là: {otpCode} (có hiệu lực 5 phút)";
            }
        }

        // ══════════════════════════════════════════════
        // RESET PASSWORD
        // ══════════════════════════════════════════════
        public async Task<string> ResetPasswordAsync(ResetPasswordRequest request)
        {
            AppUser? user = null;
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                user = await _userManager.FindByEmailAsync(request.Email);
            }
            else if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                user = await _userManager.FindByIdAsync(request.UserId);
            }

            if (user is null)
                throw new Exception("Tài khoản không tồn tại");

            // Kiểm tra mật khẩu mới trùng mật khẩu cũ hay không
            var isSamePassword = await _userManager.CheckPasswordAsync(user, request.NewPassword);
            if (isSamePassword)
                throw new Exception("Mật khẩu mới không được trùng với mật khẩu cũ");

            // Validate mật khẩu: ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
            if (request.NewPassword.Length < 8)
                throw new Exception("Mật khẩu mới phải có ít nhất 8 ký tự");
            if (!request.NewPassword.Any(char.IsUpper))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 chữ in hoa");
            if (!request.NewPassword.Any(char.IsLower))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 chữ thường");
            if (!request.NewPassword.Any(char.IsDigit))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 chữ số");
            if (request.NewPassword.All(c => char.IsLetterOrDigit(c)))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt");

            // Lấy OTP và thời gian hết hạn đã lưu
            var storedOtp = await _userManager.GetAuthenticationTokenAsync(user, "ForgotPassword", "OTP");
            var storedExpiryStr = await _userManager.GetAuthenticationTokenAsync(user, "ForgotPassword", "OTPExpiry");

            if (string.IsNullOrEmpty(storedOtp) || storedOtp != request.Token)
                throw new Exception("Mã OTP không chính xác");

            if (string.IsNullOrEmpty(storedExpiryStr) || 
                !DateTime.TryParse(storedExpiryStr, null, System.Globalization.DateTimeStyles.RoundtripKind, out var expiry) || 
                expiry < DateTime.UtcNow)
            {
                throw new Exception("Mã OTP đã hết hạn");
            }

            // Tiến hành đổi mật khẩu
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Xóa OTP khỏi database sau khi dùng thành công
            await _userManager.RemoveAuthenticationTokenAsync(user, "ForgotPassword", "OTP");
            await _userManager.RemoveAuthenticationTokenAsync(user, "ForgotPassword", "OTPExpiry");

            // Revoke tất cả refresh token
            await _authRepo.RevokeAllRefreshTokensByUserIdAsync(user.Id);
            await _authRepo.SaveChangesAsync();
            await _userManager.UpdateSecurityStampAsync(user);

            return "Đặt lại mật khẩu thành công!";
        }

        // ══════════════════════════════════════════════
        // HELPERS
        // ══════════════════════════════════════════════
        private string GenerateAccessToken(AppUser user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Lấy roles của user
            var roles = _userManager.GetRolesAsync(user).Result;

            var claims = new List<Claim>
    {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name,           user.UserName!),
            new Claim(ClaimTypes.Surname,        user.UserName!),
            new Claim(ClaimTypes.Email,          user.Email ?? ""),
            new Claim("HoTen",                   user.HoTen ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

            // Thêm role vào claims
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(bytes);
        }

        private static void SetRefreshTokenCookie(HttpResponse response, string token)
        {
            response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }
    }
}