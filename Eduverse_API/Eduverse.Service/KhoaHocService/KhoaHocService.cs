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

        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search, Guid userId)
        {
            if (userId == Guid.Empty)
                throw new Exception("Vui lòng nhập id người dùng");

            // ✅ Materialize danh sách khóa học đã đăng ký (in-memory)
            var khoaHocDaDangKyIds = await _dangKyKhoaHocService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdNguoiDangKi == userId && x.IdDangKi.HasValue)
                .Select(x => x.IdDangKi.Value)
                .ToListAsync();

            // ✅ Lấy danh sách khóa học (filter cơ bản, không join)
            var khoaHocList = await GetAll()
                .AsNoTracking()
                .Where(kh => !kh.IsDeleted || khoaHocDaDangKyIds.Contains(kh.Id))
                .ToListAsync();

            var khoaHocIds = khoaHocList.Select(x => x.Id).ToList();

            // ✅ Materialize thống kê bài giảng
            var thongKeBaiGiang = await (
                from bg in _baiGiangService.GetQueryable().AsNoTracking()
                join ph in _phanService.GetQueryable().AsNoTracking()
                    on bg.IdPhan equals ph.Id
                where ph.IdKhoaHoc != null && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                group bg by ph.IdKhoaHoc into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    TongBaiGiang = g.Count(),
                    TongThoiLuong = g.Sum(x => x.ThoiLuong ?? 0)
                }
            ).ToListAsync();

            // ✅ Materialize thống kê học viên (bỏ Distinct + Count phức tạp)
            var thongKeHocVien = await (
                from dk in _dangKyKhoaHocService.GetQueryable().AsNoTracking()
                where dk.IdDangKi != null && khoaHocIds.Contains(dk.IdDangKi.Value)
                group dk by dk.IdDangKi into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    SoLuongHocVien = g.Count()
                }
            ).ToListAsync();

            // ✅ Join in-memory — không còn lỗi nullable
            var bgDict = thongKeBaiGiang.ToDictionary(x => x.IdKhoaHoc);
            var hvDict = thongKeHocVien.ToDictionary(x => x.IdKhoaHoc);
            var daDangKySet = new HashSet<Guid>(khoaHocDaDangKyIds);

            var result = khoaHocList.Select(kh =>
            {
                bgDict.TryGetValue(kh.Id, out var bg);
                hvDict.TryGetValue(kh.Id, out var hv);

                return new KhoaHocDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    MoTa = kh.MoTa,
                    Gia = kh.Gia ?? 0,
                    GiaGoc = kh.GiaGoc ?? 0,
                    LoaiKhoaHoc = kh.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                    URLViewPreviewKhoaHoc = kh.URLViewPreviewKhoaHoc,
                    CapDo = kh.CapDo,
                    TrangThai = kh.TrangThai,
                    TrangThaiPheDuyet = kh.TrangThaiPheDuyet,
                    NgayTao = kh.NgayTao,
                    TongBaiGiang = bg?.TongBaiGiang ?? 0,
                    TongThoiLuong = bg?.TongThoiLuong ?? 0,
                    SoLuongHocVien = hv?.SoLuongHocVien ?? 0,
                    DaDangKy = daDangKySet.Contains(kh.Id)
                };
            }).AsQueryable();

            // ✅ Filter in-memory
            if (!string.IsNullOrWhiteSpace(search?.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                result = result.Where(x =>
                    (x.TieuDe != null && x.TieuDe.ToLower().Contains(keyword)) ||
                    (x.LoaiKhoaHoc != null && x.LoaiKhoaHoc.ToLower().Contains(keyword)));
            }

            if (!string.IsNullOrWhiteSpace(search?.TieuDe))
                result = result.Where(x => x.TieuDe != null && x.TieuDe.Contains(search.TieuDe));

            if (!string.IsNullOrWhiteSpace(search?.CapDo))
                result = result.Where(x => x.CapDo == search.CapDo);

            if (!string.IsNullOrWhiteSpace(search?.LoaiKhoaHoc))
                result = result.Where(x => x.LoaiKhoaHoc == search.LoaiKhoaHoc);

            if (!string.IsNullOrWhiteSpace(search?.TrangThai))
                result = result.Where(x => x.TrangThai == search.TrangThai);

            if (search?.GiaFrom != null)
                result = result.Where(x => x.Gia >= search.GiaFrom);

            if (search?.GiaTo != null)
                result = result.Where(x => x.Gia <= search.GiaTo);

            if (search?.IsFree == true)
                result = result.Where(x => x.Gia == 0);

            result = search?.SortPrice?.ToLower() switch
            {
                "asc" => result.OrderBy(x => x.Gia),
                "desc" => result.OrderByDescending(x => x.Gia),
                _ => result.OrderByDescending(x => x.NgayTao)
            };

            return await PagedList<KhoaHocDto>.CreateAsync(result, search);
        }


        public async Task<KhoaHocDto> GetLearning(Guid idDangKy, Guid idNguoiDung)
        {
            if (idDangKy == Guid.Empty)
                throw new ArgumentException("Id đăng ký không hợp lệ");

            // 1. Check đăng ký (QUYỀN TRUY CẬP)
            var dangKy = await _dangKyKhoaHocService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>x.Id == idDangKy && x.IdNguoiDangKi == idNguoiDung &&!x.IsDeleted)
                .Select(x => new
                {
                    x.IdDangKi
                })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var idKhoaHoc = dangKy.IdDangKi;

            // 2. Lấy khóa học (CHO PHÉP XEM DÙ ĐÃ XÓA MỀM NẾU ĐÃ ĐĂNG KÝ)
            var khoaHoc = await GetAll()
                .AsNoTracking()
                .Where(x =>x.Id == idKhoaHoc) 
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
                .CountAsync(x =>x.IdDangKi == idKhoaHoc &&!x.IsDeleted);

            var tienDoDict = await _tienDoHocTapService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>x.IdDangKi == idDangKy &&x.IdBaiGiang.HasValue &&!x.IsDeleted)
                .Select(x => new
                {
                    x.IdBaiGiang,
                    x.ThoiGianXem,
                    x.TrangThai
                })
                .ToDictionaryAsync(
                    x => x.IdBaiGiang,
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
