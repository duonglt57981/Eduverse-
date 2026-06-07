
using Eduverse.Service.Common;
using Eduverse.Repository.GioHangRepository;
using Eduverse.Model.Entities;
using Eduverse.Service.GioHangService.Dto;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.GioHangChiTietRepository;
using Eduverse.Repository.AppUserRepository;
using Eduverse.Service.Core.Mapper;
using Eduverse.Repository.DangKyKhoaHocRepository;

namespace Eduverse.Service.GioHangService
{
    public class GioHangService : Service<Model.Entities.GioHang>, IGioHangService
    {
        private readonly IGioHangRepository _gioHangRepo;
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly IGioHangChiTietRepository _gioHangChiTietRepository;
        private readonly IAppUserRepository _userRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IMapper _mapper;
        public GioHangService(IGioHangRepository gioHangRepo, IKhoaHocRepository khoaHocRepo , IGioHangChiTietRepository gioHangChiTietRepository, IAppUserRepository userRepository, IMapper mapper, IDangKyKhoaHocRepository dangKyKhoaHocRepository) : base(gioHangRepo)
        {
            _gioHangRepo = gioHangRepo;
            _khoaHocRepo = khoaHocRepo;
            _gioHangChiTietRepository = gioHangChiTietRepository;
            _userRepository = userRepository;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _mapper = mapper;
        }
        public async Task<GioHangDto> GetGioHangAsync(Guid userId)
        {
            var gioHang = await GetOrCreateGioHangAsync(userId);
            return await BuildDtoAsync(gioHang.Id, userId);
        }
        public async Task<GioHangDto> ThemVaoGioHangAsync(GioHangRequest request)
        {
            var daMua = await _dangKyKhoaHocRepository.GetQueryable()
                .AnyAsync(x =>
                    x.IdNguoiDangKi == request.IdNguoiDung &&
                    x.IdDangKi == request.IdKhoaHoc &&
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
            var itemDtos = await (
                from ghct in _gioHangChiTietRepository.GetQueryable().AsNoTracking()
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on ghct.IdKhoaHoc equals k.Id into kGroup
                from k in kGroup.DefaultIfEmpty()
                where ghct.IdGioHang == gioHangId
                   && ghct.DaMua == false
                   && ghct.IsDeleted == false
                select new GioHangChiTietDto
                {
                    Id = ghct.Id,
                    IdKhoaHoc = ghct.IdKhoaHoc,
                    TenKhoaHoc = k != null ? k.TieuDe : null,
                    HinhAnh = k != null ? k.HinhAnhKhoaHoc : null,
                    Gia = k != null ? k.Gia : null,
                    GiaGoc = k != null ? k.GiaGoc : null,
                    DaChon = ghct.DaChon,
                    ThoiGianThem = ghct.ThoiGianThem
                }
            ).ToListAsync();

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
