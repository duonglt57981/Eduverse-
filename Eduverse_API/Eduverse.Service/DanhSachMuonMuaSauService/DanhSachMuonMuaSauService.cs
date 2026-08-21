using Eduverse.Model.Entities;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Repository.DanhSachMuonMuaSauRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
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
        private readonly IKhoaHoc_GiangVienRepository _khoaHoc_GiangVienRepository;

        public DanhSachMuonMuaSauService(
            IDanhSachMuonMuaSauRepository repo,
            IKhoaHocRepository khoaHocRepo,
            IGioHangRepository gioHangRepo,
            IGioHangChiTietRepository gioHangChiTietRepo,
            IAppUserRepository appUserRepo,
            IKhoaHoc_GiangVienRepository khoaHoc_GiangVienRepository
        ) : base(repo)
        {
            _repo = repo;
            _khoaHocRepo = khoaHocRepo;
            _gioHangRepo = gioHangRepo;
            _gioHangChiTietRepo = gioHangChiTietRepo;
            _appUserRepo = appUserRepo;
            _khoaHoc_GiangVienRepository = khoaHoc_GiangVienRepository;
        }

        public async Task<List<DanhSachMuonMuaSauDto>> GetDanhSachAsync(Guid userId)
        {
            // 1. Lấy dữ liệu thô — bỏ hẳn join sai k.Id == gv.Id, chỉ lấy CreatedId làm fallback
            var rawItems = await (
                from d in _repo.GetQueryable().AsNoTracking()
                        .Where(x => x.IdNguoiDung == userId)
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on d.IdKhoaHoc equals k.Id into kGroup
                from k in kGroup.DefaultIfEmpty()
                select new
                {
                    d.Id,
                    d.IdKhoaHoc,
                    TenKhoaHoc = k != null ? k.TieuDe : null,
                    HinhAnh = k != null ? k.HinhAnhKhoaHoc : null,
                    Gia = k != null ? k.Gia : null,
                    GiaGoc = k != null ? k.GiaGoc : null,
                    ThoiGianLuu = d.CreatedDate,
                    CreatedId = k != null ? k.CreatedId : null,
                    TongThoiLuong = k != null ? k.TongThoiLuong : null,
                    TongBaiGiang = k != null ? k.TongBaiGiang : null
                }
            ).OrderByDescending(x => x.ThoiGianLuu).ToListAsync();

            var itemDtos = rawItems.Select(x => new DanhSachMuonMuaSauDto
            {
                Id = x.Id,
                IdKhoaHoc = x.IdKhoaHoc,
                TenKhoaHoc = x.TenKhoaHoc,
                HinhAnh = x.HinhAnh,
                Gia = x.Gia,
                GiaGoc = x.GiaGoc,
                ThoiGianLuu = x.ThoiGianLuu,
                TongThoiLuong = x.TongThoiLuong,
                TongBaiGiang = x.TongBaiGiang
            }).ToList();

            // 2. Gán danh sách N giảng viên — cùng logic với GanDanhSachGiangVienHienThi bên KhoaHocService
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
                        // Chưa backfill KhoaHoc_GiangVien -> fallback về CreatedId
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
                    tenById = await _appUserRepo.GetQueryable()
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
                    item.TenTacGia = tenGiangViens.Any() ? string.Join(", ", tenGiangViens) : null;
                }
            }

            return itemDtos;
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
