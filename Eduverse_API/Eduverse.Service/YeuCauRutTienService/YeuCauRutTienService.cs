using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.Common;
using Eduverse.Repository.KetQuaBaiThiRepository;
using Eduverse.Repository.YeuCauRutTienRepository;
using Eduverse.Service.Common;
using Eduverse.Service.KetQuaBaiThiService;
using Eduverse.Service.YeuCauRutTienService.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PayOS;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.YeuCauRutTienService
{
    public class YeuCauRutTienService : Service<YeuCauRutTien>, IYeuCauRutTienService
    {
        private readonly IRepository<YeuCauRutTien> _repo;
        private readonly IRepository<NganHang> _nganHangRepo;
        private readonly IAppUserRepository _userRepo;
        private readonly IRepository<ThongBao> _thongBaoRepo;
        private readonly PayOSClient _payOS;
        private readonly PayOSClient _payOSPayout;

        public YeuCauRutTienService(
            IRepository<YeuCauRutTien> repo,
            IRepository<NganHang> nganHangRepo,
            IAppUserRepository userRepo,
            IRepository<ThongBao> thongBaoRepo,
            PayOSClient payOS,
            [FromKeyedServices("payout")] PayOSClient payOSPayout
            ) : base(repo)
        {
            _repo = repo;
            _nganHangRepo = nganHangRepo;
            _userRepo = userRepo;
            _thongBaoRepo = thongBaoRepo;
            _payOS = payOS;
            _payOSPayout = payOSPayout;
        }
        public async Task<decimal> GetSoDuAsync(Guid userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            return user?.SoDuTaiKhoan ?? 0;
        }

        public async Task<List<YeuCauRutTienDto>> GetByUserAsync(Guid userId)
        {
            return await (
                from y in GetQueryable().Where(x => x.IdNguoiDung == userId)
                join n in _nganHangRepo.GetQueryable()
                    on y.IdNganHang equals n.Id into nGroup
                from n in nGroup.DefaultIfEmpty()
                orderby y.NgayYeuCau descending
                select new YeuCauRutTienDto
                {
                    Id = y.Id,
                    SoTienRut = y.SoTienRut,
                    TrangThai = y.TrangThai,
                    NgayYeuCau = y.NgayYeuCau,
                    NgayXuLy = y.NgayXuLy,
                    TenNganHang = n != null ? n.TenNganHang : null,
                    SoTaiKhoan = n != null ? n.SoTaiKhoan : null,
                    TenTaiKhoan = n != null ? n.TenTaiKhoan : null
                }
            ).ToListAsync();
        }

        public async Task<List<YeuCauRutTienDto>> GetAllAsync()
        {
            return await (
                from y in GetQueryable()
                join n in _nganHangRepo.GetQueryable()
                    on y.IdNganHang equals n.Id into nGroup
                from n in nGroup.DefaultIfEmpty()
                join u in _userRepo.GetQueryable()
                    on y.IdNguoiDung equals u.Id into uGroup
                from u in uGroup.DefaultIfEmpty()
                orderby y.NgayYeuCau descending
                select new YeuCauRutTienDto
                {
                    Id = y.Id,
                    SoTienRut = y.SoTienRut,
                    TrangThai = y.TrangThai,
                    NgayYeuCau = y.NgayYeuCau,
                    NgayXuLy = y.NgayXuLy,
                    TenNganHang = n != null ? n.TenNganHang : null,
                    SoTaiKhoan = n != null ? n.SoTaiKhoan : null,
                    TenTaiKhoan = n != null ? n.TenTaiKhoan : null,
                    TenGiangVien = u != null ? u.HoTen : null,
                    SoDuHienTai = u != null ? u.SoDuTaiKhoan : null,
                    HinhAnhQR = n != null ? n.HinhAnhQR : null,
                }
            ).ToListAsync();
        }

        public async Task TaoYeuCauAsync(Guid userId, TaoYeuCauRutTienDto dto)
        {
            var user = await _userRepo.GetByIdAsync(userId)
                ?? throw new Exception("Không tìm thấy người dùng");

            if (dto.SoTienRut <= 0)
                throw new Exception("Số tiền rút phải lớn hơn 0");

            if (dto.SoTienRut > user.SoDuTaiKhoan)
                throw new Exception($"Số dư không đủ. Hiện tại: {user.SoDuTaiKhoan:N0}đ");

            if (dto.SoTienRut < 50000)
                throw new Exception("Số tiền rút tối thiểu là 50.000đ");

            var nganHang = await _nganHangRepo.GetByIdAsync(dto.IdNganHang)
                ?? throw new Exception("Không tìm thấy tài khoản ngân hàng");

            if (nganHang.IdNguoiDung != userId)
                throw new Exception("Tài khoản ngân hàng không thuộc về bạn");

            // Trừ số dư tạm thời
            user.SoDuTaiKhoan -= dto.SoTienRut;
            user.UpdatedDate = DateTime.Now;
            _userRepo.Update(user);
            await _userRepo.SaveAsync();

            // Tạo yêu cầu
            var entity = new YeuCauRutTien
            {
                SoTienRut = dto.SoTienRut,
                TrangThai = "ChoDuyet",
                NgayYeuCau = DateTime.Now,
                IdNguoiDung = userId,
                IdNganHang = dto.IdNganHang,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };
            await CreateAsync(entity);

            // Thông báo cho Admin
            _thongBaoRepo.Add(new ThongBao
            {
                TieuDe = "Yêu cầu rút tiền mới",
                NoiDung = $"Giảng viên {user.HoTen} yêu cầu rút {dto.SoTienRut:N0}đ",
                DaDoc = false,
                ThoiGianTao = DateTime.Now,
                TrangThai = "MoiNhan",
                LoaiThongBao = "YeuCauRutTien",
                IdNguoiDung = null, // null = gửi cho Admin
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            });
            await _thongBaoRepo.SaveAsync();
        }

        public async Task XuLyYeuCauAsync(Guid id, XuLyYeuCauDto dto)
        {
            var yeuCau = await GetByIdAsync(id)
                ?? throw new Exception("Không tìm thấy yêu cầu");

            if (yeuCau.TrangThai != "ChoDuyet")
                throw new Exception("Yêu cầu đã được xử lý");

            var nganHang = await _nganHangRepo.GetByIdAsync(yeuCau.IdNganHang)
                ?? throw new Exception("Không tìm thấy tài khoản ngân hàng");

            var user = await _userRepo.GetByIdAsync(yeuCau.IdNguoiDung)
                ?? throw new Exception("Không tìm thấy giảng viên");


            if (dto.TrangThai == "DaDuyet")
            {
                yeuCau.TrangThai = "DaChuyenTien";

                _thongBaoRepo.Add(new ThongBao
                {
                    TieuDe = "Yêu cầu rút tiền được duyệt",
                    NoiDung = $"Yêu cầu rút {yeuCau.SoTienRut:N0}đ đã được duyệt và chuyển vào tài khoản {nganHang.SoTaiKhoan}.",
                    DaDoc = false,
                    ThoiGianTao = DateTime.Now,
                    TrangThai = "MoiNhan",
                    LoaiThongBao = "RutTienThanhCong",
                    IdNguoiDung = yeuCau.IdNguoiDung,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                });
            }
            else // TuChoi
            {
                user.SoDuTaiKhoan += yeuCau.SoTienRut ?? 0;
                user.UpdatedDate = DateTime.Now;
                _userRepo.Update(user);
                await _userRepo.SaveAsync();

                yeuCau.TrangThai = "TuChoi";

                _thongBaoRepo.Add(new ThongBao
                {
                    TieuDe = "Yêu cầu rút tiền bị từ chối",
                    NoiDung = $"Yêu cầu rút {yeuCau.SoTienRut:N0}đ đã bị từ chối. Lý do: {dto.GhiChu}. Số tiền đã được hoàn lại vào số dư.",
                    DaDoc = false,
                    ThoiGianTao = DateTime.Now,
                    TrangThai = "MoiNhan",
                    LoaiThongBao = "RutTienTuChoi",
                    IdNguoiDung = yeuCau.IdNguoiDung,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                });
            }

            yeuCau.NgayXuLy = DateTime.Now;
            yeuCau.UpdatedDate = DateTime.Now;
            await UpdateAsync(yeuCau);
            await _thongBaoRepo.SaveAsync();
        }

    }
}
