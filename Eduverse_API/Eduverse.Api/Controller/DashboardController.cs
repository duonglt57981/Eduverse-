using CloudinaryDotNet;
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

        public DashboardController(
            IService<KhoaHoc> khoaHocService,
            IService<DanhMuc> danhMucService,
            IService<DangKyKhoaHoc> dangKyKhoaHocService,
            IService<TienDoHocTap> tienDoHocTapService,
            IService<ChungChi> chungChiService,
            IService<BaiKiemTra> baiKiemTraService,
            IService<DanhMuc_KhoaHoc> danhMucKhoaHocService,
            UserManager<AppUser> userManager)
        {
            _khoaHocService = khoaHocService;
            _danhMucService = danhMucService;
            _dangKyKhoaHocService = dangKyKhoaHocService;
            _tienDoHocTapService = tienDoHocTapService;
            _chungChiService = chungChiService;
            _baiKiemTraService = baiKiemTraService;
            _danhMucKhoaHocService = danhMucKhoaHocService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<DataResponse<object>> GetDashboardData([FromQuery] string? role)
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
                            return await GetAdminDashboardDataAsync();
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
                            return await GetAdminDashboardDataAsync();
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
                            c.TrangThai == "HoatDong")
                        .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching courses: " + ex.Message);
            }

            var registeredCourses = courses.Where(c => registeredCourseIds.Contains(c.Id)).ToList();

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
                        title = course.TieuDe,
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

            var categoryNameById = categories.ToDictionary(
                cat => cat.Id,
                cat => cat.TenDanhMuc ?? string.Empty);
            var categoryNamesByCourseId = courseCategoryLinks
                .GroupBy(link => link.IdKhoaHoc)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .Select(link => categoryNameById[link.IdDanhMuc])
                        .Where(name => !string.IsNullOrWhiteSpace(name))
                        .Distinct()
                        .ToList());

            // 5. Skills Courses
            var skillCourses = unregisteredCourses.Select((c, i) => new
            {
                id = c.Id.ToString(),
                title = c.TieuDe,
                instructor = c.CreatedBy,
                studentsCount = c.SoLuongHocVien ?? 0,
                level = c.CapDo ?? "Trung cấp",

                gia = c.Gia,
                giaGoc = c.GiaGoc,
                categoryNames = categoryNamesByCourseId.GetValueOrDefault(c.Id, new List<string>()),

                daDangKy = registeredCourseIds.Contains(c.Id),
                thumbnailGradient = GetGradient(i + 2)
            }).ToList();


            // 6. Premium Selection
            var premiumCourse = courses.Where(c => !registeredCourseIds.Contains(c.Id)).FirstOrDefault(c => c.CapDo == "Nâng cao") ?? courses.FirstOrDefault();
            var premiumSelection = new
            {
                title = premiumCourse?.TieuDe ?? "Thiết kế hệ thống chuyên sâu",
                description = premiumCourse?.MoTa ?? "Học cách thiết kế hệ thống có tính sẵn sàng cao, chịu tải hàng triệu người dùng từ các chuyên gia đầu ngành.",
                instructor = premiumCourse?.CreatedBy?? "An Danh",
                rating = 0, // KhoaHoc chưa có hệ thống đánh giá
                studentsCount = premiumCourse?.SoLuongHocVien ?? 0,
                level = premiumCourse?.CapDo ?? "Nâng cao",
                gia = premiumCourse.Gia,
                giagoc = premiumCourse.GiaGoc,
                daDangKy = premiumCourse != null && registeredCourseIds.Contains(premiumCourse.Id),
                thumbnailGradient = "linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)",
                relatedCourses = courses.Where(c => !registeredCourseIds.Contains(c.Id)).Take(3).Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    title = c.TieuDe,
                    instructor = premiumCourse?.CreatedBy ?? "An Danh",
                    rating = 0, // KhoaHoc chưa có hệ thống đánh giá
                    studentsCount = c.SoLuongHocVien ?? 0,
                    level = c.CapDo ?? "Cơ bản",
                    gia = c.Gia,
                    giagoc = c.GiaGoc,
                    daDangKy = registeredCourseIds.Contains(c.Id),
                    thumbnailGradient = GetGradient(i + 1)
                }).ToList()
            };

            // 7. History recommendation
            var historyRecommendation = new
            {
                basedOnCourse = registeredCourses.FirstOrDefault()?.TieuDe ?? "HTML & CSS Nâng Cao",
                courses = courses.Where(c => !registeredCourseIds.Contains(c.Id)).Take(3).Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    title = c.TieuDe,
                    instructor = premiumCourse?.CreatedBy ?? "An Danh",
                    rating = 0, // KhoaHoc chưa có hệ thống đánh giá
                    studentsCount = c.SoLuongHocVien ?? 0,
                    level = c.CapDo ?? "Trung cấp",
                    gia = c.Gia,
                    giagoc = c.GiaGoc,
                    daDangKy = registeredCourseIds.Contains(c.Id),
                    thumbnailGradient = GetGradient(i + 3)
                }).ToList()
            };
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
                    premiumSelection = premiumSelection,
                    historyRecommendation = historyRecommendation
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

        // ===== Dashboard cho GIẢNG VIÊN (dữ liệu thật, không dữ liệu giả) =====
        private async Task<DataResponse<object>> GetInstructorDashboardDataAsync(Guid instructorId)
        {
            AppUser user = null;
            try { user = await _userManager.FindByIdAsync(instructorId.ToString()); }
            catch (Exception ex) { Console.WriteLine("Error finding instructor: " + ex.Message); }
            var fullName = user?.HoTen ?? "Giảng viên";
            var avatarUrl = user?.AnhDaiDien;

            // Khóa học của giảng viên (CreatedId == instructorId)
            var myCourses = new List<KhoaHoc>();
            try
            {
                myCourses = await _khoaHocService.GetQueryable()
                    .Where(c => c.CreatedId == instructorId && c.IsDeleted == false && c.TrangThai != "DaXoa")
                    .ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching instructor courses: " + ex.Message); }
            var myCourseIds = myCourses.Select(c => c.Id).ToList();
            int totalCourses = myCourses.Count;

            // Đăng ký vào các khóa của giảng viên (lọc trong bộ nhớ cho an toàn)
            var allRegs = new List<DangKyKhoaHoc>();
            try
            {
                allRegs = await _dangKyKhoaHocService.GetQueryable().Where(r => r.IsDeleted == false).ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching registrations: " + ex.Message); }
            var myRegs = allRegs.Where(r => r.IdKhoaHoc.HasValue && myCourseIds.Contains(r.IdKhoaHoc.Value)).ToList();

            int totalStudents = myRegs.Where(r => r.IdNguoiDangKi.HasValue).Select(r => r.IdNguoiDangKi.Value).Distinct().Count();
            double totalRevenue = myRegs.Sum(r => r.GiaDangKy ?? 0);

            // Tiến độ học tập của các đăng ký (dùng cho tỷ lệ hoàn thành + tiến độ học viên)
            var allProgress = new List<TienDoHocTap>();
            try
            {
                allProgress = await _tienDoHocTapService.GetQueryable().Where(p => p.IsDeleted == false && p.IdDangKi.HasValue).ToListAsync();
            }
            catch (Exception ex) { Console.WriteLine("Error fetching progress: " + ex.Message); }

            // Tăng trưởng học viên: tháng này so với tháng trước
            var nowDate = DateTime.Now;
            var curMonthStart = new DateTime(nowDate.Year, nowDate.Month, 1);
            var prevMonthStart = curMonthStart.AddMonths(-1);
            int newThisMonth = myRegs.Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= curMonthStart && r.IdNguoiDangKi.HasValue).Select(r => r.IdNguoiDangKi.Value).Distinct().Count();
            int newPrevMonth = myRegs.Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= prevMonthStart && r.ThoiGianDK.Value < curMonthStart && r.IdNguoiDangKi.HasValue).Select(r => r.IdNguoiDangKi.Value).Distinct().Count();
            double studentGrowthPercent = newPrevMonth > 0
                ? Math.Round((double)(newThisMonth - newPrevMonth) / newPrevMonth * 100, 0)
                : (newThisMonth > 0 ? 100 : 0);

            // Học viên mới theo 7 tháng gần nhất
            var monthlyEnrollments = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                var mStart = curMonthStart.AddMonths(-i);
                var mEnd = mStart.AddMonths(1);
                int cnt = myRegs.Count(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= mStart && r.ThoiGianDK.Value < mEnd);
                monthlyEnrollments.Add(new { label = "Tháng " + mStart.Month, value = cnt });
            }

            // Tỷ lệ hoàn thành theo khóa (từ TienDoHocTap)
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

            // Học viên mới nhất
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
                    completionByCourse = completionByCourse,
                    recentStudents = recentStudents
                }
            };
        }

        private async Task<DataResponse<object>> GetAdminDashboardDataAsync()
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

            double totalRevenue = allRegistrations.Sum(r => r.GiaDangKy ?? 0);

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

            // 5. Revenue Trend (12 Months of the current year)
            var currentYear = DateTime.Now.Year;
            var revenueTrend = new double[12];
            for (int m = 1; m <= 12; m++)
            {
                revenueTrend[m - 1] = allRegistrations
                    .Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value.Year == currentYear && r.ThoiGianDK.Value.Month == m)
                    .Sum(r => r.GiaDangKy ?? 0);
            }


            // 6. Student Growth (last 7 months)
            var studentGrowth = new int[7];
            try
            {
                var allUsers = await _userManager.Users.Where(u => !u.IsDeleted).ToListAsync();
                for (int i = 0; i < 7; i++)
                {
                    var targetMonth = DateTime.Now.AddMonths(-(6 - i));
                    studentGrowth[i] = allUsers.Count(u => u.CreatedDate.Year == targetMonth.Year && u.CreatedDate.Month == targetMonth.Month);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error calculating student growth: " + ex.Message);
            }

            // (Bỏ dữ liệu giả: dùng số liệu thật kể cả khi bằng 0)

            // 7. Best Selling Courses
            var courses = new List<KhoaHoc>();
            try
            {
                courses = await _khoaHocService.GetQueryable().Where(c => c.IsDeleted == false).ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching courses list: " + ex.Message);
            }

            var bestSellingCourses = new List<object>();
            try
            {
                var courseRegs = allRegistrations
                    .GroupBy(r => r.IdKhoaHoc)
                    .Select(g => new { CourseId = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .ToList();

                int totalRegs = allRegistrations.Count;
                foreach (var item in courseRegs.Take(3))
                {
                    var course = courses.FirstOrDefault(c => c.Id == item.CourseId);
                    if (course != null)
                    {
                        int percent = totalRegs > 0 ? (int)Math.Round((double)item.Count / totalRegs * 100) : 0;
                        bestSellingCourses.Add(new
                        {
                            title = course.TieuDe,
                            percentage = percent
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error grouping course registrations: " + ex.Message);
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

            double revThisMonth = allRegistrations.Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= curMonthStart).Sum(r => r.GiaDangKy ?? 0);
            double revPrevMonth = allRegistrations.Where(r => r.ThoiGianDK.HasValue && r.ThoiGianDK.Value >= prevMonthStart && r.ThoiGianDK.Value < curMonthStart).Sum(r => r.GiaDangKy ?? 0);

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
                    studentGrowth = studentGrowth,
                    bestSellingCourses = bestSellingCourses,
                    heatmap = heatmap,
                    recentActivities = recentActivities
                }
            };
        }
    }
}
