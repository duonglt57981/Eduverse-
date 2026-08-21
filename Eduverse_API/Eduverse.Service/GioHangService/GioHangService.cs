
using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.GioHangService.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.GioHangService
{
    public class GioHangService : Service<Model.Entities.GioHang>, IGioHangService
    {
        private readonly IGioHangRepository _gioHangRepo;
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly IGioHangChiTietRepository _gioHangChiTietRepository;
        private readonly IAppUserRepository _userRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IKhoaHoc_GiangVienRepository _khoaHoc_GiangVienRepository;
        private readonly IMapper _mapper;
        public GioHangService(IGioHangRepository gioHangRepo,
            IKhoaHocRepository khoaHocRepo ,
            IGioHangChiTietRepository gioHangChiTietRepository,
            IAppUserRepository userRepository, IMapper mapper,
            IKhoaHoc_GiangVienRepository khoaHoc_GiangVienRepository,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository) : base(gioHangRepo)
        {
            _gioHangRepo = gioHangRepo;
            _khoaHocRepo = khoaHocRepo;
            _gioHangChiTietRepository = gioHangChiTietRepository;
            _userRepository = userRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _khoaHoc_GiangVienRepository = khoaHoc_GiangVienRepository;
            _mapper = mapper;
        }
        public async Task<GioHangDto> GetGioHangAsync(Guid userId)
        {
            var gioHang = await GetOrCreateGioHangAsync(userId);
            return await BuildDtoAsync(gioHang.Id, userId);
        }
        public async Task<GioHangDto> ThemVaoGioHangAsync(GioHangRequest request)
        {
            var khoaHoc = await _khoaHocRepo.GetByIdAsync(request.IdKhoaHoc);

            if (khoaHoc.CreatedId == request.IdNguoiDung)
            {
                throw new InvalidOperationException("Bạn không thể mua khóa học do chính mình tạo.");
            }
            var daMua = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x =>
                    x.IdNguoiDangKi == request.IdNguoiDung &&
                    x.IdKhoaHoc == request.IdKhoaHoc &&
                    x.TrangThai == "Hoạt động");
            if (daMua)
            {
                throw new InvalidOperationException("Bạn đã sở hữu khóa học này.");
            }
            var gioHang = await GetOrCreateGioHangAsync(request.IdNguoiDung);

            var existed = await _gioHangChiTietRepository.GetQueryable()
                .AnyAsync(x => x.IdGioHang == gioHang.Id
                            && x.IdKhoaHoc == request.IdKhoaHoc
                            && x.DaMua == false);

            if (!existed)
            {
                var entity = _mapper.Map<GioHangRequest, GioHangChiTiet>(request);

                entity.Id = Guid.NewGuid();
                entity.IdGioHang = gioHang.Id;  
                entity.DaChon = true;
                entity.DaMua = false;
                entity.ThoiGianThem = DateTime.Now;
                entity.CreatedDate = DateTime.Now;
                entity.UpdatedDate = DateTime.Now;

                _gioHangChiTietRepository.Add(entity);
                await _gioHangChiTietRepository.SaveAsync();
            }

            return await BuildDtoAsync(gioHang.Id, request.IdNguoiDung);
        }



        public async Task<GioHangDto> XoaKhoiGioHangAsync(Guid userId, Guid khoaHocId)
        {
            var gioHang = await GetOrCreateGioHangAsync(userId);

            var item = await _gioHangChiTietRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdGioHang == gioHang.Id
                                       && x.IdKhoaHoc == khoaHocId
                                        && x.DaMua == false);
            if (item != null)
            {
                item.DaMua = true;
                item.UpdatedDate = DateTime.Now;
                _gioHangChiTietRepository.Update(item);
                await _gioHangChiTietRepository.SaveAsync();
            }

            return await BuildDtoAsync(gioHang.Id, userId);
        }



        public async Task<GioHangDto> ToggleChonAsync(Guid userId, Guid khoaHocId)
        {
            var gioHang = await GetOrCreateGioHangAsync(userId);

             var item = await _gioHangChiTietRepository.GetQueryable()
            .FirstOrDefaultAsync(x =>
                x.IdGioHang == gioHang.Id &&
                x.IdKhoaHoc == khoaHocId &&
                x.DaMua == false);


            if (item != null)
            {
                item.DaChon = !item.DaChon;

                try
                {
                    _gioHangChiTietRepository.Update(item);
                    await _gioHangChiTietRepository.SaveAsync();
                    var verify = await _gioHangChiTietRepository.GetQueryable()
                    .AsNoTracking()
                    .FirstAsync(x => x.Id == item.Id);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[TOGGLE] Save THAT BAI: {ex.Message}");
                    Console.WriteLine($"[TOGGLE] Inner: {ex.InnerException?.Message}");
                }
            }

            return await BuildDtoAsync(gioHang.Id, userId);
        }


        private async Task<GioHang> GetOrCreateGioHangAsync(Guid userId)
        {
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
                await CreateAsync(gioHang);
            }
            return gioHang;
        }




        private async Task<GioHangDto> BuildDtoAsync(Guid gioHangId, Guid userId)
        {
            // Bỏ join thẳng CreatedId->user, chỉ lấy CreatedId để làm fallback
            var rawItems = await (
                from ghct in _gioHangChiTietRepository.GetQueryable().AsNoTracking()
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on ghct.IdKhoaHoc equals k.Id into kGroup
                from k in kGroup.DefaultIfEmpty()
                where ghct.IdGioHang == gioHangId
                   && ghct.DaMua == false
                   && ghct.IsDeleted == false
                select new
                {
                    ghct.Id,
                    ghct.IdKhoaHoc,
                    TenKhoaHoc = k != null ? k.TieuDe : null,
                    HinhAnh = k != null ? k.HinhAnhKhoaHoc : null,
                    Gia = k != null ? k.Gia : null,
                    GiaGoc = k != null ? k.GiaGoc : null,
                    ghct.DaChon,
                    ghct.ThoiGianThem,
                    CreatedId = k != null ? k.CreatedId : null,
                    TongThoiLuong = k != null ? k.TongThoiLuong : null,
                    TongBaiGiang = k != null ? k.TongBaiGiang : null
                }
            ).ToListAsync();

            var itemDtos = rawItems.Select(x => new GioHangChiTietDto
            {
                Id = x.Id,
                IdKhoaHoc = x.IdKhoaHoc,
                TenKhoaHoc = x.TenKhoaHoc,
                HinhAnh = x.HinhAnh,
                Gia = x.Gia,
                GiaGoc = x.GiaGoc,
                DaChon = x.DaChon,
                ThoiGianThem = x.ThoiGianThem,
                TongThoiLuong = x.TongThoiLuong,
                TongBaiGiang = x.TongBaiGiang
            }).ToList();

            // ── Gán danh sách giảng viên (N giảng viên / khóa học) ──────────────
            // Cùng logic với GanDanhSachGiangVienHienThi bên KhoaHocService
            var khoaHocIds = rawItems.Where(x => x.IdKhoaHoc.HasValue)
                .Select(x => x.IdKhoaHoc!.Value)
                .Distinct()
                .ToList();

            if (khoaHocIds.Any())
            {
                var members = await _khoaHoc_GiangVienRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => khoaHocIds.Contains(x.IdKhoaHoc) && !x.IsDeleted)
                    .Select(x => new { x.IdKhoaHoc, x.IdGiangVien, x.LaChuSoHuu, x.Visible })
                    .ToListAsync();

                var membersByKhoaHoc = members
                    .GroupBy(x => x.IdKhoaHoc)
                    .ToDictionary(g => g.Key, g => g.ToList());

                var idsTheoKhoaHoc = new Dictionary<Guid, List<Guid>>();
                var idsCanTraTen = new HashSet<Guid>();

                foreach (var raw in rawItems)
                {
                    if (!raw.IdKhoaHoc.HasValue) continue;
                    var idKh = raw.IdKhoaHoc.Value;

                    List<Guid> ids;
                    if (membersByKhoaHoc.TryGetValue(idKh, out var ds) && ds.Any())
                    {
                        var visibleOnes = ds.Where(x => x.Visible).Select(x => x.IdGiangVien).ToList();
                        ids = visibleOnes.Any()
                            ? visibleOnes
                            : (ds.FirstOrDefault(x => x.LaChuSoHuu) is { } owner
                                ? new List<Guid> { owner.IdGiangVien }
                                : new List<Guid>());
                    }
                    else
                    {
                        // Chưa có dòng KhoaHoc_GiangVien nào (chưa backfill) → fallback CreatedId
                        ids = raw.CreatedId.HasValue
                            ? new List<Guid> { raw.CreatedId.Value }
                            : new List<Guid>();
                    }

                    idsTheoKhoaHoc[idKh] = ids;
                    foreach (var id in ids) idsCanTraTen.Add(id);
                }

                var tenById = new Dictionary<Guid, string>();
                if (idsCanTraTen.Any())
                {
                    tenById = await _userRepository.GetQueryable()
                        .AsNoTracking()
                        .Where(u => idsCanTraTen.Contains(u.Id))
                        .Select(u => new { u.Id, u.HoTen })
                        .ToDictionaryAsync(u => u.Id, u => u.HoTen);
                }

                foreach (var item in itemDtos)
                {
                    if (!item.IdKhoaHoc.HasValue || !idsTheoKhoaHoc.TryGetValue(item.IdKhoaHoc.Value, out var ids))
                        continue;

                    var tenGiangViens = ids
                        .Select(id => tenById.GetValueOrDefault(id))
                        .Where(ten => !string.IsNullOrWhiteSpace(ten))
                        .ToList();

                    item.DanhSachGiangVien = tenGiangViens;
                    // Giữ TenTacGia để không phá code cũ còn dùng field này ở nơi khác
                    item.TenTacGia = tenGiangViens.Any() ? string.Join(", ", tenGiangViens) : null;
                }
            }

            var daChon = itemDtos.Where(i => i.DaChon == true).ToList();

            return new GioHangDto
            {
                GioHangId = gioHangId,
                Items = itemDtos,
                TongTien = itemDtos.Sum(i => i.Gia ?? 0),
                TongTienDaChon = daChon.Sum(i => i.Gia ?? 0),
                SoLuongDaChon = daChon.Count
            };
        }
    }
}
