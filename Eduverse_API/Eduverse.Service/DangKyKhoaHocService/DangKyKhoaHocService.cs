using Eduverse.Model.Entities;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhGiaRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService.Dto;
using Eduverse.Service.DanhGiaService;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.ThongBaoService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DangKyKhoaHocService
{
    public class DangKyKhoaHocService : Service<Model.Entities.DangKyKhoaHoc>, IDangKyKhoaHocService
    {
        //private readonly IKhoaHocService _khoaHocService;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private readonly INotificationPublisher _notificationPublisher;
        public DangKyKhoaHocService(
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            //IKhoaHocService khoaHocService,
            IKhoaHocRepository khoaHocRepository,
            IMapper mapper,
            INotificationPublisher notificationPublisher,
            IHttpContextAccessor? httpContextAccessor = null) : base(dangKyKhoaHocRepository)
        {
            //_khoaHocService = khoaHocService;
            _mapper = mapper;
            _khoaHocRepository = khoaHocRepository;
            _notificationPublisher = notificationPublisher;
            this._httpContextAccessor = httpContextAccessor;
        }


        public async Task<DangKyKhoaHocMienPhiDto> DangKyKhoaHocMienPhi(Guid idKhoaHoc)
        {
            if (idKhoaHoc == Guid.Empty)
                throw new ArgumentException("Id khóa học không hợp lệ");

            var khoaHoc = await _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc
                                       && !x.IsDeleted
                                       && x.TrangThai == "HoatDong");

            var giaKhoaHoc = await _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc && !x.IsDeleted)
                .Select(x => x.Gia)
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (khoaHoc.Gia > 0)
                throw new Exception("Khóa học này yêu cầu thanh toán");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDangKi);

            var daDangKy = await GetQueryable()
                .AnyAsync(x => x.IdNguoiDangKi == idNguoiDangKi
                            && x.IdKhoaHoc == idKhoaHoc
                            && !x.IsDeleted
                            && x.IsDangKy != false);

            if (daDangKy)
                throw new Exception("Bạn đã đăng ký khóa học này");

            var dangKy = new DangKyKhoaHoc
            {
                Id = Guid.NewGuid(),
                IdNguoiDangKi = idNguoiDangKi,
                IdKhoaHoc = idKhoaHoc,
                GiaDangKy = giaKhoaHoc,
                TrangThai = "DaDangKi",
                IsDangKy = true,    
                ThoiGianDK = DateTime.Now,
                NgayHetHan = DateTime.Now.AddMonths(6)
                
            };

            await CreateAsync(dangKy);
            await SaveAsync();

            khoaHoc.SoLuongHocVien = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc
                    && !x.IsDeleted
                    && x.IsDangKy != false
                    && x.IdNguoiDangKi.HasValue)
                .Select(x => x.IdNguoiDangKi)
                .Distinct()
                .CountAsync();
            _khoaHocRepository.Update(khoaHoc);
            await _khoaHocRepository.SaveAsync();

            var learnerName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
                              ?? "Học viên";

            if (khoaHoc.CreatedId.HasValue && khoaHoc.CreatedId.Value != idNguoiDangKi)
            {
                await _notificationPublisher.NotifyUserAsync(khoaHoc.CreatedId.Value, new NotificationPayload
                {
                    TieuDe = "Khóa học có học viên mới",
                    NoiDung = $"{learnerName} vừa đăng ký khóa học '{khoaHoc.TieuDe}'.",
                    LoaiThongBao = "HocVienDangKyKhoaHoc",
                    Link = "/instructor/students",
                    FromUser = idNguoiDangKi,
                    ItemId = khoaHoc.Id,
                    ItemName = khoaHoc.TieuDe
                });
            }

            return _mapper.Map<DangKyKhoaHoc,DangKyKhoaHocMienPhiDto>(dangKy);
        }

        public async Task<Model.Entities.DangKyKhoaHoc?> GetByKhoaHocAndUser(Guid idKhoaHoc, Guid userId)
        {
            return await GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                   && x.IdNguoiDangKi == userId
                                   && !x.IsDeleted);
        }

        //Kiểm tra và isdelete khi hết hạn
        public async Task ExpireDangKyKhoaHocAsync()
        {
            var now = DateTime.Now;

            var danhSachHetHan = await GetQueryable()
                .Where(x => !x.IsDeleted
                         && x.NgayHetHan.HasValue
                         && x.NgayHetHan.Value <= now)
                .ToListAsync();

            if (!danhSachHetHan.Any())
                return;

            foreach (var item in danhSachHetHan)
            {
                item.TrangThai = "HetHan";
                await DeleteAsync(item);
                await SaveAsync();
            }

            
        }
    }
}
