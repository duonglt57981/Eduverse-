
using Eduverse.Model.Entities;
using Eduverse.Repository.AuthRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepo;
        private readonly IConfiguration _config;

        public AuthService(IAuthRepository authRepo, IConfiguration config)
        {
            _authRepo = authRepo;
            _config = config;
        }

        // ══════════════════════════════════════════════
        // REGISTER
        // ══════════════════════════════════════════════
        public async Task<DataResponse<string>> RegisterAsync(RegisterRequest request)
        {
            // Kiểm tra email tồn tại
            var existing = await _authRepo.GetByEmailAsync(request.Email);
            if (existing is not null)
                return DataResponse<string>.False("Email đã được sử dụng");

            var taiKhoan = new TaiKhoan
            {
                SDT = request.SDT,
                Email = request.Email,
                HashPass = BCrypt.Net.BCrypt.HashPassword(request.Password), 
                TrangThai = true,
                NgayTao = DateTime.UtcNow,
                ID_VaiTro = request.ID_VaiTro
            };

            await _authRepo.AddTaiKhoanAsync(taiKhoan);
            await _authRepo.SaveChangesAsync();

            return DataResponse<string>.Success("Đăng ký thành công");
        }

        // ══════════════════════════════════════════════
        // LOGIN
        // ══════════════════════════════════════════════
        public async Task<DataResponse<AuthResponse>> LoginAsync(
            LoginRequest request, HttpResponse httpResponse)
        {
            var taiKhoan = await _authRepo.GetByEmailAsync(request.Email);

            // Verify password — BCrypt tự handle timing attack
            if (taiKhoan is null || !BCrypt.Net.BCrypt.Verify(request.Password, taiKhoan.HashPass))
                return DataResponse<AuthResponse>.False("Email hoặc mật khẩu không đúng");

            if (!taiKhoan.TrangThai)
                return DataResponse<AuthResponse>.False("Tài khoản đã bị khóa");

            // Sinh Access Token (15 phút)
            var accessToken = GenerateAccessToken(taiKhoan);

            // Sinh Refresh Token (7 ngày) + lưu DB
            var refreshTokenStr = GenerateRefreshToken();
            await _authRepo.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshTokenStr,
                NgayTao = DateTime.UtcNow,
                NgayHetHan = DateTime.UtcNow.AddDays(7),
                DaBiThuHoi = false,
                IDTaiKhoan = taiKhoan.IDTaiKhoan
            });
            await _authRepo.SaveChangesAsync();

            // Ghi Refresh Token vào HttpOnly Cookie
            SetRefreshTokenCookie(httpResponse, refreshTokenStr);

            return DataResponse<AuthResponse>.Success(new AuthResponse
            {
                AccessToken = accessToken,
                Email = taiKhoan.Email,
                IDTaiKhoan = taiKhoan.IDTaiKhoan,
                VaiTro = taiKhoan.ID_VaiTro
            });
        }

        // ══════════════════════════════════════════════
        // REFRESH TOKEN (Token Rotation)
        // ══════════════════════════════════════════════
        public async Task<DataResponse<AuthResponse>> RefreshTokenAsync(
            HttpRequest httpRequest, HttpResponse httpResponse)
        {
            // Đọc từ cookie — FE không cần làm gì thêm
            var oldTokenStr = httpRequest.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(oldTokenStr))
                return DataResponse<AuthResponse>.False("Không tìm thấy refresh token");

            var tokenEntity = await _authRepo.GetRefreshTokenAsync(oldTokenStr);

            if (tokenEntity is null)
                return DataResponse<AuthResponse>.False("Refresh token không hợp lệ");

            if (tokenEntity.NgayHetHan < DateTime.UtcNow)
                return DataResponse<AuthResponse>.False("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");

            // Thu hồi token cũ (Rotation — phát hiện token bị đánh cắp)
            await _authRepo.RevokeRefreshTokenAsync(tokenEntity);

            // Cấp token mới
            var newAccessToken = GenerateAccessToken(tokenEntity.TaiKhoan);
            var newRefreshTokenStr = GenerateRefreshToken();

            await _authRepo.AddRefreshTokenAsync(new RefreshToken
            {
                Token = newRefreshTokenStr,
                NgayTao = DateTime.UtcNow,
                NgayHetHan = DateTime.UtcNow.AddDays(7),
                DaBiThuHoi = false,
                IDTaiKhoan = tokenEntity.IDTaiKhoan
            });
            await _authRepo.SaveChangesAsync();

            SetRefreshTokenCookie(httpResponse, newRefreshTokenStr);

            return DataResponse<AuthResponse>.Success(new AuthResponse
            {
                AccessToken = newAccessToken,
                Email = tokenEntity.TaiKhoan.Email,
                IDTaiKhoan = tokenEntity.TaiKhoan.IDTaiKhoan,
                VaiTro = tokenEntity.TaiKhoan.ID_VaiTro
            });
        }

        // ══════════════════════════════════════════════
        // LOGOUT
        // ══════════════════════════════════════════════
        public async Task<DataResponse<string>> LogoutAsync(
            HttpRequest httpRequest, HttpResponse httpResponse)
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
            return DataResponse<string>.Success("Đăng xuất thành công");
        }

        // ══════════════════════════════════════════════
        // PRIVATE HELPERS
        // ══════════════════════════════════════════════
        private string GenerateAccessToken(TaiKhoan taiKhoan)
        {
            var key = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                // Đây là các claim mà EduverseContext.SaveChangesAsync đang đọc
                new Claim(ClaimTypes.NameIdentifier, taiKhoan.IDTaiKhoan.ToString()),
                new Claim(ClaimTypes.Surname,        taiKhoan.Email),
                new Claim(ClaimTypes.Email,          taiKhoan.Email),
                new Claim(ClaimTypes.Role,                  taiKhoan.ID_VaiTro.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

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
                HttpOnly = true,               // JS không đọc được → chống XSS
                Secure = true,               // Chỉ qua HTTPS
                SameSite = SameSiteMode.Strict, // Chống CSRF
                Expires = DateTime.UtcNow.AddDays(7)
            });
        }
    }
}
