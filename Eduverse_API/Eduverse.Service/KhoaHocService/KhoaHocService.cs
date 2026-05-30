using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.CloudinaryService;
using Eduverse.Service.Common;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DangKyKhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DanhMuc_KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService
{
    public class KhoaHocService : Service<KhoaHoc>, IKhoaHocService
    {
        private readonly IPhanService _phanService;
        private readonly IBaiGiangService _baiGiangService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDangKyKhoaHocService _dangKyKhoaHocService;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IMapper _mapper;

        public KhoaHocService(
            IKhoaHocRepository khoaHocRepository,
            IPhanService phanService,
            IBaiGiangService baiGiangService,
            ITaiLieuService taiLieuService,
            IDangKyKhoaHocService dangKyKhoaHocService,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IHttpContextAccessor httpContextAccessor,
            ICloudinaryService cloudinaryService,
            IDanhMucRepository danhMucRepository,
        IMapper mapper
        ) : base(khoaHocRepository)
        {
            _phanService = phanService;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _dangKyKhoaHocService = dangKyKhoaHocService;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _cloudinaryService = cloudinaryService;
            _danhMucRepository = danhMucRepository;
        }

        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search)
        {
            var thongKeBaiGiang =
                   from ph in _phanService.GetQueryable().AsNoTracking()
                   join bg in _baiGiangService.GetQueryable().AsNoTracking()
                       on ph.Id equals bg.IdPhan
                   group bg by ph.IdKhoaHoc into g
                   select new
                   {
                       IdKhoaHoc = g.Key,
                       TongBaiGiang = g.Count(),
                       TongThoiLuong = g.Sum(x => x.ThoiLuong ?? 0)
                   };

            var thongKeHocVien =
                from dk in _dangKyKhoaHocService.GetQueryable().AsNoTracking()
                group dk by dk.IdDangKi into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    SoLuongHocVien = g.Count()
                };


            var query =
                from kh in GetQueryable().AsNoTracking()

                join tkbg in thongKeBaiGiang
                    on kh.Id equals tkbg.IdKhoaHoc
                    into bgGroup

                from tkbg in bgGroup.DefaultIfEmpty()

                join tkhv in thongKeHocVien
                    on kh.Id equals tkhv.IdKhoaHoc
                    into hvGroup

                from tkhv in hvGroup.DefaultIfEmpty()

                select new KhoaHocDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    MoTa = kh.MoTa,

                    Gia = kh.Gia,
                    GiaGoc = kh.GiaGoc,

                    LoaiKhoaHoc = kh.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = kh.URLViewPreviewKhoaHoc,

                    CapDo = kh.CapDo,
                    TrangThai = kh.TrangThai,
                    TrangThaiPheDuyet = kh.TrangThaiPheDuyet,

                    NgayTao = kh.NgayTao,

                    TongBaiGiang = tkbg != null
                        ? tkbg.TongBaiGiang
                        : 0,

                    TongThoiLuong = tkbg != null
                        ? tkbg.TongThoiLuong
                        : 0,

                    SoLuongHocVien = tkhv != null
                        ? tkhv.SoLuongHocVien
                        : 0
                };

            #region Filter

            if (!string.IsNullOrWhiteSpace(search?.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.TieuDe, $"%{search.Keyword}%") ||
                    EF.Functions.Like(x.LoaiKhoaHoc, $"%{search.Keyword}%"));
            }

            if (!string.IsNullOrWhiteSpace(search?.TieuDe))
            {
                query = query.Where(x =>
                    x.TieuDe.Contains(search.TieuDe));
            }

            if (!string.IsNullOrWhiteSpace(search?.CapDo))
            {
                query = query.Where(x =>
                    x.CapDo == search.CapDo);
            }

            if (!string.IsNullOrWhiteSpace(search?.LoaiKhoaHoc))
            {
                query = query.Where(x =>
                    x.LoaiKhoaHoc == search.LoaiKhoaHoc);
            }

            if (!string.IsNullOrWhiteSpace(search?.TrangThai))
            {
                query = query.Where(x =>
                    x.TrangThai == search.TrangThai);
            }

            if (search?.GiaFrom != null)
            {
                query = query.Where(x =>
                    x.Gia >= search.GiaFrom.Value);
            }

            if (search?.GiaTo != null)
            {
                query = query.Where(x =>
                    x.Gia <= search.GiaTo.Value);
            }

            if (search?.IsFree == true)
            {
                query = query.Where(x =>
                    x.Gia == 0);
            }

            #endregion

            #region Sort

            query = search?.SortPrice?.ToLower() switch
            {
                "asc" => query.OrderBy(x => x.Gia),

                "desc" => query.OrderByDescending(x => x.Gia),

                _ => query.OrderByDescending(x => x.NgayTao)
            };

            #endregion

            return await PagedList<KhoaHocDto>.CreateAsync(query, search);
        }


        public async Task<KhoaHocDto> GetLearning(Guid idKhoaHoc, Guid idNguoiDung)
        {

            var daDangKy = await _dangKyKhoaHocService
                .GetQueryable()
                .AsNoTracking()
                .AnyAsync(x =>
                    x.IdDangKi == idKhoaHoc &&
                    x.IdNguoiDangKi == idNguoiDung);

            if (!daDangKy)
                throw new Exception("Người dùng chưa đăng ký khóa học này");


            var khoaHoc = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc)
                .Select(x => new KhoaHocDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,

                    SoLuongHocVien = _dangKyKhoaHocService
                        .GetQueryable()
                        .Count(dk => dk.IdDangKi == x.Id)
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            var phanHocs = await _phanService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var phanIds = phanHocs
                .Select(x => x.Id)
                .ToList();


            var baiGiangs = await _baiGiangService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => phanIds.Contains(x.IdPhan))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiGiangIds = baiGiangs
                .Select(x => x.Id)
                .ToList();


            var taiLieus = await _taiLieuService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang))
                .ToListAsync();


            khoaHoc.TongBaiGiang = baiGiangs.Count;

            khoaHoc.TongThoiLuong = baiGiangs.Sum(x =>
                x.ThoiLuong ?? 0);


            var taiLieuLookup = taiLieus
                .GroupBy(x => x.IdBaiGiang)
                .ToDictionary(
                    x => x.Key,
                    x => x.Select(t => new TaiLieuDto
                    {
                        Id = t.Id,
                        IdBaiGiang = t.IdBaiGiang,
                        TenTaiLieu = t.TenTaiLieu,
                        LoaiTaiLieu = t.LoaiTaiLieu,
                        URL = t.URL
                    }).ToList()
                );


            var baiGiangLookup = baiGiangs
                .GroupBy(x => x.IdPhan)
                .ToDictionary(
                    x => x.Key,
                    x => x.Select(bg => new BaiGiangDto
                    {
                        Id = bg.Id,
                        IdPhan = bg.IdPhan,

                        TieuDe = bg.TieuDe,
                        LoaiBaiGiang = bg.LoaiBaiGiang,

                        IdVideoBaiGiang = bg.IdVideoBaiGiang,
                        URLBaiGiang = bg.URLBaiGiang,

                        ThuTuSapXep = bg.ThuTuSapXep,
                        ThoiLuong = bg.ThoiLuong,

                        LaBaiGiangFree = bg.LaBaiGiangFree,

                        DanhSachTaiLieu =
                            taiLieuLookup.TryGetValue(bg.Id, out var dsTaiLieu)
                                ? dsTaiLieu
                                : new List<TaiLieuDto>()
                    })
                    .ToList()
                );


            khoaHoc.DanhSachPhanHoc = phanHocs
                .Select(ph => new PhanHocDto
                {
                    Id = ph.Id,
                    IdKhoaHoc = ph.IdKhoaHoc,

                    TenPhan = ph.TenPhan,
                    MieuTa = ph.MieuTa,
                    ThuTuSapXep = ph.ThuTuSapXep,

                    DanhSachBaiGiang =
                        baiGiangLookup.TryGetValue(
                            ph.Id,
                            out var dsBaiGiang)
                            ? dsBaiGiang
                            : new List<BaiGiangDto>()
                })
                .ToList();

            return khoaHoc;
        }


        public async Task<KhoaHocDto> CreateKhoaHoc(CreateKhoaHocRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên khóa học không được để trống");

            if (request.DanhSachDanhMuc == null || !request.DanhSachDanhMuc.Any())
                throw new Exception("Vui lòng chọn danh mục");

            if (request.Gia < 0)
                throw new Exception("Giá không hợp lệ");

            if (request.GiaGoc < request.Gia)
                throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");

            var danhMucIds = request.DanhSachDanhMuc.Distinct().ToList();


            var invalidIds = danhMucIds
                .Except(await _danhMucRepository.GetQueryable()
                    .Where(x => danhMucIds.Contains(x.Id))
                    .Select(x => x.Id)
                    .ToListAsync())
                .ToList();

            if (invalidIds.Any())
                throw new Exception($"Danh mục không tồn tại: {string.Join(",", invalidIds)}");

            var upLoadResult = await _cloudinaryService.UploadImageAsync(request.Img);

            var isFree = request.Gia <= 0;

            var khoaHoc = new KhoaHoc
            {
                TieuDe = request.TieuDe,
                MoTa = request.MoTa,
                GiaGoc = request.GiaGoc,
                Gia = request.Gia,
                LoaiKhoaHoc = isFree ? "Khóa học miễn phí" : "Khóa học trả phí",
                HinhAnhKhoaHoc = upLoadResult.UrlImg,
            };

            await CreateAsync(khoaHoc);

            var khoaHocDanhMucs = danhMucIds.Select(id => new DanhMuc_KhoaHocDto
            {
                IdKhoaHoc = khoaHoc.Id,
                IdDanhMuc = id
            }).ToList();

            await _danhMuc_KhoaHocService.CreateRange(khoaHocDanhMucs);

            return _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHoc);
        }


        public async Task<KhoaHocDto> UpdateKhoaHoc(UpdateKhoaHocRequest request)
        {
            var entity = await GetByIdAsync(request.Id);
            if (entity == null || entity.IsDeleted)
                throw new Exception("Không tìm thấy khóa học");

            if (string.IsNullOrWhiteSpace(request.TieuDe))
                throw new Exception("Tên khóa học không được để trống");

            if (request.Gia < 0)
                throw new Exception("Giá không hợp lệ");

            if (request.GiaGoc < request.Gia)
                throw new Exception("Giá gốc phải lớn hơn hoặc bằng giá");


            if (request.Img != null)
            {
                var oldImage = entity.HinhAnhKhoaHoc;

                var upload = await _cloudinaryService.UploadImageAsync(request.Img);
                entity.HinhAnhKhoaHoc = upload.UrlImg;

                if (!string.IsNullOrEmpty(oldImage))
                    _ = _cloudinaryService.DeleteImageAsync(oldImage);
            }


            entity.TieuDe = request.TieuDe;
            entity.MoTa = request.MoTa;
            entity.Gia = request.Gia;
            entity.GiaGoc = request.GiaGoc;
            entity.LoaiKhoaHoc = request.Gia <= 0 ? "Khóa học miễn phí" : "Khóa học trả phí";

            await UpdateAsync(entity);

            var danhMucMoi = (request.DanhSachDanhMuc ?? new List<Guid>())
                .Distinct()
                .ToList();

            var danhMucCu = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == entity.Id && !x.IsDeleted)
                .ToListAsync();

            var danhMucCuIds = danhMucCu
                .Select(x => x.IdDanhMuc)
                .ToHashSet();

            var danhMucMoiSet = danhMucMoi.ToHashSet();

            var canXoa = danhMucCu
                .Where(x => !danhMucMoiSet.Contains(x.IdDanhMuc))
                .ToList();

            foreach (var item in canXoa)
            {
                item.IsDeleted = true;
                item.DeletedDate = DateTime.UtcNow;
            }

            if (canXoa.Any())
                await _danhMuc_KhoaHocService.UpdateAsync(canXoa);

            var canThem = danhMucMoiSet
                .Where(id => !danhMucCuIds.Contains(id))
                .Select(id => new DanhMuc_KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = entity.Id,
                    IdDanhMuc = id,
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                })
                .ToList();

            if (canThem.Any())
                await _danhMuc_KhoaHocService.CreateRange(canThem);

            await SaveAsync();
            return _mapper.Map<KhoaHoc, KhoaHocDto>(entity);
        }


        public async Task<bool> DeleteKhoaHoc(Guid id)
        {
            var khoaHoc = await GetByIdAsync(id);

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            var now = DateTime.UtcNow;

            var phanIds = await _phanService.GetQueryable()
                .Where(x => x.IdKhoaHoc == id && !x.IsDeleted).Select(x => x.Id)
                .ToListAsync();

            if (!phanIds.Any())
            {
                khoaHoc.IsDeleted = true;
                khoaHoc.DeletedDate = now;
                await DeleteAsync(khoaHoc);
                return true;
            }

            var baiGiangIds = await _baiGiangService.GetQueryable()
                .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
                .Select(x => x.Id)
                .ToListAsync();


            var taiLieuTask = _taiLieuService.GetQueryable()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                .ToListAsync();

            var baiGiangTask = _baiGiangService.GetQueryable()
                .Where(x => baiGiangIds.Contains(x.Id) && !x.IsDeleted)
                .ToListAsync();

            var phanHocTask = _phanService.GetQueryable()
                .Where(x => x.IdKhoaHoc == id && !x.IsDeleted)
                .ToListAsync();

            await Task.WhenAll(taiLieuTask, baiGiangTask, phanHocTask);

            var taiLieus = taiLieuTask.Result;
            var baiGiangs = baiGiangTask.Result;
            var phanHocs = phanHocTask.Result;


            if (taiLieus.Any())
            {
                taiLieus.ForEach(x =>
                {
                    x.IsDeleted = true;
                    x.DeletedDate = now;
                });

                await _taiLieuService.DeleteRange(taiLieus);
            }

            if (baiGiangs.Any())
            {
                baiGiangs.ForEach(x =>
                {
                    x.IsDeleted = true;
                    x.DeletedDate = now;
                });

                await _baiGiangService.DeleteRange(baiGiangs);
            }

            if (phanHocs.Any())
            {
                phanHocs.ForEach(x =>
                {
                    x.IsDeleted = true;
                    x.DeletedDate = now;
                });

                await _phanService.DeleteRange(phanHocs);
            }

            khoaHoc.IsDeleted = true;
            khoaHoc.DeletedDate = now;

            await DeleteAsync(khoaHoc);

            return true;
        }
    }
}
