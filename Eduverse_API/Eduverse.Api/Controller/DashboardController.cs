using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

            // Seed data if DB is empty of courses
            await SeedDataAsync(loggedInUserId.Value);

            // Fetch user info
            var user = await _userManager.FindByIdAsync(loggedInUserId.ToString());
            var fullName = user?.HoTen ?? "Học viên EduVerse";
            var avatarUrl = user?.AnhDaiDien;

            // Fetch user's registered courses
            var userRegistrations = await _dangKyKhoaHocService.GetQueryable()
                .Where(r => r.IdNguoiDangKi == loggedInUserId.Value && r.IsDeleted == false)
                .ToListAsync();

            var registeredCourseIds = userRegistrations.Select(r => r.IdDangKi).ToList();

            // Fetch actual courses information
            var courses = await _khoaHocService.GetQueryable()
                .Where(c => c.IsDeleted == false)
                .ToListAsync();

            var registeredCourses = courses.Where(c => registeredCourseIds.Contains(c.Id)).ToList();

            // Calculate progress for each registration
            var registrationIds = userRegistrations.Select(r => r.Id).ToList();
            var progressRecords = await _tienDoHocTapService.GetQueryable()
                .Where(p => registrationIds.Contains(p.IdDangKi ?? Guid.Empty))
                .ToListAsync();

            // Calculate statistics
            int totalCourses = registeredCourses.Count;
            double avgProgress = 0;
            var progressList = new List<double>();

            foreach (var reg in userRegistrations)
            {
                var course = courses.FirstOrDefault(c => c.Id == reg.IdDangKi);
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

            var certificates = await _chungChiService.GetQueryable()
                .Where(c => registeredCourseIds.Contains(c.IdKhoaHoc ?? Guid.Empty) && c.IsDeleted == false)
                .ToListAsync();
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
                var course = courses.FirstOrDefault(c => c.Id == reg.IdDangKi);
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
                        contentType = "Video bài giảng",
                        duration = "Còn " + (course.TongThoiLuong.HasValue ? Math.Max(1, course.TongThoiLuong.Value / 60) : 2) + " giờ học",
                        progress = (int)progressVal,
                        thumbnailGradient = GetGradient(idx++)
                    });
                }
            }

            var continueLearning = new
            {
                courses = continueCourses,
                paths = new List<object>
                {
                    new
                    {
                        id = "path-1",
                        title = "Lộ trình Trở thành Kỹ sư AI",
                        contentType = "Lộ trình học tập",
                        duration = "Còn 4 khóa học",
                        progress = 30,
                        thumbnailGradient = "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)"
                    }
                },
                certificates = certificates.Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    title = c.TenChungChi,
                    contentType = "Chứng chỉ hoàn thành",
                    duration = "Đã cấp: " + (c.NgayCap.HasValue ? c.NgayCap.Value.ToString("dd/MM/yyyy") : "Gần đây"),
                    progress = 100,
                    thumbnailGradient = GetGradient(i + 4)
                }).ToList(),
                assessments = new List<object>
                {
                    new
                    {
                        id = "assess-1",
                        title = "Đánh giá năng lực Backend Developer",
                        contentType = "Bài thi thực hành",
                        duration = "Còn 1 bài thi",
                        progress = 0,
                        thumbnailGradient = "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                    }
                }
            };

            // 3. Next Sectors
            var categories = await _danhMucService.GetQueryable()
                .Where(d => d.IsDeleted == false)
                .Take(4)
                .ToListAsync();

            var defaultSectorIcons = new[] { "ai", "cloud", "data", "marketing" };
            var nextSectors = categories.Select((cat, i) => new
            {
                id = cat.Id.ToString(),
                title = cat.TenDanhMuc,
                iconName = defaultSectorIcons[i % defaultSectorIcons.Length],
                subfields = GetSubfields(cat.TenDanhMuc),
                bgLight = "#FFF8F6",
                iconColor = "#8D1313"
            }).ToList();

            // 4. Interested Skills Badges
            var interestedSkills = new List<string> { "AI", "Cloud", "Design", "Data Science", "Marketing" };

            // 5. Skills Courses
            var skillCourses = courses.Select((c, i) => new
            {
                id = c.Id.ToString(),
                title = c.TieuDe,
                instructor = "Giảng viên EduVerse",
                rating = 4.8,
                studentsCount = c.SoLuongHocVien ?? 1500,
                level = c.CapDo ?? "Trung cấp",
                thumbnailGradient = GetGradient(i + 2)
            }).ToList();

            // 6. Premium Selection
            var premiumCourse = courses.FirstOrDefault(c => c.CapDo == "Nâng cao") ?? courses.FirstOrDefault();
            var premiumSelection = new
            {
                title = premiumCourse?.TieuDe ?? "Thiết kế hệ thống chuyên sâu",
                description = premiumCourse?.MoTa ?? "Học cách thiết kế hệ thống có tính sẵn sàng cao, chịu tải hàng triệu người dùng từ các chuyên gia đầu ngành.",
                instructor = "TS. Nguyễn Văn B",
                rating = 4.9,
                studentsCount = premiumCourse?.SoLuongHocVien ?? 2500,
                level = premiumCourse?.CapDo ?? "Nâng cao",
                thumbnailGradient = "linear-gradient(135deg, #8B1E3F 0%, #7C3AED 100%)",
                relatedCourses = courses.Take(3).Select((c, i) => new
                {
                    id = c.Id.ToString(),
                    title = c.TieuDe,
                    instructor = "Giảng viên EduVerse",
                    rating = 4.7,
                    studentsCount = c.SoLuongHocVien ?? 1000,
                    level = c.CapDo ?? "Cơ bản",
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
                    instructor = "Giảng viên chuyên nghiệp",
                    rating = 4.8,
                    studentsCount = c.SoLuongHocVien ?? 1800,
                    level = c.CapDo ?? "Trung cấp",
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

            // Seed categories (DanhMuc)
            var categories = new List<DanhMuc>
            {
                new DanhMuc { Id = Guid.NewGuid(), TenDanhMuc = "Trí tuệ Nhân tạo (AI)", TrangThai = "Active", NgayTao = DateTime.Now },
                new DanhMuc { Id = Guid.NewGuid(), TenDanhMuc = "Điện toán Đám mây", TrangThai = "Active", NgayTao = DateTime.Now },
                new DanhMuc { Id = Guid.NewGuid(), TenDanhMuc = "Khoa học Dữ liệu", TrangThai = "Active", NgayTao = DateTime.Now },
                new DanhMuc { Id = Guid.NewGuid(), TenDanhMuc = "Marketing Kỹ thuật số", TrangThai = "Active", NgayTao = DateTime.Now }
            };
            foreach (var cat in categories)
            {
                await _danhMucService.CreateAsync(cat);
            }

            // Seed courses (KhoaHoc)
            var courses = new List<KhoaHoc>
            {
                new KhoaHoc
                {
                    Id = Guid.Parse("c1111111-1111-1111-1111-111111111111"),
                    TieuDe = "HTML & CSS Nâng Cao",
                    MoTa = "Khóa học HTML & CSS nâng cao giúp xây dựng giao diện web chuyên nghiệp, tối ưu hóa CSS và responsive.",
                    Gia = 499000,
                    GiaGoc = 999000,
                    LoaiKhoaHoc = "Web Development",
                    CapDo = "Trung cấp",
                    TongThoiLuong = 120,
                    TongBaiGiang = 15,
                    SoLuongHocVien = 1540,
                    TrangThai = "Active",
                    NgayTao = DateTime.Now
                },
                new KhoaHoc
                {
                    Id = Guid.Parse("c2222222-2222-2222-2222-222222222222"),
                    TieuDe = "Lập trình Javascript Thực Chiến",
                    MoTa = "Lập trình Javascript thực chiến với các dự án thực tế, từ cơ bản đến nâng cao.",
                    Gia = 799000,
                    GiaGoc = 1499000,
                    LoaiKhoaHoc = "Web Development",
                    CapDo = "Trung cấp",
                    TongThoiLuong = 240,
                    TongBaiGiang = 25,
                    SoLuongHocVien = 2890,
                    TrangThai = "Active",
                    NgayTao = DateTime.Now
                },
                new KhoaHoc
                {
                    Id = Guid.Parse("c3333333-3333-3333-3333-333333333333"),
                    TieuDe = "Thiết kế hệ thống với Microservices",
                    MoTa = "Thiết kế hệ thống Microservices quy mô lớn sử dụng .NET Core, Docker, Ocelot API Gateway.",
                    Gia = 1299000,
                    GiaGoc = 2499000,
                    LoaiKhoaHoc = "System Design",
                    CapDo = "Nâng cao",
                    TongThoiLuong = 480,
                    TongBaiGiang = 40,
                    SoLuongHocVien = 1200,
                    TrangThai = "Active",
                    NgayTao = DateTime.Now
                },
                new KhoaHoc
                {
                    Id = Guid.Parse("c4444444-4444-4444-4444-444444444444"),
                    TieuDe = "Nhập môn Machine Learning & Python",
                    MoTa = "Khóa học nền tảng về Machine Learning sử dụng Python, Scikit-Learn và Pandas.",
                    Gia = 899000,
                    GiaGoc = 1799000,
                    LoaiKhoaHoc = "AI & Machine Learning",
                    CapDo = "Cơ bản",
                    TongThoiLuong = 360,
                    TongBaiGiang = 30,
                    SoLuongHocVien = 3200,
                    TrangThai = "Active",
                    NgayTao = DateTime.Now
                },
                new KhoaHoc
                {
                    Id = Guid.Parse("c5555555-5555-5555-5555-555555555555"),
                    TieuDe = "Xây dựng Chatbot AI với LLMs",
                    MoTa = "Ứng dụng LangChain, OpenAI API để xây dựng hệ thống Chatbot thông minh.",
                    Gia = 1499000,
                    GiaGoc = 2999000,
                    LoaiKhoaHoc = "AI & Machine Learning",
                    CapDo = "Nâng cao",
                    TongThoiLuong = 200,
                    TongBaiGiang = 18,
                    SoLuongHocVien = 850,
                    TrangThai = "Active",
                    NgayTao = DateTime.Now
                },
                new KhoaHoc
                {
                    Id = Guid.Parse("c6666666-6666-6666-6666-666666666666"),
                    TieuDe = "AWS Cloud Practitioner Essentials",
                    MoTa = "Khóa học luyện thi chứng chỉ AWS Cloud Practitioner bản cập nhật mới nhất.",
                    Gia = 599000,
                    GiaGoc = 1199000,
                    LoaiKhoaHoc = "Cloud Computing",
                    CapDo = "Cơ bản",
                    TongThoiLuong = 180,
                    TongBaiGiang = 22,
                    SoLuongHocVien = 4500,
                    TrangThai = "Active",
                    NgayTao = DateTime.Now
                }
            };
            foreach (var course in courses)
            {
                await _khoaHocService.CreateAsync(course);
            }

            // Seed user registrations (DangKyKhoaHoc)
            var registrations = new List<DangKyKhoaHoc>
            {
                new DangKyKhoaHoc { Id = Guid.NewGuid(), IdNguoiDangKi = userId, IdDangKi = courses[0].Id, TrangThai = "Active", ThoiGianDK = DateTime.Now.AddDays(-15), GiaDangKy = courses[0].Gia },
                new DangKyKhoaHoc { Id = Guid.NewGuid(), IdNguoiDangKi = userId, IdDangKi = courses[1].Id, TrangThai = "Active", ThoiGianDK = DateTime.Now.AddDays(-10), GiaDangKy = courses[1].Gia },
                new DangKyKhoaHoc { Id = Guid.NewGuid(), IdNguoiDangKi = userId, IdDangKi = courses[2].Id, TrangThai = "Active", ThoiGianDK = DateTime.Now.AddDays(-5), GiaDangKy = courses[2].Gia }
            };
            foreach (var reg in registrations)
            {
                await _dangKyKhoaHocService.CreateAsync(reg);
            }

            // Seed TienDoHocTap for those registrations
            var progressRecords = new List<TienDoHocTap>
            {
                new TienDoHocTap { Id = Guid.NewGuid(), IdDangKi = registrations[0].Id, ThoiGianXem = 70, LanCuoiXem = DateTime.Now, TrangThai = "Learning" },
                new TienDoHocTap { Id = Guid.NewGuid(), IdDangKi = registrations[1].Id, ThoiGianXem = 40, LanCuoiXem = DateTime.Now, TrangThai = "Learning" },
                new TienDoHocTap { Id = Guid.NewGuid(), IdDangKi = registrations[2].Id, ThoiGianXem = 15, LanCuoiXem = DateTime.Now, TrangThai = "Learning" }
            };
            foreach (var prog in progressRecords)
            {
                await _tienDoHocTapService.CreateAsync(prog);
            }

            // Seed some certificates (ChungChi)
            var certificate = new ChungChi
            {
                Id = Guid.NewGuid(),
                IdKhoaHoc = courses[0].Id,
                IdDangKi = registrations[0].Id,
                TenChungChi = "Chứng chỉ HTML & CSS Nâng Cao",
                MaSoChungChi = "CERT-HTMLCSS-2026",
                URL_ChungChi = "#",
                NgayCap = DateTime.Now.AddDays(-1),
                TrangThai = "Completed",
                DiemTongKet = 9.5,
                TongThoiGianHoc = 120,
                NgayTao = DateTime.Now
            };
            await _chungChiService.CreateAsync(certificate);

            await _khoaHocService.SaveAsync();
        }
    }
}
