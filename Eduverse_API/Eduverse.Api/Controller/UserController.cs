using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Api.Controller
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : EduverseController
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<AppRole> _roleManager;

        public UserController(
            UserManager<AppUser> userManager,
            RoleManager<AppRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet]
        public async Task<DataResponse<object>> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _userManager.Users.Where(u => !u.IsDeleted);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.Trim().ToLower();
                    query = query.Where(u => 
                        (u.UserName != null && u.UserName.ToLower().Contains(search)) ||
                        (u.Email != null && u.Email.ToLower().Contains(search)) ||
                        (u.HoTen != null && u.HoTen.ToLower().Contains(search)) ||
                        (u.PhoneNumber != null && u.PhoneNumber.Contains(search))
                    );
                }

                var users = await query.ToListAsync();
                var userListWithRoles = new List<object>();

                foreach (var u in users)
                {
                    var roles = await _userManager.GetRolesAsync(u);
                    
                    if (!string.IsNullOrWhiteSpace(role) && !roles.Contains(role))
                    {
                        continue;
                    }

                    userListWithRoles.Add(new
                    {
                        u.Id,
                        u.UserName,
                        u.Email,
                        u.HoTen,
                        u.PhoneNumber,
                        u.DiaChi,
                        u.ChucVu,
                        u.GioiTinh,
                        u.NgaySinh,
                        u.SoDuTaiKhoan,
                        u.LockoutEnd,
                        IsLocked = u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow,
                        Roles = roles
                    });
                }

                int totalItems = userListWithRoles.Count;
                var pagedItems = userListWithRoles
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var allRoles = await _roleManager.Roles.Select(r => r.Name).ToListAsync();
                int totalUsersCount = await _userManager.Users.CountAsync(u => !u.IsDeleted);
                int activeUsersCount = await _userManager.Users.CountAsync(u => !u.IsDeleted && (u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow));
                int lockedUsersCount = await _userManager.Users.CountAsync(u => !u.IsDeleted && u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow);

                return DataResponse<object>.Success(new
                {
                    items = pagedItems,
                    totalItems = totalItems,
                    pageIndex = pageIndex,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalItems / pageSize),
                    availableRoles = allRoles,
                    totalUsersCount = totalUsersCount,
                    activeUsersCount = activeUsersCount,
                    lockedUsersCount = lockedUsersCount,
                    roleGroupsCount = allRoles.Count
                }, "Lấy danh sách người dùng thành công");
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False("Lỗi: " + ex.Message);
            }
        }

        [HttpPost]
        public async Task<DataResponse<object>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName) || string.IsNullOrWhiteSpace(request.Password))
            {
                return DataResponse<object>.False("Username và Password không được để trống");
            }

            try
            {
                var existingUser = await _userManager.FindByNameAsync(request.UserName);
                if (existingUser != null)
                {
                    return DataResponse<object>.False("Tên tài khoản đã tồn tại");
                }

                if (!string.IsNullOrWhiteSpace(request.Email))
                {
                    var existingEmail = await _userManager.FindByEmailAsync(request.Email);
                    if (existingEmail != null)
                    {
                        return DataResponse<object>.False("Email đã được sử dụng");
                    }
                }

                var user = new AppUser
                {
                    UserName = request.UserName,
                    Email = request.Email,
                    HoTen = request.HoTen,
                    PhoneNumber = request.PhoneNumber,
                    DiaChi = request.DiaChi,
                    ChucVu = request.ChucVu,
                    GioiTinh = request.GioiTinh,
                    NgaySinh = request.NgaySinh,
                    CreatedDate = DateTime.UtcNow,
                    CreatedId = UserId
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return DataResponse<object>.False("Tạo người dùng thất bại: " + string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                if (request.Roles != null && request.Roles.Any())
                {
                    foreach (var role in request.Roles)
                    {
                        if (await _roleManager.RoleExistsAsync(role))
                        {
                            await _userManager.AddToRoleAsync(user, role);
                        }
                    }
                }
                else
                {
                    if (await _roleManager.RoleExistsAsync("HocVien"))
                    {
                        await _userManager.AddToRoleAsync(user, "HocVien");
                    }
                }

                return DataResponse<object>.Success(null, "Tạo người dùng thành công");
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False("Lỗi: " + ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<DataResponse<object>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null || user.IsDeleted)
                {
                    return DataResponse<object>.False("Không tìm thấy người dùng");
                }

                if (!string.IsNullOrWhiteSpace(request.Email) && !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
                {
                    var existingEmail = await _userManager.FindByEmailAsync(request.Email);
                    if (existingEmail != null)
                    {
                        return DataResponse<object>.False("Email đã được sử dụng");
                    }
                    user.Email = request.Email;
                    user.NormalizedEmail = request.Email.ToUpper();
                }

                user.HoTen = request.HoTen;
                user.PhoneNumber = request.PhoneNumber;
                user.DiaChi = request.DiaChi;
                user.ChucVu = request.ChucVu;
                user.GioiTinh = request.GioiTinh;
                user.NgaySinh = request.NgaySinh;
                user.UpdatedDate = DateTime.UtcNow;
                user.UpdatedId = UserId;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return DataResponse<object>.False("Cập nhật thông tin thất bại: " + string.Join(", ", result.Errors.Select(e => e.Description)));
                }

                if (!string.IsNullOrWhiteSpace(request.Password))
                {
                    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var passResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
                    if (!passResult.Succeeded)
                    {
                        return DataResponse<object>.False("Đặt lại mật khẩu thất bại: " + string.Join(", ", passResult.Errors.Select(e => e.Description)));
                    }
                }

                if (request.Roles != null)
                {
                    var currentRoles = await _userManager.GetRolesAsync(user);
                    var rolesToRemove = currentRoles.Except(request.Roles).ToList();
                    var rolesToAdd = request.Roles.Except(currentRoles).ToList();

                    if (rolesToRemove.Any())
                    {
                        await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                    }

                    foreach (var role in rolesToAdd)
                    {
                        if (await _roleManager.RoleExistsAsync(role))
                        {
                            await _userManager.AddToRoleAsync(user, role);
                        }
                    }
                }

                return DataResponse<object>.Success(null, "Cập nhật người dùng thành công");
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False("Lỗi: " + ex.Message);
            }
        }

        [HttpPut("{id}/toggle-lock")]
        public async Task<DataResponse<object>> ToggleLock(Guid id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null || user.IsDeleted)
                {
                    return DataResponse<object>.False("Không tìm thấy người dùng");
                }

                if (user.Id == UserId)
                {
                    return DataResponse<object>.False("Không thể tự khóa tài khoản của chính mình");
                }

                bool isLocked = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow;
                if (isLocked)
                {
                    user.LockoutEnd = null;
                }
                else
                {
                    user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
                }

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return DataResponse<object>.False("Thao tác thất bại");
                }

                return DataResponse<object>.Success(null, isLocked ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công");
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False("Lỗi: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<DataResponse<object>> DeleteUser(Guid id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id.ToString());
                if (user == null || user.IsDeleted)
                {
                    return DataResponse<object>.False("Không tìm thấy người dùng");
                }

                if (user.Id == UserId)
                {
                    return DataResponse<object>.False("Không thể tự xóa tài khoản của chính mình");
                }

                user.IsDeleted = true;
                user.DeletedDate = DateTime.UtcNow;
                user.DeletedId = UserId;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return DataResponse<object>.False("Xóa người dùng thất bại");
                }

                return DataResponse<object>.Success(null, "Xóa người dùng thành công");
            }
            catch (Exception ex)
            {
                return DataResponse<object>.False("Lỗi: " + ex.Message);
            }
        }
    }

    public class CreateUserRequest
    {
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Email { get; set; }
        public string? HoTen { get; set; }
        public string? PhoneNumber { get; set; }
        public string? DiaChi { get; set; }
        public string? ChucVu { get; set; }
        public int? GioiTinh { get; set; }
        public DateTime? NgaySinh { get; set; }
        public List<string>? Roles { get; set; }
    }

    public class UpdateUserRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? HoTen { get; set; }
        public string? PhoneNumber { get; set; }
        public string? DiaChi { get; set; }
        public string? ChucVu { get; set; }
        public int? GioiTinh { get; set; }
        public DateTime? NgaySinh { get; set; }
        public List<string>? Roles { get; set; }
    }
}
