using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.AuthService
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "SDT không được trống")]
        public string SDT { get; set; }

        [Required(ErrorMessage = "Email không được trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password không được trống")]
        [MinLength(6, ErrorMessage = "Password tối thiểu 6 ký tự")]
        public string Password { get; set; }

        public int ID_VaiTro { get; set; } = 2; // Mặc định role user
    }

    public class LoginRequest
    {
        [Required(ErrorMessage = "Email không được trống")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password không được trống")]
        public string Password { get; set; }
    }

    public class AuthResponse
    {
        public string AccessToken { get; set; }
        public string Email { get; set; }
        public int IDTaiKhoan { get; set; }
        public int VaiTro { get; set; }
    }
}
