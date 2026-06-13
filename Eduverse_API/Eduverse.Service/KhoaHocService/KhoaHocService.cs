
﻿using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.DanhSachYeuThichRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.BaiGiangRepository;

namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly IDanhMucRepository _danhMucRepo;
        private readonly IDanhSachYeuThichRepository _yeuThichRepo;
        private readonly IDangKyKhoaHocRepository _dangKyRepo;
        private readonly IDanhMuc_KhoaHocRepository _danhMucKhoaHocRepository;
        private readonly IPhanRepository _phanRepo;
        private readonly IBaiGiangRepository _baiGiangRepo;
        public KhoaHocService(
            IKhoaHocRepository khoaHocRepository,
            IDanhMucRepository danhMucRepo,
            IDanhSachYeuThichRepository yeuThichRepo,
            IDangKyKhoaHocRepository dangKyRepo,
            IDanhMuc_KhoaHocRepository danhMucKhoaHocRepository,
            IPhanRepository phanRepo,
            IBaiGiangRepository baiGiangRepo
        ) : base(khoaHocRepository)
        {
            _khoaHocRepo = khoaHocRepository;
            _danhMucRepo = danhMucRepo;
            _yeuThichRepo = yeuThichRepo;
            _dangKyRepo = dangKyRepo;
            _danhMucKhoaHocRepository = danhMucKhoaHocRepository ;
            _phanRepo = phanRepo;
            _baiGiangRepo = baiGiangRepo;
        }

        public async Task<PagedList<KhoaHocDto>> GetDataAsync(KhoaHocSearch search, Guid? userId)
        {
            var query =
                from k in _khoaHocRepo.GetQueryable().AsNoTracking()

                join dmkh in _danhMucKhoaHocRepository.GetQueryable().AsNoTracking()
                    on k.Id equals dmkh.IdKhoaHoc into dmkhGroup
                from dmkh in dmkhGroup.DefaultIfEmpty()

                join dm in _danhMucRepo.GetQueryable().AsNoTracking()
                    on dmkh.IdDanhMuc equals dm.Id into dmGroup
                from dm in dmGroup.DefaultIfEmpty()

                join yt in _yeuThichRepo.GetQueryable().AsNoTracking()
                    on new
                    {
                        KhoaHocId = k.Id,
                        NguoiDungId = userId ?? Guid.Empty
                    }
                    equals new
                    {
                        KhoaHocId = yt.IdKhoaHoc ?? Guid.Empty,
                        NguoiDungId = yt.IdNguoiDung ?? Guid.Empty
                    }
                    into ytGroup
                from yt in ytGroup.DefaultIfEmpty()

                join dk in _dangKyRepo.GetQueryable().AsNoTracking()
                    on new
                    {
                        KhoaHocId = k.Id,
                        NguoiDungId = userId ?? Guid.Empty
                    }
                    equals new
                    {
                        KhoaHocId = dk.IdDangKi ?? Guid.Empty,
                        NguoiDungId = dk.IdNguoiDangKi ?? Guid.Empty
                    }
                    into dkGroup
                from dk in dkGroup.DefaultIfEmpty()

                select new KhoaHocDto
                {
                    Id = k.Id,
                    TieuDe = k.TieuDe,
                    MoTa = k.MoTa,
                    Gia = k.Gia,
                    GiaGoc = k.GiaGoc,
                    LoaiKhoaHoc = k.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = k.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = k.URLViewPreviewKhoaHoc,
                    CapDo = k.CapDo,
                    TongThoiLuong = k.TongThoiLuong,
                    TongBaiGiang = k.TongBaiGiang,
                    SoLuongHocVien = k.SoLuongHocVien,
                    TrangThai = k.TrangThai,
                    TrangThaiPheDuyet = k.TrangThaiPheDuyet,
                    NgayTao = k.NgayTao,

                    DaYeuThich = yt != null && !yt.IsDeleted,
                    DaDangKy = dk != null && dk.TrangThai == "Hoạt động"
                };

            if (search != null)
            {
                if (!string.IsNullOrEmpty(search.Keyword))
                {
                    query = query.Where(k =>
                        EF.Functions.Like(k.TieuDe, $"%{search.Keyword}%") ||
                        EF.Functions.Like(k.MoTa, $"%{search.Keyword}%"));
                }

                if (!string.IsNullOrEmpty(search.CapDo))
                    query = query.Where(k => k.CapDo == search.CapDo);

                if (!string.IsNullOrEmpty(search.LoaiKhoaHoc))
                    query = query.Where(k => k.LoaiKhoaHoc == search.LoaiKhoaHoc);

                if (!string.IsNullOrEmpty(search.TrangThai))
                    query = query.Where(k => k.TrangThai == search.TrangThai);

                if (search.GiaTu.HasValue)
                    query = query.Where(k => k.Gia >= search.GiaTu);

                if (search.GiaDen.HasValue)
                    query = query.Where(k => k.Gia <= search.GiaDen);

                if (search.DanhMucId.HasValue)
                {
                    query = query.Where(k =>
                        _danhMucKhoaHocRepository.GetQueryable()
                            .Any(x => x.IdKhoaHoc == k.Id && x.IdDanhMuc == search.DanhMucId));
                }
            }

            query = query.OrderByDescending(k => k.NgayTao);
            return await PagedList<KhoaHocDto>.CreateAsync(query, search);
        }

        public async Task<KhoaHocDetailDto?> GetChiTietAsync(Guid id, Guid? userId)
        {
            var khoaHoc = await (
                from k in _khoaHocRepo.GetQueryable().AsNoTracking()
                where k.Id == id

                join dmkh in _danhMucKhoaHocRepository.GetQueryable().AsNoTracking()
                    on k.Id equals dmkh.IdKhoaHoc into dmkhGroup
                from dmkh in dmkhGroup.DefaultIfEmpty()

                join dm in _danhMucRepo.GetQueryable().AsNoTracking()
                    on dmkh.IdDanhMuc equals dm.Id into dmGroup
                from dm in dmGroup.DefaultIfEmpty()

                join yt in _yeuThichRepo.GetQueryable().AsNoTracking()
                    on new
                    {
                        KhoaHocId = k.Id,
                        NguoiDungId = userId ?? Guid.Empty
                    }
                    equals new
                    {
                        KhoaHocId = yt.IdKhoaHoc ?? Guid.Empty,
                        NguoiDungId = yt.IdNguoiDung ?? Guid.Empty
                    }
                    into ytGroup
                from yt in ytGroup.DefaultIfEmpty()

                join dk in _dangKyRepo.GetQueryable().AsNoTracking()
                    on new
                    {
                        KhoaHocId = k.Id,
                        NguoiDungId = userId ?? Guid.Empty
                    }
                    equals new
                    {
                        KhoaHocId = dk.IdDangKi ?? Guid.Empty,
                        NguoiDungId = dk.IdNguoiDangKi ?? Guid.Empty
                    }
                    into dkGroup
                from dk in dkGroup.DefaultIfEmpty()

                select new KhoaHocDetailDto
                {
                    Id = k.Id,
                    TieuDe = k.TieuDe,
                    MoTa = k.MoTa,
                    Gia = k.Gia,
                    GiaGoc = k.GiaGoc,
                    LoaiKhoaHoc = k.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = k.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = k.URLViewPreviewKhoaHoc,
                    CapDo = k.CapDo,
                    TongThoiLuong = k.TongThoiLuong,
                    TongBaiGiang = k.TongBaiGiang,
                    SoLuongHocVien = k.SoLuongHocVien,
                    TrangThai = k.TrangThai,
                    TrangThaiPheDuyet = k.TrangThaiPheDuyet,
                    NgayTao = k.NgayTao,
                    DaYeuThich = yt != null && !yt.IsDeleted,
                    DaDangKy = dk != null && dk.TrangThai == "Hoạt động"
                }
            ).FirstOrDefaultAsync();

            if (khoaHoc == null)
                return null;

            var phans = await _phanRepo.GetQueryable().Where(p=>p.Id==id).ToListAsync();
            var phanDtos = new List<PhanDto>();

            foreach (var phan in phans)
            {
                var baiGiangs = await _baiGiangRepo.GetQueryable().Where(bg=>bg.IdPhan==phan.Id).ToListAsync();

                phanDtos.Add(new PhanDto
                {
                    Id = phan.Id,
                    TenPhan = phan.TenPhan,
                    MieuTa = phan.MieuTa,
                    ThuTuSapXep = phan.ThuTuSapXep,
                    BaiGiangs = baiGiangs.Select(b => new BaiGiangDto
                    {
                        Id = b.Id,
                        TieuDe = b.TieuDe,
                        LoaiBaiGiang = b.LoaiBaiGiang,
                        URLBaiGiang = (b.LaBaiGiangFree == true || khoaHoc.DaDangKy == true)
                                    ? b.URLBaiGiang
                                    : null,
                        ThuTuSapXep = b.ThuTuSapXep,
                        ThoiLuong = b.ThoiLuong,
                        LaBaiGiangFree = b.LaBaiGiangFree,
                        TrangThai = b.TrangThai
                    }).ToList()
                });
            }

            khoaHoc.Phans = phanDtos;
            return khoaHoc;
        }

        public async Task<PagedList<KhoaHocDto>> GetYeuThichAsync(Guid userId, KhoaHocSearch search)
        {
            var query =
                from yt in _yeuThichRepo.GetQueryable().AsNoTracking()
                where yt.IdNguoiDung == userId && !yt.IsDeleted
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on yt.IdKhoaHoc equals k.Id
                select new KhoaHocDto
                {
                    Id = k.Id,
                    TieuDe = k.TieuDe,
                    MoTa = k.MoTa,
                    Gia = k.Gia,
                    GiaGoc = k.GiaGoc,
                    LoaiKhoaHoc = k.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = k.HinhAnhKhoaHoc,
                    CapDo = k.CapDo,
                    TongThoiLuong = k.TongThoiLuong,
                    TongBaiGiang = k.TongBaiGiang,
                    TrangThai = k.TrangThai,
                    NgayTao = k.NgayTao,
                    DaYeuThich = true
                };

            if (!string.IsNullOrEmpty(search?.Keyword))
                query = query.Where(k => EF.Functions.Like(k.TieuDe, $"%{search.Keyword}%"));

            query = query.OrderByDescending(k => k.NgayTao);
            return await PagedList<KhoaHocDto>.CreateAsync(query, search);
        }

        public async Task<PagedList<KhoaHocDto>> GetKhoaHocDaDangKyAsync(Guid userId, KhoaHocSearch search)
        {
            var query =
                from dk in _dangKyRepo.GetQueryable().AsNoTracking()
                where dk.IdNguoiDangKi == userId && dk.TrangThai == "Hoạt động" && !dk.IsDeleted
                join k in _khoaHocRepo.GetQueryable().AsNoTracking()
                    on dk.IdDangKi equals k.Id
                select new KhoaHocDto
                {
                    Id = k.Id,
                    TieuDe = k.TieuDe,
                    MoTa = k.MoTa,
                    Gia = k.Gia,
                    GiaGoc = k.GiaGoc,
                    LoaiKhoaHoc = k.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = k.HinhAnhKhoaHoc,
                    CapDo = k.CapDo,
                    TongThoiLuong = k.TongThoiLuong,
                    TongBaiGiang = k.TongBaiGiang,
                    TrangThai = k.TrangThai,
                    NgayTao = k.NgayTao,
                    DaDangKy = true
                };

            if (!string.IsNullOrEmpty(search?.Keyword))
                query = query.Where(k => EF.Functions.Like(k.TieuDe, $"%{search.Keyword}%"));

            query = query.OrderByDescending(k => k.NgayTao);
            return await PagedList<KhoaHocDto>.CreateAsync(query, search);
        }

        public async Task<KhoaHocDto> TaoKhoaHocAsync(CreateKhoaHocDto dto, Guid userId)
        {
            var khoaHoc = new KhoaHoc
            {
                TieuDe = dto.TieuDe,
                MoTa = dto.MoTa,
                Gia = dto.Gia,
                GiaGoc = dto.GiaGoc,
                LoaiKhoaHoc = dto.LoaiKhoaHoc,
                HinhAnhKhoaHoc = dto.HinhAnhKhoaHoc,
                URLViewPreviewKhoaHoc = dto.URLViewPreviewKhoaHoc,
                CapDo = dto.CapDo,
                TrangThai = "Không hoạt động",
                TrangThaiPheDuyet = "Chờ duyệt",
                NgayTao = DateTime.Now,
                CreatedBy = userId.ToString(),
                CreatedId = userId,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            await CreateAsync(khoaHoc);
            return MapToDto(khoaHoc);
        }

        public async Task<KhoaHocDto> CapNhatKhoaHocAsync(Guid id, UpdateKhoaHocDto dto, Guid userId)
        {
            var khoaHoc = await GetByIdOrThrowAsync(id);

            khoaHoc.TieuDe = dto.TieuDe;
            khoaHoc.MoTa = dto.MoTa;
            khoaHoc.Gia = dto.Gia;
            khoaHoc.GiaGoc = dto.GiaGoc;
            khoaHoc.LoaiKhoaHoc = dto.LoaiKhoaHoc;
            khoaHoc.HinhAnhKhoaHoc = dto.HinhAnhKhoaHoc;
            khoaHoc.URLViewPreviewKhoaHoc = dto.URLViewPreviewKhoaHoc;
            khoaHoc.CapDo = dto.CapDo;
            khoaHoc.NgayCapNhat = DateTime.Now;
            khoaHoc.UpdatedBy = userId.ToString();
            khoaHoc.UpdatedId = userId;
            khoaHoc.UpdatedDate = DateTime.Now;

            await UpdateAsync(khoaHoc);
            return MapToDto(khoaHoc);
        }

        public async Task ToggleYeuThichAsync(Guid userId, Guid khoaHocId)
        {
            var existing = await _yeuThichRepo
                .Where(x => x.IdNguoiDung == userId && x.IdKhoaHoc == khoaHocId)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                _yeuThichRepo.Delete(existing);
            }
            else
            {
                _yeuThichRepo.Add(new DanhSachYeuThich
                {
                    IdNguoiDung = userId,
                    IdKhoaHoc = khoaHocId,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                });
            }

            await _yeuThichRepo.SaveAsync();
        }

        public async Task<List<DanhMucDto>> GetAllDanhMucAsync()
        {
            var list = await _danhMucRepo.GetAll().ToListAsync();
            return list.Select(d => new DanhMucDto
            {
                Id = d.Id,
                TenDanhMuc = d.TenDanhMuc
            }).ToList();
        }

        private KhoaHocDto MapToDto(KhoaHoc k) => new()
        {
            Id = k.Id,
            TieuDe = k.TieuDe,
            MoTa = k.MoTa,
            Gia = k.Gia,
            GiaGoc = k.GiaGoc,
            LoaiKhoaHoc = k.LoaiKhoaHoc,
            HinhAnhKhoaHoc = k.HinhAnhKhoaHoc,
            URLViewPreviewKhoaHoc = k.URLViewPreviewKhoaHoc,
            CapDo = k.CapDo,
            TongThoiLuong = k.TongThoiLuong,
            TongBaiGiang = k.TongBaiGiang,
            SoLuongHocVien = k.SoLuongHocVien,
            TrangThai = k.TrangThai,
            TrangThaiPheDuyet = k.TrangThaiPheDuyet,
            NgayTao = k.NgayTao
        };
        public async Task<PagedList<KhoaHocDto>> GetPagedAsync(KhoaHocQueryDto query)
        {
            var queryable = _khoaHocRepo.GetQueryable()
                .AsNoTracking()
                .Where(k => !k.IsDeleted                       
                         && k.TrangThai == "Hoạt động"          
                         && k.TrangThaiPheDuyet == "Đã duyệt"); 
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                queryable = queryable.Where(k =>
                    EF.Functions.Like(k.TieuDe, $"%{query.Search}%") ||
                    EF.Functions.Like(k.MoTa, $"%{query.Search}%"));
            }

            if (!string.IsNullOrWhiteSpace(query.CapDo))
                queryable = queryable.Where(x => x.CapDo == query.CapDo);

            if (!string.IsNullOrWhiteSpace(query.DanhMucId)
                && Guid.TryParse(query.DanhMucId, out Guid danhMucIdParsed))
            {
                queryable = queryable.Where(k =>
                    _danhMucKhoaHocRepository.GetQueryable()
                        .Any(x => x.IdKhoaHoc == k.Id && x.IdDanhMuc == danhMucIdParsed));
            }

            var totalCount = await queryable.CountAsync();
            int skip = (query.PageIndex - 1) * query.PageSize;

            var entities = await queryable
                .OrderByDescending(x => x.NgayTao)
                .Skip(skip)
                .Take(query.PageSize)
                .ToListAsync();

            var dtos = entities.Select(k => MapToDto(k)).ToList();
            return new PagedList<KhoaHocDto>(dtos, totalCount, query.PageIndex, query.PageSize);
        }

        public async Task<KhoaHocDto?> GetByIdAsync(Guid id, Guid? userId)
        {
            var khoaHoc = await _khoaHocRepo.GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(k => k.Id == id);

            if (khoaHoc == null)
            {
                return null; 
            }

            var dto = MapToDto(khoaHoc);

            if (userId.HasValue)
            {
                bool isEnrolled = await _dangKyRepo.GetQueryable()
                     .AnyAsync(d => d.IdDangKi == id && d.IdNguoiDangKi == userId.Value);
                dto.DaDangKy = isEnrolled;

            }

            return dto;
        }
    }
}
