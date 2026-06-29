using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.DanhSachMuonMuaSauRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Service.DanhSachMuonMuaSauService.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DanhSachMuonMuaSauService
{
    public class DanhSachMuonMuaSauService
        : Service<DanhSachMuonMuaSau>, IDanhSachMuonMuaSauService
    {
        private readonly IDanhSachMuonMuaSauRepository _repo;
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly IGioHangRepository _gioHangRepo;
        private readonly IGioHangChiTietRepository _gioHangChiTietRepo;
        private readonly IAppUserRepository _appUserRepo;

        public DanhSachMuonMuaSauService(
            IDanhSachMuonMuaSauRepository repo,
            IKhoaHocRepository khoaHocRepo,
            IGioHangRepository gioHangRepo,
            IGioHangChiTietRepository gioHangChiTietRepo,
            IAppUserRepository appUserRepo
        ) : base(repo)
        {
            _repo = repo;
            _khoaHocRepo = khoaHocRepo;
            _gioHangRepo = gioHangRepo;
            _gioHangChiTietRepo = gioHangChiTietRepo;
            _appUserRepo = appUserRepo;
        }

        public async Task<List<DanhSachMuonMuaSauDto>> GetDanhSachAsync(Guid userId)
        {
            return await (
                from d in _repo.GetQueryable().AsNoTracking()
                        .Where(x => x.IdNguoiDung == userId)
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on d.IdKhoaHoc equals k.Id into kGroup
                from k in kGroup.DefaultIfEmpty()

                join gv in _appUserRepo.GetQueryable().AsNoTracking()
                    on k.Id equals gv.Id into gvGroup
                from gv in gvGroup.DefaultIfEmpty()

                select new DanhSachMuonMuaSauDto
                {
                    Id = d.Id,
                    IdKhoaHoc = d.IdKhoaHoc,
                    TenKhoaHoc = k != null ? k.TieuDe : null,
                    HinhAnh = k != null ? k.HinhAnhKhoaHoc : null,
                    Gia = k != null ? k.Gia : null,
                    GiaGoc = k != null ? k.GiaGoc : null,
                    ThoiGianLuu = d.CreatedDate,
                    TenTacGia = gv != null ? gv.HoTen : null,
                    TongThoiLuong = k != null ? k.TongThoiLuong : null,
                    TongBaiGiang = k != null ? k.TongBaiGiang : null
                }
            ).OrderByDescending(x => x.ThoiGianLuu).ToListAsync();
        }

        public async Task LuuMuaSauAsync(Guid userId, Guid khoaHocId)
        {
            // Kiểm tra đã lưu chưa
            var existed = await AnyAsync(x =>
                x.IdNguoiDung == userId && x.IdKhoaHoc == khoaHocId);
            if (existed) return;

            var entity = new DanhSachMuonMuaSau
            {
                IdNguoiDung = userId,
                IdKhoaHoc = khoaHocId,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };
            await CreateAsync(entity);
        }

        public async Task XoaKhoiMuaSauAsync(Guid userId, Guid khoaHocId)
        {
            var item = await FirstOrDefaultAsync(x =>
                x.IdNguoiDung == userId && x.IdKhoaHoc == khoaHocId);
            if (item != null)
                await DeleteAsync(item);
        }

        public async Task ChuyenVaoGioHangAsync(Guid userId, Guid khoaHocId)
        {
            // Tìm hoặc tạo giỏ hàng
            var gioHang = await _gioHangRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdNguoiDung == userId);

            if (gioHang == null)
            {
                gioHang = new GioHang
                {
                    IdNguoiDung = userId,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                };
                _gioHangRepo.Add(gioHang);
                await _gioHangRepo.SaveAsync();
            }

            // Kiểm tra đã có trong giỏ chưa
            var existed = await _gioHangChiTietRepo.GetAll()
                .AnyAsync(x => x.IdGioHang == gioHang.Id
                    && x.IdKhoaHoc == khoaHocId
                    && x.DaMua == false);

            if (!existed)
            {
                _gioHangChiTietRepo.Add(new GioHangChiTiet
                {
                    IdGioHang = gioHang.Id,
                    IdKhoaHoc = khoaHocId,
                    DaChon = true,
                    DaMua = false,
                    ThoiGianThem = DateTime.Now,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                });
                await _gioHangChiTietRepo.SaveAsync();
            }

            // Xóa khỏi danh sách mua sau
            await XoaKhoiMuaSauAsync(userId, khoaHocId);
        }
    }
}
