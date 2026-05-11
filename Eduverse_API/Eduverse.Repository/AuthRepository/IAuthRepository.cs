using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.AuthRepository
{
        public interface IAuthRepository
        {
            Task<TaiKhoan?> GetByEmailAsync(string email);
            Task<TaiKhoan?> GetByIdAsync(int id);
            Task AddTaiKhoanAsync(TaiKhoan taiKhoan);
            Task AddRefreshTokenAsync(RefreshToken token);
            Task<RefreshToken?> GetRefreshTokenAsync(string token);
            Task RevokeRefreshTokenAsync(RefreshToken token);
            Task SaveChangesAsync();
        }
}
