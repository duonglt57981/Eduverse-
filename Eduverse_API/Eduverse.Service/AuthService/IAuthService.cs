using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.AuthService
{
    public interface IAuthService
    {
        Task<DataResponse<string>> RegisterAsync(RegisterRequest request);
        Task<DataResponse<AuthResponse>> LoginAsync(LoginRequest request, HttpResponse httpResponse);
        Task<DataResponse<AuthResponse>> RefreshTokenAsync(HttpRequest httpRequest, HttpResponse httpResponse);
        Task<DataResponse<string>> LogoutAsync(HttpRequest httpRequest, HttpResponse httpResponse);
    }
}
