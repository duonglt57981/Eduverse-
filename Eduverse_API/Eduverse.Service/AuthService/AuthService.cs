
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
            if (user is null && request.UserName.Contains("@"))
            {
                user = await _userManager.FindByEmailAsync(request.UserName);
            }

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

            await AssignNewSessionAsync(user, httpResponse);

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

            var roles = await _userManager.GetRolesAsync(user);

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

            var roles = await _userManager.GetRolesAsync(tokenEntity.AppUser);

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

                    var user = tokenEntity.AppUser;
                    if (user is not null)
                    {
                        user.CurrentSessionId = null;
                        user.CurrentDeviceInfo = null;
                        user.CurrentSessionAt = null;
                        await _userManager.UpdateAsync(user);
                    }
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

            user.CurrentSessionId = null;
            user.CurrentDeviceInfo = null;
            user.CurrentSessionAt = null;

            // Cập nhật SecurityStamp → invalidate tất cả JWT cũ
            await _userManager.UpdateSecurityStampAsync(user);
            await _userManager.UpdateAsync(user);

            return "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
        }

        // ══════════════════════════════════════════════
        // FORGOT PASSWORD — gửi mã OTP về email
        // ══════════════════════════════════════════════
        private const string ResetProvider = "PwdReset";
        private const int OtpExpiryMinutes = 5;
        private const int ResetTokenExpiryMinutes = 10;
        private const int MaxOtpAttempts = 5;
        private const int ResendCooldownSeconds = 60;
        private const string GenericForgotMessage =
            "Nếu email tồn tại trong hệ thống, mã xác minh sẽ được gửi đến địa chỉ email đó.";

        private static string HashValue(string value)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(value));
            return Convert.ToHexString(bytes);
        }

        private static bool TryGetUtc(string? iso, out DateTime utc)
        {
            utc = default;
            return !string.IsNullOrEmpty(iso)
                && DateTime.TryParse(iso, null, System.Globalization.DateTimeStyles.RoundtripKind, out utc);
        }

        private async Task ClearOtpTokensAsync(AppUser user)
        {
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "OtpHash");
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "OtpExp");
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "Att");
        }

        private async Task ClearAllResetTokensAsync(AppUser user)
        {
            await ClearOtpTokensAsync(user);
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "RtHash");
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "RtExp");
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "LastSent");
        }

        // BƯỚC 1: yêu cầu gửi OTP — LUÔN trả về thông báo chung (chống dò tìm tài khoản)
        public async Task<string> ForgotPasswordAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new Exception("Vui lòng nhập email.");

            var normalized = email.Trim();
            var user = await _userManager.FindByEmailAsync(normalized);

            // Không tồn tại / đã vô hiệu hoá / đang bị khoá → không tạo OTP, không gửi email
            if (user is null || user.IsDeleted || await _userManager.IsLockedOutAsync(user))
                return GenericForgotMessage;

            // Cooldown gửi lại: nếu vừa gửi trong 60s → bỏ qua (vẫn trả thông báo chung)
            var lastSentStr = await _userManager.GetAuthenticationTokenAsync(user, ResetProvider, "LastSent");
            if (TryGetUtc(lastSentStr, out var lastSent)
                && (DateTime.UtcNow - lastSent).TotalSeconds < ResendCooldownSeconds)
                return GenericForgotMessage;

            // OTP 6 chữ số bằng bộ sinh số ngẫu nhiên mật mã an toàn
            var otpCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

            // Lưu HASH của OTP + hạn dùng + reset số lần sai + mốc thời gian gửi.
            // OTP mới tự động vô hiệu OTP cũ (ghi đè) và huỷ reset token cũ.
            await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "OtpHash", HashValue(otpCode));
            await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "OtpExp", DateTime.UtcNow.AddMinutes(OtpExpiryMinutes).ToString("o"));
            await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "Att", "0");
            await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "LastSent", DateTime.UtcNow.ToString("o"));
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "RtHash");
            await _userManager.RemoveAuthenticationTokenAsync(user, ResetProvider, "RtExp");

            try
            {
                await _emailService.SendAsync(
                    to: normalized,
                    subject: "Mã xác minh đặt lại mật khẩu EduVerse",
                    body: BuildOtpEmail(otpCode));
            }
            catch (Exception ex)
            {
                // Không lộ mã OTP hay lỗi SMTP ra API (chống dò email) — NHƯNG ghi log ra console
                // để biết vì sao email không gửi được (thường do sai/thiếu Gmail App Password).
                Console.WriteLine($"[EduVerse][ForgotPassword] Gửi email OTP THẤT BẠI tới {normalized}: {ex.GetType().Name}: {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"[EduVerse][ForgotPassword]   Chi tiết: {ex.InnerException.Message}");
            }

            return GenericForgotMessage;
        }

        private static string BuildOtpEmail(string otpCode) => $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                <div style='text-align: center; margin-bottom: 20px;'>
                    <h2 style='color: #7f1d1d; margin: 0; font-size: 24px; font-weight: bold;'>EduVerse</h2>
                </div>
                <hr style='border: none; border-top: 1px solid #f0f0f0; margin-bottom: 20px;' />
                <p style='font-size: 16px; color: #333333; line-height: 1.5;'>Chào bạn,</p>
                <p style='font-size: 16px; color: #333333; line-height: 1.5;'>Bạn vừa yêu cầu đặt lại mật khẩu tài khoản <strong>EduVerse</strong>. Vui lòng dùng mã xác minh bên dưới để tiếp tục:</p>
                <div style='background: #f9f8f6; border: 1px dashed #7f1d1d; border-radius: 8px; padding: 15px; text-align: center; margin: 25px 0;'>
                    <span style='font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #7f1d1d;'>{otpCode}</span>
                </div>
                <p style='font-size: 14px; color: #666666; line-height: 1.5;'>Mã này có hiệu lực trong <strong>5 phút</strong>. Vì lý do bảo mật, tuyệt đối không chia sẻ mã với bất kỳ ai.</p>
                <p style='font-size: 14px; color: #666666; line-height: 1.5;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                <hr style='border: none; border-top: 1px solid #f0f0f0; margin: 25px 0;' />
                <div style='text-align: center;'>
                    <p style='font-size: 12px; color: #999999; margin: 0;'>Đây là email tự động, vui lòng không phản hồi.</p>
                    <p style='font-size: 12px; color: #999999; margin: 5px 0 0 0;'>&copy; {DateTime.Now.Year} EduVerse.</p>
                </div>
            </div>";

        // BƯỚC 2: xác minh OTP ở BACKEND → trả về reset token ngắn hạn (dùng một lần)
        public async Task<string> VerifyOtpAsync(VerifyOtpRequest request)
        {
            const string invalidMsg = "Mã OTP không đúng hoặc đã hết hạn.";
            if (request is null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
                throw new Exception(invalidMsg);

            var user = await _userManager.FindByEmailAsync(request.Email.Trim());
            if (user is null || user.IsDeleted)
                throw new Exception(invalidMsg);

            var otpHash = await _userManager.GetAuthenticationTokenAsync(user, ResetProvider, "OtpHash");
            var expStr = await _userManager.GetAuthenticationTokenAsync(user, ResetProvider, "OtpExp");
            var attStr = await _userManager.GetAuthenticationTokenAsync(user, ResetProvider, "Att");

            if (string.IsNullOrEmpty(otpHash) || !TryGetUtc(expStr, out var exp) || exp < DateTime.UtcNow)
            {
                await ClearOtpTokensAsync(user);
                throw new Exception(invalidMsg);
            }

            int.TryParse(attStr, out var attempts);
            if (attempts >= MaxOtpAttempts)
            {
                await ClearOtpTokensAsync(user);
                throw new Exception("Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã OTP mới.");
            }

            if (!string.Equals(HashValue(request.Otp.Trim()), otpHash, StringComparison.Ordinal))
            {
                attempts++;
                if (attempts >= MaxOtpAttempts)
                {
                    await ClearOtpTokensAsync(user);
                    throw new Exception("Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã OTP mới.");
                }
                await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "Att", attempts.ToString());
                throw new Exception($"Mã OTP không đúng. Bạn còn {MaxOtpAttempts - attempts} lần thử.");
            }

            // OTP đúng → phát reset token ngắn hạn (dùng một lần), xoá OTP đã dùng
            var rtBytes = RandomNumberGenerator.GetBytes(32);
            var resetToken = Convert.ToBase64String(rtBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
            await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "RtHash", HashValue(resetToken));
            await _userManager.SetAuthenticationTokenAsync(user, ResetProvider, "RtExp", DateTime.UtcNow.AddMinutes(ResetTokenExpiryMinutes).ToString("o"));
            await ClearOtpTokensAsync(user);

            return resetToken;
        }

        // BƯỚC 3: đặt mật khẩu mới bằng RESET TOKEN (không dùng lại email + OTP cũ)
        public async Task<string> ResetPasswordAsync(ResetPasswordRequest request)
        {
            const string invalidSession = "Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thực hiện lại.";
            if (request is null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.ResetToken))
                throw new Exception(invalidSession);

            var user = await _userManager.FindByEmailAsync(request.Email.Trim());
            if (user is null || user.IsDeleted)
                throw new Exception(invalidSession);

            var rtHash = await _userManager.GetAuthenticationTokenAsync(user, ResetProvider, "RtHash");
            var rtExpStr = await _userManager.GetAuthenticationTokenAsync(user, ResetProvider, "RtExp");
            if (string.IsNullOrEmpty(rtHash) || !TryGetUtc(rtExpStr, out var rtExp) || rtExp < DateTime.UtcNow
                || !string.Equals(HashValue(request.ResetToken.Trim()), rtHash, StringComparison.Ordinal))
            {
                throw new Exception(invalidSession);
            }

            // Quy tắc mật khẩu (giữ nguyên như đăng ký/đổi mật khẩu)
            if (request.NewPassword.Length < 8)
                throw new Exception("Mật khẩu mới phải có ít nhất 8 ký tự");
            if (!request.NewPassword.Any(char.IsUpper))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 chữ in hoa");
            if (!request.NewPassword.Any(char.IsLower))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 chữ thường");
            if (!request.NewPassword.Any(char.IsDigit))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 chữ số");
            if (request.NewPassword.All(char.IsLetterOrDigit))
                throw new Exception("Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt");

            // Không trùng mật khẩu cũ. Tài khoản Google chưa có mật khẩu → CheckPassword=false → cho phép đặt mới.
            if (await _userManager.CheckPasswordAsync(user, request.NewPassword))
                throw new Exception("Mật khẩu mới không được trùng với mật khẩu cũ.");

            // Đổi mật khẩu bằng cơ chế Identity an toàn (tự băm mật khẩu)
            var identityToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, identityToken, request.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Vô hiệu toàn bộ token đặt lại + huỷ mọi phiên đăng nhập cũ + đổi security stamp
            await ClearAllResetTokensAsync(user);
            await _authRepo.RevokeAllRefreshTokensByUserIdAsync(user.Id);
            await _authRepo.SaveChangesAsync();
            await _userManager.UpdateSecurityStampAsync(user);

            user.CurrentSessionId = null;
            user.CurrentDeviceInfo = null;
            user.CurrentSessionAt = null;
            await _userManager.UpdateAsync(user);

            return "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.";
        }

        // ══════════════════════════════════════════════
        // ĐĂNG NHẬP EXTERNAL (GOOGLE & FACEBOOK)
        // ══════════════════════════════════════════════
        private async Task<(string email, string name, string providerKey, string? picture)> ValidateGoogleTokenAsync(string token)
        {
            using var client = new System.Net.Http.HttpClient();
            var response = await client.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(token)}");
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Mã xác thực Google không hợp lệ hoặc đã hết hạn.");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (root.TryGetProperty("error_description", out var errorProp))
            {
                throw new Exception($"Lỗi xác thực Google: {errorProp.GetString()}");
            }

            // 1) Xác minh issuer (iss) đúng của Google
            var iss = root.TryGetProperty("iss", out var issProp) ? issProp.GetString() : null;
            if (iss != "accounts.google.com" && iss != "https://accounts.google.com")
            {
                throw new Exception("Không thể xác thực tài khoản Google. Vui lòng thử lại.");
            }

            // 2) Xác minh audience (aud) == Google Client ID của ứng dụng
            var expectedClientId = _config["Authentication:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(expectedClientId))
            {
                throw new Exception("Hệ thống chưa được cấu hình đăng nhập Google.");
            }
            var aud = root.TryGetProperty("aud", out var audProp) ? audProp.GetString() : null;
            if (!string.Equals(aud, expectedClientId, StringComparison.Ordinal))
            {
                throw new Exception("Token Google không dành cho ứng dụng này.");
            }

            // 3) Bắt buộc email tồn tại và đã được Google xác minh
            var email = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : null;
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new Exception("Không lấy được email từ Google.");
            }
            var emailVerified = root.TryGetProperty("email_verified", out var evProp) ? evProp.GetString() : null;
            if (!string.Equals(emailVerified, "true", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Email Google của bạn chưa được xác minh.");
            }

            var providerKey = root.TryGetProperty("sub", out var subProp) ? subProp.GetString() : null;
            if (string.IsNullOrWhiteSpace(providerKey))
            {
                throw new Exception("Không lấy được mã định danh từ Google.");
            }

            var name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : email!.Split('@')[0];
            var picture = root.TryGetProperty("picture", out var picProp) ? picProp.GetString() : null;

            return (email!, name ?? email!.Split('@')[0], providerKey!, picture);
        }

        private async Task<(string email, string name, string providerKey)> ValidateFacebookTokenAsync(string token)
        {
            using var client = new System.Net.Http.HttpClient();
            var response = await client.GetAsync($"https://graph.facebook.com/me?fields=id,name,email&access_token={token}");
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Mã xác thực Facebook không hợp lệ hoặc đã hết hạn.");
            }

            var content = await response.Content.ReadAsStringAsync();
            var doc = System.Text.Json.JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (root.TryGetProperty("error", out var errorProp))
            {
                var errMsg = errorProp.TryGetProperty("message", out var msgProp) ? msgProp.GetString() : "Lỗi không xác định";
                throw new Exception($"Lỗi xác thực Facebook: {errMsg}");
            }

            var providerKey = root.GetProperty("id").GetString() ?? throw new Exception("Không lấy được mã định danh từ Facebook.");
            var email = root.TryGetProperty("email", out var emailProp) ? emailProp.GetString() : $"{providerKey}@facebook.com";
            var name = root.TryGetProperty("name", out var nameProp) ? nameProp.GetString() : $"Facebook User {providerKey.Substring(0, 5)}";

            return (email, name, providerKey);
        }

        public async Task<AuthResponse> ExternalLoginAsync(ExternalLoginRequest request, HttpResponse httpResponse)
        {
            if (string.IsNullOrWhiteSpace(request.Provider))
                throw new Exception("Thiếu thông tin nhà cung cấp đăng nhập.");

            var isGoogle = request.Provider.Equals("Google", StringComparison.OrdinalIgnoreCase);
            var isFacebook = request.Provider.Equals("Facebook", StringComparison.OrdinalIgnoreCase);

            // Chuẩn hoá tên provider để lưu/tra cứu nhất quán trong bảng AspNetUserLogins
            string providerName = isGoogle ? "Google" : isFacebook ? "Facebook" : request.Provider;

            string email = request.Email ?? "";
            string name = request.Name ?? "";
            string providerKey = request.ProviderKey ?? "";
            string? picture = null;

            if (isGoogle)
            {
                // Google BẮT BUỘC gửi id_token để server tự xác minh (không tin dữ liệu client gửi lên)
                if (string.IsNullOrWhiteSpace(request.Token))
                    throw new Exception("Thiếu mã xác thực Google. Vui lòng thử lại.");

                var googleResult = await ValidateGoogleTokenAsync(request.Token);
                email = googleResult.email;
                name = googleResult.name;
                providerKey = googleResult.providerKey;
                picture = googleResult.picture;
            }
            else if (isFacebook)
            {
                if (!string.IsNullOrWhiteSpace(request.Token))
                {
                    var facebookResult = await ValidateFacebookTokenAsync(request.Token);
                    email = facebookResult.email;
                    name = facebookResult.name;
                    providerKey = facebookResult.providerKey;
                }
            }
            else
            {
                throw new Exception("Nhà cung cấp đăng nhập không được hỗ trợ.");
            }

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(providerKey))
            {
                throw new Exception("Thông tin xác thực tài khoản liên kết không đầy đủ.");
            }

            var user = await _userManager.FindByLoginAsync(providerName, providerKey);
            if (user is null)
            {
                user = await _userManager.FindByEmailAsync(email);
                if (user is null)
                {
                    var emailPrefix = email.Split('@')[0];
                    var userName = emailPrefix;
                    var userWithSameName = await _userManager.FindByNameAsync(userName);
                    int suffix = 1;
                    while (userWithSameName is not null)
                    {
                        userName = $"{emailPrefix}{suffix}";
                        userWithSameName = await _userManager.FindByNameAsync(userName);
                        suffix++;
                    }

                    user = new AppUser
                    {
                        UserName = userName,
                        Email = email,
                        HoTen = name ?? userName,
                        AnhDaiDien = picture,
                        EmailConfirmed = true
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                    {
                        throw new Exception($"Không thể tạo tài khoản: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                    }

                    // Nghiệp vụ EduVerse: tài khoản tạo qua Google luôn mặc định là Học viên
                    await _userManager.AddToRoleAsync(user, "HocVien");
                }

                // Liên kết provider vào tài khoản (tài khoản mới HOẶC tài khoản email đã tồn tại)
                var identityUserLoginInfo = new UserLoginInfo(providerName, providerKey, providerName);
                var addLoginResult = await _userManager.AddLoginAsync(user, identityUserLoginInfo);
                if (!addLoginResult.Succeeded)
                {
                    throw new Exception($"Không thể liên kết tài khoản {providerName}: {string.Join(", ", addLoginResult.Errors.Select(e => e.Description))}");
                }
            }

            // Chặn tài khoản đã bị vô hiệu hoá / bị khoá — dù Google đã xác thực thành công
            if (user.IsDeleted)
                throw new Exception("Tài khoản của bạn hiện không còn hoạt động.");
            if (await _userManager.IsLockedOutAsync(user))
            {
                var lockoutEnd = user.LockoutEnd?.ToLocalTime();
                throw new Exception(lockoutEnd.HasValue
                    ? $"Tài khoản của bạn đang bị khóa đến {lockoutEnd:HH:mm dd/MM/yyyy}."
                    : "Tài khoản của bạn hiện đang bị khóa.");
            }

            await AssignNewSessionAsync(user, httpResponse);

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

            var roles = await _userManager.GetRolesAsync(user);

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
            new Claim("sid",                     user.CurrentSessionId ?? ""),
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

        private void SetRefreshTokenCookie(HttpResponse response, string token)
        {
            response.Cookies.Append("refreshToken", token, new CookieOptions
            {
                HttpOnly = true,
                // Mặc định true (bảo mật). Đặt Auth:CookieSecure=false khi triển khai qua HTTP (vd IP), khuyến nghị dùng HTTPS.
                Secure = !string.Equals(_config["Auth:CookieSecure"], "false", System.StringComparison.OrdinalIgnoreCase),
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }

        private async Task AssignNewSessionAsync(AppUser user, HttpResponse httpResponse)
        {
            user.CurrentSessionId = Guid.NewGuid().ToString();
            user.CurrentDeviceInfo = GetDeviceInfo(httpResponse);
            user.CurrentSessionAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new Exception("Không thể khởi tạo phiên đăng nhập. Vui lòng thử lại.");
        }

        private static string? GetDeviceInfo(HttpResponse httpResponse)
        {
            var userAgent = httpResponse.HttpContext?.Request.Headers["User-Agent"].ToString();
            return string.IsNullOrWhiteSpace(userAgent) ? "Unknown device" : userAgent;
        }
    }
}
