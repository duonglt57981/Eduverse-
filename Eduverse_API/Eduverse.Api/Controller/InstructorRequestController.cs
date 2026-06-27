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

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class InstructorRequestController : EduverseController
    {
        private readonly IService<InstructorRequest> _requestService;
        private readonly UserManager<AppUser> _userManager;

        public InstructorRequestController(
            IService<InstructorRequest> requestService,
            UserManager<AppUser> userManager)
        {
            _requestService = requestService;
            _userManager = userManager;
        }

        // ══════════════════════════════════════════════
        // 1. POST /api/profile/upgrade-request
        // ══════════════════════════════════════════════
        [HttpPost("profile/upgrade-request")]
        public async Task<DataResponse<object>> SubmitUpgradeRequest([FromBody] UpgradeRequestDto dto)
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

            var newRequest = new InstructorRequest
            {
                AppUserId = loggedInUserId.Value,
                ChuyenMon = dto.ChuyenMon,
                KinhNghiem = dto.KinhNghiem,
                LyDo = dto.LyDo,
                Status = 0
            };

            await _requestService.CreateAsync(newRequest);
            await _requestService.SaveAsync();

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

            return new DataResponse<object>
            {
                Status = true,
                Message = "Đã từ chối yêu cầu thành công!"
            };
        }
    }

    public class UpgradeRequestDto
    {
        public string ChuyenMon { get; set; } = string.Empty;
        public string KinhNghiem { get; set; } = string.Empty;
        public string LyDo { get; set; } = string.Empty;
    }

    public class RejectRequestDto
    {
        public string? AdminNotes { get; set; }
    }
}
