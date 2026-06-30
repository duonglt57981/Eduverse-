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
        private readonly UserManager<AppUser> _userManager;

        public DashboardController(
            IService<KhoaHoc> khoaHocService,
            IService<DanhMuc> danhMucService,
            IService<DangKyKhoaHoc> dangKyKhoaHocService,
            IService<TienDoHocTap> tienDoHocTapService,
            IService<ChungChi> chungChiService,
            IService<BaiKiemTra> baiKiemTraService,
            UserManager<AppUser> userManager)
        {
            _khoaHocService = khoaHocService;
            _danhMucService = danhMucService;
            _dangKyKhoaHocService = dangKyKhoaHocService;
            _tienDoHocTapService = tienDoHocTapService;
            _chungChiService = chungChiService;
            _baiKiemTraService = baiKiemTraService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<DataResponse<object>> GetDashboardData()
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
                    if (roles.Contains("Admin"))
                    {
                        return await GetAdminDashboardDataAsync();
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
                courses = await _khoaHocService.GetQueryable()
                    .Where(c => c.IsDeleted == false)
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

            if (!continueCourses.Any())
            {
                continueCourses.Add(new
                {
                    id = "c-fallback-1",
                    title = "WEB2064 - Lập trình Javascript nâng cao",
                    subtitle = "8. Async Javascript: Promises & Callbacks",
                    contentType = "Bài viết",
                    duration = "1 phút học",
                    progress = 70,
                    thumbnailGradient = "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)"
                });
                continueCourses.Add(new
                {
                    id = "c-fallback-2",
                    title = "Vue JS 3 For Modern Web Development...",
                    subtitle = "13. Setting up Vue JS",
                    contentType = "Bài giảng",
                    duration = "7 phút học",
                    progress = 45,
                    thumbnailGradient = "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                });
                continueCourses.Add(new
                {
                    id = "c-fallback-3",
                    title = "Software Engineering 101: Plan and Execute...",
                    subtitle = "2. Your Turn: Architecture",
                    contentType = "Bài tập",
                    duration = "15 phút học",
                    progress = 90,
                    thumbnailGradient = "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)"
                });
            }

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

            if (!certList.Any())
            {
                certList.Add(new
                {
                    id = "cert-fallback-1",
                    title = "ISTQB® Certified Tester Foundation Level (CTFL)",
                    subtitle = "Brightest",
                    contentType = "Luyện thi chứng chỉ",
                    duration = "Hoàn thành",
                    progress = 100,
                    thumbnailGradient = "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)"
                });
            }

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
                    .Take(4)
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
                subfields = GetSubfields(cat.TenDanhMuc),
                bgLight = "#FFF8F6",
                iconColor = "#8D1313"
            }).ToList();

            // 4. Interested Skills Badges
            var interestedSkills = new List<string> { "AI", "Python", "ReactJS", "SQL Server", "AWS", "UI/UX" };

            var unregisteredCourses = courses
                .Where(c => !registeredCourseIds.Contains(c.Id))
                .ToList();


            // 5. Skills Courses
            var skillCourses = unregisteredCourses.Select((c, i) => new
            {
                id = c.Id.ToString(),
                title = c.TieuDe,
                instructor = c.CreatedBy,
                studentsCount = c.SoLuongHocVien ?? 1500,
                level = c.CapDo ?? "Trung cấp",

                gia = c.Gia,
                giaGoc = c.GiaGoc,

                thumbnailGradient = GetGradient(i + 2)
            }).ToList();


            // 6. Premium Selection
            var premiumCourse = courses.FirstOrDefault(c => c.CapDo == "Nâng cao") ?? courses.FirstOrDefault();
            var premiumSelection = new
            {
                title = premiumCourse?.TieuDe ?? "Thiết kế hệ thống chuyên sâu",
                description = premiumCourse?.MoTa ?? "Học cách thiết kế hệ thống có tính sẵn sàng cao, chịu tải hàng triệu người dùng từ các chuyên gia đầu ngành.",
                instructor = premiumCourse?.CreatedBy?? "An Danh",
                rating = 4.9,
                studentsCount = premiumCourse?.SoLuongHocVien ?? 2500,
                level = premiumCourse?.CapDo ?? "Nâng cao",
                gia = premiumCourse.Gia,
                giagoc = premiumCourse.GiaGoc,
                thumbnailGradient = "linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)",
                relatedCourses = courses.Take(3).Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    title = c.TieuDe,
                    instructor = premiumCourse?.CreatedBy ?? "An Danh",
                    rating = 4.7,
                    studentsCount = c.SoLuongHocVien ?? 1000,
                    level = c.CapDo ?? "Cơ bản",
                    gia = c.Gia,
                    giagoc = c.GiaGoc,
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
                    rating = 4.8,
                    studentsCount = c.SoLuongHocVien ?? 1800,
                    level = c.CapDo ?? "Trung cấp",
                    gia = c.Gia,
                    giagoc = c.GiaGoc,
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
            int totalStudents = 12450;
            try
            {
                totalStudents = await _userManager.Users.Where(u => !u.IsDeleted).CountAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error counting students: " + ex.Message);
            }

            // 3. Fetch total courses
            int totalCourses = 6;
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
                : 78.4;
            if (completionRate > 100) completionRate = 100;
            if (completionRate <= 0) completionRate = 78.4;

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

            // Fallback for student growth if all 0
            if (studentGrowth.All(c => c == 0))
            {
                studentGrowth = new int[] { 3400, 4800, 3900, 6200, 8100, 7200, 9500 };
                totalStudents = 12450;
            }

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

            if (!bestSellingCourses.Any())
            {
                bestSellingCourses.Add(new { title = "UI/UX Design Masterclass", percentage = 92 });
                bestSellingCourses.Add(new { title = "Web Development Bootcamp", percentage = 78 });
                bestSellingCourses.Add(new { title = "Data Science Fundamentals", percentage = 64 });
            }

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

            if (heatmap.All(c => c == 0))
            {
                var rand = new Random();
                for (int i = 0; i < 140; i++)
                {
                    heatmap.Add(rand.Next(0, 5));
                }
            }

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

            if (!recentActivities.Any())
            {
                recentActivities.Add(new { type = "registration", title = "Lê Văn A vừa đăng ký React Native 2024", time = "2 phút trước", subtitle = "Thanh toán thành công" });
                recentActivities.Add(new { type = "quiz", title = "Nguyễn Thị B vừa hoàn thành bài thi cuối khóa", time = "15 phút trước", subtitle = "Điểm số: 9.5/10" });
                recentActivities.Add(new { type = "premium", title = "Trần Minh C đã gia hạn gói Premium", time = "45 phút trước", subtitle = "+2.500.000đ" });
            }

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
                        completionRate = completionRate
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
