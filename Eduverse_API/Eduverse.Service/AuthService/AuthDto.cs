using System.ComponentModel.DataAnnotations;

namespace Eduverse.Service.AuthService
{
    public class RegisterRequest
    {
        [Required] public string UserName { get; set; }
        [Required] public string HoTen { get; set; }
        [Required][EmailAddress] public string Email { get; set; }
        [Required][MinLength(6)] public string Password { get; set; }
        public string? ChucVu { get; set; }
        public int? GioiTinh { get; set; }
    }

    public class LoginRequest
    {
        [Required] public string UserName { get; set; }
        [Required] public string Password { get; set; }
    }

    public class AuthResponse
    {
        public string AccessToken { get; set; }
        public string UserName { get; set; }
        public string? HoTen { get; set; }
        public string? Email { get; set; }
    }

    public class ChangePasswordRequest
    {
        [Required] public string OldPassword { get; set; }
        [Required][MinLength(6)] public string NewPassword { get; set; }
    }

    public class ForgotPasswordRequest
    {
        [Required][EmailAddress] public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        [Required] public string UserId { get; set; }
        [Required] public string Token { get; set; }
        [Required][MinLength(6)] public string NewPassword { get; set; }
    }

    public class VerifyEmailRequest
    {
        [Required] public string UserId { get; set; }
        [Required] public string Token { get; set; }
    }
}