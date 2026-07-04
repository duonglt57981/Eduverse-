using Eduverse.Model.Entities;
using Eduverse.Repository.NganHangRepository;
using Eduverse.Service.CloudinaryService;
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
        private readonly ICloudinaryService _cloudinaryService;
        public NganHangService(
            INganHangRepository nganHangRepository,
            ICloudinaryService cloudinaryService
        ) : base(nganHangRepository)
        {
            _cloudinaryService = cloudinaryService;
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
                    HinhAnhQR = n.HinhAnhQR,
                    PublicIdHinhAnhQR = n.PublicIdHinhAnhQR,
                    TrangThai = n.TrangThai
                })
                .ToListAsync();
        }

        public async Task<NganHangDto> TaoNganHangAsync(Guid userId, TaoNganHangDto dto)
        {
            // Upload ảnh QR lên Cloudinary nếu có
            string? hinhAnhUrl = null;
            string? publicId = null;

            if (dto.HinhAnhQR != null && dto.HinhAnhQR.Length > 0)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.HinhAnhQR);
                hinhAnhUrl = uploadResult.UrlImg;
                publicId = uploadResult.PublicId;
            }

            var entity = new NganHang
            {
                TenNganHang = dto.TenNganHang,
                TenTaiKhoan = dto.TenTaiKhoan,
                SoTaiKhoan = dto.SoTaiKhoan,
                IdNguoiDung = userId,
                HinhAnhQR = hinhAnhUrl,
                PublicIdHinhAnhQR = publicId,
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
                HinhAnhQR = entity.HinhAnhQR,
                PublicIdHinhAnhQR = entity.PublicIdHinhAnhQR,
                TrangThai = entity.TrangThai
            };
        }

        public async Task XoaNganHangAsync(Guid id, Guid userId)
        {
            var entity = await FirstOrDefaultAsync(n => n.Id == id && n.IdNguoiDung == userId);
            if (entity == null)
                throw new Exception("Không tìm thấy tài khoản ngân hàng");

            // Xóa ảnh QR trên Cloudinary nếu có PublicId
            // (Thêm DeleteImageAsync vào ICloudinaryService nếu cần)
            // if (!string.IsNullOrEmpty(entity.PublicIdHinhAnhQR))
            //     await _cloudinaryService.DeleteImageAsync(entity.PublicIdHinhAnhQR);

            await DeleteAsync(entity);
        }
    }
}
