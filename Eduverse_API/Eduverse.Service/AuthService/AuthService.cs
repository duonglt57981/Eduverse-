
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
            var existing = await _userManager.FindByNameAsync(request.UserName);
            if (existing is not null)
                throw new Exception("Username đã tồn tại");

            var user = new AppUser
            {
                UserName = request.UserName,
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
        // FORGOT PASSWORD — gửi email reset
        // ══════════════════════════════════════════════
        public async Task<string> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            // Không báo user có tồn tại không — bảo mật
            if (user is null) return "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu";

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(token);
            var resetUrl = $"{_config["App:ClientUrl"]}/auth/reset-password?userId={user.Id}&token={encodedToken}";

            await _emailService.SendAsync(
                to: email,
                subject: "Đặt lại mật khẩu EduVerse",
                body: $@"
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Nhấn vào link bên dưới để đặt lại mật khẩu:</p>
                    <a href='{resetUrl}' style='background:#c0392b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;'>
                        Đặt lại mật khẩu
                    </a>
                    <p>Link có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                "
            );

            return "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu";
        }

        // ══════════════════════════════════════════════
        // RESET PASSWORD
        // ══════════════════════════════════════════════
        public async Task<string> ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user is null)
                throw new Exception("Tài khoản không tồn tại");

            var decodedToken = Uri.UnescapeDataString(request.Token);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, request.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

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