using System.ComponentModel.DataAnnotations;

namespace Eduverse.Service.AuthService
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Họ và tên là bắt buộc")]
        public string HoTen { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự")]
        public string Password { get; set; }

        public string? ChucVu { get; set; }
        public int? GioiTinh { get; set; }

        [RegularExpression(@"^0[0-9]{9}$", ErrorMessage = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0")]
        public string? PhoneNumber { get; set; }
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
        public List<string>? Roles { get; set; }
    }

    public class ExternalLoginRequest
    {
        [Required] public string Provider { get; set; }
        [Required] public string Email { get; set; }
        public string? Name { get; set; }
        [Required] public string ProviderKey { get; set; }
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
        public string? UserId { get; set; }
        public string? Email { get; set; }
        [Required] public string Token { get; set; }
        [Required][MinLength(8, ErrorMessage = "Mật khẩu mới phải có ít nhất 8 ký tự")] public string NewPassword { get; set; }
    }

    public class VerifyEmailRequest
    {
        [Required] public string UserId { get; set; }
        [Required] public string Token { get; set; }
    }
}