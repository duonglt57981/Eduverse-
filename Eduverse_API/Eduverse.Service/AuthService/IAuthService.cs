using Eduverse.Service.AuthService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using LoginRequest = Eduverse.Service.AuthService.LoginRequest;
using RegisterRequest = Eduverse.Service.AuthService.RegisterRequest;
using ResetPasswordRequest = Eduverse.Service.AuthService.ResetPasswordRequest;
// Microsoft.AspNetCore.Identity.Data cũng có lớp cùng tên -> phải chỉ rõ lớp của dự án
using ForgotPasswordRequest = Eduverse.Service.AuthService.ForgotPasswordRequest;

public interface IAuthService
{
    Task<string> SendRegisterOtpAsync(SendRegisterOtpRequest request);
    Task<string> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request, HttpResponse httpResponse);
    Task<AuthResponse> RefreshTokenAsync(HttpRequest httpRequest, HttpResponse httpResponse);
    Task LogoutAsync(HttpRequest httpRequest, HttpResponse httpResponse);
    Task<string> VerifyEmailAsync(string userId, string token);
    Task<string> ChangePasswordAsync(ChangePasswordRequest request, Guid userId, HttpResponse httpResponse);
    Task<string> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<string> SendPhoneOtpAsync(Guid userId, SendPhoneOtpRequest request);
    Task<string> ConfirmPhoneOtpAsync(Guid userId, ConfirmPhoneOtpRequest request);
    Task<string> ResetPasswordAsync(ResetPasswordRequest request);
    Task<string> VerifyOtpAsync(VerifyOtpRequest request);
    Task<AuthResponse> ExternalLoginAsync(ExternalLoginRequest request, HttpResponse httpResponse);
}
