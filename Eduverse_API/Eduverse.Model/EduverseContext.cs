using Eduverse.Model.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using System.Security.Claims;

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
        //public DbSet<KhoaHoc> KhoaHocs { get; set; } trùng
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<BaiGiang> baiGiangs { get; set; }
        public DbSet<BaiKiemTra> baiKiemTras { get; set; }
        public DbSet<CauHoi> cauHois { get; set; }
        public DbSet<ChiTietLamBaiKiemTra> chiTietLamBaiKiemTras { get; set; }
        public DbSet<ChungChi> chungChis { get; set; }
        public DbSet<DangKyKhoaHoc> dangKyKhoaHocs { get; set; }
        public DbSet<DanhGia> danhGias { get; set; }
        public DbSet<DanhMuc> danhMucs { get; set; }
        public DbSet<DanhMuc_KhoaHoc> danhMuc_KhoaHocs { get; set; }
        public DbSet<DanhSachYeuThich> danhSachYeuThiches { get; set; }
        public DbSet<DanhSachMuonMuaSau> danhSachMuonMuaSaus { get; set; }
        public DbSet<DapAn> dapAns { get; set; }
        public DbSet<DapAn_NguoiDung> dapAn_NguoiDungs { get; set; }
        public DbSet<DonHang> donHangs { get; set; }
        public DbSet<DonHangChiTiet> donHangChiTiets { get; set; }
        public DbSet<GioHang> gioHangs { get; set; }
        public DbSet<GioHangChiTiet> gioHangChiTiets { get; set; }
        public DbSet<HoiDap> hoiDaps { get; set; }
        public DbSet<KetQuaBaiThi> ketQuaBaiThis { get; set; }
        public DbSet<KhuyenMai> khuyenMais { get; set; }
        public DbSet<KhuyenMai_KhoaHoc> khuyenMai_KhoaHocs   { get; set; }
        public DbSet<KhoaHoc_GiangVien> khoaHoc_GiangViens { get; set; }
        public DbSet<LanLamBaiKiemTra> lanLamBaiKiemTras { get; set; }
        public DbSet<LienKet> lienKets { get; set; }
        public DbSet<LoiMoiGiangVien> loiMoiGiangViens { get; set; }
        public DbSet<DonHang_KhuyenMai> DonHang_KhuyenMais { get; set; }
        public DbSet<LoaiThongBao> loaiThongBaos { get; set; }
        public DbSet<NganHang> nganHangs { get; set; }
        public DbSet<Phan> phans { get; set; }
        public DbSet<PhanHoiDanhGia> phanHoiDanhGias { get; set; }
        public DbSet<TaiLieu> taiLieus { get; set; }
        public DbSet<TienDoHocTap> tienDoHocTaps { get; set; }
        public DbSet<ThanhToan> thanhToans { get; set; }
        public DbSet<ThongBao> thongBaos { get; set; }
        public DbSet<VaiTro_NguoiDung> vaiTro_NguoiDungs { get; set; }
        public DbSet<LichSuKiemDuyetKhoaHoc> lichSuKiemDuyetKhoaHocs { get; set; }
        public DbSet<YeuCauRutTien> yeuCauRutTiens { get; set; }
        public DbSet<LikeHoiDap> likeHoiDaps { get; set; }

        public DbSet<InstructorRequest> InstructorRequests { get; set; }
        public DbSet<LyDoTuChoi> lyDoTuChois { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
                    builder.Entity<KhoaHoc_GiangVien>()
            .HasIndex(x => new { x.IdKhoaHoc, x.IdGiangVien })
            .IsUnique();

            builder.Entity<LoiMoiGiangVien>()
                .HasIndex(x => new { x.IdKhoaHoc, x.IdNguoiDuocMoi })
                .IsUnique();  // 1 người chỉ có 1 lời mời active cho 1 khóa

            builder.Entity<KhoaHoc>()
       .ToTable("KhoaHocs");

            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(r => r.IDRefreshToken);
                entity.Property(r => r.Token).IsRequired();
                entity.HasIndex(r => r.Token).IsUnique();
                entity.HasOne(r => r.AppUser)
                      .WithMany()
                      .HasForeignKey(r => r.AppUserId)
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

            builder.Entity<DonHangChiTiet>(entity =>
            {
                entity.HasKey(x => x.Id);

                entity.HasOne<DonHang>()
                      .WithMany(x => x.DonHangChiTiets)
                      .HasForeignKey(x => x.IdDonHang);

                entity.HasOne<KhoaHoc>()
                      .WithMany()
                      .HasForeignKey(x => x.IdKhoaHoc);
            });

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
