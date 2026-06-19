using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api/learning-paths")]
    [Authorize]
    public class LearningPathController : EduverseController
    {
        public LearningPathController()
        {
        }

        [HttpGet]
        public DataResponse<object> GetLearningPaths()
        {
            var paths = new List<object>
            {
                // IT Paths
                new
                {
                    id = "lp-1",
                    title = "Poly - WEB1013 - Xây dựng trang web - SU2026",
                    author = "Tạ Thị Hồng Trâm",
                    category = "Công nghệ thông tin",
                    duration = "15 giờ 47 phút",
                    enrolledCount = 107,
                    isCompanyPath = true
                },
                new
                {
                    id = "lp-2",
                    title = "Poly - DAT110 - Trực quan dữ liệu nâng cao_SU2026",
                    author = "Ngọc Quang Lê",
                    category = "Công nghệ thông tin",
                    duration = "28 giờ 43 phút",
                    enrolledCount = 15,
                    isCompanyPath = true
                },
                new
                {
                    id = "lp-3",
                    title = "Poly - SOA102 - Hệ quản trị nội dung_SU2026",
                    author = "Tạ Thị Hồng Trâm",
                    category = "Công nghệ thông tin",
                    duration = "20 giờ 30 phút",
                    enrolledCount = 45,
                    isCompanyPath = true
                },
                new
                {
                    id = "lp-4",
                    title = "Poly - MOB1014 - Lập trình Android cơ bản - SP2026",
                    author = "Nguyễn Văn C",
                    category = "Công nghệ thông tin",
                    duration = "35 giờ 15 phút",
                    enrolledCount = 89,
                    isCompanyPath = false
                },
                // Hospitality
                new
                {
                    id = "lp-5",
                    title = "Poly - HRM201 - Quản lý nhân sự khách sạn chuyên nghiệp",
                    author = "Lê Thị Hồng",
                    category = "Du lịch, nhà hàng và khách sạn",
                    duration = "18 giờ 20 phút",
                    enrolledCount = 34,
                    isCompanyPath = true
                },
                // Electronics
                new
                {
                    id = "lp-6",
                    title = "Poly - EEE101 - Thiết kế mạch điện tử cơ bản",
                    author = "Hoàng Văn Nam",
                    category = "Điện tử và cơ khí",
                    duration = "24 giờ 0 phút",
                    enrolledCount = 52,
                    isCompanyPath = false
                },
                // Business / Management
                new
                {
                    id = "lp-7",
                    title = "Poly - MGT101 - Quản trị học đại cương",
                    author = "Nguyễn Thị Thảo",
                    category = "Quản trị kinh doanh",
                    duration = "12 giờ 30 phút",
                    enrolledCount = 120,
                    isCompanyPath = true
                },
                new
                {
                    id = "lp-8",
                    title = "Poly - MKT102 - Tiếp thị liên kết & SEO nâng cao",
                    author = "Lê Văn Hùng",
                    category = "Quản trị kinh doanh",
                    duration = "22 giờ 10 phút",
                    enrolledCount = 210,
                    isCompanyPath = false
                }
            };

            return new DataResponse<object>
            {
                Status = true,
                Message = "Lấy danh sách lộ trình thành công",
                Data = paths
            };
        }
    }
}
