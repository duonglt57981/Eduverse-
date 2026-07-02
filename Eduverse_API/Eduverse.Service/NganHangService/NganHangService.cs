using Eduverse.Model.Entities;
using Eduverse.Repository.NganHangRepository;
using Eduverse.Service.Common;
using Eduverse.Service.NganHangService;
using Eduverse.Service.NganHangService.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;



namespace Eduverse.Service.NganHangService
{
    public class NganHangService : Service<NganHang>, INganHangService
    {
        public NganHangService(INganHangRepository nganHangRepository) : base(nganHangRepository)
        {
        }
        public async Task<List<NganHangDto>> GetByUserAsync(Guid userId)
        {
            return await GetQueryable()
                .Where(n => n.IdNguoiDung == userId)
                .Select(n => new NganHangDto
                {
                    Id = n.Id,
                    TenNganHang = n.TenNganHang,
                    TenTaiKhoan = n.TenTaiKhoan,
                    SoTaiKhoan = n.SoTaiKhoan,
                    TrangThai = n.TrangThai
                })
                .ToListAsync();
        }

        public async Task<NganHangDto> TaoNganHangAsync(Guid userId, TaoNganHangDto dto)
        {
            var entity = new NganHang
            {
                TenNganHang = dto.TenNganHang,
                TenTaiKhoan = dto.TenTaiKhoan,
                SoTaiKhoan = dto.SoTaiKhoan,
                IdNguoiDung = userId,
                TrangThai = "HoatDong",
                NgayTao = DateTime.Now,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };
            await CreateAsync(entity);
            return new NganHangDto
            {
                Id = entity.Id,
                TenNganHang = entity.TenNganHang,
                TenTaiKhoan = entity.TenTaiKhoan,
                SoTaiKhoan = entity.SoTaiKhoan,
                TrangThai = entity.TrangThai
            };
        }

        public async Task XoaNganHangAsync(Guid id, Guid userId)
        {
            var entity = await FirstOrDefaultAsync(n => n.Id == id && n.IdNguoiDung == userId);
            if (entity == null) throw new Exception("Không t?m th?y tài kho?n ngân hàng");
            await DeleteAsync(entity);
        }
    }
}
