using Eduverse.Service.AuthService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using LoginRequest = Eduverse.Service.AuthService.LoginRequest;
using RegisterRequest = Eduverse.Service.AuthService.RegisterRequest;
using ResetPasswordRequest = Eduverse.Service.AuthService.ResetPasswordRequest;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request, HttpResponse httpResponse);
    Task<AuthResponse> RefreshTokenAsync(HttpRequest httpRequest, HttpResponse httpResponse);
    Task LogoutAsync(HttpRequest httpRequest, HttpResponse httpResponse);
    Task<string> VerifyEmailAsync(string userId, string token);
    Task<string> ChangePasswordAsync(ChangePasswordRequest request, Guid userId, HttpResponse httpResponse);
    Task<string> ForgotPasswordAsync(string email);
    Task<string> ResetPasswordAsync(ResetPasswordRequest request);
    Task<AuthResponse> ExternalLoginAsync(ExternalLoginRequest request, HttpResponse httpResponse);
}