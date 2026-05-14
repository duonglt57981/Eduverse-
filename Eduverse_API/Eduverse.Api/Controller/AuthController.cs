using Docker.DotNet.Models;
using Eduverse.Api.Dto;
using Eduverse.Service.AuthService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AuthResponse = Eduverse.Service.AuthService.AuthResponse;
using ForgotPasswordRequest = Eduverse.Service.AuthService.ForgotPasswordRequest;
using LoginRequest = Eduverse.Service.AuthService.LoginRequest;
using RegisterRequest = Eduverse.Service.AuthService.RegisterRequest;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                return Ok(new DataResponse<string>
                {
                    Status = true,
                    Message = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new DataResponse<string>
                {
                    Status = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var result = await _authService.LoginAsync(request, Response);
                return Ok(new DataResponse<AuthResponse>
                {
                    Status = true,
                    Message = "Đăng nhập thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new DataResponse<AuthResponse>
                {
                    Status = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(Request, Response);
                return Ok(new DataResponse<AuthResponse>
                {
                    Status = true,
                    Message = "Refresh token thành công",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new DataResponse<AuthResponse>
                {
                    Status = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await _authService.LogoutAsync(Request, Response);
                return Ok(new DataResponse<string>
                {
                    Status = true,
                    Message = "Đăng xuất thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new DataResponse<string>
                {
                    Status = false,
                    Message = ex.Message
                });
            }
        }
        [HttpGet("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
        {
            try
            {
                var result = await _authService.VerifyEmailAsync(userId, token);
                return Ok(new DataResponse<string> { Status = true, Message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new DataResponse<string> { Status = false, Message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var result = await _authService.ForgotPasswordAsync(request.Email);
                return Ok(new DataResponse<string> { Status = true, Message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new DataResponse<string> { Status = false, Message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] Service.AuthService.ResetPasswordRequest request)
        {
            try
            {
                var result = await _authService.ResetPasswordAsync(request);
                return Ok(new DataResponse<string> { Status = true, Message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new DataResponse<string> { Status = false, Message = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var result = await _authService.ChangePasswordAsync(request, userId, Response);
                return Ok(new DataResponse<string> { Status = true, Message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new DataResponse<string> { Status = false, Message = ex.Message });
            }
        }
    }
}
