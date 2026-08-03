using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Service.Common;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.EmailService;
using System.ComponentModel.DataAnnotations;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class InstructorRequestController : EduverseController
    {
        private readonly IService<InstructorRequest> _requestService;
        private readonly UserManager<AppUser> _userManager;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IEmailService _emailService;
        private readonly IService<ThongBao> _thongBaoService;

        public InstructorRequestController(
            IService<InstructorRequest> requestService,
            UserManager<AppUser> userManager,
            ICloudinaryService cloudinaryService,
            IEmailService emailService,
            IService<ThongBao> thongBaoService)
        {
            _requestService = requestService;
            _userManager = userManager;
            _cloudinaryService = cloudinaryService;
            _emailService = emailService;
            _thongBaoService = thongBaoService;
        }

        // ══════════════════════════════════════════════
        // 1. POST /api/profile/upgrade-request
        // ══════════════════════════════════════════════
        [HttpPost("profile/upgrade-request")]
        public async Task<DataResponse<object>> SubmitUpgradeRequest([FromForm] UpgradeRequestDto dto)
        {
            var loggedInUserId = UserId;
            if (loggedInUserId == null)
            {
                return new DataResponse<object> { Status = false, Message = "Không tìm thấy người dùng đăng nhập" };
            }

            var user = await _userManager.FindByIdAsync(loggedInUserId.ToString());
            if (user == null)
            {
                return new DataResponse<object> { Status = false, Message = "Người dùng không tồn tại" };
            }

            // Check if user is already GiaoVien or Admin
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Contains("GiaoVien") || roles.Contains("Admin"))
            {
                return new DataResponse<object> { Status = false, Message = "Tài khoản của bạn đã là Giảng viên hoặc Quản trị viên" };
            }

            // Check if there is already a pending request
            var pendingExists = await _requestService.AnyAsync(r => r.AppUserId == loggedInUserId.Value && r.Status == 0 && r.IsDeleted == false);
            if (pendingExists)
            {
                return new DataResponse<object> { Status = false, Message = "Bạn đã gửi yêu cầu nâng cấp và đang chờ xét duyệt" };
            }

            if (dto.CvFile == null || dto.CvFile.Length == 0)
            {
                return new DataResponse<object> { Status = false, Message = "Vui lòng chọn file tài liệu CV" };
            }

            if (dto.CvFile.Length > 10 * 1024 * 1024)
            {
                return new DataResponse<object> { Status = false, Message = "File tối đa 10MB" };
            }

            // Upload CV to Cloudinary
            var uploadResult = await _cloudinaryService.UploadDocumentAsync(dto.CvFile);
            if (uploadResult == null || string.IsNullOrEmpty(uploadResult.UrlDoc))
            {
                return new DataResponse<object> { Status = false, Message = "Lỗi khi tải file CV lên máy chủ Cloudinary" };
            }

            var newRequest = new InstructorRequest
            {
                AppUserId = loggedInUserId.Value,
                ChuyenMon = dto.ChuyenMon,
                KinhNghiem = dto.KinhNghiem,
                BangCap = dto.BangCap,
                LyDo = dto.LyDo,
                CvUrl = uploadResult.UrlDoc,
                Status = 0
            };

            await _requestService.CreateAsync(newRequest);
            await _requestService.SaveAsync();

            // Create notification for Admin
            var adminThongBao = new ThongBao
            {
                TieuDe = "Yêu cầu nâng cấp Giảng viên mới",
                NoiDung = $"Học viên {user.HoTen ?? user.UserName} đã gửi yêu cầu nâng cấp lên giảng viên.",
                DaDoc = false,
                ThoiGianTao = DateTime.Now,
                TrangThai = "MoiNhan",
                LoaiThongBao = "YeuCauNangCapGiangVien",
                IdNguoiDung = null // null means send to Admin
            };
            await _thongBaoService.CreateAsync(adminThongBao);
            await _thongBaoService.SaveAsync();

            // Send confirmation email
            try
            {
                string subject = "[EduVerse] Xác nhận nhận yêu cầu đăng ký trở thành giảng viên";
                string body = $@"
                    <h3>Xin chào {user.HoTen ?? user.UserName},</h3>
                    <p>EduVerse đã nhận được hồ sơ đăng ký trở thành Giảng viên của bạn.</p>
                    <p><strong>Thông tin đăng ký:</strong></p>
                    <ul>
                        <li><strong>Chuyên môn:</strong> {dto.ChuyenMon}</li>
                        <li><strong>Kinh nghiệm:</strong> {dto.KinhNghiem}</li>
                        <li><strong>Bằng cấp:</strong> {dto.BangCap}</li>
                    </ul>
                    <p>Đội ngũ kiểm duyệt EduVerse đang xem xét hồ sơ của bạn và sẽ phản hồi kết quả trong vòng 24h làm việc.</p>
                    <p>Trân trọng,<br/>Đội ngũ hỗ trợ EduVerse</p>";

                await _emailService.SendAsync(user.Email!, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending confirmation email: " + ex.Message);
            }

            return new DataResponse<object>
            {
                Status = true,
                Message = "Gửi yêu cầu nâng cấp Giảng viên thành công!"
            };
        }

        // ══════════════════════════════════════════════
        // 2. GET /api/profile/upgrade-request
        // ══════════════════════════════════════════════
        [HttpGet("profile/upgrade-request")]
        public async Task<DataResponse<object>> GetLatestUpgradeRequest()
        {
            var loggedInUserId = UserId;
            if (loggedInUserId == null)
            {
                return new DataResponse<object> { Status = false, Message = "Không tìm thấy người dùng đăng nhập" };
            }

            var latestRequest = await _requestService.GetQueryable()
                .Where(r => r.AppUserId == loggedInUserId.Value && r.IsDeleted == false)
                .OrderByDescending(r => r.CreatedDate)
                .FirstOrDefaultAsync();

            if (latestRequest == null)
            {
                return new DataResponse<object> { Status = true, Data = null };
            }

            return new DataResponse<object>
            {
                Status = true,
                Data = new
                {
                    id = latestRequest.Id,
                    chuyenMon = latestRequest.ChuyenMon,
                    kinhNghiem = latestRequest.KinhNghiem,
                    bangCap = latestRequest.BangCap,
                    cvUrl = latestRequest.CvUrl,
                    lyDo = latestRequest.LyDo,
                    status = latestRequest.Status,
                    adminNotes = latestRequest.AdminNotes,
                    createdDate = latestRequest.CreatedDate
                }
            };
        }

        // ══════════════════════════════════════════════
        // 3. GET /api/admin/instructor-requests
        // ══════════════════════════════════════════════
        [HttpGet("admin/instructor-requests")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<object>> GetAllRequests()
        {
            var list = await _requestService.GetQueryable()
                .Include(r => r.AppUser)
                .Where(r => r.IsDeleted == false)
                .OrderByDescending(r => r.CreatedDate)
                .Select(r => new
                {
                    id = r.Id,
                    appUserId = r.AppUserId,
                    userName = r.AppUser != null ? r.AppUser.UserName : string.Empty,
                    hoTen = r.AppUser != null ? r.AppUser.HoTen : string.Empty,
                    email = r.AppUser != null ? r.AppUser.Email : string.Empty,
                    phoneNumber = r.AppUser != null ? r.AppUser.PhoneNumber : string.Empty,
                    chuyenMon = r.ChuyenMon,
                    kinhNghiem = r.KinhNghiem,
                    bangCap = r.BangCap,
                    cvUrl = r.CvUrl,
                    lyDo = r.LyDo,
                    status = r.Status,
                    adminNotes = r.AdminNotes,
                    createdDate = r.CreatedDate
                })
                .ToListAsync();

            return new DataResponse<object>
            {
                Status = true,
                Message = "Lấy danh sách yêu cầu thành công",
                Data = list
            };
        }

        // ══════════════════════════════════════════════
        // 3b. GET /api/admin/instructor-requests/{id}/cv
        // Phát tệp CV qua chính máy chủ thay vì để trình duyệt gọi thẳng
        // Cloudinary. Có ba lý do:
        //   - Cloudinary phát tệp raw kèm Content-Type octet-stream nên trình
        //     duyệt tải về thay vì mở, và chặn phát PDF ở một số cấu hình.
        //   - Đặt đúng Content-Type + inline thì xem được ngay trong trang.
        //   - Hồ sơ CV là dữ liệu cá nhân, đi qua đây thì chỉ quản trị viên
        //     đăng nhập mới đọc được, không còn ai có đường dẫn cũng xem được.
        // ══════════════════════════════════════════════
        [HttpGet("admin/instructor-requests/{id}/cv")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCvFile(Guid id)
        {
            var request = await _requestService.GetByIdAsync(id);
            if (request == null || string.IsNullOrWhiteSpace(request.CvUrl))
                return NotFound(new { status = false, message = "Không tìm thấy hồ sơ CV" });

            try
            {
                using var client = new System.Net.Http.HttpClient
                {
                    Timeout = TimeSpan.FromSeconds(30)
                };
                var response = await client.GetAsync(request.CvUrl);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(502, new
                    {
                        status = false,
                        message = $"Máy chủ lưu trữ trả về mã {(int)response.StatusCode} khi tải CV"
                    });
                }

                var bytes = await response.Content.ReadAsByteArrayAsync();
                var duoi = System.IO.Path.GetExtension(
                    request.CvUrl.Split('?')[0].Split('#')[0]).ToLowerInvariant();

                var contentType = duoi switch
                {
                    ".pdf" => "application/pdf",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".doc" => "application/msword",
                    _ => "application/octet-stream"
                };

                // inline = mở ngay trong trình duyệt, không ép tải về
                Response.Headers["Content-Disposition"] =
                    $"inline; filename=\"CV_{id}{duoi}\"";

                return File(bytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(502, new
                {
                    status = false,
                    message = "Không tải được tệp CV từ máy chủ lưu trữ: " + ex.Message
                });
            }
        }

        // ══════════════════════════════════════════════
        // 4. POST /api/admin/instructor-requests/{id}/approve
        // ══════════════════════════════════════════════
        [HttpPost("admin/instructor-requests/{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<object>> ApproveRequest(Guid id)
        {
            var request = await _requestService.GetByIdAsync(id);
            if (request == null || request.IsDeleted)
            {
                return new DataResponse<object> { Status = false, Message = "Yêu cầu không tồn tại" };
            }

            if (request.Status != 0)
            {
                return new DataResponse<object> { Status = false, Message = "Yêu cầu này đã được xử lý" };
            }

            var user = await _userManager.FindByIdAsync(request.AppUserId.ToString());
            if (user == null)
            {
                return new DataResponse<object> { Status = false, Message = "Người dùng yêu cầu không tồn tại" };
            }

            // Update user roles
            var userRoles = await _userManager.GetRolesAsync(user);
            if (userRoles.Contains("HocVien"))
            {
                await _userManager.RemoveFromRoleAsync(user, "HocVien");
            }
            if (!userRoles.Contains("GiaoVien"))
            {
                await _userManager.AddToRoleAsync(user, "GiaoVien");
            }

            // Update ChucVu to Giảng viên
            user.ChucVu = "Giảng viên EduVerse";
            await _userManager.UpdateAsync(user);

            // Update request status
            request.Status = 1; // Approved
            request.AdminNotes = "Yêu cầu nâng cấp của bạn đã được phê duyệt. Vui lòng đăng nhập lại để cập nhật quyền.";
            await _requestService.UpdateAsync(request);
            await _requestService.SaveAsync();

            // Send notification email to the user
            try
            {
                string subject = "[EduVerse] Chúc mừng! Yêu cầu đăng ký giảng viên đã được phê duyệt";
                string body = $@"
                    <h3>Xin chào {user.HoTen ?? user.UserName},</h3>
                    <p>Chúng tôi vô cùng vui mừng thông báo hồ sơ đăng ký trở thành Giảng viên của bạn đã được ban quản trị EduVerse phê duyệt.</p>
                    <p>Quyền giảng viên đã được kích hoạt cho tài khoản của bạn. Vui lòng <strong>đăng xuất và đăng nhập lại</strong> để cập nhật quyền truy cập và khám phá bảng quản trị giảng viên chuyên nghiệp dành riêng cho bạn.</p>
                    <p>Chúc bạn có những trải nghiệm giảng dạy tuyệt vời cùng EduVerse!</p>
                    <p>Trân trọng,<br/>Đội ngũ hỗ trợ EduVerse</p>";

                await _emailService.SendAsync(user.Email!, subject, body);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending approval email: " + ex.Message);
            }

            return new DataResponse<object>
            {
                Status = true,
                Message = "Đã phê duyệt yêu cầu nâng cấp Giảng viên thành công!"
            };
        }

        // ══════════════════════════════════════════════
        // 5. POST /api/admin/instructor-requests/{id}/reject
        // ══════════════════════════════════════════════
        [HttpPost("admin/instructor-requests/{id}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<DataResponse<object>> RejectRequest(Guid id, [FromBody] RejectRequestDto dto)
        {
            var request = await _requestService.GetByIdAsync(id);
            if (request == null || request.IsDeleted)
            {
                return new DataResponse<object> { Status = false, Message = "Yêu cầu không tồn tại" };
            }

            if (request.Status != 0)
            {
                return new DataResponse<object> { Status = false, Message = "Yêu cầu này đã được xử lý" };
            }

            request.Status = 2; // Rejected
            request.AdminNotes = dto?.AdminNotes ?? "Yêu cầu nâng cấp của bạn đã bị từ chối.";
            await _requestService.UpdateAsync(request);
            await _requestService.SaveAsync();

            // Send notification email to the user
            try
            {
                var user = await _userManager.FindByIdAsync(request.AppUserId.ToString());
                if (user != null)
                {
                    string subject = "[EduVerse] Thông báo kết quả yêu cầu đăng ký giảng viên";
                    string body = $@"
                        <h3>Xin chào {user.HoTen ?? user.UserName},</h3>
                        <p>Cảm ơn bạn đã quan tâm và gửi hồ sơ đăng ký trở thành Giảng viên tại EduVerse.</p>
                        <p>Rất tiếc, sau khi xem xét kỹ lưỡng hồ sơ của bạn, chúng tôi chưa thể phê duyệt yêu cầu của bạn tại thời điểm này.</p>
                        <p><strong>Lý do từ chối / Phản hồi từ Admin:</strong> {request.AdminNotes}</p>
                        <p>Bạn có thể điều chỉnh thông tin bổ sung và gửi lại yêu cầu xét duyệt mới trên hệ thống bất cứ lúc nào.</p>
                        <p>Trân trọng,<br/>Đội ngũ hỗ trợ EduVerse</p>";

                    await _emailService.SendAsync(user.Email!, subject, body);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending rejection email: " + ex.Message);
            }

            return new DataResponse<object>
            {
                Status = true,
                Message = "Đã từ chối yêu cầu thành công!"
            };
        }
    }

    public class UpgradeRequestDto
    {
        [Required]
        public string ChuyenMon { get; set; } = string.Empty;

        [Required]
        public string KinhNghiem { get; set; } = string.Empty;

        [Required]
        public string BangCap { get; set; } = string.Empty;

        [Required]
        public string LyDo { get; set; } = string.Empty;

        [Required]
        public IFormFile CvFile { get; set; }
    }

    public class RejectRequestDto
    {
        public string? AdminNotes { get; set; }
    }
}
