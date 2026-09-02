using CloudinaryDotNet;
using DocumentFormat.OpenXml.Spreadsheet;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : EduverseController
    {
        private readonly IService<KhoaHoc> _khoaHocService;
        private readonly IService<DanhMuc> _danhMucService;
        private readonly IService<DangKyKhoaHoc> _dangKyKhoaHocService;
        private readonly IService<TienDoHocTap> _tienDoHocTapService;
        private readonly IService<ChungChi> _chungChiService;
        private readonly IService<BaiKiemTra> _baiKiemTraService;
        private readonly IService<DanhMuc_KhoaHoc> _danhMucKhoaHocService;
        private readonly UserManager<AppUser> _userManager;
        private readonly IService<DonHang> _donHangService;
        private readonly IService<DonHangChiTiet> _donHangChiTietService;
        private readonly IService<KhoaHoc_GiangVien> _khoaHocGiangVienService;
        private readonly IService<DonHang_KhuyenMai> _donHangKhuyenMaiService;
        private readonly IService<DonHang_GiangVien> _donHangGiangVienService;
        private readonly IService<DanhGia> _danhGiaService;
        private readonly IService<KhuyenMai> _khuyenMaiService;
        private readonly IService<KhuyenMai_KhoaHoc> _khuyenMaiKhoaHocService;
        private readonly IService<DanhSachYeuThich> _danhSachYeuThichService;
        public DashboardController(
            IService<KhoaHoc> khoaHocService,
            IService<DanhMuc> danhMucService,
            IService<DangKyKhoaHoc> dangKyKhoaHocService,
            IService<TienDoHocTap> tienDoHocTapService,
            IService<DonHang> donHangService,
            IService<DonHangChiTiet> donHangChiTietService,
            IService<ChungChi> chungChiService,
            IService<BaiKiemTra> baiKiemTraService,
            IService<DanhMuc_KhoaHoc> danhMucKhoaHocService,
            IService<KhoaHoc_GiangVien> khoaHocGiangVienService,
            IService<DonHang_KhuyenMai> donHangKhuyenMaiService,
            IService<DonHang_GiangVien> donHangGiangVienService,
            IService<KhuyenMai> khuyenMaiService,              
            IService<KhuyenMai_KhoaHoc> khuyenMaiKhoaHocService,
            IService<DanhGia> danhGiaService,
            IService<DanhSachYeuThich> danhSachYeuThichService,
            UserManager<AppUser> userManager)
        {
            _khoaHocService = khoaHocService;
            _danhMucService = danhMucService;
            _dangKyKhoaHocService = dangKyKhoaHocService;
            _tienDoHocTapService = tienDoHocTapService;
            _chungChiService = chungChiService;
            _donHangService = donHangService;
            _donHangChiTietService = donHangChiTietService;
            _baiKiemTraService = baiKiemTraService;
            _danhMucKhoaHocService = danhMucKhoaHocService;
            _userManager = userManager;
            _khoaHocGiangVienService = khoaHocGiangVienService;
            _donHangKhuyenMaiService = donHangKhuyenMaiService;
            _donHangGiangVienService = donHangGiangVienService;
            _danhGiaService = danhGiaService;
            _khuyenMaiService = khuyenMaiService;               
            _khuyenMaiKhoaHocService = khuyenMaiKhoaHocService;
            _danhSachYeuThichService = danhSachYeuThichService;
        }

        [HttpGet]
        public async Task<DataResponse<object>> GetDashboardData([FromQuery] string? role, [FromQuery] string? period)
        {
            var loggedInUserId = UserId;
            if (loggedInUserId == null)
            {
                return new DataResponse<object>
                {
                    Status = false,
                    Message = "Không tìm thấy người dùng đăng nhập"
                };
            }

            try
            {
                // Seed data if DB is empty of courses
                await SeedDataAsync(loggedInUserId.Value);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error seeding data: " + ex.Message);
            }

            // Fetch user info
            AppUser user = null;
            IList<string> roles = new List<string>();
            try
            {
                user = await _userManager.FindByIdAsync(loggedInUserId.ToString());
                if (user != null)
                {
                    roles = await _userManager.GetRolesAsync(user);

                    if (!string.IsNullOrEmpty(role))
                    {
                        if (role == "Admin" && roles.Contains("Admin"))
                        {
                            return await GetAdminDashboardDataAsync(period);
                        }
                        if (role == "GiaoVien" && roles.Contains("GiaoVien"))
                        {
                            return await GetInstructorDashboardDataAsync(loggedInUserId.Value);
                        }
                        // If role == "HocVien", fall through to student dashboard data
                    }
                    else
                    {
                        if (roles.Contains("Admin"))
                        {
                            return await GetAdminDashboardDataAsync(period);
                        }
                        if (roles.Contains("GiaoVien"))
                        {
                            return await GetInstructorDashboardDataAsync(loggedInUserId.Value);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching user or roles: " + ex.Message);
            }

            var fullName = user?.HoTen ?? "Học viên EduVerse";
            var avatarUrl = user?.AnhDaiDien;


            // Fetch user's registered courses
            var userRegistrations = new List<DangKyKhoaHoc>();
            try
            {
                userRegistrations = await _dangKyKhoaHocService.GetQueryable()
                    .Where(r => r.IdNguoiDangKi == loggedInUserId.Value && r.IsDeleted == false)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching user registrations: " + ex.Message);
            }

            var registeredCourseIds = userRegistrations.Select(r => r.IdKhoaHoc).ToList();

            // Fetch actual courses information
            var courses = new List<KhoaHoc>();
            try
            {
                courses = await _khoaHocService.GetQueryable().Where(c =>
                            c.TrangThaiPheDuyet == "DaDuyet" &&
                            c.TrangThai == "HoatDong" &&
                            c.IsBanHienTai == true &&
                            c.IsDeleted == false)
                        .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching courses: " + ex.Message);
            }



            var registeredCourses = courses.Where(c => registeredCourseIds.Contains(c.Id)).ToList();

            var allCourseIds = courses.Select(c => c.Id).ToList();
            var ratingMap = await GetRatingMapAsync(allCourseIds);

            // Fetch instructor full names (HoTen) instead of login username (CreatedBy)
            var instructorNameByCourseId = new Dictionary<Guid, string>();
            try
            {
                var courseGiangViens = await _khoaHocGiangVienService.GetQueryable()
                    .Where(kgv => allCourseIds.Contains(kgv.IdKhoaHoc) && !kgv.IsDeleted && kgv.Visible)
                    .OrderByDescending(kgv => kgv.LaChuSoHuu)
                    .ToListAsync();

                var giangVienUserIds = courseGiangViens
                    .Select(kgv => kgv.IdGiangVien)
                    .Concat(courses.Where(c => c.CreatedId.HasValue).Select(c => c.CreatedId!.Value))
                    .Distinct()
                    .ToList();

                var instructorUsers = await _userManager.Users
                    .Where(u => giangVienUserIds.Contains(u.Id))
                    .Select(u => new { u.Id, u.HoTen, u.UserName })
                    .ToListAsync();

                var nameByUserId = instructorUsers.ToDictionary(
                    u => u.Id,
                    u => !string.IsNullOrWhiteSpace(u.HoTen) ? u.HoTen : (!string.IsNullOrWhiteSpace(u.UserName) ? u.UserName : "Giảng viên EduVerse")
                );

                foreach (var c in courses)
                {
                    var gv = courseGiangViens.FirstOrDefault(kgv => kgv.IdKhoaHoc == c.Id);
                    if (gv != null && nameByUserId.TryGetValue(gv.IdGiangVien, out var gvName))
                    {
                        instructorNameByCourseId[c.Id] = gvName;
                    }
                    else if (c.CreatedId.HasValue && nameByUserId.TryGetValue(c.CreatedId.Value, out var creatorName))
                    {
                        instructorNameByCourseId[c.Id] = creatorName;
                    }
                    else
                    {
                        instructorNameByCourseId[c.Id] = !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse";
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching instructor names: " + ex.Message);
            }

            // Calculate progress for each registration
            var registrationIds = userRegistrations.Select(r => r.Id).ToList();
            var progressRecords = new List<TienDoHocTap>();
            try
            {
                progressRecords = await _tienDoHocTapService.GetQueryable()
                    .Where(p => registrationIds.Contains(p.IdDangKi ?? Guid.Empty))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching progress records: " + ex.Message);
            }

            // Calculate statistics
            int totalCourses = registeredCourses.Count;
            double avgProgress = 0;
            var progressList = new List<double>();

            foreach (var reg in userRegistrations)
            {
                var course = courses.FirstOrDefault(c => c.Id == reg.IdKhoaHoc);
                var record = progressRecords.FirstOrDefault(p => p.IdDangKi == reg.Id);
                if (course != null && record != null)
                {
                    double progressVal = record.ThoiGianXem ?? 0;
                    if (course.TongThoiLuong.HasValue && course.TongThoiLuong.Value > 0 && progressVal > 100)
                    {
                        progressVal = Math.Min(100, Math.Round(progressVal / course.TongThoiLuong.Value * 100));
                    }
                    else
                    {
                        progressVal = Math.Min(100, progressVal);
                    }
                    progressList.Add(progressVal);
                }
                else
                {
                    progressList.Add(0);
                }
            }

            avgProgress = progressList.Any() ? Math.Round(progressList.Average()) : 0;

            var certificates = new List<ChungChi>();
            try
            {
                certificates = await _chungChiService.GetQueryable()
                    .Where(c => registeredCourseIds.Contains(c.IdKhoaHoc ?? Guid.Empty) && c.IsDeleted == false)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching certificates: " + ex.Message);
            }
            int certificatesCount = certificates.Count;

            // 1. Welcome stats
            var welcomeStats = new
            {
                userName = fullName,
                avatarUrl = avatarUrl,
                subtitle = "Hôm nay là thời điểm tuyệt vời để tiếp tục hành trình học tập của bạn.",
                totalCourses = totalCourses,
                progressPercent = avgProgress,
                certificatesCount = certificatesCount
            };

            // 2. Continue learning tabs
            var continueCourses = new List<object>();
            int idx = 0;
            foreach (var reg in userRegistrations)
            {
                var course = courses.FirstOrDefault(c => c.Id == reg.IdKhoaHoc);
                if (course != null)
                {
                    var record = progressRecords.FirstOrDefault(p => p.IdDangKi == reg.Id);
                    double progressVal = record?.ThoiGianXem ?? 0;
                    if (course.TongThoiLuong.HasValue && course.TongThoiLuong.Value > 0 && progressVal > 100)
                    {
                        progressVal = Math.Min(100, Math.Round(progressVal / course.TongThoiLuong.Value * 100));
                    }
                    else
                    {
                        progressVal = Math.Min(100, progressVal);
                    }

                    continueCourses.Add(new
                    {
                        id = course.Id.ToString(),
                        idDangKiKhoaHoc = reg.Id.ToString(),
                        daDangKy = true,
                        title = course.TieuDe,
                        hinhAnhKhoaHoc = course.HinhAnhKhoaHoc,
                        subtitle = "Video bài giảng",
                        contentType = "Video bài giảng",
                        duration = "Còn " + (course.TongThoiLuong.HasValue ? Math.Max(1, course.TongThoiLuong.Value / 60) : 2) + " giờ học",
                        progress = (int)progressVal,
                        thumbnailGradient = GetGradient(idx++)
                    });
                }
            }

            // (Bỏ dữ liệu giả: 'đang học dở' lấy từ đăng ký thật, rỗng nếu chưa có)

            var certList = certificates.Select((c, i) => (object)new
            {
                id = c.Id.ToString(),
                title = c.TenChungChi,
                subtitle = "EduVerse",
                contentType = "Chứng chỉ hoàn thành",
                duration = "Đã cấp: " + (c.NgayCap.HasValue ? c.NgayCap.Value.ToString("dd/MM/yyyy") : "Gần đây"),
                progress = 100,
                thumbnailGradient = GetGradient(i + 4)
            }).ToList();

            // (Bỏ dữ liệu giả: chứng chỉ lấy từ dữ liệu thật, rỗng nếu chưa có)

            var continueLearning = new
            {
                courses = continueCourses,
                //paths = null,
                certificates = certList,
                //assessments = null,
            };

            // 3. Next Sectors
            var categories = new List<DanhMuc>();
            try
            {
                categories = await _danhMucService.GetQueryable()
                    .Where(cat =>
                        !cat.IsDeleted &&
                        (cat.TrangThai == "HoatDong" ||
                         cat.TrangThai == "HDH" ||
                         cat.TrangThai == "Active" ||
                         cat.TrangThai == "Hoạt động" ||
                         string.IsNullOrEmpty(cat.TrangThai)))
                    .OrderBy(cat => cat.TenDanhMuc)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching categories: " + ex.Message);
            }

            //var defaultSectorIcons = new[] { "ai", "cloud", "data", "marketing" };
            var nextSectors = categories.Select((cat, i) => new
            {
                id = cat.Id.ToString(),
                title = cat.TenDanhMuc,
                //iconName = defaultSectorIcons[i % defaultSectorIcons.Length],
                subfields = new List<string>(),
                bgLight = "#FFF8F6",
                iconColor = "#8D1313"
            }).ToList();

            // 4. Interested Skills Badges
            var interestedSkills = categories
                .Select(cat => cat.TenDanhMuc)
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .ToList();

            var unregisteredCourses = courses
                .Where(c => !registeredCourseIds.Contains(c.Id))
                .ToList();

            var activeCategoryIds = categories.Select(cat => cat.Id).ToList();
            var courseCategoryLinks = await _danhMucKhoaHocService.GetQueryable()
                .Where(link =>
                    !link.IsDeleted &&
                    activeCategoryIds.Contains(link.IdDanhMuc))
                .ToListAsync();

            var categoryNameById = categories
                .GroupBy(cat => cat.Id)
                .ToDictionary(
                    g => g.Key,
                    g => g.First().TenDanhMuc ?? string.Empty);

            var categoryNamesByCourseId = courseCategoryLinks
                .GroupBy(link => link.IdKhoaHoc)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .Select(link => categoryNameById.TryGetValue(link.IdDanhMuc, out var cn) ? cn : string.Empty)
                        .Where(name => !string.IsNullOrWhiteSpace(name))
                        .Distinct()
                        .ToList());

            // 5. Skills Courses
            var skillCourses = unregisteredCourses.Select((c, i) => new
            {
                id = c.Id.ToString(),
                title = c.TieuDe,
                hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                studentsCount = c.SoLuongHocVien ?? 0,
                level = c.CapDo ?? "Trung cấp",
                diemDanhGiaTrungBinh = ratingMap.TryGetValue(c.Id, out var r1) ? r1.DiemTrungBinh : (double?)null,
                soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var r1b) ? r1b.SoLuong : 0,
                gia = c.Gia,
                giaGoc = c.GiaGoc,
                loaiKhoaHoc = c.LoaiKhoaHoc,
                categoryNames = categoryNamesByCourseId.GetValueOrDefault(c.Id, new List<string>()),
                daDangKy = registeredCourseIds.Contains(c.Id),
                thumbnailGradient = GetGradient(i + 2)
            }).ToList();

            //5.5.Khóa học ưu đãi(chỉ voucher do Admin tạo, còn hiệu lực)
            var promotedCourses = new List<object>();
            try
            {
                var nowVoucher = DateTime.Now;

                var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                var adminIds = adminUsers.Select(u => u.Id).ToList();

                var activeAdminVouchers = await _khuyenMaiService.GetQueryable()
                    .Where(km => km.CreatedId.HasValue
                              && adminIds.Contains(km.CreatedId.Value)
                              && (!km.NgayKetThuc.HasValue || km.NgayKetThuc.Value >= nowVoucher)
                              && (!km.SoLuongHieuLuc.HasValue || km.SoLuongHieuLuc.Value > 0))
                    .Select(km => new { km.Id, km.MaGiamGia, km.PhanTramGiam, km.NgayKetThuc })
                    .ToListAsync();

                var activeVoucherIds = activeAdminVouchers.Select(v => v.Id).ToList();

                if (activeVoucherIds.Any())
                {
                    var links = await _khuyenMaiKhoaHocService.GetQueryable()
                        .Where(l => l.IdKhuyenMai.HasValue && activeVoucherIds.Contains(l.IdKhuyenMai.Value)
                                 && l.IdKhoaHoc.HasValue)
                        .ToListAsync();

                    var voucherByCourseId = links
                        .Where(l => l.IdKhoaHoc.HasValue && l.IdKhuyenMai.HasValue)
                        .GroupBy(l => l.IdKhoaHoc!.Value)
                        .ToDictionary(
                            g => g.Key,
                            g => activeAdminVouchers.FirstOrDefault(v => v.Id == g.First().IdKhuyenMai!.Value)
                        );

                    var promotedCourseIds = voucherByCourseId.Where(kv => kv.Value != null).Select(kv => kv.Key).ToList();

                    var promotedCourseEntities = courses
                        .Where(c => promotedCourseIds.Contains(c.Id) && !registeredCourseIds.Contains(c.Id))
                        .ToList();

                    promotedCourses = promotedCourseEntities.Select((c, i) =>
                    {
                        var voucher = voucherByCourseId[c.Id];
                        return (object)new
                        {
                            id = c.Id.ToString(),
                            title = c.TieuDe,
                            hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                            instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                            tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                            rating = ratingMap.TryGetValue(c.Id, out var rpm) ? rpm.DiemTrungBinh : (double?)null,
                            soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var rpb) ? rpb.SoLuong : 0,
                            studentsCount = c.SoLuongHocVien ?? 0,
                            level = c.CapDo ?? "Trung cấp",
                            gia = c.Gia,
                            giaGoc = c.GiaGoc,
                            loaiKhoaHoc = c.LoaiKhoaHoc,
                            daDangKy = registeredCourseIds.Contains(c.Id),
                            maGiamGia = voucher.MaGiamGia,
                            phanTramGiam = voucher.PhanTramGiam,
                            voucherHetHan = voucher.NgayKetThuc,
                            thumbnailGradient = GetGradient(i)
                        };
                    }).ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching promoted courses: " + ex.Message);
            }


            // 6. Premium Selection
            var premiumCourse = courses.Where(c => !registeredCourseIds.Contains(c.Id)).FirstOrDefault(c => c.CapDo == "Nâng cao") ?? courses.FirstOrDefault();
            var premiumSelection = new
            {
                id = premiumCourse?.Id.ToString(),
                title = premiumCourse?.TieuDe ?? "Thiết kế hệ thống chuyên sâu",
                hinhAnhKhoaHoc = premiumCourse?.HinhAnhKhoaHoc,
                description = premiumCourse?.MoTa ?? "Học cách thiết kế hệ thống có tính sẵn sàng cao, chịu tải hàng triệu người dùng từ các chuyên gia đầu ngành.",
                instructor = premiumCourse != null ? instructorNameByCourseId.GetValueOrDefault(premiumCourse.Id, !string.IsNullOrWhiteSpace(premiumCourse.CreatedBy) ? premiumCourse.CreatedBy : "EduVerse") : "EduVerse",
                tenGiangVien = premiumCourse != null ? instructorNameByCourseId.GetValueOrDefault(premiumCourse.Id, !string.IsNullOrWhiteSpace(premiumCourse.CreatedBy) ? premiumCourse.CreatedBy : "EduVerse") : "EduVerse",
                rating = premiumCourse != null && ratingMap.TryGetValue(premiumCourse.Id, out var rp) ? rp.DiemTrungBinh : (double?)null,
                soLuongDanhGia = premiumCourse != null && ratingMap.TryGetValue(premiumCourse.Id, out var rpb) ? rpb.SoLuong : 0,
                studentsCount = premiumCourse?.SoLuongHocVien ?? 0,
                level = premiumCourse?.CapDo ?? "Nâng cao",
                gia = premiumCourse?.Gia ?? 0,
                giagoc = premiumCourse?.GiaGoc,
                loaiKhoaHoc = premiumCourse?.LoaiKhoaHoc,
                daDangKy = premiumCourse != null && registeredCourseIds.Contains(premiumCourse.Id),
                thumbnailGradient = "linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)",
                relatedCourses = courses.Where(c => !registeredCourseIds.Contains(c.Id)).Take(3).Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    title = c.TieuDe,
                    hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                    instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                    tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                    rating = ratingMap.TryGetValue(c.Id, out var rr) ? rr.DiemTrungBinh : (double?)null,
                    soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var rrb) ? rrb.SoLuong : 0,
                    studentsCount = c.SoLuongHocVien ?? 0,
                    level = c.CapDo ?? "Cơ bản",
                    gia = c.Gia,
                    giagoc = c.GiaGoc,
                    loaiKhoaHoc = c.LoaiKhoaHoc,
                    daDangKy = registeredCourseIds.Contains(c.Id),
                    thumbnailGradient = GetGradient(i + 1)
                }).ToList()
            };

            // 6.5. Featured courses (Các khóa học nổi bật - đánh giá cao nhất)
            var trendingCourses = unregisteredCourses
                .OrderByDescending(c => ratingMap.TryGetValue(c.Id, out var tr) ? tr.DiemTrungBinh : 0)
                .ThenByDescending(c => ratingMap.TryGetValue(c.Id, out var tr) ? tr.SoLuong : 0)
                .ThenByDescending(c => c.SoLuongHocVien ?? 0)
                .Take(12)
                .Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    tieuDe = c.TieuDe,
                    title = c.TieuDe,
                    hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                    instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                    tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                    rating = ratingMap.TryGetValue(c.Id, out var rt) ? rt.DiemTrungBinh : (double?)null,
                    diemDanhGiaTrungBinh = ratingMap.TryGetValue(c.Id, out var rtd) ? rtd.DiemTrungBinh : (double?)null,
                    soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var rtb) ? rtb.SoLuong : 0,
                    studentsCount = c.SoLuongHocVien ?? 0,
                    soLuongHocVien = c.SoLuongHocVien ?? 0,
                    level = c.CapDo ?? "Trung cấp",
                    capDo = c.CapDo ?? "Trung cấp",
                    gia = c.Gia,
                    giaGoc = c.GiaGoc,
                    giagoc = c.GiaGoc,
                    loaiKhoaHoc = c.LoaiKhoaHoc,
                    daDangKy = false,
                    categoryNames = categoryNamesByCourseId.GetValueOrDefault(c.Id, new List<string>()),
                    thumbnailGradient = GetGradient(i)
                }).ToList();

            // 7. History recommendation (Vì bạn đã học...)
            var historyRecommendations = new List<object>();
            var recommendedCourseIdsUsed = new HashSet<Guid>();

            if (registeredCourses.Any())
            {
                var regDateMap = userRegistrations
                    .GroupBy(r => r.IdKhoaHoc)
                    .ToDictionary(g => g.Key, g => g.Max(r => r.CreatedDate));

                var sortedRegisteredCourses = registeredCourses
                    .OrderByDescending(c => regDateMap.GetValueOrDefault(c.Id, DateTime.MinValue))
                    .ToList();

                foreach (var learnedCourse in sortedRegisteredCourses)
                {
                    var learnedCatIds = courseCategoryLinks
                        .Where(l => l.IdKhoaHoc == learnedCourse.Id)
                        .Select(l => l.IdDanhMuc)
                        .Distinct()
                        .ToList();

                    if (!learnedCatIds.Any()) continue;

                    var catNames = learnedCatIds
                        .Where(id => categoryNameById.ContainsKey(id))
                        .Select(id => categoryNameById[id])
                        .ToList();
                    var categoryTitle = catNames.FirstOrDefault() ?? string.Empty;

                    var matchedCourses = courses
                        .Where(c => !registeredCourseIds.Contains(c.Id) &&
                                    !recommendedCourseIdsUsed.Contains(c.Id) &&
                                    courseCategoryLinks.Any(l => l.IdKhoaHoc == c.Id && learnedCatIds.Contains(l.IdDanhMuc)))
                        .Take(10)
                        .ToList();

                    if (matchedCourses.Any())
                    {
                        foreach (var mc in matchedCourses)
                        {
                            recommendedCourseIdsUsed.Add(mc.Id);
                        }

                        historyRecommendations.Add(new
                        {
                            basedOnCourseId = learnedCourse.Id.ToString(),
                            basedOnCourse = learnedCourse.TieuDe,
                            categoryName = categoryTitle,
                            categoryNames = catNames,
                            courses = matchedCourses.Select((c, i) => new
                            {
                                id = c.Id.ToString(),
                                tieuDe = c.TieuDe,
                                title = c.TieuDe,
                                hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                                instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                                tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                                rating = ratingMap.TryGetValue(c.Id, out var rh) ? rh.DiemTrungBinh : (double?)null,
                                diemDanhGiaTrungBinh = ratingMap.TryGetValue(c.Id, out var rhd) ? rhd.DiemTrungBinh : (double?)null,
                                soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var rhb) ? rhb.SoLuong : 0,
                                studentsCount = c.SoLuongHocVien ?? 0,
                                soLuongHocVien = c.SoLuongHocVien ?? 0,
                                level = c.CapDo ?? "Trung cấp",
                                capDo = c.CapDo ?? "Trung cấp",
                                gia = c.Gia,
                                giaGoc = c.GiaGoc,
                                giagoc = c.GiaGoc,
                                loaiKhoaHoc = c.LoaiKhoaHoc,
                                daDangKy = false,
                                categoryNames = categoryNamesByCourseId.GetValueOrDefault(c.Id, new List<string>()),
                                thumbnailGradient = GetGradient(i + 2)
                            }).ToList()
                        });

                        if (historyRecommendations.Count >= 2) break;
                    }
                }
            }

            var primaryHistoryRec = historyRecommendations.FirstOrDefault() ?? (object)new
            {
                basedOnCourse = registeredCourses.FirstOrDefault()?.TieuDe ?? (courses.FirstOrDefault()?.TieuDe ?? "Khóa học nổi bật"),
                categoryName = string.Empty,
                courses = unregisteredCourses.Take(6).Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    tieuDe = c.TieuDe,
                    title = c.TieuDe,
                    hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                    instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                    tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                    rating = ratingMap.TryGetValue(c.Id, out var rh) ? rh.DiemTrungBinh : (double?)null,
                    diemDanhGiaTrungBinh = ratingMap.TryGetValue(c.Id, out var rhd) ? rhd.DiemTrungBinh : (double?)null,
                    soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var rhb) ? rhb.SoLuong : 0,
                    studentsCount = c.SoLuongHocVien ?? 0,
                    soLuongHocVien = c.SoLuongHocVien ?? 0,
                    level = c.CapDo ?? "Trung cấp",
                    capDo = c.CapDo ?? "Trung cấp",
                    gia = c.Gia,
                    giaGoc = c.GiaGoc,
                    giagoc = c.GiaGoc,
                    loaiKhoaHoc = c.LoaiKhoaHoc,
                    daDangKy = false,
                    categoryNames = categoryNamesByCourseId.GetValueOrDefault(c.Id, new List<string>()),
                    thumbnailGradient = GetGradient(i + 3)
                }).ToList()
            };

            // 8. Wishlist recommendations (Vì bạn đã đưa ... vào danh sách mong ước)
            var wishlistRecommendations = new List<object>();
            try
            {
                var userFavorites = await _danhSachYeuThichService.GetQueryable()
                    .Where(yt => yt.IdNguoiDung == loggedInUserId && !yt.IsDeleted && yt.IdKhoaHoc.HasValue)
                    .OrderByDescending(yt => yt.CreatedDate)
                    .ToListAsync();

                var favoriteCourseIds = userFavorites.Select(f => f.IdKhoaHoc!.Value).Distinct().ToList();
                var favoriteCourses = courses.Where(c => favoriteCourseIds.Contains(c.Id)).ToList();

                foreach (var favCourse in favoriteCourses)
                {
                    var favCatIds = courseCategoryLinks
                        .Where(l => l.IdKhoaHoc == favCourse.Id)
                        .Select(l => l.IdDanhMuc)
                        .Distinct()
                        .ToList();

                    if (!favCatIds.Any()) continue;

                    var catNames = favCatIds
                        .Where(id => categoryNameById.ContainsKey(id))
                        .Select(id => categoryNameById[id])
                        .ToList();
                    var categoryTitle = catNames.FirstOrDefault() ?? string.Empty;

                    var matchedCourses = courses
                        .Where(c => c.Id != favCourse.Id &&
                                    !registeredCourseIds.Contains(c.Id) &&
                                    !favoriteCourseIds.Contains(c.Id) &&
                                    !recommendedCourseIdsUsed.Contains(c.Id) &&
                                    courseCategoryLinks.Any(l => l.IdKhoaHoc == c.Id && favCatIds.Contains(l.IdDanhMuc)))
                        .OrderByDescending(c => ratingMap.TryGetValue(c.Id, out var tr) ? tr.DiemTrungBinh : 0)
                        .ThenByDescending(c => ratingMap.TryGetValue(c.Id, out var tr) ? tr.SoLuong : 0)
                        .ThenByDescending(c => c.SoLuongHocVien ?? 0)
                        .Take(10)
                        .ToList();

                    if (matchedCourses.Any())
                    {
                        foreach (var mc in matchedCourses)
                        {
                            recommendedCourseIdsUsed.Add(mc.Id);
                        }

                        wishlistRecommendations.Add(new
                        {
                            basedOnCourseId = favCourse.Id.ToString(),
                            basedOnCourse = favCourse.TieuDe,
                            categoryName = categoryTitle,
                            categoryNames = catNames,
                            courses = matchedCourses.Select((c, i) => new
                            {
                                id = c.Id.ToString(),
                                tieuDe = c.TieuDe,
                                title = c.TieuDe,
                                hinhAnhKhoaHoc = c.HinhAnhKhoaHoc,
                                instructor = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                                tenGiangVien = instructorNameByCourseId.GetValueOrDefault(c.Id, !string.IsNullOrWhiteSpace(c.CreatedBy) ? c.CreatedBy : "EduVerse"),
                                rating = ratingMap.TryGetValue(c.Id, out var rh) ? rh.DiemTrungBinh : (double?)null,
                                diemDanhGiaTrungBinh = ratingMap.TryGetValue(c.Id, out var rhd) ? rhd.DiemTrungBinh : (double?)null,
                                soLuongDanhGia = ratingMap.TryGetValue(c.Id, out var rhb) ? rhb.SoLuong : 0,
                                studentsCount = c.SoLuongHocVien ?? 0,
                                soLuongHocVien = c.SoLuongHocVien ?? 0,
                                level = c.CapDo ?? "Trung cấp",
                                capDo = c.CapDo ?? "Trung cấp",
                                gia = c.Gia,
                                giaGoc = c.GiaGoc,
                                giagoc = c.GiaGoc,
                                loaiKhoaHoc = c.LoaiKhoaHoc,
                                daDangKy = false,
                                categoryNames = categoryNamesByCourseId.GetValueOrDefault(c.Id, new List<string>()),
                                thumbnailGradient = GetGradient(i + 4)
                            }).ToList()
                        });

                        if (wishlistRecommendations.Count >= 2) break;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating wishlist recommendations: " + ex.Message);
            }

            return new DataResponse<object>
            {
                Status = true,
                Message = "Lấy dữ liệu Dashboard thành công",
                Data = new
                {
                    welcomeStats = welcomeStats,
                    continueLearning = continueLearning,
                    nextSectors = nextSectors,
                    interestedSkills = interestedSkills,
                    skillsCourses = skillCourses,
                    trendingCourses = trendingCourses,
                    promotedCourses = promotedCourses,
                    premiumSelection = premiumSelection,
                    historyRecommendation = primaryHistoryRec,
                    historyRecommendations = historyRecommendations,
                    wishlistRecommendations = wishlistRecommendations
                }
            };
        }

        private string GetGradient(int index)
        {
            var gradients = new[]
            {
                "linear-gradient(135deg, #F43F5E 0%, #C084FC 100%)",
                "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
                "linear-gradient(135deg, #6B7280 0%, #374151 100%)",
                "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)"
            };
            return gradients[index % gradients.Length];
        }

        private async Task<Dictionary<Guid, (double DiemTrungBinh, int SoLuong)>> GetRatingMapAsync(List<Guid> courseIds)
        {
            var result = new Dictionary<Guid, (double, int)>();
            if (courseIds == null || !courseIds.Any()) return result;

            try
            {
                var danhGias = await _danhGiaService.GetQueryable()
                    .Where(d => !d.IsDeleted
                             && d.TrangThai == "HienThi"
                             && d.IdKhoaHoc.HasValue
                             && courseIds.Contains(d.IdKhoaHoc.Value))
                    .ToListAsync();

                result = danhGias
                    .GroupBy(d => d.IdKhoaHoc!.Value)
                    .ToDictionary(
                        g => g.Key,
                        g => (Math.Round(g.Average(x => x.SoSao ?? 0), 1), g.Count())
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching ratings: " + ex.Message);
            }

            return result;
        }

        private List<string> GetSubfields(string categoryName)
        {
            if (categoryName.Contains("AI") || categoryName.Contains("Trí tuệ"))
            {
                return new List<string> { "Deep Learning", "LLMs & GenAI", "NLP" };
            }
            if (categoryName.Contains("Cloud") || categoryName.Contains("Đám mây"))
            {
                return new List<string> { "AWS Essentials", "Kubernetes", "DevOps" };
            }
            if (categoryName.Contains("Dữ liệu"))
            {
                return new List<string> { "Data Pipeline", "PowerBI", "SQL Server" };
            }
            return new List<string> { "SEO Strategy", "Social Media", "Facebook Ads" };
        }

        private async Task SeedDataAsync(Guid userId)
        {
            if (await _khoaHocService.AnyAsync(x => x.IsDeleted == false))
            {
                return;
            }

        }

        private async Task<DataResponse<object>> GetInstructorDashboardDataAsync(Guid instructorId)
        {
            AppUser user = null;
            try { user = await _userManager.FindByIdAsync(instructorId.ToString()); }
            catch (Exception ex) { Console.WriteLine("Error finding instructor: " + ex.Message); }
            var fullName = user?.HoTen ?? "Giảng viên";
            var avatarUrl = user?.AnhDaiDien;

            var myMemberships = new List<KhoaHoc_GiangVien>();
            try
            {
                myMemberships = await _khoaHocGiangVienService.GetQueryable()
                    .Where(x => x.IdGiangVien == instructorId && !x.IsDeleted)
                    .ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching instructor memberships: " + ex.Message); }

            var myTyLeByCourseId = myMemberships
                .GroupBy(x => x.IdKhoaHoc)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.TyLeChiaDoanhThu));

            var collabCourseIds = myMemberships.Select(x => x.IdKhoaHoc).Distinct().ToList();

            var myCourses = new List<KhoaHoc>();
            try
            {
                myCourses = await _khoaHocService.GetQueryable()
                    .Where(c => (c.CreatedId == instructorId || collabCourseIds.Contains(c.Id))
                             && c.IsDeleted == false && c.TrangThai != "DaXoa")
                    .ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching instructor courses: " + ex.Message); }
            var myCourseIds = myCourses.Select(c => c.Id).ToList();
            int totalCourses = myCourses.Count;

            var tongTyLeByCourseId = new Dictionary<Guid, int>();
            try
            {
                var allMembershipsOfMyCourses = await _khoaHocGiangVienService.GetQueryable()
                    .Where(x => myCourseIds.Contains(x.IdKhoaHoc) && !x.IsDeleted)
                    .ToListAsync();

                tongTyLeByCourseId = allMembershipsOfMyCourses
                    .GroupBy(x => x.IdKhoaHoc)
                    .ToDictionary(g => g.Key, g => g.Sum(x => x.TyLeChiaDoanhThu));
            }
            catch (Exception ex) { Console.WriteLine("Error fetching all course memberships: " + ex.Message); }

            var allRegs = new List<DangKyKhoaHoc>();
            try
            {
                allRegs = await _dangKyKhoaHocService.GetQueryable().Where(r => r.IsDeleted == false).ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching registrations: " + ex.Message); }
            var myRegs = allRegs.Where(r => r.IdKhoaHoc.HasValue && myCourseIds.Contains(r.IdKhoaHoc.Value)).ToList();

            var myRevenueRecords = new List<DonHang_GiangVien>();

            try
            {
                myRevenueRecords = await _donHangGiangVienService.GetQueryable()
                    .Where(x =>
                        x.IdGiangVien == instructorId &&
                        myCourseIds.Contains(x.IdKhoaHoc) &&
                        !x.IsDeleted)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching instructor revenue records: " + ex.Message);
            }

            double totalRevenue = Math.Round(
                myRevenueRecords.Sum(x => x.SoTienNhan),
                0
            );

            int totalStudents = myRegs.Where(r => r.IdNguoiDangKi.HasValue).Select(r => r.IdNguoiDangKi.Value).Distinct().Count();

            var allProgress = new List<TienDoHocTap>();
            try
            {
                allProgress = await _tienDoHocTapService.GetQueryable().Where(p => p.IsDeleted == false && p.IdDangKi.HasValue).ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching progress: " + ex.Message); }

            var nowDate = DateTime.Now;
            var curMonthStart = new DateTime(nowDate.Year, nowDate.Month, 1);
            var prevMonthStart = curMonthStart.AddMonths(-1);
            int newThisMonth = myRegs.Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= curMonthStart && r.IdNguoiDangKi.HasValue).Select(r => r.IdNguoiDangKi.Value).Distinct().Count();
            int newPrevMonth = myRegs.Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= prevMonthStart && r.ThoiGianDK.Value < curMonthStart && r.IdNguoiDangKi.HasValue).Select(r => r.IdNguoiDangKi.Value).Distinct().Count();
            double studentGrowthPercent = newPrevMonth > 0
                ? Math.Round((double)(newThisMonth - newPrevMonth) / newPrevMonth * 100, 0)
                : (newThisMonth > 0 ? 100 : 0);

            var monthlyEnrollments = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                var mStart = curMonthStart.AddMonths(-i);
                var mEnd = mStart.AddMonths(1);
                int cnt = myRegs
                    .Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= mStart && r.ThoiGianDK.Value < mEnd && r.IdNguoiDangKi.HasValue)
                    .Select(r => r.IdNguoiDangKi!.Value)
                    .Distinct()
                    .Count();
                monthlyEnrollments.Add(new { label = "Tháng " + mStart.Month, value = cnt });
            }

            var monthlyRevenue = new List<object>();

            for (int i = 6; i >= 0; i--)
            {
                var mStart = curMonthStart.AddMonths(-i);
                var mEnd = mStart.AddMonths(1);

                double totalAmount = myRevenueRecords
                    .Where(r =>
                        r.NgayGhiNhan >= mStart &&
                        r.NgayGhiNhan < mEnd)
                    .Sum(r => r.SoTienNhan);

                monthlyRevenue.Add(new
                {
                    label = "Th" + mStart.Month,
                    totalAmount = Math.Round(totalAmount, 0)
                });
            }

            var completionByCourse = new List<object>();
            try
            {
                var regIdToCourse = new Dictionary<Guid, Guid>();
                foreach (var r in myRegs)
                {
                    if (r.IdKhoaHoc.HasValue) regIdToCourse[r.Id] = r.IdKhoaHoc.Value;
                }
                var grouped = allProgress
                    .Where(p => p.IdDangKi.HasValue && regIdToCourse.ContainsKey(p.IdDangKi.Value))
                    .GroupBy(p => regIdToCourse[p.IdDangKi.Value])
                    .Select(g => new
                    {
                        courseId = g.Key,
                        rate = g.Count() > 0 ? (int)Math.Round((double)g.Count(x => x.ThoiGianHoanThanh.HasValue) / g.Count() * 100) : 0
                    })
                    .OrderByDescending(x => x.rate)
                    .Take(4)
                    .ToList();
                foreach (var gc in grouped)
                {
                    var course = myCourses.FirstOrDefault(c => c.Id == gc.courseId);
                    if (course != null) completionByCourse.Add(new { title = course.TieuDe, rate = gc.rate });
                }
            }
            catch (Exception ex) { Console.WriteLine("Error computing completion: " + ex.Message); }

            var recentStudents = new List<object>();
            try
            {
                var sorted = myRegs.Where(r => r.ThoiGianDK.HasValue && r.IdNguoiDangKi.HasValue).OrderByDescending(r => r.ThoiGianDK).Take(6).ToList();
                foreach (var reg in sorted)
                {
                    var student = await _userManager.FindByIdAsync(reg.IdNguoiDangKi.Value.ToString());
                    var course = myCourses.FirstOrDefault(c => c.Id == reg.IdKhoaHoc);
                    var diff = DateTime.Now - (reg.ThoiGianDK ?? DateTime.Now);
                    string timeStr = diff.TotalMinutes < 60 ? ((int)Math.Max(1, diff.TotalMinutes)) + " phút trước"
                        : diff.TotalHours < 24 ? ((int)diff.TotalHours) + " giờ trước"
                        : ((int)diff.TotalDays) + " ngày trước";
                    int totalLec = course?.TongBaiGiang ?? 0;
                    int doneLec = allProgress.Count(pr => pr.IdDangKi == reg.Id && pr.ThoiGianHoanThanh.HasValue);
                    int progress = totalLec > 0 ? (int)Math.Round((double)doneLec / totalLec * 100) : 0;
                    if (progress > 100) progress = 100;
                    recentStudents.Add(new { name = student?.HoTen ?? "Học viên", course = course?.TieuDe ?? "", progress = progress, time = timeStr });
                }
            }
            catch (Exception ex) { Console.WriteLine("Error recent students: " + ex.Message); }

            return new DataResponse<object>
            {
                Status = true,
                Data = new
                {
                    role = "GiaoVien",
                    fullName = fullName,
                    avatarUrl = avatarUrl,
                    totalCourses = totalCourses,
                    totalStudents = totalStudents,
                    totalRevenue = totalRevenue,
                    newStudentsThisMonth = newThisMonth,
                    studentGrowthPercent = studentGrowthPercent,
                    monthlyEnrollments = monthlyEnrollments,
                    monthlyRevenue = monthlyRevenue,
                    completionByCourse = completionByCourse,
                    recentStudents = recentStudents
                }
            };
        }

        private async Task<DataResponse<object>> GetAdminDashboardDataAsync(string? period = null)
        {
            var loggedInUserId = UserId;
            AppUser user = null;
            try
            {
                user = await _userManager.FindByIdAsync(loggedInUserId.ToString());
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error finding admin user: " + ex.Message);
            }
            var fullName = user?.HoTen ?? "Quản trị viên";
            var avatarUrl = user?.AnhDaiDien;

            // 1. Fetch all registrations (active & non-deleted)
            var allRegistrations = new List<DangKyKhoaHoc>();
            try
            {
                allRegistrations = await _dangKyKhoaHocService.GetQueryable()
                    .Where(r => r.IsDeleted == false)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching all registrations: " + ex.Message);
            }

            double totalRevenue = 0;

            try
            {
                // 1. Lấy các đơn hàng đã thanh toán
                var donHangsDaThanhToan = await _donHangService.GetQueryable()
                    .Where(d => !d.IsDeleted && d.TrangThai == 1)
                    .ToListAsync();

                var donHangIds = donHangsDaThanhToan
                    .Select(d => d.Id)
                    .ToList();

                // 2. Lấy chi tiết đơn hàng
                var chiTiets = await _donHangChiTietService.GetQueryable()
                    .Where(ct =>
                        !ct.IsDeleted &&
                        ct.IdDonHang.HasValue &&
                        donHangIds.Contains(ct.IdDonHang.Value))
                    .ToListAsync();

                // 3. Lấy khuyến mãi của các đơn hàng
                var vouchers = await _donHangKhuyenMaiService.GetQueryable()
                    .Where(km =>
                        !km.IsDeleted &&
                        km.IdDonHang.HasValue &&
                        donHangIds.Contains(km.IdDonHang.Value))
                    .ToListAsync();

                var giamTheoDonHang = vouchers
                    .GroupBy(km => km.IdDonHang!.Value)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(x => x.SoTienGiam ?? 0)
                    );

                // 4. Tính doanh thu thực nhận của hệ thống
                // Lưu ý: ở đây tính TỔNG cho cả đơn hàng (không tách theo từng khóa học),
                // nên gộp SoTienGiam theo IdDonHang là ĐÚNG — không phải bug (khác với hàm
                // của giảng viên, nơi cần tách giảm giá theo từng khóa học cụ thể).
                foreach (var dh in donHangsDaThanhToan)
                {
                    var chiTietDonHang = chiTiets
                        .Where(ct => ct.IdDonHang == dh.Id)
                        .ToList();

                    var tongTienTruocGiam = chiTietDonHang
                        .Sum(ct => ct.GiaLucDat ?? 0);

                    var tienGiam = giamTheoDonHang
                        .GetValueOrDefault(dh.Id, 0);

                    var tienThucThu = Math.Max(
                        0,
                        tongTienTruocGiam - tienGiam
                    );

                    // 70% dành cho giảng viên
                    var phanGiangVien = tienThucThu * 0.7;

                    // 30% hệ thống
                    var phanHeThong = tienThucThu * 0.3;

                    totalRevenue += phanHeThong;
                }

                totalRevenue = Math.Round(totalRevenue, 0);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating total revenue: " + ex.Message);
            }

            // 2. Fetch total students (users count)
            int totalStudents = 0;
            try
            {
                totalStudents = await _userManager.Users.Where(u => !u.IsDeleted).CountAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error counting students: " + ex.Message);
            }

            // 3. Fetch total courses
            int totalCourses = 0;
            try
            {
                totalCourses = await _khoaHocService.GetQueryable()
                    .Where(c => c.IsDeleted == false)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error counting courses: " + ex.Message);
            }

            // 4. Fetch completion rate (average progress)
            var progressRecords = new List<TienDoHocTap>();
            try
            {
                progressRecords = await _tienDoHocTapService.GetQueryable()
                    .Where(p => p.IsDeleted == false)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching progress records: " + ex.Message);
            }

            double completionRate = progressRecords.Any()
                ? Math.Round(progressRecords.Average(p => p.ThoiGianXem ?? 0), 1)
                : 0;
            if (completionRate > 100) completionRate = 100;

            // 5. Revenue Trend theo khoảng thời gian: month | quarter | year (mặc định year)
            var nowDt = DateTime.Now;
            var periodKey = (period ?? "year").Trim().ToLowerInvariant();
            if (periodKey != "month" && periodKey != "quarter") periodKey = "year";

            var revenueTrendList = new List<double>();
            var revenueLabels = new List<string>();
            try
            {
                DateTime tuNgay, denNgay;
                if (periodKey == "month")
                {
                    tuNgay = new DateTime(nowDt.Year, nowDt.Month, 1);
                    denNgay = tuNgay.AddMonths(1);
                }
                else if (periodKey == "quarter")
                {
                    int thangDauQuy = ((nowDt.Month - 1) / 3) * 3 + 1;
                    tuNgay = new DateTime(nowDt.Year, thangDauQuy, 1);
                    denNgay = tuNgay.AddMonths(3);
                }
                else
                {
                    tuNgay = new DateTime(nowDt.Year, 1, 1);
                    denNgay = tuNgay.AddYears(1);
                }

                var donHangsDaThanhToan = await _donHangService.GetQueryable()
                    .Where(d => !d.IsDeleted
                             && d.TrangThai == 1
                             && d.NgayTao.HasValue
                             && d.NgayTao.Value >= tuNgay
                             && d.NgayTao.Value < denNgay)
                    .ToListAsync();

                if (periodKey == "month")
                {
                    int soNgay = DateTime.DaysInMonth(nowDt.Year, nowDt.Month);
                    for (int ngay = 1; ngay <= soNgay; ngay++)
                    {
                        var donHangNgay = donHangsDaThanhToan
                        .Where(d => d.NgayTao!.Value.Day == ngay)
                        .ToList();

                        var doanhThuHeThong = await TinhDoanhThuHeThongAsync(donHangNgay);

                        revenueTrendList.Add(doanhThuHeThong);
                        revenueLabels.Add(ngay.ToString());
                    }
                }
                else if (periodKey == "quarter")
                {
                    for (int i = 0; i < 3; i++)
                    {
                        var thang = tuNgay.AddMonths(i);
                        var donHangThang = donHangsDaThanhToan
                        .Where(d => d.NgayTao!.Value.Year == thang.Year
                                 && d.NgayTao!.Value.Month == thang.Month)
                        .ToList();

                        var doanhThuHeThong = await TinhDoanhThuHeThongAsync(donHangThang);

                        revenueTrendList.Add(doanhThuHeThong);
                        revenueLabels.Add("Th" + thang.Month);
                    }
                }
                else
                {
                    for (int m = 1; m <= 12; m++)
                    {
                        var donHangThang = donHangsDaThanhToan
                            .Where(d => d.NgayTao!.Value.Month == m)
                            .ToList();

                        var doanhThuHeThong = await TinhDoanhThuHeThongAsync(donHangThang);

                        revenueTrendList.Add(doanhThuHeThong);
                        revenueLabels.Add("Th" + m);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating revenue trend: " + ex.Message);
            }

            // Bảo đảm biểu đồ luôn có tối thiểu 2 điểm để vẽ được đường
            while (revenueTrendList.Count < 2) { revenueTrendList.Add(0); revenueLabels.Add(""); }
            var revenueTrend = revenueTrendList.ToArray();


            // 6. Student Growth (last 7 months)
            var studentGrowth = new int[7];
            try
            {
                for (int i = 0; i < 7; i++)
                {
                    var targetMonth = DateTime.Now.AddMonths(-(6 - i));

                    // Đếm số học viên UNIQUE đăng ký khóa học trong tháng đó
                    studentGrowth[i] = allRegistrations
                        .Where(r => r.ThoiGianDK.HasValue
                                 && r.ThoiGianDK.Value.Year == targetMonth.Year
                                 && r.ThoiGianDK.Value.Month == targetMonth.Month
                                 && r.IdNguoiDangKi.HasValue)
                        .Select(r => r.IdNguoiDangKi!.Value)
                        .Distinct()
                        .Count();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating student growth: " + ex.Message);
            }

            // (Bỏ dữ liệu giả: dùng số liệu thật kể cả khi bằng 0)

            // 7. Fetch courses list (dùng chung cho Best Selling, Recent Activities, Course trend...)
            var courses = new List<KhoaHoc>();
            try
            {
                courses = await _khoaHocService.GetQueryable().Where(c => c.IsDeleted == false).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching courses list: " + ex.Message);
            }

            // 7.1 Best Selling Courses — Top 3 khóa học TRẢ PHÍ có doanh thu (phần admin thực nhận) cao nhất
            var bestSellingCourses = new List<object>();
            try
            {
                var paidCourseIds = courses.Where(c => (c.Gia ?? 0) > 0).Select(c => c.Id).ToHashSet();

                if (paidCourseIds.Any())
                {
                    var donHangsDaTT_BSC = await _donHangService.GetQueryable()
                        .Where(d => !d.IsDeleted && d.TrangThai == 1)
                        .ToListAsync();
                    var donHangIds_BSC = donHangsDaTT_BSC.Select(d => d.Id).ToList();

                    var chiTietAll_BSC = await _donHangChiTietService.GetQueryable()
                        .Where(ct => !ct.IsDeleted && ct.IdDonHang.HasValue && donHangIds_BSC.Contains(ct.IdDonHang.Value))
                        .ToListAsync();

                    var voucherAll_BSC = await _donHangKhuyenMaiService.GetQueryable()
                        .Where(km => !km.IsDeleted && km.IdDonHang.HasValue && donHangIds_BSC.Contains(km.IdDonHang.Value))
                        .ToListAsync();

                    var giamTheoDonHangVaKhoaHoc = voucherAll_BSC
                        .Where(km => km.IdKhoaHocDuocGiam.HasValue)
                        .GroupBy(km => (km.IdDonHang!.Value, km.IdKhoaHocDuocGiam!.Value))
                        .ToDictionary(g => g.Key, g => g.Sum(x => x.SoTienGiam ?? 0));

                    var purchaseCountByCourse = new Dictionary<Guid, int>();
                    var revenueByCourse = new Dictionary<Guid, double>();

                    // Đếm SỐ LƯỢT MUA = số dòng chi tiết trong các đơn hàng đã thanh toán thành công, theo từng khóa học trả phí
                    foreach (var ct in chiTietAll_BSC)
                    {
                        if (!ct.IdKhoaHoc.HasValue || !paidCourseIds.Contains(ct.IdKhoaHoc.Value)) continue;
                        if (!ct.IdDonHang.HasValue) continue;

                        purchaseCountByCourse[ct.IdKhoaHoc.Value] =
                            purchaseCountByCourse.GetValueOrDefault(ct.IdKhoaHoc.Value, 0) + 1;

                        var giaDong = ct.GiaLucDat ?? 0;
                        var giamDung = giamTheoDonHangVaKhoaHoc
                            .GetValueOrDefault((ct.IdDonHang.Value, ct.IdKhoaHoc.Value), 0);  // giảm giá đúng khóa này, không ước lượng
                        var thucThuDong = Math.Max(0, giaDong - giamDung);
                        var adminNhanDuoc = thucThuDong * 0.3;

                        revenueByCourse[ct.IdKhoaHoc.Value] =
                            revenueByCourse.GetValueOrDefault(ct.IdKhoaHoc.Value, 0) + adminNhanDuoc;
                    }

                    bestSellingCourses = purchaseCountByCourse
                        .Select(kv => new
                        {
                            PurchaseCount = kv.Value,
                            Revenue = revenueByCourse.GetValueOrDefault(kv.Key, 0),
                            Course = courses.FirstOrDefault(c => c.Id == kv.Key)
                        })
                        .Where(x => x.Course != null)
                        .OrderByDescending(x => x.PurchaseCount)
                        .ThenByDescending(x => x.Revenue)
                        .Take(3)
                        .Select(x => (object)new
                        {
                            title = x.Course!.TieuDe,
                            purchaseCount = x.PurchaseCount,
                            revenue = Math.Round(x.Revenue, 0)
                        })
                        .ToList();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error computing best selling courses: " + ex.Message);
            }

            // (Bỏ dữ liệu giả: danh sách khóa học bán chạy lấy từ đăng ký thật)

            // 8. Heatmap Activity Grid (140 days)
            var heatmap = new List<int>();
            var activityCounts = new Dictionary<DateTime, int>();
            foreach (var r in allRegistrations.Where(r => r.ThoiGianDK.HasValue))
            {
                var dateKey = r.ThoiGianDK.Value.Date;
                activityCounts[dateKey] = activityCounts.GetValueOrDefault(dateKey) + 1;
            }
            var today = DateTime.Today;
            for (int i = 0; i < 140; i++)
            {
                var date = today.AddDays(-(139 - i));
                heatmap.Add(activityCounts.GetValueOrDefault(date, 0));
            }

            // (Bỏ dữ liệu ngẫu nhiên giả: heatmap dùng hoạt động đăng ký thật)

            // 9. Recent Online Activities
            var recentActivities = new List<object>();
            try
            {
                var sortedRegs = allRegistrations
                    .Where(r => r.ThoiGianDK.HasValue)
                    .OrderByDescending(r => r.ThoiGianDK)
                    .Take(5)
                    .ToList();

                foreach (var reg in sortedRegs)
                {
                    var studentUser = await _userManager.FindByIdAsync(reg.IdNguoiDangKi.ToString());
                    var course = courses.FirstOrDefault(c => c.Id == reg.IdKhoaHoc);
                    if (studentUser != null && course != null)
                    {
                        var diff = DateTime.Now - (reg.ThoiGianDK ?? DateTime.Now);
                        string timeStr = diff.TotalMinutes < 60 ? $"{(int)Math.Max(1, diff.TotalMinutes)} phút trước"
                            : diff.TotalHours < 24 ? $"{(int)diff.TotalHours} giờ trước"
                            : $"{(int)diff.TotalDays} ngày trước";

                        recentActivities.Add(new
                        {
                            type = "registration",
                            title = $"{studentUser.HoTen ?? "Học viên"} vừa đăng ký {course.TieuDe}",
                            time = timeStr,
                            subtitle = "Thanh toán thành công"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating recent activities: " + ex.Message);
            }

            // (Bỏ dữ liệu giả: hoạt động gần đây lấy từ đăng ký thật)

            // ===== Xu hướng THẬT: tháng hiện tại so với tháng trước (không dùng số cứng) =====
            var nowDate = DateTime.Now;
            var curMonthStart = new DateTime(nowDate.Year, nowDate.Month, 1);
            var prevMonthStart = curMonthStart.AddMonths(-1);

            double revThisMonth = 0;
            double revPrevMonth = 0;

            try
            {
                var donHangThangNay = await _donHangService.GetQueryable()
                    .Where(d => !d.IsDeleted
                             && d.TrangThai == 1
                             && d.NgayTao >= curMonthStart)
                    .ToListAsync();

                var donHangThangTruoc = await _donHangService.GetQueryable()
                    .Where(d => !d.IsDeleted
                             && d.TrangThai == 1
                             && d.NgayTao >= prevMonthStart
                             && d.NgayTao < curMonthStart)
                    .ToListAsync();

                // ===== Tháng này =====
                var idsThis = donHangThangNay.Select(d => d.Id).ToList();


                revThisMonth = await TinhDoanhThuHeThongAsync(donHangThangNay);

                // ===== Tháng trước =====
                var idsPrev = donHangThangTruoc.Select(d => d.Id).ToList();


                revPrevMonth = await TinhDoanhThuHeThongAsync(donHangThangTruoc);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating revenue trend percent: " + ex.Message);
            }

            int stuThisMonth = 0, stuPrevMonth = 0;
            try
            {
                stuThisMonth = await _userManager.Users.CountAsync(u => !u.IsDeleted && u.CreatedDate >= curMonthStart);
                stuPrevMonth = await _userManager.Users.CountAsync(u => !u.IsDeleted && u.CreatedDate >= prevMonthStart && u.CreatedDate < curMonthStart);
            }
            catch (Exception ex) { Console.WriteLine("Error trend students: " + ex.Message); }

            int crsThisMonth = courses.Count(c => c.NgayTao.HasValue && c.NgayTao.Value >= curMonthStart);
            int crsPrevMonth = courses.Count(c => c.NgayTao.HasValue && c.NgayTao.Value >= prevMonthStart && c.NgayTao.Value < curMonthStart);

            double revenueTrendPct = revPrevMonth > 0 ? Math.Round((revThisMonth - revPrevMonth) / revPrevMonth * 100, 1) : (revThisMonth > 0 ? 100 : 0);
            double studentsTrendPct = stuPrevMonth > 0 ? Math.Round((double)(stuThisMonth - stuPrevMonth) / stuPrevMonth * 100, 1) : (stuThisMonth > 0 ? 100 : 0);
            double coursesTrendPct = crsPrevMonth > 0 ? Math.Round((double)(crsThisMonth - crsPrevMonth) / crsPrevMonth * 100, 1) : (crsThisMonth > 0 ? 100 : 0);
            double completionTrendPct = 0; // completionRate là snapshot trung bình, không có mốc so sánh theo tháng

            return new DataResponse<object>
            {
                Status = true,
                Message = "Lấy dữ liệu Admin Dashboard thành công",
                Data = new
                {
                    isAdmin = true,
                    welcomeStats = new
                    {
                        userName = fullName,
                        avatarUrl = avatarUrl,
                        subtitle = "Chào mừng bạn đến với trang quản trị hệ thống.",
                        totalCourses = totalCourses,
                        totalRevenue = totalRevenue,
                        totalStudents = totalStudents,
                        completionRate = completionRate,
                        revenueTrendPct = revenueTrendPct,
                        studentsTrendPct = studentsTrendPct,
                        coursesTrendPct = coursesTrendPct,
                        completionTrendPct = completionTrendPct
                    },
                    revenueTrend = revenueTrend,
                    revenueLabels = revenueLabels,
                    revenuePeriod = periodKey,
                    studentGrowth = studentGrowth,
                    bestSellingCourses = bestSellingCourses,
                    heatmap = heatmap,
                    recentActivities = recentActivities
                }
            };
        }

        private async Task<double> TinhDoanhThuHeThongAsync(
    List<DonHang> donHangs)
        {
            if (!donHangs.Any())
                return 0;

            var donHangIds = donHangs
                .Select(d => d.Id)
                .ToList();

            var chiTiets = await _donHangChiTietService.GetQueryable()
                .Where(ct =>
                    !ct.IsDeleted &&
                    ct.IdDonHang.HasValue &&
                    donHangIds.Contains(ct.IdDonHang.Value))
                .ToListAsync();

            var vouchers = await _donHangKhuyenMaiService.GetQueryable()
                .Where(km =>
                    !km.IsDeleted &&
                    km.IdDonHang.HasValue &&
                    donHangIds.Contains(km.IdDonHang.Value))
                .ToListAsync();

            var giamTheoDonHang = vouchers
                .GroupBy(km => km.IdDonHang!.Value)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(x => x.SoTienGiam ?? 0)
                );

            double doanhThuHeThong = 0;

            foreach (var dh in donHangs)
            {
                var chiTiet = chiTiets
                    .Where(ct => ct.IdDonHang == dh.Id)
                    .ToList();

                var tongGia = chiTiet
                    .Sum(ct => ct.GiaLucDat ?? 0);

                var giamGia = giamTheoDonHang
                    .GetValueOrDefault(dh.Id, 0);

                var tienThucThu = Math.Max(
                    0,
                    tongGia - giamGia
                );

                doanhThuHeThong += tienThucThu * 0.3;
            }

            return Math.Round(doanhThuHeThong, 0);
        }
    }
}
