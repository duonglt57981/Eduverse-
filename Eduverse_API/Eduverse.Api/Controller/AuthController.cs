using Eduverse.Service.AuthService;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : EduverseController
    {
        private readonly IAuthService _authService;


        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<DataResponse<string>> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return new DataResponse<string> { Status = true, Message = result };
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<DataResponse<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request, Response);
            return new DataResponse<AuthResponse>
            {
                Status = true,
                Message = "Đăng nhập thành công",
                Data = result
            };
        }

        [HttpPost("refresh-token")]
        public async Task<DataResponse<AuthResponse>> RefreshToken()
        {
            var result = await _authService.RefreshTokenAsync(Request, Response);
            return new DataResponse<AuthResponse>
            {
                Status = true,
                Message = "Refresh token thành công",
                Data = result
            };
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<DataResponse<string>> Logout()
        {
            await _authService.LogoutAsync(Request, Response);
            return new DataResponse<string>
            {
                Status = true,
                Message = "Đăng xuất thành công"
            };
        }

        [HttpGet("verify-email")]
        [AllowAnonymous]
        public async Task<DataResponse<string>> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
        {
            var result = await _authService.VerifyEmailAsync(userId, token);
            return new DataResponse<string> { Status = true, Message = result };
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<DataResponse<string>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var result = await _authService.ForgotPasswordAsync(request.Email);
            return new DataResponse<string> { Status = true, Message = result };
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<DataResponse<string>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request);
            return new DataResponse<string> { Status = true, Message = result };
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<DataResponse<string>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _authService.ChangePasswordAsync(request, userId, Response);
            return new DataResponse<string> { Status = true, Message = result };
        }
    }
}