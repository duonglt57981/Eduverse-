using Eduverse.Model;
using Eduverse.Model.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.AuthRepository
{
        public class AuthRepository : IAuthRepository
        {
            private readonly EduverseContext _context;

            public AuthRepository(EduverseContext context)
            {
                _context = context;
            }

            public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
                => await _context.RefreshTokens
                    .Include(r => r.AppUser) 
                    .FirstOrDefaultAsync(r => r.Token == token && !r.DaBiThuHoi);

            public async Task AddRefreshTokenAsync(RefreshToken token)
                => await _context.RefreshTokens.AddAsync(token);

            public async Task RevokeRefreshTokenAsync(RefreshToken token)
            {
                token.DaBiThuHoi = true;
                _context.RefreshTokens.Update(token);
            }
            public async Task RevokeAllRefreshTokensByUserIdAsync(Guid userId)
            {
                var tokens = await _context.RefreshTokens
                    .Where(r => r.AppUserId == userId && !r.DaBiThuHoi)
                    .ToListAsync();

                foreach (var token in tokens)
                    token.DaBiThuHoi = true;

                _context.RefreshTokens.UpdateRange(tokens);
            }

            public async Task SaveChangesAsync()
                    => await _context.SaveChangesAsync();
            }
}
