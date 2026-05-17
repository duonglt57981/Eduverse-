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
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task AddRefreshTokenAsync(RefreshToken token);
        Task RevokeRefreshTokenAsync(RefreshToken token);
        Task RevokeAllRefreshTokensByUserIdAsync(Guid userId);
        Task SaveChangesAsync();
    }
}
