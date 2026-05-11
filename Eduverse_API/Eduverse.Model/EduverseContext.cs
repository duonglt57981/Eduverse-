using System.Security.Claims;
using Eduverse.Model.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Model
{
    public class EduverseContext : IdentityDbContext<AppUser, AppRole, Guid>
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;
        public EduverseContext(DbContextOptions<EduverseContext> options, IHttpContextAccessor? httpContextAccessor=null) : base(options)
        {
            this._httpContextAccessor = httpContextAccessor;
        }

        public DbSet<AppUser> AppUsers { get; set; }
        public DbSet<AppRole> AppRoles { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<TaiKhoan> taiKhoans { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<TaiKhoan>(entity =>
            {
                entity.HasKey(t => t.IDTaiKhoan);
                entity.Property(t => t.Email).IsRequired().HasMaxLength(256);
                entity.Property(t => t.SDT).HasMaxLength(20);
                entity.Property(t => t.HashPass).IsRequired();
                entity.HasIndex(t => t.Email).IsUnique(); // Email unique
            });

            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(r => r.IDRefreshToken);
                entity.Property(r => r.Token).IsRequired();
                entity.HasIndex(r => r.Token).IsUnique();

                entity.HasOne(r => r.TaiKhoan)
                      .WithMany(t => t.RefreshTokens)
                      .HasForeignKey(r => r.IDTaiKhoan)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<AppUser>().HasData(
                new AppUser
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    UserName = "admin",
                    ChucVu = "Admin",
                    NormalizedUserName = "ADMIN",
                    Email = "admin",
                    NormalizedEmail = "ADMIN",
                    EmailConfirmed = true,
                    PasswordHash = new PasswordHasher<AppUser>().HashPassword(null, "12345678"),
                    SecurityStamp = Guid.NewGuid().ToString()
                }
            );

            base.OnModelCreating(builder);
        }
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<AuditableEntity>();

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Surname);
            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedDate = DateTime.Now;
                    entry.Entity.UpdatedDate = DateTime.Now; // Set updated date on create to avoid SQL range error
                    entry.Entity.CreatedId = userId;
                    entry.Entity.CreatedBy = userName;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedDate = DateTime.Now;
                    entry.Entity.UpdatedId = userId;
                    entry.Entity.UpdatedBy = userName;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedDate = DateTime.Now;
                    entry.Entity.DeletedId = userId;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
