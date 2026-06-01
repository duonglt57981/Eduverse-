using Eduverse.Model.Entities;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.CloudinaryService;
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
using Eduverse.Service.TienDoHocTapService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;



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
        private readonly ITienDoHocTapService _tienDoHocTapService;

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
        IMapper mapper,
        ITienDoHocTapService tienDoHocTapService
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
            _tienDoHocTapService = tienDoHocTapService;
        }

        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search, Guid? userId = null)
        {
            // 1. Lấy danh sách khóa học user đã đăng ký (nếu có userId)
            HashSet<Guid> enrolledCourseIds = new HashSet<Guid>();
            if (userId.HasValue)
            {
                enrolledCourseIds = await _dangKyKhoaHocService.GetQueryable()
                    .Where(dk => dk.IdNguoiDangKi == userId.Value && !dk.IsDeleted)
                    .Select(dk => dk.IdDangKi)
                    .Distinct()
                    .ToHashSetAsync();
            }

            // 2. Query khóa học với điều kiện IsDeleted
            var khoaHocQuery = GetQueryable().AsNoTracking();

            // Nếu có userId: lấy khóa học chưa xóa HOẶC khóa học đã đăng ký (dù đã xóa)
            if (userId.HasValue)
            {
                khoaHocQuery = khoaHocQuery.Where(kh => !kh.IsDeleted || enrolledCourseIds.Contains(kh.Id));
            }
            else
            {
                khoaHocQuery = khoaHocQuery.Where(kh => !kh.IsDeleted);
            }

            // 3. Thống kê bài giảng (subquery)
            var thongKeBaiGiang =
                from ph in _phanService.GetQueryable().AsNoTracking()
                join bg in _baiGiangService.GetQueryable().AsNoTracking() on ph.Id equals bg.IdPhan
                group bg by ph.IdKhoaHoc into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    TongBaiGiang = g.Count(),
                    TongThoiLuong = g.Sum(x => x.ThoiLuong ?? 0)
                };

            // 4. Thống kê học viên (subquery)
            var thongKeHocVien =
                from dk in _dangKyKhoaHocService.GetQueryable().AsNoTracking()
                group dk by dk.IdDangKi into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    SoLuongHocVien = g.Select(x => x.IdNguoiDangKi).Distinct().Count()
                };

            // 5. Join chính
            var query =
                from kh in khoaHocQuery
                join tkbg in thongKeBaiGiang on kh.Id equals tkbg.IdKhoaHoc into bgGroup
                from tkbg in bgGroup.DefaultIfEmpty()
                join tkhv in thongKeHocVien on kh.Id equals tkhv.IdKhoaHoc into hvGroup
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
                    TongBaiGiang = tkbg != null ? tkbg.TongBaiGiang : 0,
                    TongThoiLuong = tkbg != null ? tkbg.TongThoiLuong : 0,
                    SoLuongHocVien = tkhv != null ? tkhv.SoLuongHocVien : 0,
                    DaDangKy = userId.HasValue && enrolledCourseIds.Contains(kh.Id)
                };

            // 6. Áp dụng các bộ lọc từ search
            if (!string.IsNullOrWhiteSpace(search?.Keyword))
            {
                query = query.Where(x =>
                    EF.Functions.Like(x.TieuDe, $"%{search.Keyword}%") ||
                    EF.Functions.Like(x.LoaiKhoaHoc, $"%{search.Keyword}%"));
            }

            if (!string.IsNullOrWhiteSpace(search?.TieuDe))
                query = query.Where(x => x.TieuDe.Contains(search.TieuDe));

            if (!string.IsNullOrWhiteSpace(search?.CapDo))
                query = query.Where(x => x.CapDo == search.CapDo);

            if (!string.IsNullOrWhiteSpace(search?.LoaiKhoaHoc))
                query = query.Where(x => x.LoaiKhoaHoc == search.LoaiKhoaHoc);

            if (!string.IsNullOrWhiteSpace(search?.TrangThai))
                query = query.Where(x => x.TrangThai == search.TrangThai);

            if (search?.GiaFrom != null)
                query = query.Where(x => x.Gia >= search.GiaFrom.Value);

            if (search?.GiaTo != null)
                query = query.Where(x => x.Gia <= search.GiaTo.Value);

            if (search?.IsFree == true)
                query = query.Where(x => x.Gia == 0);

            // 7. Sắp xếp
            query = search?.SortPrice?.ToLower() switch
            {
                "asc" => query.OrderBy(x => x.Gia),
                "desc" => query.OrderByDescending(x => x.Gia),
                _ => query.OrderByDescending(x => x.NgayTao)
            };

            // 8. Phân trang
            return await PagedList<KhoaHocDto>.CreateAsync(query, search);
        }


        public async Task<KhoaHocDto> GetLearning(Guid idDangKy, Guid idNguoiDung)
        {
            if (idDangKy == Guid.Empty)
                throw new ArgumentException("Id đăng ký không hợp lệ");

            // 1. Check đăng ký (QUYỀN TRUY CẬP)
            var dangKy = await _dangKyKhoaHocService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.Id == idDangKy &&
                    x.IdNguoiDangKi == idNguoiDung &&
                    !x.IsDeleted)
                .Select(x => new
                {
                    x.IdDangKi
                })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var idKhoaHoc = dangKy.IdDangKi;

            // 2. Lấy khóa học (CHO PHÉP XEM DÙ ĐÃ XÓA MỀM NẾU ĐÃ ĐĂNG KÝ)
            var khoaHoc = await GetQueryable()
                .AsNoTracking()
                .Where(x =>x.Id == idKhoaHoc &&(!x.IsDeleted)) 
                .Select(x => new KhoaHocDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                    Gia = x.Gia,
                    GiaGoc = x.GiaGoc,
                    LoaiKhoaHoc = x.LoaiKhoaHoc
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            // 3. Số học viên
            khoaHoc.SoLuongHocVien = await _dangKyKhoaHocService
                .GetQueryable()
                .AsNoTracking()
                .CountAsync(x =>
                    x.IdDangKi == idKhoaHoc &&
                    !x.IsDeleted);

            var tienDoDict = await _tienDoHocTapService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdDangKi == idDangKy &&
                    x.IdBaiGiang.HasValue &&
                    !x.IsDeleted)
                .Select(x => new
                {
                    x.IdBaiGiang,
                    x.ThoiGianXem,
                    x.TrangThai
                })
                .ToDictionaryAsync(
                    x => x.IdBaiGiang!.Value,
                    x => new
                    {
                        x.ThoiGianXem,
                        x.TrangThai
                    });

            var phanHocs = await _phanService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdKhoaHoc == idKhoaHoc &&
                    !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .Select(x => new PhanHocDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdKhoaHoc,
                    TenPhan = x.TenPhan,
                    MieuTa = x.MieuTa,
                    ThuTuSapXep = x.ThuTuSapXep,
                    DanhSachBaiGiang = new List<BaiGiangDto>()
                })
                .ToListAsync();

            khoaHoc.DanhSachPhanHoc = phanHocs;

            if (!phanHocs.Any())
                return khoaHoc;

            var phanIds = phanHocs.Select(x => x.Id).ToHashSet();

            var baiGiangs = await _baiGiangService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    phanIds.Contains(x.IdPhan) &&
                    !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .Select(x => new BaiGiangDto
                {
                    Id = x.Id,
                    IdPhan = x.IdPhan,
                    TieuDe = x.TieuDe,
                    LoaiBaiGiang = x.LoaiBaiGiang,
                    IdVideoBaiGiang = x.IdVideoBaiGiang,
                    URLBaiGiang = x.URLBaiGiang,
                    ThuTuSapXep = x.ThuTuSapXep,
                    ThoiLuong = x.ThoiLuong,
                    LaBaiGiangFree = x.LaBaiGiangFree,
                    DanhSachTaiLieu = new List<TaiLieuDto>()
                })
                .ToListAsync();

            foreach (var bg in baiGiangs)
            {
                if (tienDoDict.TryGetValue(bg.Id, out var td))
                {
                    bg.DaHoanThanh = td.TrangThai == "HoanThanh";
                    bg.ThoiGianXem = td.ThoiGianXem ?? 0;
                }
                else
                {
                    bg.DaHoanThanh = false;
                    bg.ThoiGianXem = 0;
                }
            }

            khoaHoc.TongBaiGiang = baiGiangs.Count;
            khoaHoc.TongThoiLuong = baiGiangs.Sum(x => x.ThoiLuong ?? 0);
            khoaHoc.SoBaiGiangHoanThanh = baiGiangs.Count(x => x.DaHoanThanh);

            khoaHoc.PhanTramHoanThanh = khoaHoc.TongBaiGiang == 0 ? 0: Math.Round((double)khoaHoc.SoBaiGiangHoanThanh * 100.0 / (double)khoaHoc.TongBaiGiang,2);

            // 7. TÀI LIỆU
            var baiGiangIds = baiGiangs.Select(x => x.Id).ToHashSet();

            var taiLieus = await _taiLieuService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    baiGiangIds.Contains(x.IdBaiGiang) &&
                    !x.IsDeleted)
                .Select(x => new TaiLieuDto
                {
                    Id = x.Id,
                    IdBaiGiang = x.IdBaiGiang,
                    TenTaiLieu = x.TenTaiLieu,
                    LoaiTaiLieu = x.LoaiTaiLieu,
                    URL = x.URL
                })
                .ToListAsync();

            var taiLieuLookup = taiLieus
                .GroupBy(x => x.IdBaiGiang)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var bg in baiGiangs)
            {
                if (taiLieuLookup.TryGetValue(bg.Id, out var ds))
                    bg.DanhSachTaiLieu = ds;
            }

            // 8. MAP BÀI GIẢNG -> PHẦN
            var baiGiangLookup = baiGiangs
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var phan in phanHocs)
            {
                if (baiGiangLookup.TryGetValue(phan.Id, out var ds))
                    phan.DanhSachBaiGiang = ds;
            }

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
            if (id == Guid.Empty)
                throw new ArgumentException("Id khóa học không hợp lệ");

            var now = DateTime.UtcNow;


            var khoaHoc = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");


            var phans = await _phanService.GetQueryable()
                .Where(x => x.IdKhoaHoc == id && !x.IsDeleted)
                .Select(x => x.Id)
                .ToListAsync();

            if (phans.Count == 0)
            {
                khoaHoc.IsDeleted = true;
                khoaHoc.DeletedDate = now;

                await UpdateAsync(khoaHoc);
                return true;
            }


            var baiGiangs = await _baiGiangService.GetQueryable()
                .Where(x => phans.Contains(x.IdPhan) && !x.IsDeleted)
                .ToListAsync();

            var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();

            var taiLieus = await _taiLieuService.GetQueryable()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                .ToListAsync();

            foreach (var tl in taiLieus)
            {
                tl.IsDeleted = true;
                tl.DeletedDate = now;
            }

            if (taiLieus.Count > 0)
                await _taiLieuService.DeleteAsync(taiLieus);


            foreach (var bg in baiGiangs)
            {
                bg.IsDeleted = true;
                bg.DeletedDate = now;
            }

            if (baiGiangs.Count > 0)
                await _baiGiangService.DeleteAsync(baiGiangs);


            var phanEntities = await _phanService.GetQueryable()
                .Where(x => phans.Contains(x.Id) && !x.IsDeleted)
                .ToListAsync();

            foreach (var p in phanEntities)
            {
                p.IsDeleted = true;
                p.DeletedDate = now;
            }

            if (phanEntities.Count > 0)
                await _phanService.DeleteAsync(phanEntities);

 
            khoaHoc.IsDeleted = true;
            khoaHoc.DeletedDate = now;

            await DeleteAsync(khoaHoc);

            return true;
        }
    }
}
