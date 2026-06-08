using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
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
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;

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
            ITienDoHocTapService tienDoHocTapService,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository
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
            _phanRepository = phanRepository;
            _baiGiangRepository = baiGiangRepository;
        }


        #region GetListKhoaHoc
        public async Task<PagedList<KhoaHocDto>> GetList(KhoaHocSearch search,Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không hợp lệ");

            search ??= new KhoaHocSearch();

            IQueryable<KhoaHoc> query = GetQueryable()
                .AsNoTracking()
                .Where(kh =>!_dangKyKhoaHocService
                .GetQueryable()
                .Any(dk =>dk.IdNguoiDangKi == userId && dk.IdDangKi == kh.Id));

            // Keyword
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();

                query = query.Where(x =>
                    x.TieuDe.Contains(keyword) ||
                    x.LoaiKhoaHoc.Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(search.TieuDe))
            {
                var tieuDe = search.TieuDe.Trim();

                query = query.Where(x =>
                    x.TieuDe.Contains(tieuDe));
            }

            if (!string.IsNullOrWhiteSpace(search.CapDo))
            {
                query = query.Where(x =>
                    x.CapDo == search.CapDo);
            }

            if (!string.IsNullOrWhiteSpace(search.LoaiKhoaHoc))
            {
                query = query.Where(x =>
                    x.LoaiKhoaHoc == search.LoaiKhoaHoc);
            }

            if (search.GiaFrom.HasValue)
            {
                query = query.Where(x =>
                    x.Gia >= search.GiaFrom.Value);
            }

            if (search.GiaTo.HasValue)
            {
                query = query.Where(x =>
                    x.Gia <= search.GiaTo.Value);
            }

            if (search.TongBaiGiangFrom.HasValue)
            {
                query = query.Where(x =>
                    x.TongBaiGiang >= search.TongBaiGiangFrom.Value);
            }
            
            if (search.TongBaiGiangTo.HasValue)
            {
                query = query.Where(x =>
                    x.TongBaiGiang <= search.TongBaiGiangTo.Value);
            }

            if (search.IsFree == true)
            {
                query = query.Where(x => x.Gia == 0);
            }

            // Validate
            if (search.GiaFrom > search.GiaTo)
            {
                throw new Exception("Giá bắt đầu không được lớn hơn giá kết thúc");
            }

            if (search.TongBaiGiangFrom > search.TongBaiGiangTo)
            {
                throw new Exception("Số bài giảng bắt đầu không được lớn hơn số bài giảng kết thúc");
            }

            // Sort
            query = search.SortPrice?.ToLower() switch
            {
                "asc" => query.OrderBy(x => x.Gia),
                "desc" => query.OrderByDescending(x => x.Gia),
                _ => query.OrderByDescending(x => x.NgayTao)
            };

            var dtoQuery = query.Select(kh => new KhoaHocDto
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
                TongThoiLuong = kh.TongThoiLuong,
                TongBaiGiang = kh.TongBaiGiang,
                SoLuongHocVien = kh.SoLuongHocVien,
                NgayTao = kh.NgayTao,

                DaDangKy = false
            });

            return await PagedList<KhoaHocDto>.CreateAsync(dtoQuery, search);
        }
        #endregion


        #region GetListDangKi
        public async Task<PagedList<KhoaHocDto>> GetListDangKi(KhoaHocDangKiSearch search, Guid userId)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("UserId không hợp lệ");

            search ??= new KhoaHocDangKiSearch();

            var query =
                from dk in _dangKyKhoaHocService.GetQueryable().AsNoTracking()
                join kh in GetAll().AsNoTracking()
                    on dk.IdDangKi equals kh.Id
                where dk.IdNguoiDangKi == userId
                select new
                {
                    DangKyId = dk.Id,
                    NgayDangKy = dk.CreatedDate,

                    kh.Id,
                    kh.TieuDe,
                    kh.MoTa,
                    kh.LoaiKhoaHoc,
                    kh.HinhAnhKhoaHoc,
                    kh.URLViewPreviewKhoaHoc,
                    kh.CapDo,
                    kh.TongThoiLuong,
                    kh.SoLuongHocVien
                };

            #region Filter

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();

                query = query.Where(x =>
                    (x.TieuDe ?? "").Contains(keyword) ||
                    (x.LoaiKhoaHoc ?? "").Contains(keyword));
            }

            #endregion

            query = query.OrderByDescending(x => x.NgayDangKy);

            var totalCount = await query.CountAsync();

            var pageData = await query
                .Skip((search.PageIndex - 1) * search.PageSize)
                .Take(search.PageSize)
                .ToListAsync();

            if (!pageData.Any())
            {
                return new PagedList<KhoaHocDto>(
                    new List<KhoaHocDto>(),
                    search.PageIndex,
                    search.PageSize,
                    totalCount);
            }

            var khoaHocIds = pageData
                .Select(x => x.Id)
                .Distinct()
                .ToList();

            var dangKyIds = pageData
                .Select(x => x.DangKyId)
                .Distinct()
                .ToList();

            var tongBaiGiangDict = await (
                from ph in _phanRepository.GetAll().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                group bg by ph.IdKhoaHoc.Value into g
                select new
                {
                    IdKhoaHoc = g.Key,
                    TongBaiGiang = g.Count()
                })
                .ToDictionaryAsync(
                    x => x.IdKhoaHoc,
                    x => x.TongBaiGiang);

            var tienDoDict = await (
                from td in _tienDoHocTapService.GetQueryable().AsNoTracking()
                where td.IdDangKi.HasValue
                      && dangKyIds.Contains(td.IdDangKi.Value)
                      && td.TrangThai == "HoanThanh"
                group td by td.IdDangKi.Value into g
                select new
                {
                    IdDangKy = g.Key,
                    SoBaiGiangHoanThanh = g
                        .Select(x => x.IdBaiGiang)
                        .Distinct()
                        .Count()
                })
                .ToDictionaryAsync(
                    x => x.IdDangKy,
                    x => x.SoBaiGiangHoanThanh);

            var items = pageData
                .Select(x =>
                {
                    var tongBaiGiang = tongBaiGiangDict.TryGetValue(x.Id, out var tong) ? tong : 0;
                    var soBaiDaHoc = tienDoDict.TryGetValue(x.DangKyId, out var hoc) ? hoc : 0;

                    return new KhoaHocDto
                    {
                        Id = x.Id,
                        idDangKiKhoaHoc = x.DangKyId, 
                        TieuDe = x.TieuDe,
                        MoTa = x.MoTa,
                        LoaiKhoaHoc = x.LoaiKhoaHoc,
                        HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                        URLViewPreviewKhoaHoc = x.URLViewPreviewKhoaHoc,
                        CapDo = x.CapDo,
                        TongThoiLuong = x.TongThoiLuong,
                        SoLuongHocVien = x.SoLuongHocVien,
                        DaDangKy = true,
                        NgayDangKy = x.NgayDangKy,
                        TongBaiGiang = tongBaiGiang,
                        SoBaiGiangHoanThanh = soBaiDaHoc,
                        PhanTramHoanThanh = tongBaiGiang > 0
                            ? Math.Round((double)soBaiDaHoc * 100 / tongBaiGiang)
                            : 0
                    };
                })
                .ToList();

            return new PagedList<KhoaHocDto>(
                items,
                search.PageIndex,
                search.PageSize,
                totalCount);
        }
        #endregion


        #region GetLearning
        public async Task<KhoaHocDto> GetLearning(Guid idDangKy)
        {
            if (idDangKy == Guid.Empty)
                throw new ArgumentException("Id đăng ký không hợp lệ");

            var dangKy = await _dangKyKhoaHocService.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == idDangKy && !x.IsDeleted)
                .Select(x => new
                {
                    x.Id,
                    x.IdDangKi
                })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này");

            var idKhoaHoc = dangKy.IdDangKi;

            var soHocVien = await _dangKyKhoaHocService.GetQueryable()
                .AsNoTracking()
                .CountAsync(x => x.IdDangKi == idKhoaHoc && !x.IsDeleted);

            var khoaHoc = await GetAll()
                .AsNoTracking()
                .Where(x => x.Id == idKhoaHoc)
                .Select(x => new KhoaHocDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    MoTa = x.MoTa,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                    LoaiKhoaHoc = x.LoaiKhoaHoc,
                    SoLuongHocVien = soHocVien,
                    DanhSachPhanHoc = new List<PhanHocDto>()
                })
                .FirstOrDefaultAsync();

            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            // 3. Lấy phần học
            var phanHocs = await _phanService.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
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

            var phanIds = phanHocs.Select(x => x.Id).ToList();

            // 4. Lấy bài giảng
            var baiGiangs = await _baiGiangService.GetQueryable()   
                .AsNoTracking()
                .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
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

            var baiGiangIds = baiGiangs.Select(x => x.Id).ToList();

            // 5. Tiến độ học tập
            var tienDoDict = await _tienDoHocTapService.GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDangKi == idDangKy
                    && x.IdBaiGiang.HasValue
                    && baiGiangIds.Contains(x.IdBaiGiang.Value)
                    && !x.IsDeleted)
                .Select(x => new
                {
                    x.IdBaiGiang,
                    x.ThoiGianXem,
                    x.TrangThai
                })
                .ToDictionaryAsync(x => x.IdBaiGiang!.Value);

            // 6. Tài liệu
            var taiLieuLookup = await _taiLieuService.GetQueryable()
                .AsNoTracking()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                .Select(x => new TaiLieuDto
                {
                    Id = x.Id,
                    IdBaiGiang = x.IdBaiGiang,
                    TenTaiLieu = x.TenTaiLieu,
                    LoaiTaiLieu = x.LoaiTaiLieu,
                    URL = x.URL
                })
                .ToListAsync()
                .ContinueWith(t => t.Result
                    .GroupBy(x => x.IdBaiGiang)
                    .ToDictionary(x => x.Key, x => x.ToList()));

            // 7. Gán dữ liệu + thống kê
            int tongBaiGiang = 0;
            int tongThoiLuong = 0;
            int hoanThanh = 0;

            foreach (var bg in baiGiangs)
            {
                tongBaiGiang++;
                tongThoiLuong += bg.ThoiLuong ?? 0;

                if (tienDoDict.TryGetValue(bg.Id, out var td))
                {
                    bg.DaHoanThanh = td.TrangThai == "HoanThanh";
                    bg.ThoiGianXem = td.ThoiGianXem ?? 0;

                    if (bg.DaHoanThanh)
                        hoanThanh++;
                }

                if (taiLieuLookup.TryGetValue(bg.Id, out var tls))
                    bg.DanhSachTaiLieu = tls;
            }

            // 8. Gắn bài giảng vào phần
            var baiGiangByPhan = baiGiangs
                .GroupBy(x => x.IdPhan)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var phan in phanHocs)
            {
                if (baiGiangByPhan.TryGetValue(phan.Id, out var list))
                    phan.DanhSachBaiGiang = list;
            }

            khoaHoc.TongBaiGiang = tongBaiGiang;
            khoaHoc.TongThoiLuong = tongThoiLuong;
            khoaHoc.SoBaiGiangHoanThanh = hoanThanh;
            khoaHoc.PhanTramHoanThanh = tongBaiGiang == 0 ? 0: Math.Round((double)hoanThanh * 100 / tongBaiGiang, 2);

            return khoaHoc;
        }
        #endregion


        #region CreateKhoaHoc
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

            if (request.Img == null)
                throw new Exception("Vui lòng chọn ảnh cho khóa học");

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
                CreatedDate = DateTime.UtcNow,
                TrangThai = "HDI"
            };

            await CreateAsync(khoaHoc);
            await SaveAsync();

            var khoaHocDanhMucs = danhMucIds.Select(id => new DanhMuc_KhoaHocDto
            {
                IdKhoaHoc = khoaHoc.Id,
                IdDanhMuc = id
            }).ToList();

            await _danhMuc_KhoaHocService.CreateRange(khoaHocDanhMucs);
            await _danhMuc_KhoaHocService.SaveAsync();

            return _mapper.Map<KhoaHoc, KhoaHocDto>(khoaHoc);
        }
        #endregion


        #region  UpdateKhoaHoc
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

            var danhMucMoi = (request.DanhSachDanhMuc ?? new List<Guid>())
                .Distinct()
                .ToList();

            if (danhMucMoi.Any())
            {
                var danhMucTonTai = await _danhMucRepository.GetQueryable()
                    .Where(x => danhMucMoi.Contains(x.Id) && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                var danhMucKhongTonTai = danhMucMoi
                    .Except(danhMucTonTai)
                    .ToList();

                if (danhMucKhongTonTai.Any())
                    throw new Exception($"Danh mục không tồn tại: {string.Join(", ", danhMucKhongTonTai)}");
            }

            if (request.Img != null)
            {
                var upload = await _cloudinaryService.UploadImageAsync(request.Img);

                if (upload == null)
                    throw new Exception("Upload hình ảnh thất bại");

                var oldImage = entity.HinhAnhKhoaHoc;
                entity.HinhAnhKhoaHoc = upload.UrlImg;

                if (!string.IsNullOrEmpty(oldImage))
                    _ = _cloudinaryService.DeleteImageAsync(oldImage);
            }

            entity.TieuDe = request.TieuDe;
            entity.MoTa = request.MoTa;
            entity.Gia = request.Gia;
            entity.GiaGoc = request.GiaGoc;
            entity.CapDo = request.CapDo;
            entity.LoaiKhoaHoc = request.Gia <= 0 ? "Khóa học miễn phí" : "Khóa học trả phí";
            entity.UpdatedDate = DateTime.UtcNow;

            await UpdateAsync(entity);
            await SaveAsync();

            var danhMucCu = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == entity.Id && !x.IsDeleted)
                .ToListAsync();

            var danhMucCuIds = danhMucCu.Select(x => x.IdDanhMuc).ToHashSet();
            var danhMucMoiSet = danhMucMoi.ToHashSet();

            var canXoa = danhMucCu
                .Where(x => !danhMucMoiSet.Contains(x.IdDanhMuc))
                .ToList();

            if (canXoa.Any())
                await _danhMuc_KhoaHocService.UpdateAsync(canXoa);
            await _danhMuc_KhoaHocService.SaveAsync();


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
            await _danhMuc_KhoaHocService.SaveAsync();

            await SaveAsync();
            return _mapper.Map<KhoaHoc, KhoaHocDto>(entity);
        }
        #endregion


        public async Task<bool> DeleteKhoaHoc(Guid id)
        {
            var khoaHoc = await GetByIdAsync(id);
            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khoa học");

            khoaHoc.TrangThai = "KDI";

            await DeleteAsync(khoaHoc);
            await SaveAsync();
            return true;
        }
    }
}
