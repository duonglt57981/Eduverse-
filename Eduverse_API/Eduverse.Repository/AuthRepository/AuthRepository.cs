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

        public async Task<TaiKhoan?> GetByEmailAsync(string email)
            => await _context.taiKhoans
                .Include(t => t.RefreshTokens)
                .FirstOrDefaultAsync(t => t.Email == email);

        public async Task<TaiKhoan?> GetByIdAsync(int id)
            => await _context.taiKhoans
                .Include(t => t.RefreshTokens)
                .FirstOrDefaultAsync(t => t.IDTaiKhoan == id);

        public async Task AddTaiKhoanAsync(TaiKhoan taiKhoan)
            => await _context.taiKhoans.AddAsync(taiKhoan);

        public async Task AddRefreshTokenAsync(RefreshToken token)
            => await _context.RefreshTokens.AddAsync(token);

        public async Task<RefreshToken?> GetRefreshTokenAsync(string token)
            => await _context.RefreshTokens
                .Include(r => r.TaiKhoan)
                .FirstOrDefaultAsync(r => r.Token == token && !r.DaBiThuHoi);

        public async Task RevokeRefreshTokenAsync(RefreshToken token)
        {
            token.DaBiThuHoi = true;
            _context.RefreshTokens.Update(token);
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
