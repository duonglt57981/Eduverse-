using CloudinaryDotNet.Actions;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Repository.ThongBao;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Repository.UserRoleRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.AppUserService.Dto;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DapAnService;
using Eduverse.Service.Dto;
using Eduverse.Service.ElasticsearchService;
using Eduverse.Service.GeminiService;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate.YourNamespace.KiemDuyet;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Eduverse.Service.TienDoHocTapService;
using Eduverse.Service.UserRoleService;
using Elastic.Clients.Elasticsearch;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Eduverse.Service.ElasticsearchService;
using System.Linq.Expressions;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Elastic.Clients.Elasticsearch;
using Eduverse.Service.TienDoHocTapService;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.ThongBaoService;
using Eduverse.Repository.LyDoTuChoiRepository;
using Eduverse.Service.LyDoTuChoiService.Dto;
using System.Data;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{
    public class LichSuKiemDuyetKhoaHocService : Service<Model.Entities.LichSuKiemDuyetKhoaHoc>, ILichSuKiemDuyetKhoaHocService
    {
        private const double NGUONG_CHAN = 0.7;    
        private const double NGUONG_PHAN_VAN = 0.4; 

        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IPhanRepository _phanRepository;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IBaiKiemTraRepository _kiemTraRepository;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private readonly IDanhMuc_KhoaHocRepository _danhMuc_KhoaHocRepository;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;
        private readonly IBaiKiemTraService _baiKiemTraService;
        private readonly ILanLamBaiKiemTraRepository _lanLamBaiKiemTraRepository;
        private readonly ICauHoiRepository _cauHoiRepository;
        private readonly IDapAnRepository _dapAnRepository;
        private readonly IGeminiService _geminiService;
        private readonly ILogger<LichSuKiemDuyetKhoaHocService> _logger;
        private readonly IMapper _mapper;
        private readonly IElasticsearchService _elasticsearchService;
        private readonly IBaiKiemTraRepository _baiKiemTraRepository;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly ITienDoHocTapRepository _tienDoHocTapRepository;
        private readonly IThongBaoRepository _thongBaoRepository;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IUserRoleService _userRoleService;
        private readonly IAppUserService _appUserService;
        private readonly EduverseContext _eduverseContext;
        private readonly INotificationPublisher _notificationPublisher;
        private readonly ILyDoTuChoiRepository _lyDoTuChoiRepository;

        public LichSuKiemDuyetKhoaHocService(
            ILichSuKiemDuyetKhoaHocRepository repository,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IKhoaHocRepository khoaHocRepository,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository,
            ITaiLieuRepository taiLieuRepository,
            IBaiKiemTraRepository kiemTraRepository,
            IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository,
            IDanhMucRepository danhMucRepository,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IGeminiService geminiService,
            ILogger<LichSuKiemDuyetKhoaHocService> logger,
            IBaiKiemTraRepository baiKiemTraRepository,
            ILanLamBaiKiemTraRepository lanLamBaiKiemTraRepository,
            ICauHoiRepository cauHoiRepository,
            IDapAnRepository dapAnRepository,
            IMapper mapper,
            IElasticsearchService elasticsearchService,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            ITienDoHocTapRepository tienDoHocTapRepository,
            IThongBaoRepository thongBaoRepository,
            IUserRoleRepository userRoleRepository,
            IAppUserService appUserService,
            IUserRoleService userRoleService,
            EduverseContext eduverseContext,
            INotificationPublisher notificationPublisher,
            ILyDoTuChoiRepository lyDoTuChoiRepository,


        IHttpContextAccessor? httpContextAccessor = null) : base(repository)
        {
            _khoaHocRepository = khoaHocRepository;
            _phanRepository = phanRepository;
            _baiKiemTraRepository = baiKiemTraRepository;   
            _baiGiangRepository = baiGiangRepository;
            _taiLieuRepository = taiLieuRepository;
            _kiemTraRepository = kiemTraRepository;
            this._httpContextAccessor = httpContextAccessor;
            _danhMuc_KhoaHocRepository = danhMuc_KhoaHocRepository;
            _danhMucRepository = danhMucRepository;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _geminiService = geminiService;
            _logger = logger;
            _lanLamBaiKiemTraRepository = lanLamBaiKiemTraRepository;
            _cauHoiRepository = cauHoiRepository;
            _dapAnRepository = dapAnRepository;
            _mapper = mapper;
            _elasticsearchService = elasticsearchService;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _tienDoHocTapRepository = tienDoHocTapRepository;
            _thongBaoRepository = thongBaoRepository;
            _userRoleRepository = userRoleRepository;
            _appUserService = appUserService;
            _eduverseContext = eduverseContext;
            _lyDoTuChoiRepository = lyDoTuChoiRepository;
            _notificationPublisher = notificationPublisher;
        }

        #region GetDanhSachKiemDuyet
        public async Task<PagedList<KhoaHocKiemDuyetListDto>> GetDanhSachKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            int _count = 0;
            
            const string NHANVIEN = "personnel";
            const string ADMIN = "Admin";

            // 1. Lấy thông tin user an toàn
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var principal = _httpContextAccessor.HttpContext?.User;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                // Không có userId hợp lệ, trả về rỗng
                return new PagedList<KhoaHocKiemDuyetListDto>(new List<KhoaHocKiemDuyetListDto>(), 0, 1, 10);
            }

            // 2. Lấy danh sách Id đang duyệt của user (cho trạng thái DangDuyet)
            // 3. Xây dựng query cơ bản - lấy các khóa học có trạng thái ChoDuyet hoặc DangDuyet
            var khoaHocQuery = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => !x.IsDeleted && x.IsBanHienTai
                    && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet"));

            // 4. Lọc theo role
            if (principal != null)
            {
                _count++;
                Console.WriteLine($"GetDanhSachKiemDuyet: {_count}");
                if (principal.IsInRole(NHANVIEN) && !principal.IsInRole(ADMIN))
                {
                    // NHANVIEN: chỉ lấy khóa học có IdNguoiDuyet = userId
                    khoaHocQuery = khoaHocQuery.Where(x => x.IdNguoiDuyet == userId);
                }
                else if (principal.IsInRole(ADMIN))
                {
                    // ADMIN: chỉ lấy khóa học có IdNguoiDuyet = null (chưa phân công)
                }
                else
                {
                    // Role khác: không có quyền, trả về rỗng
                    return new PagedList<KhoaHocKiemDuyetListDto>(new List<KhoaHocKiemDuyetListDto>(), 0, 1, 10);
                }
            }

            // 5. Lọc theo trạng thái (nếu có)
            if (!string.IsNullOrWhiteSpace(search.TrangThaiPheDuyet))
            {
                if (search.TrangThaiPheDuyet == "ChoDuyet")
                {
                    khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "ChoDuyet");
                }
                else if (search.TrangThaiPheDuyet == "DangDuyet")
                {
                    khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "DangDuyet");
                }
            }

            // 6. Lọc theo keyword
            if (search.TrangThaiPhanCong == "ChuaPhanCong")
                khoaHocQuery = khoaHocQuery.Where(x => x.IdNguoiDuyet == null);
            else if (search.TrangThaiPhanCong == "DaPhanCong")
                khoaHocQuery = khoaHocQuery.Where(x => x.IdNguoiDuyet != null);

            if (search.IdNguoiDuyet.HasValue)
                khoaHocQuery = khoaHocQuery.Where(x => x.IdNguoiDuyet == search.IdNguoiDuyet.Value);

            if (search.TuNgay.HasValue)
            {
                var tuNgay = search.TuNgay.Value.Date;
                khoaHocQuery = khoaHocQuery.Where(x => x.UpdatedDate >= tuNgay);
            }

            if (search.DenNgay.HasValue)
            {
                var sauDenNgay = search.DenNgay.Value.Date.AddDays(1);
                khoaHocQuery = khoaHocQuery.Where(x => x.UpdatedDate < sauDenNgay);
            }

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                khoaHocQuery = khoaHocQuery.Where(x =>
                    (x.TieuDe != null && x.TieuDe.Contains(keyword))
                    || (x.CreatedBy != null && x.CreatedBy.Contains(keyword)));
            }

            // 7. Sắp xếp
            if (!string.IsNullOrEmpty(search.SapXepTen))
            {
                khoaHocQuery = search.SapXepTen == "AZ"
                    ? khoaHocQuery.OrderBy(x => x.TieuDe ?? string.Empty)
                    : khoaHocQuery.OrderByDescending(x => x.TieuDe ?? string.Empty);
            }
            else if (!string.IsNullOrEmpty(search.SapXepNgay))
            {
                khoaHocQuery = search.SapXepNgay == "Moi"
                    ? khoaHocQuery.OrderByDescending(x => x.CreatedDate)
                    : khoaHocQuery.OrderBy(x => x.CreatedDate);
            }
            else
            {
                // Mặc định: mới nhất trước
                khoaHocQuery = khoaHocQuery.OrderByDescending(x => x.CreatedDate);
            }

            // 8. Project sang DTO
            var query = khoaHocQuery.Select(x => new KhoaHocKiemDuyetListDto
            {
                IdKhoaHoc = x.Id,
                TieuDe = x.TieuDe,
                TrangThai = x.TrangThai,
                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                CreateBy = x.CreatedBy,
                CreateDate = x.CreatedDate,
                NgayGuiDuyet = x.UpdatedDate,
                IdNguoiDuyet = x.IdNguoiDuyet,
                TenNguoiDuyet = x.IdNguoiDuyet.HasValue
                    ? _eduverseContext.AppUsers
                        .Where(u => u.Id == x.IdNguoiDuyet.Value)
                        .Select(u => u.HoTen)
                        .FirstOrDefault()
                    : null,
            });

            // 9. Phân trang
            return await PagedList<KhoaHocKiemDuyetListDto>.CreateAsync(query,search);
        }
        #endregion


        #region GetDetailKiemDuyet
        public async Task<KiemDuyetDetailDto> GetDetailKiemDuyet(Guid idKhoaHoc)
        {
            // 1. Lấy đúng bản khóa học theo Id được truyền vào
            var targetVersion = await _khoaHocRepository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc);

            if (targetVersion == null)
                return null;

            var currentUser = _httpContextAccessor?.HttpContext?.User;
            var currentUserIdText = currentUser?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUser?.IsInRole("personnel") == true
                && currentUser.IsInRole("Admin") == false
                && (!Guid.TryParse(currentUserIdText, out var currentUserId)
                    || targetVersion.IdNguoiDuyet != currentUserId))
            {
                throw new UnauthorizedAccessException("Bạn chỉ được truy cập khóa học được phân công cho mình.");
            }

            // 2. Lấy toàn bộ cây dữ liệu (không dùng khóa ngoại, so khớp thủ công qua Id list)
            var phans = await _phanRepository.GetAll()
                .Where(x => x.IdKhoaHoc == targetVersion.Id && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var phanIds = phans.Select(p => p.Id).ToList();

            var baiGiangs = await _baiGiangRepository.GetAll()
                .Where(x => phanIds.Contains(x.IdPhan) && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiGiangIds = baiGiangs.Select(b => b.Id).ToList();

            var lyDoBaiGiangs = await _lyDoTuChoiRepository.GetAll()
                .Where(x => baiGiangIds.Contains(x.IdDoiTuong ?? Guid.Empty))
                .ToListAsync();

            var taiLieus = await _taiLieuRepository.GetAll()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository.GetAll()
                .Where(x => x.IdPhan.HasValue && phanIds.Contains(x.IdPhan.Value) && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();
            
            var baiKiemTraIds = baiKiemTras.Select(b => b.Id).ToList();

            var lyDoBaiKiemTras = await _lyDoTuChoiRepository.GetAll()
                .Where(x => baiKiemTraIds.Contains(x.IdDoiTuong ?? Guid.Empty))
                .ToListAsync();

            var cauHois = await _cauHoiRepository.GetAll()
                .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value) && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois.Select(c => c.Id).ToList();

            var dapAns = await _dapAnRepository.GetAll()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value) && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet" || x.TrangThaiPheDuyet == "DaDuyet"))
                .ToListAsync();

            var tenDanhMucs = await _danhMuc_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHoc)
                .Join(_danhMucRepository.GetQueryable(),    
                      dk => dk.IdDanhMuc,     
                      dm => dm.Id,              
                      (dk, dm) => dm.TenDanhMuc)       
                .ToListAsync();

            // Admin only previews; assigned personnel starts the review session.
            // Admin chỉ xem trước. Chỉ personnel được phân công mới bắt đầu phiên kiểm duyệt.
            var shouldStartReview = currentUser?.IsInRole("personnel") == true
                && currentUser.IsInRole("Admin") == false;
            var hasCurrentReview = Guid.TryParse(currentUserIdText, out var reviewUserId)
                && await GetQueryable().AnyAsync(x =>
                    x.IdDoiTuong == targetVersion.Id && x.CreatedId == reviewUserId);

            if (shouldStartReview)
            {
                if (shouldStartReview
                && !hasCurrentReview
                && (targetVersion.TrangThaiPheDuyet == "ChoDuyet"
                    || targetVersion.TrangThaiPheDuyet == "DangDuyet"
                    || targetVersion.TrangThaiPheDuyet == null))
                {
                    //var KiemDuyetKhoaHoc = new LichSuKiemDuyetKhoaHoc
                    //{
                    //    IdDoiTuong = targetVersion.Id,
                    //    LoaiDoiTuong = "KhoaHoc",
                    //    TrangThaiPheDuyet = "DangDuyet"
                    //};

                    //await CreateAsync(KiemDuyetKhoaHoc);
                    //await SaveAsync();

                    targetVersion.TrangThaiPheDuyet = "DangDuyet";
                    targetVersion.TrangThai = "DangDuyet";

                    _khoaHocRepository.Update(targetVersion);
                    //_khoaHocRepository.SaveAsync();

                }

                foreach (var phan in phans)
                {
                    if (shouldStartReview
                        && (phan.TrangThaiPheDuyet == "ChoDuyet" || phan.TrangThaiPheDuyet == null))
                    {
                        phan.TrangThaiPheDuyet = "DangDuyet";
                        phan.TrangThai = "DangDuyet";

                        _phanRepository.Update(phan);
                        //await _phanRepository.SaveAsync();
                    }
                }

                foreach (var item in baiGiangs)
                {
                    if (shouldStartReview
                        && (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null))
                    {
                        item.TrangThaiPheDuyet = "DangDuyet";
                        item.TrangThai = "DangDuyet";

                        _baiGiangRepository.Update(item);
                        //await _taiLieuRepository.SaveAsync();

                    }
                }

                foreach (var item in taiLieus)
                {
                    if (shouldStartReview
                        && (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null))
                    {
                        item.TrangThaiPheDuyet = "DangDuyet";
                        item.TrangThai = "DangDuyet";

                        _taiLieuRepository.Update(item);
                        //await _taiLieuRepository.SaveAsync();
                    }
                }

                foreach (var item in baiKiemTras)
                {
                    if (shouldStartReview
                        && (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null))
                    {
                        item.TrangThaiPheDuyet = "DangDuyet";
                        item.TrangThai = "DangDuyet";

                        _baiKiemTraRepository.Update(item);
                        //await _baiKiemTraRepository.SaveAsync();
                    }
                }

                foreach (var item in cauHois)
                {
                    if (shouldStartReview
                        && (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null))
                    {
                        item.TrangThaiPheDuyet = "DangDuyet";
                        item.TrangThai = "DangDuyet";

                        _cauHoiRepository.Update(item);
                        //await _cauHoiRepository.SaveAsync();
                    }
                }

                // DapAn có TrangThai/TrangThaiPheDuyet riêng theo DTO → chuyển trạng thái tương tự
                foreach (var item in dapAns)
                {
                    if (shouldStartReview
                        && (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null))
                    {
                        item.TrangThaiPheDuyet = "DangDuyet";
                        item.TrangThai = "DangDuyet";

                        _dapAnRepository.Update(item);
                        //await _dapAnRepository.SaveAsync();
                    }
                }
            }

            

            // Lưu toàn bộ thay đổi trạng thái + lịch sử kiểm duyệt trong 1 lần
            await SaveAsync();

            // 4. Dựng cây lồng nhau: Phan -> BaiGiang -> TaiLieu, Phan -> BaiKiemTra -> CauHoi -> DapAn
            var taiLieuLookup = taiLieus.ToLookup(t => t.IdBaiGiang);
            var baiGiangLookup = baiGiangs.ToLookup(b => b.IdPhan);
            var lyDoBaiGiangLookup = lyDoBaiGiangs.ToLookup(l => l.IdDoiTuong);
            var dapAnLookup = dapAns.Where(d => d.IdCauHoi.HasValue).ToLookup(d => d.IdCauHoi.Value);
            var cauHoiLookup = cauHois.ToLookup(c => c.IdBaiKiemTra);
            var baiKiemTraLookup = baiKiemTras
                .Where(b => b.IdPhan.HasValue)
                .ToLookup(b => b.IdPhan.Value);
            var lyDoBaiKiemTraLookup = lyDoBaiKiemTras.ToLookup(l => l.IdDoiTuong);



            var phanDtos = phans.Select(p => new PhanChoDuyetDto
            {
                Id = p.Id,
                TenPhan = p.TenPhan,
                MieuTa = p.MieuTa,
                ThuTuSapXep = p.ThuTuSapXep,
                TrangThai = p.TrangThai,
                TrangThaiPheDuyet = p.TrangThaiPheDuyet,
                NgayTao = p.CreatedDate,
                IdKhoaHoc = p.IdKhoaHoc,
                IdBanGhiTruoc = p.IdBanGhiTruoc,
                IsBanHienTai = p.IsBanHienTai,

                BaiGiangs = baiGiangLookup[p.Id].Select(b => new BaiGiangChoDuyetDto
                {
                    IdBaiGiang = b.Id,
                    TieuDe = b.TieuDe,
                    LoaiBaiGiang = b.LoaiBaiGiang,
                    URLBaiGiang = b.URLBaiGiang,
                    ThoiLuong = b.ThoiLuong,
                    LaBaiGiangFree = b.LaBaiGiangFree,
                    TrangThai = b.TrangThai,
                    TrangThaiPheDuyet = b.TrangThaiPheDuyet,
                    IdPhan = b.IdPhan,
                    IsBanHienTai = b.IsBanHienTai,
                    IdBanGhiTruoc = b.IdBanGhiTruoc,
                    ThuTuSapXep = b.ThuTuSapXep,
                    LyDoTuChois = lyDoBaiGiangLookup[b.Id]
                        .OrderByDescending(l => l.CreatedDate)
                        .Select(l => new LyDoTuChoiDto { Id = l.Id, LyDo = l.LyDo })
                        .FirstOrDefault(),

                    TaiLieus = taiLieuLookup[b.Id].Select(t => new TaiLieuChoDuyetDto
                    {
                        IdTaiLieu = t.Id,
                        LoaiTaiLieu = t.LoaiTaiLieu,
                        TenTaiLieu = t.TenTaiLieu,
                        URL = t.URL,
                        IdDocument = t.IdDocument,
                        TrangThai = t.TrangThai,
                        TrangThaiPheDuyet = t.TrangThaiPheDuyet,
                        IdBaiGiang = t.IdBaiGiang
                    }).ToList()
                }).ToList(),

                BaiKiemTras = baiKiemTraLookup[p.Id].Select(bkt => new BaiKiemTraChoDuyetDto
                {
                    Id = bkt.Id,
                    TenBaiKiemTra = bkt.TenBaiKiemTra,
                    MoTa = bkt.MoTa,
                    DiemDat = bkt.DiemDat,
                    GioiHanThoiGian = bkt.GioiHanThoiGian,
                    ChoLamLai = bkt.ChoLamLai,
                    SoLanLamToiDa = bkt.SoLanLamToiDa,
                    IdPhan = bkt.IdPhan,
                    IsBanHienTai = bkt.IsBanHienTai,
                    IdBanGhiTruoc = bkt.IdBanGhiTruoc,
                    TrangThai = bkt.TrangThai,
                    TrangThaiPheDuyet = bkt.TrangThaiPheDuyet,
                    ThuTuSapXep = bkt.ThuTuSapXep,
                    LyDoTuChois = lyDoBaiKiemTraLookup[bkt.Id]
                        .OrderByDescending(l => l.CreatedDate)
                        .Select(l => new LyDoTuChoiDto { Id = l.Id, LyDo = l.LyDo })
                        .FirstOrDefault(),
                    CauHois = cauHoiLookup[bkt.Id].Select(c => new CauHoiChoDuyetDto
                    {
                        Id = c.Id,
                        IdBaiKiemTra = c.IdBaiKiemTra.Value,
                        TenCauHoi = c.TenCauHoi,
                        NoiDungCauHoi = c.NoiDungCauHoi,
                        DoKho = c.DoKho,
                        LoaiCauHoi = c.LoaiCauHoi,
                        ThuTuSapXep = c.ThuTuSapXep,

                        DapAns = dapAnLookup[c.Id].Select(d => new DapAnChoDuyetDto
                        {
                            Id = d.Id,
                            NoiDungDapAn = d.NoiDungDapAn,
                            LaDapAnDung = d.LaDapAnDung,
                            ThuTuSapXep = d.ThuTuSapXep,
                            IdCauHoi = d.IdCauHoi,
                            TrangThai = d.TrangThai,
                            TrangThaiPheDuyet = d.TrangThaiPheDuyet,
                            IdBanGhiTruoc = d.IdBanGhiTruoc,
                            IsBanHienTai = d.IsBanHienTai
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).ToList();

            // 5. Map thông tin Khóa học + gán cây Phần đã dựng ở trên
            var result = new KiemDuyetDetailDto
            {
                IdKhoaHoc = targetVersion.Id,
                TieuDe = targetVersion.TieuDe,
                MoTa = targetVersion.MoTa,
                GiaGoc = targetVersion.GiaGoc,
                LoaiKhoaHoc = targetVersion.LoaiKhoaHoc,
                HinhAnhKhoaHoc = targetVersion.HinhAnhKhoaHoc,
                CapDo = targetVersion.CapDo,
                TrangThai = targetVersion.TrangThai,
                TrangThaiPheDuyet = targetVersion.TrangThaiPheDuyet,
                IdBanGhiTruoc = targetVersion.IdBanGhiTruoc,
                IsBanHienTai = targetVersion.IsBanHienTai,
                CreateBy = targetVersion.CreatedBy,
                DanhMucs = tenDanhMucs,
                Phans = phanDtos,
                
            };

            return result;
        }

        #endregion


        #region GetListLichSuKiemDuyet
        public async Task<PagedList<KhoaHocKiemDuyetListDto>> GetListLichSuKiemDuyet(KhoaHocKiemDuyetSearchDto search, string role)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

            var khoaHocQuery = _khoaHocRepository.GetAll()
                 .Where(x =>
                    (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi" || x.TrangThaiPheDuyet == "XemXet"));

            if (string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase) && search.TrangThaiPheDuyet == "XemXet")
            {
                khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "XemXet");
            }
            else if (string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase))
            {
                khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi");
            }
            else if (string.Equals(role, "personnel", StringComparison.OrdinalIgnoreCase))
            {
                khoaHocQuery = khoaHocQuery.Where(x =>(x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi")
                    && (x.IdNguoiDuyet == userId || GetQueryable()
                        .Any(h => h.CreatedId == userId && h.IdDoiTuong == x.Id)));
            }

            // Lọc thêm theo trạng thái nếu có chỉ định
            if (!string.IsNullOrWhiteSpace(search.TrangThaiPheDuyet))
            {
                if (search.TrangThaiPheDuyet == "DaDuyet")
                {
                    khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "DaDuyet");
                }
                else if (search.TrangThaiPheDuyet == "TuChoi")
                {
                    khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "TuChoi");
                }
            }

            if (!string.IsNullOrWhiteSpace(search.Keyword))
                khoaHocQuery = khoaHocQuery.Where(x => x.TieuDe.Contains(search.Keyword));

            // Sắp xếp
            if (!string.IsNullOrEmpty(search.SapXepTen))
            {
                khoaHocQuery = search.SapXepTen switch
                {
                    "AZ" => khoaHocQuery.OrderBy(x => x.TieuDe ?? string.Empty),
                    "ZA" => khoaHocQuery.OrderByDescending(x => x.TieuDe ?? string.Empty),
                    _ => khoaHocQuery.OrderByDescending(x => x.CreatedDate)
                };
            }
            else if (!string.IsNullOrEmpty(search.SapXepNgay))
            {
                khoaHocQuery = search.SapXepNgay switch
                {
                    "Moi" => khoaHocQuery.OrderByDescending(x => x.CreatedDate), 
                    "Cu" => khoaHocQuery.OrderBy(x => x.CreatedDate),             
                    _ => khoaHocQuery.OrderByDescending(x => x.CreatedDate)
                };
            }
            else
            {
                khoaHocQuery = khoaHocQuery.OrderByDescending(x => x.CreatedDate);
            }

            if (search.IdNguoiDuyet.HasValue)
                khoaHocQuery = khoaHocQuery.Where(x => x.IdNguoiDuyet == search.IdNguoiDuyet.Value);

            if (search.idGiangVien.HasValue)
                khoaHocQuery = khoaHocQuery.Where(x => x.CreatedId == search.idGiangVien.Value);

            if (search.TuNgay.HasValue)
            {
                var tuNgay = search.TuNgay.Value.Date;
                khoaHocQuery = khoaHocQuery.Where(x => x.UpdatedDate >= tuNgay);
            }

            if (search.DenNgay.HasValue)
            {
                var sauDenNgay = search.DenNgay.Value.Date.AddDays(1);
                khoaHocQuery = khoaHocQuery.Where(x => x.UpdatedDate < sauDenNgay);
            }

            var query = khoaHocQuery.Select(x => new KhoaHocKiemDuyetListDto
            {
                IdKhoaHoc = x.Id,
                TieuDe = x.TieuDe,
                TrangThai = x.TrangThai,
                HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                CreateBy = x.CreatedBy,
                CreateDate = x.CreatedDate
            });

            return await PagedList<KhoaHocKiemDuyetListDto>.CreateAsync(query, search);
        }
        #endregion


        #region GetDetailLichSuKiemDuyet
        public async Task<KiemDuyetDetailDto> GetDetailLichSuKiemDuyet(Guid idKhoaHoc)
        {
            // 1. Lấy thông tin khóa học theo Id
            var targetVersion = await _khoaHocRepository.GetAll()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc);

            if (targetVersion == null)
                return null;

            // 2. Lấy toàn bộ cây dữ liệu với trạng thái DaDuyet hoặc TuChoi (KHÔNG UPDATE)
            var phans = await _phanRepository.GetAll()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == targetVersion.Id
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var phanIds = phans.Select(p => p.Id).ToList();

            var baiGiangs = await _baiGiangRepository.GetAll()
                .AsNoTracking()
                .Where(x => phanIds.Contains(x.IdPhan)
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiGiangIds = baiGiangs.Select(b => b.Id).ToList();

            var lyDoBaiGiangs = await _lyDoTuChoiRepository.GetAll()
               .Where(x => baiGiangIds.Contains(x.IdDoiTuong ?? Guid.Empty))
               .ToListAsync();

            var taiLieus = await _taiLieuRepository.GetAll()
                .AsNoTracking()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang)
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository.GetAll()
                .AsNoTracking()
                .Where(x => x.IdPhan.HasValue
                            && phanIds.Contains(x.IdPhan.Value)
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiKiemTraIds = baiKiemTras.Select(b => b.Id).ToList();

            var lyDoBaiKiemTras = await _lyDoTuChoiRepository.GetAll()
               .Where(x => baiKiemTraIds.Contains(x.IdDoiTuong ?? Guid.Empty))
               .ToListAsync();

            var cauHois = await _cauHoiRepository.GetAll()
                .AsNoTracking()
                .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois.Select(c => c.Id).ToList();

            var dapAns = await _dapAnRepository.GetAll()
                .AsNoTracking()
                .Where(x => x.IdCauHoi.HasValue
                            && cauHoiIds.Contains(x.IdCauHoi.Value)
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .ToListAsync();

            // 3. Lấy thông tin lịch sử kiểm duyệt
            var lichSuKiemDuyet = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDoiTuong == idKhoaHoc
                            && !x.IsDeleted
                            && (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi"))
                .OrderByDescending(x => x.NgayDuyet)
                .Select(x => new LichSuKiemDuyetDto
                {
                    Id = x.Id,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    LyDo = x.LyDo,
                    NgayDuyet = x.NgayDuyet,
                    NgayTao = x.CreatedDate
                })
                .FirstOrDefaultAsync();

            var tenDanhMucs = await _danhMuc_KhoaHocRepository.GetQueryable()
               .Where(x => x.IdKhoaHoc == idKhoaHoc)
               .Join(_danhMucRepository.GetQueryable(),
                     dk => dk.IdDanhMuc,
                     dm => dm.Id,
                     (dk, dm) => dm.TenDanhMuc)
               .ToListAsync();

            // 4. Dựng cây lồng nhau: Phan -> BaiGiang -> TaiLieu, Phan -> BaiKiemTra -> CauHoi -> DapAn
            var taiLieuLookup = taiLieus.ToLookup(t => t.IdBaiGiang);
            var baiGiangLookup = baiGiangs.ToLookup(b => b.IdPhan);
            var lyDoBaiGiangLookup = lyDoBaiGiangs.ToLookup(l => l.IdDoiTuong);
            var dapAnLookup = dapAns.Where(d => d.IdCauHoi.HasValue).ToLookup(d => d.IdCauHoi.Value);
            var cauHoiLookup = cauHois.ToLookup(c => c.IdBaiKiemTra);
            var baiKiemTraLookup = baiKiemTras
                .Where(b => b.IdPhan.HasValue)
                .ToLookup(b => b.IdPhan.Value);
            var lyDoBaiKiemTraLookup = lyDoBaiKiemTras.ToLookup(l => l.IdDoiTuong);

            var phanDtos = phans.Select(p => new PhanChoDuyetDto
            {
                Id = p.Id,
                TenPhan = p.TenPhan,
                MieuTa = p.MieuTa,
                ThuTuSapXep = p.ThuTuSapXep,
                TrangThai = p.TrangThai,
                TrangThaiPheDuyet = p.TrangThaiPheDuyet,
                NgayTao = p.CreatedDate,
                IdKhoaHoc = p.IdKhoaHoc,
                IdBanGhiTruoc = p.IdBanGhiTruoc,
                IsBanHienTai = p.IsBanHienTai,

                BaiGiangs = baiGiangLookup[p.Id].Select(b => new BaiGiangChoDuyetDto
                {
                    IdBaiGiang = b.Id,
                    TieuDe = b.TieuDe,
                    LoaiBaiGiang = b.LoaiBaiGiang,
                    URLBaiGiang = b.URLBaiGiang,
                    ThoiLuong = b.ThoiLuong,
                    LaBaiGiangFree = b.LaBaiGiangFree,
                    TrangThai = b.TrangThai,
                    TrangThaiPheDuyet = b.TrangThaiPheDuyet,
                    IdPhan = b.IdPhan,
                    IsBanHienTai = b.IsBanHienTai,
                    IdBanGhiTruoc = b.IdBanGhiTruoc,
                    LyDoTuChois = lyDoBaiGiangLookup[b.Id]
                     .OrderByDescending(l => l.CreatedDate)
                     .Select(l => new LyDoTuChoiDto { Id = l.Id, LyDo = l.LyDo })
                     .FirstOrDefault(),
                    TaiLieus = taiLieuLookup[b.Id].Select(t => new TaiLieuChoDuyetDto
                    {
                        IdTaiLieu = t.Id,
                        LoaiTaiLieu = t.LoaiTaiLieu,
                        TenTaiLieu = t.TenTaiLieu,
                        URL = t.URL,
                        IdDocument = t.IdDocument,
                        TrangThai = t.TrangThai,
                        TrangThaiPheDuyet = t.TrangThaiPheDuyet,
                        IdBaiGiang = t.IdBaiGiang
                    }).ToList()
                }).ToList(),

                BaiKiemTras = baiKiemTraLookup[p.Id].Select(bkt => new BaiKiemTraChoDuyetDto
                {
                    Id = bkt.Id,
                    TenBaiKiemTra = bkt.TenBaiKiemTra,
                    MoTa = bkt.MoTa,
                    DiemDat = bkt.DiemDat,
                    GioiHanThoiGian = bkt.GioiHanThoiGian,
                    ChoLamLai = bkt.ChoLamLai,
                    SoLanLamToiDa = bkt.SoLanLamToiDa,
                    IdPhan = bkt.IdPhan,
                    IsBanHienTai = bkt.IsBanHienTai,
                    IdBanGhiTruoc = bkt.IdBanGhiTruoc,
                    TrangThai = bkt.TrangThai,
                    TrangThaiPheDuyet = bkt.TrangThaiPheDuyet,
                    LyDoTuChois = lyDoBaiKiemTraLookup[bkt.Id]
                        .OrderByDescending(l => l.CreatedDate)
                        .Select(l => new LyDoTuChoiDto { Id = l.Id, LyDo = l.LyDo })
                        .FirstOrDefault(),
                    CauHois = cauHoiLookup[bkt.Id].Select(c => new CauHoiChoDuyetDto
                    {
                        Id = c.Id,
                        IdBaiKiemTra = c.IdBaiKiemTra.Value,
                        TenCauHoi = c.TenCauHoi,
                        NoiDungCauHoi = c.NoiDungCauHoi,
                        DoKho = c.DoKho,
                        LoaiCauHoi = c.LoaiCauHoi,
                        ThuTuSapXep = c.ThuTuSapXep,

                        DapAns = dapAnLookup[c.Id].Select(d => new DapAnChoDuyetDto
                        {
                            Id = d.Id,
                            NoiDungDapAn = d.NoiDungDapAn,
                            LaDapAnDung = d.LaDapAnDung,
                            ThuTuSapXep = d.ThuTuSapXep,
                            IdCauHoi = d.IdCauHoi,
                            TrangThai = d.TrangThai,
                            TrangThaiPheDuyet = d.TrangThaiPheDuyet,
                            IdBanGhiTruoc = d.IdBanGhiTruoc,
                            IsBanHienTai = d.IsBanHienTai
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).ToList();

            // 5. Map thông tin Khóa học + gán cây Phần + thông tin lịch sử kiểm duyệt
            var result = new KiemDuyetDetailDto
            {
                IdKhoaHoc = targetVersion.Id,
                TieuDe = targetVersion.TieuDe,
                MoTa = targetVersion.MoTa,
                GiaGoc = targetVersion.GiaGoc,
                LoaiKhoaHoc = targetVersion.LoaiKhoaHoc,
                HinhAnhKhoaHoc = targetVersion.HinhAnhKhoaHoc,
                CapDo = targetVersion.CapDo,
                TrangThaiPheDuyet = targetVersion.TrangThaiPheDuyet,
                CreateBy = targetVersion.CreatedBy,
                Phans = phanDtos,
                LichSuKiemDuyetDto = lichSuKiemDuyet,
                DanhMucs = tenDanhMucs
            };

            return result;
        }
        #endregion


        public async Task<PagedList<NhanVienPheDuyetDto>> GetNhanVienPheDuyet(NhanVienSearch search)
        {
            search.PageIndex = Math.Max(1, search.PageIndex);
            search.PageSize = Math.Clamp(search.PageSize, 1, 50);

            var personnelRoleIds = _eduverseContext.Set<AppRole>()
                .Where(role => role.NormalizedName == "PERSONNEL")
                .Select(role => role.Id);
            var personnelUserIds = _eduverseContext.Set<IdentityUserRole<Guid>>()
                .Where(userRole => personnelRoleIds.Contains(userRole.RoleId))
                .Select(userRole => userRole.UserId);

            var query = _eduverseContext.AppUsers
                .AsNoTracking()
                .Where(u => personnelUserIds.Contains(u.Id) && !u.IsDeleted)
                .Select(u => new NhanVienPheDuyetDto
                {
                    UserId = u.Id,
                    HoTen = u.HoTen,
                    Role = "personnel",
                    AnhDaiDien = u.AnhDaiDien,
                    SoLuongKhoaHocDuyet = _khoaHocRepository.GetQueryable()
                        .Count(k => k.IdNguoiDuyet == u.Id
                                 && !k.IsDeleted
                                 && k.IsBanHienTai
                                 && (k.TrangThaiPheDuyet == "ChoDuyet" || k.TrangThaiPheDuyet == "DangDuyet"))
                });

            // Từ khóa tìm theo tên (nếu có)
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(x => (x.HoTen ?? string.Empty).ToLower().Contains(keyword));
            }

            // Nhân viên chưa được phân khóa học nào
            if (search.ChuaCoKhoaHoc == true)
            {
                query = query.Where(x => x.SoLuongKhoaHocDuyet == 0);
            }

            // Sắp xếp theo số lượng khóa học
            if (!string.IsNullOrWhiteSpace(search.SapXepTheoSoLuongKhoaHoc))
            {
                if (search.SapXepTheoSoLuongKhoaHoc.Equals("asc", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.OrderBy(x => x.SoLuongKhoaHocDuyet).ThenBy(x => x.HoTen).ThenBy(x => x.UserId);
                }
                else if (search.SapXepTheoSoLuongKhoaHoc.Equals("desc", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.OrderByDescending(x => x.SoLuongKhoaHocDuyet).ThenBy(x => x.HoTen).ThenBy(x => x.UserId);
                }
                else
                {
                    query = query.OrderBy(x => x.HoTen).ThenBy(x => x.UserId);
                }
            }
            else
            {
                query = query.OrderBy(x => x.HoTen).ThenBy(x => x.UserId);
            }

            return await PagedList<NhanVienPheDuyetDto>.CreateAsync(query, search);
        }


        public async Task<PhanCongKiemDuyetResultDto> PhanDuyetKhoaHoc(Guid idNguoiDuyet, List<Guid>? danhSachKhoaHocId)
        {
            var principal = _httpContextAccessor?.HttpContext?.User;
            if (principal?.Identity?.IsAuthenticated != true
                || !Guid.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
                throw new PhanCongKiemDuyetException(StatusCodes.Status401Unauthorized, "Bạn cần đăng nhập để phân công khóa học.");
            if (!principal.IsInRole("Admin"))
                throw new PhanCongKiemDuyetException(StatusCodes.Status403Forbidden, "Chỉ Admin được phân công khóa học.");
            if (idNguoiDuyet == Guid.Empty)
                throw new PhanCongKiemDuyetException(StatusCodes.Status400BadRequest, "ID chuyên viên không hợp lệ.");
            var ids = PhanCongKiemDuyetValidator.NormalizeCourseIds(danhSachKhoaHocId);
            var reviewer = await _eduverseContext.AppUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idNguoiDuyet && !x.IsDeleted);
            if (reviewer == null)
                throw new PhanCongKiemDuyetException(StatusCodes.Status404NotFound, "Không tìm thấy chuyên viên kiểm duyệt.");

            var reviewerIsPersonnel = await (
                from userRole in _eduverseContext.Set<IdentityUserRole<Guid>>()
                join role in _eduverseContext.Set<AppRole>() on userRole.RoleId equals role.Id
                where userRole.UserId == idNguoiDuyet && role.NormalizedName == "PERSONNEL"
                select userRole.UserId).AnyAsync();
            if (!reviewerIsPersonnel)
                throw new PhanCongKiemDuyetException(StatusCodes.Status400BadRequest, "Người được chọn không còn vai trò personnel.");

            var assignedAt = DateTime.Now;
            var executionStrategy = _eduverseContext.Database.CreateExecutionStrategy();
            await executionStrategy.ExecuteAsync(async () =>
            {
                foreach (var entry in _eduverseContext.ChangeTracker
                    .Entries<PhanCongKiemDuyetKhoaHoc>()
                    .Where(entry => entry.State == EntityState.Added && ids.Contains(entry.Entity.IdKhoaHoc)))
                {
                    entry.State = EntityState.Detached;
                }

                await using var transaction = await _eduverseContext.Database
                    .BeginTransactionAsync(IsolationLevel.Serializable);
                try
                {
                    var courses = await _eduverseContext.Set<KhoaHoc>()
                        .AsNoTracking()
                        .Where(x => ids.Contains(x.Id))
                        .Select(x => new { x.Id, x.IsDeleted, x.IsBanHienTai, x.TrangThaiPheDuyet, x.IdNguoiDuyet })
                        .ToListAsync();

                    var foundIds = courses.Select(x => x.Id).ToHashSet();
                    var missingIds = ids.Where(id => !foundIds.Contains(id)).ToList();
                    if (missingIds.Count > 0)
                        throw new PhanCongKiemDuyetException(StatusCodes.Status404NotFound,
                            $"Không tìm thấy {missingIds.Count} khóa học.", missingIds);

                    var invalidIds = courses
                        .Where(x => x.IsDeleted || !x.IsBanHienTai
                            || (x.TrangThaiPheDuyet != "ChoDuyet" && x.TrangThaiPheDuyet != "DangDuyet"))
                        .Select(x => x.Id)
                        .ToList();
                    if (invalidIds.Count > 0)
                        throw new PhanCongKiemDuyetException(StatusCodes.Status409Conflict,
                            "Một hoặc nhiều khóa học không còn đủ điều kiện phân công.", invalidIds);

                    var updatedRows = await _eduverseContext.Set<KhoaHoc>()
                        .Where(x => ids.Contains(x.Id) && !x.IsDeleted && x.IsBanHienTai
                            && (x.TrangThaiPheDuyet == "ChoDuyet" || x.TrangThaiPheDuyet == "DangDuyet"))
                        .ExecuteUpdateAsync(setters => setters
                            .SetProperty(x => x.IdNguoiDuyet, idNguoiDuyet)
                            .SetProperty(x => x.UpdatedDate, assignedAt)
                            .SetProperty(x => x.UpdatedId, userId)
                            .SetProperty(x => x.UpdatedBy, principal.Identity!.Name));

                    if (updatedRows != ids.Count)
                        throw new PhanCongKiemDuyetException(StatusCodes.Status409Conflict,
                            "Một hoặc nhiều khóa học không còn đủ điều kiện phân công. Danh sách đã được làm mới.", ids);

                    var histories = ids.Select(courseId => new PhanCongKiemDuyetKhoaHoc
                    {
                        Id = Guid.NewGuid(),
                        IdKhoaHoc = courseId,
                        IdNguoiDuyet = idNguoiDuyet,
                        IdNguoiPhanCong = userId,
                        NgayPhanCong = assignedAt
                    });
                    await _eduverseContext.phanCongKiemDuyetKhoaHocs.AddRangeAsync(histories);
                    await _eduverseContext.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (PhanCongKiemDuyetException)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
                catch (DbUpdateException exception)
                {
                    await transaction.RollbackAsync();
                    _logger.LogWarning(exception, "Xung đột khi phân công {CourseCount} khóa học", ids.Count);
                    throw new PhanCongKiemDuyetException(StatusCodes.Status409Conflict,
                        "Một hoặc nhiều khóa học vừa được Admin khác phân công. Vui lòng tải lại danh sách.", ids);
                }
            });

            try
            {
                await _notificationPublisher.NotifyUserAsync(idNguoiDuyet, new NotificationPayload
                {
                    TieuDe = "Bạn có khóa học mới cần kiểm duyệt",
                    NoiDung = $"Bạn vừa được phân công kiểm duyệt {ids.Count} khóa học.",
                    LoaiThongBao = "PhanCongKiemDuyetKhoaHoc",
                    Link = "/personnel/approve-courses",
                    FromUser = userId,
                    ItemName = $"{ids.Count} khóa học"
                });
            }
            catch (Exception exception)
            {
                _logger.LogError(exception,
                    "Đã phân công khóa học nhưng gửi thông báo cho chuyên viên {ReviewerId} thất bại", idNguoiDuyet);
            }

            return new PhanCongKiemDuyetResultDto
            {
                IdNguoiDuyet = idNguoiDuyet,
                TenNguoiDuyet = reviewer.HoTen ?? reviewer.UserName ?? "Chuyên viên",
                SoKhoaHocDaPhan = ids.Count,
                DanhSachKhoaHocId = ids,
                NgayPhanCong = assignedAt
            };
        }


        #region KiemDuyetKhoaHoc
        public async Task<KiemDuyetKhoaHocDto> KiemDuyetFullKhoaHoc(KiemDuyetKhoaHocRequest request)
        {
            // ── Kiểm tra quyền ──────────────────────────────────
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var approvePrincipal = _httpContextAccessor.HttpContext?.User;
            var role = approvePrincipal?.IsInRole("Admin") == true
                ? "Admin"
                : approvePrincipal?.IsInRole("personnel") == true ? "personnel" : null;
            var allowedRoles = new[] { "Admin", "personnel" };

            if (role == null || !allowedRoles.Contains(role))
                throw new UnauthorizedAccessException("Chỉ Admin hoặc nhân viên kiểm duyệt mới có quyền truy cập");

            //var currentReview = await GetQueryable()
            //    .FirstOrDefaultAsync(x => x.IdDoiTuong == request.IdKhoaHoc && x.CreatedId == userId);
            //if (role == "personnel" && currentReview == null)
            //    throw new Exception("Khóa học này đã có người khác đang duyệt!");

            if (request.TrangThaiPheDuyet == null)
                throw new Exception("Vui lòng chọn Duyệt khóa học ");

            if (request.TrangThaiPheDuyet != "TuChoi" && request.TrangThaiPheDuyet != "DaDuyet")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối.");

            var khoaHoc = await _khoaHocRepository.GetByIdAsync(request.IdKhoaHoc);
            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (role == "personnel" && khoaHoc.IdNguoiDuyet != userId)
                throw new UnauthorizedAccessException("Bạn chỉ được duyệt khóa học được phân công cho mình.");

            if (khoaHoc.TrangThaiPheDuyet != "ChoDuyet" && khoaHoc.TrangThaiPheDuyet != "DangDuyet" && khoaHoc.TrangThaiPheDuyet != "DaDuyet")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");


            var ngayDuyet = DateTime.Now;

            // ── Lấy toàn bộ cây con của khóa học ──────────────────
            var phans = await _phanRepository
                .GetQueryable()
                .Where(x => x.IdKhoaHoc == khoaHoc.Id)
                .ToListAsync();

            var idPhans = phans.Select(x => x.Id).ToList();

            var baiGiangs = await _baiGiangRepository
                .GetQueryable()
                .Where(x => idPhans.Contains(x.IdPhan))
                .ToListAsync();

            var idBaiGiangs = baiGiangs.Select(x => x.Id).ToList();

            var lyDoBaiGiangs = await _lyDoTuChoiRepository.GetQueryable().Where(x => idBaiGiangs.Contains(x.IdDoiTuong ?? Guid.Empty)).ToListAsync();

            var taiLieus = await _taiLieuRepository
                .GetQueryable()
                .Where(x => idBaiGiangs.Contains(x.IdBaiGiang))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository
                .GetQueryable()
                .Where(x => idPhans.Contains(x.IdPhan.Value))
                .ToListAsync();

            var idBaiKiemTras = baiKiemTras.Select(x => x.Id).ToList();

            var lyDoBaiKiemTras = await _lyDoTuChoiRepository.GetQueryable().Where(x => idBaiKiemTras.Contains(x.IdDoiTuong ?? Guid.Empty)).ToListAsync();

            var cauHois = await _cauHoiRepository
                .GetQueryable()
                .Where(x => idBaiKiemTras.Contains(x.IdBaiKiemTra.Value))
                .ToListAsync();

            var idCauHois = cauHois.Select(x => x.Id).ToList();
            var dapAns = await _dapAnRepository
                .GetQueryable()
                .Where(x => idCauHois.Contains(x.IdCauHoi.Value))
                .ToListAsync();

            var lichSuKiemDuyet = await GetQueryable().Where(x => x.IdDoiTuong == request.IdKhoaHoc).FirstOrDefaultAsync();
            if(lichSuKiemDuyet != null)
            {
                await DeleteAsync(lichSuKiemDuyet);
            }

            //var GetLichSuKiemDuyetKhoaHoc = currentReview;
            // ngừng hoạt động
            if(khoaHoc.TrangThaiPheDuyet == "DaDuyet" && request.TrangThaiPheDuyet == "TuChoi")
            {
                khoaHoc.TrangThaiPheDuyet = "XemXet";
                khoaHoc.TrangThai = "NgungHoatDong";
                khoaHoc.UpdatedBy = khoaHoc.UpdatedBy;
                khoaHoc.UpdatedId = khoaHoc.UpdatedId;
                khoaHoc.UpdatedDate = khoaHoc.UpdatedDate;
                _khoaHocRepository.Update(khoaHoc);
                await _khoaHocRepository.SaveAsync();

                foreach (var phan in phans)
                {
                    phan.TrangThaiPheDuyet = "DaDuyet";
                    phan.TrangThai = "NgungHoatDong";
                    phan.UpdatedBy = phan.UpdatedBy;
                    phan.UpdatedId = phan.UpdatedId;
                    phan.UpdatedDate = phan.UpdatedDate;
                    _phanRepository.Update(phan);
                    //await _phanRepository.SaveAsync();
                }

                foreach (var bg in baiGiangs)
                {
                    bg.TrangThaiPheDuyet = "DaDuyet";
                    bg.TrangThai = "NgungHoatDong";
                    bg.UpdatedBy = bg.UpdatedBy;
                    bg.UpdatedId = bg.UpdatedId;
                    bg.UpdatedDate = bg.UpdatedDate;
                    _baiGiangRepository.Update(bg);
                    //await _baiGiangRepository.SaveAsync();
                }

                foreach (var tl in taiLieus)
                {
                    tl.TrangThaiPheDuyet = "DaDuyet";
                    tl.TrangThai = "NgungHoatDong";
                    tl.UpdatedBy = tl.UpdatedBy;
                    tl.UpdatedId = tl.UpdatedId;
                    tl.UpdatedDate = tl.UpdatedDate;
                    _taiLieuRepository.Update(tl);
                    //await _taiLieuRepository.SaveAsync();
                }

                foreach (var bkt in baiKiemTras)
                {
                    bkt.TrangThaiPheDuyet = "DaDuyet";
                    bkt.TrangThai = "NgungHoatDong";
                    bkt.UpdatedBy = bkt.UpdatedBy;
                    bkt.UpdatedId = bkt.UpdatedId;
                    bkt.UpdatedDate = bkt.UpdatedDate;
                    _baiKiemTraRepository.Update(bkt);
                    //await _baiKiemTraRepository.SaveAsync();
                }

                foreach (var ch in cauHois)
                {
                    ch.TrangThaiPheDuyet = "DaDuyet";
                    ch.TrangThai = "NgungHoatDong";
                    ch.UpdatedBy = ch.UpdatedBy;
                    ch.UpdatedId = ch.UpdatedId;
                    ch.UpdatedDate = ch.UpdatedDate;
                    _cauHoiRepository.Update(ch);
                    //await _cauHoiRepository.SaveAsync();
                }

                foreach (var da in dapAns)
                {
                    da.TrangThaiPheDuyet = "DaDuyet";
                    da.TrangThai = "NgungHoatDong";
                    da.UpdatedBy = da.UpdatedBy;
                    da.UpdatedId = da.UpdatedId;
                    da.UpdatedDate = da.UpdatedDate;
                    _dapAnRepository.Update(da);
                    //await _dapAnRepository.SaveAsync();
                }

                var currentReview = new LichSuKiemDuyetKhoaHoc
                {
                    IdDoiTuong = khoaHoc.Id,
                    IdNguoiDuyet = userId,
                    LoaiDoiTuong = "XemXetKhoaHoc",
                    LyDo = request.LyDo,
                    NgayDuyet = DateTime.UtcNow,
                    TrangThaiPheDuyet = request.TrangThaiPheDuyet
                };
                await CreateAsync(currentReview);
                await SaveAsync();

                if (khoaHoc.CreatedId.HasValue)
                {
           
                    await _notificationPublisher.NotifyUserAsync(khoaHoc.CreatedId.Value, new NotificationPayload
                    {
                        TieuDe = "Khóa học của bạn đã được chúng tôi xem xét lại và đã không đạt yêu cầu",
                        NoiDung = $"Khóa học {khoaHoc.TieuDe} đã được chúng tôi xem xét lại và đã có những vi phạm. Nhấp vào để biết chi tiết hơn ",
                        LoaiThongBao =   "XemXetLaiKhoaHoc" ,
                        Link = $"/instructor/manager-courses/{khoaHoc.Id}/manager",
                        FromUser = khoaHoc.CreatedId,
                        ItemId = khoaHoc.Id,
                        ItemName = khoaHoc.TieuDe
                    });
                }
            }
            else
            {
                // ── TuChoi ──────────────────────────────────────────
                if (request.TrangThaiPheDuyet == "TuChoi")
                {
                    khoaHoc.TrangThaiPheDuyet = "TuChoi";
                    khoaHoc.TrangThai = "DaXoa";
                    khoaHoc.UpdatedBy = khoaHoc.UpdatedBy;
                    khoaHoc.UpdatedId = khoaHoc.UpdatedId;
                    khoaHoc.UpdatedDate = khoaHoc.UpdatedDate;
                    _khoaHocRepository.Update(khoaHoc);
                    //await _khoaHocRepository.SaveAsync();

                    foreach (var phan in phans)
                    {
                        phan.TrangThaiPheDuyet = "TuChoi";
                        phan.TrangThai = "DaXoa";
                        phan.UpdatedBy = phan.UpdatedBy;
                        phan.UpdatedId = phan.UpdatedId;
                        phan.UpdatedDate = phan.UpdatedDate;
                        _phanRepository.Update(phan);
                        await _phanRepository.SaveAsync();
                    }

                    foreach (var bg in baiGiangs)
                    {
                        bg.TrangThaiPheDuyet = "TuChoi";
                        bg.TrangThai = "DaXoa";
                        bg.UpdatedBy = bg.UpdatedBy;
                        bg.UpdatedId = bg.UpdatedId;
                        bg.UpdatedDate = bg.UpdatedDate;
                        _baiGiangRepository.Update(bg);
                        //await _baiGiangRepository.SaveAsync();
                    }

                    foreach (var tl in taiLieus)
                    {
                        tl.TrangThaiPheDuyet = "TuChoi";
                        tl.TrangThai = "DaXoa";
                        tl.UpdatedBy = tl.UpdatedBy;
                        tl.UpdatedId = tl.UpdatedId;
                        tl.UpdatedDate = tl.UpdatedDate;
                        _taiLieuRepository.Update(tl);
                        //await _taiLieuRepository.SaveAsync();
                    }

                    foreach (var bkt in baiKiemTras)
                    {
                        bkt.TrangThaiPheDuyet = "TuChoi";
                        bkt.TrangThai = "DaXoa";
                        bkt.UpdatedBy = bkt.UpdatedBy;
                        bkt.UpdatedId = bkt.UpdatedId;
                        bkt.UpdatedDate = bkt.UpdatedDate;
                        _baiKiemTraRepository.Update(bkt);
                        //await _baiKiemTraRepository.SaveAsync();
                    }

                    foreach (var ch in cauHois)
                    {
                        ch.TrangThaiPheDuyet = "TuChoi";
                        ch.TrangThai = "DaXoa";
                        ch.UpdatedBy = ch.UpdatedBy;
                        ch.UpdatedId = ch.UpdatedId;
                        ch.UpdatedDate = ch.UpdatedDate;
                        _cauHoiRepository.Update(ch);
                        //await _cauHoiRepository.SaveAsync();
                    }

                    foreach (var da in dapAns)
                    {
                        da.TrangThaiPheDuyet = "TuChoi";
                        da.TrangThai = "DaXoa";
                        da.UpdatedBy = da.UpdatedBy;
                        da.UpdatedId = da.UpdatedId;
                        da.UpdatedDate = da.UpdatedDate;
                        _dapAnRepository.Update(da);
                        //await _dapAnRepository.SaveAsync();
                    }
               

                    //var currentReview = new LichSuKiemDuyetKhoaHoc
                    //{
                    //    IdDoiTuong = khoaHoc.Id,
                    //    IdNguoiDuyet = userId,
                    //    LoaiDoiTuong = "KhoaHoc",
                    //    NgayDuyet = DateTime.UtcNow,
                    //    TrangThaiPheDuyet = request.TrangThaiPheDuyet
                    //};
                    //await CreateAsync(currentReview);
                    //await SaveAsync();
                }
                // ── DaDuyet ─────────────────────────────────────────
                else
                {
                    var lydoBaiGiangs = await _lyDoTuChoiRepository.GetQueryable().Where(x => idBaiGiangs.Contains(x.IdDoiTuong ?? Guid.Empty)).ToListAsync();

                    if (lydoBaiGiangs.Any())
                    {
                        foreach (var item in lydoBaiGiangs)
                        {
                            item.TrangThai = "DaXoa";
                            _lyDoTuChoiRepository.Delete(item);
                        }
                        await _lyDoTuChoiRepository.SaveAsync();
                    }

                    khoaHoc.TrangThaiPheDuyet = "DaDuyet";
                    khoaHoc.TrangThai = "HoatDong";
                    khoaHoc.UpdatedBy = khoaHoc.UpdatedBy;
                    khoaHoc.UpdatedId = khoaHoc.UpdatedId;
                    khoaHoc.UpdatedDate = khoaHoc.UpdatedDate;
                    _khoaHocRepository.Update(khoaHoc);
                    //await _khoaHocRepository.SaveAsync();

                    foreach (var phan in phans)
                    {
                        phan.TrangThaiPheDuyet = "DaDuyet";
                        phan.TrangThai = "HoatDong";
                        phan.UpdatedBy = phan.UpdatedBy;
                        phan.UpdatedId = phan.UpdatedId;
                        phan.UpdatedDate = phan.UpdatedDate;
                        _phanRepository.Update(phan);
                        //await _phanRepository.SaveAsync();
                    }

                    foreach (var bg in baiGiangs)
                    {
                        bg.TrangThaiPheDuyet = "DaDuyet";
                        bg.TrangThai = "HoatDong";
                        bg.UpdatedBy = bg.UpdatedBy;
                        bg.UpdatedId = bg.UpdatedId;
                        bg.UpdatedDate = bg.UpdatedDate;
                        _baiGiangRepository.Update(bg);
                        //await _baiGiangRepository.SaveAsync();
                    }

                    foreach (var tl in taiLieus)
                    {
                        tl.TrangThaiPheDuyet = "DaDuyet";
                        tl.TrangThai = "HoatDong";
                        tl.UpdatedBy = tl.UpdatedBy;
                        tl.UpdatedId = tl.UpdatedId;
                        tl.UpdatedDate = tl.UpdatedDate;
                        _taiLieuRepository.Update(tl);
                        //await _taiLieuRepository.SaveAsync();
                    }

                    foreach (var bkt in baiKiemTras)
                    {
                        bkt.TrangThaiPheDuyet = "DaDuyet";
                        bkt.TrangThai = "HoatDong";
                        bkt.UpdatedBy = bkt.UpdatedBy;
                        bkt.UpdatedId = bkt.UpdatedId;
                        bkt.UpdatedDate = bkt.UpdatedDate;
                        _baiKiemTraRepository.Update(bkt);
                        //await _baiKiemTraRepository.SaveAsync();
                    }

                    foreach (var ch in cauHois)
                    {
                        ch.TrangThaiPheDuyet = "DaDuyet";
                        ch.TrangThai = "HoatDong";
                        ch.UpdatedBy = ch.UpdatedBy;
                        ch.UpdatedId = ch.UpdatedId;
                        ch.UpdatedDate = ch.UpdatedDate;
                        _cauHoiRepository.Update(ch);
                        //await _cauHoiRepository.SaveAsync();
                    }

                    foreach (var da in dapAns)
                    {
                        da.TrangThaiPheDuyet = "DaDuyet";
                        da.TrangThai = "HoatDong";
                        da.UpdatedBy = da.UpdatedBy;
                        da.UpdatedId = da.UpdatedId;
                        da.UpdatedDate = da.UpdatedDate;
                        _dapAnRepository.Update(da);
                        //await _dapAnRepository.SaveAsync();
                    }

                    //if (GetLichSuKiemDuyetKhoaHoc != null)
                    //{
                    //    GetLichSuKiemDuyetKhoaHoc.TrangThaiPheDuyet = request.TrangThaiPheDuyet;
                    //    GetLichSuKiemDuyetKhoaHoc.LyDo = request.LyDo;

                    //    GetLichSuKiemDuyetKhoaHoc.NgayDuyet = DateTime.UtcNow;
                    //    GetLichSuKiemDuyetKhoaHoc.IdNguoiDuyet = userId;
                    //    await UpdateAsync(GetLichSuKiemDuyetKhoaHoc);
                    //    await SaveAsync();
                    //}

                    //update đăng kí khóa học 
                    var dangkikhoahoc = await _dangKyKhoaHocRepository.GetQueryable().Where(x => x.IdKhoaHoc == khoaHoc.IdBanGhiTruoc).ToListAsync();
                    if (dangkikhoahoc.Any())
                    {
                        await CapNhatDangKyKhoaHoc(khoaHoc.Id, khoaHoc.IdBanGhiTruoc.Value);
                    }

                }

                var currentReview = new LichSuKiemDuyetKhoaHoc
                {
                    IdDoiTuong = khoaHoc.Id,
                    IdNguoiDuyet = userId,
                    LoaiDoiTuong = "KhoaHoc",
                    NgayDuyet = DateTime.UtcNow,
                    TrangThaiPheDuyet = request.TrangThaiPheDuyet
                };
                await CreateAsync(currentReview);
                await SaveAsync();

                if (khoaHoc.CreatedId.HasValue)
                {
                    var approved = request.TrangThaiPheDuyet == "DaDuyet";
                    await _notificationPublisher.NotifyUserAsync(khoaHoc.CreatedId.Value, new NotificationPayload
                    {
                        TieuDe = approved ? "Khóa học đã được phê duyệt" : "Khóa học bị từ chối",
                        NoiDung = approved
                            ? $"Khóa học '{khoaHoc.TieuDe}' đã được phê duyệt và xuất bản."
                            : $"Khóa học '{khoaHoc.TieuDe}' bị từ chối. Lý do: {request.LyDo}",
                        LoaiThongBao = approved ? "KhoaHocDaDuyet" : "KhoaHocTuChoi",
                        Link = $"/instructor/manager-courses/{khoaHoc.Id}/manager",
                        FromUser = khoaHoc.CreatedId,
                        ItemId = khoaHoc.Id,
                        ItemName = khoaHoc.TieuDe
                    });
                }
            }

            return new KiemDuyetKhoaHocDto
            {
                IdDoiTuong = request.IdKhoaHoc,
                LoaiDoiTuong = "KhoaHoc",
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                LyDo = request.TrangThaiPheDuyet == "TuChoi" ? request.LyDo : "Khóa học đã được chấp thuận",
                NgayDuyet = ngayDuyet
            };
        }

        private class DangKyMapping
        {
            public Guid IdDangKyCu { get; set; }
            public Guid IdDangKyMoi { get; set; }
            public Guid IdNguoiDangKi { get; set; }
        }

        private async Task<List<DangKyMapping>> CapNhatDangKyKhoaHoc(Guid idKhoaHocMoi, Guid idKhoaHocCu)
        {
            try
            {
                var danhSachDangKyCu = await _dangKyKhoaHocRepository.GetQueryable()
                    .Where(x => x.IdKhoaHoc == idKhoaHocCu && !x.IsDeleted)
                    .ToListAsync();

                if (!danhSachDangKyCu.Any())
                    return new List<DangKyMapping>();

                var mappingList = new List<DangKyMapping>();
                var danhSachDangKyMoi = new List<DangKyKhoaHoc>();

                foreach (var dkCu in danhSachDangKyCu)
                {
                    var dkMoi = new DangKyKhoaHoc
                    {
                        Id = Guid.NewGuid(),
                        IdKhoaHoc = idKhoaHocMoi,
                        IdNguoiDangKi = dkCu.IdNguoiDangKi,
                        TrangThai = dkCu.TrangThai,
                        GiaDangKy = dkCu.GiaDangKy,
                        ThoiGianDK = dkCu.ThoiGianDK,
                        IsDangKy = dkCu.IsDangKy,
                        NgayHetHan = dkCu.NgayHetHan,
                    };

                    danhSachDangKyMoi.Add(dkMoi);
                    mappingList.Add(new DangKyMapping
                    {
                        IdDangKyCu = dkCu.Id,
                        IdDangKyMoi = dkMoi.Id,
                        IdNguoiDangKi = dkCu.IdNguoiDangKi.Value
                    });
                }

                var khoaHocs = await _khoaHocRepository.GetQueryable()
                    .Select(x => new
                    {
                        x.Id,
                        x.TieuDe
                    })
                    .ToDictionaryAsync(x => x.Id);

                foreach (var item in danhSachDangKyMoi)
                {
                    khoaHocs.TryGetValue(item.IdKhoaHoc ?? Guid.Empty, out var khoaHoc);
                    _thongBaoRepository.Add(new ThongBao
                    {
                        TieuDe = "Khóa học vừa có bản cập nhật",
                        NoiDung = $"Khóa học '{khoaHoc.TieuDe}' vừa có bản nhập nhật mới.",
                        Link = $"/student/courses/my-courses/learning/{item.IdKhoaHoc}",
                        DaDoc = false,
                        ThoiGianTao = DateTime.Now,
                        TrangThai = "MoiNhan",
                        LoaiThongBao = "KhoaHoc",
                        IdNguoiDung = item.IdNguoiDangKi,
                    });
                    await _thongBaoRepository.SaveAsync();

                    
                    _dangKyKhoaHocRepository.Add(item);
                    await SaveAsync();
                }
                await _dangKyKhoaHocRepository.SaveAsync();

                foreach (var dkCu in danhSachDangKyCu)
                {
                    dkCu.IsDeleted = true;
                    _dangKyKhoaHocRepository.Delete(dkCu);
                }
                await _dangKyKhoaHocRepository.SaveAsync();

                await CapNhatTienDoHoc(idKhoaHocMoi,idKhoaHocCu, mappingList);

                return mappingList;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi cập nhật đăng ký khóa học: {ex.Message}", ex);
            }
        }


        private async Task<bool> CapNhatTienDoHoc(Guid idKhoaHocMoi,Guid idKhoaHocCu,List<DangKyMapping> danhSachMappingDangKy)
        {
            try
            {
                // 1. Lấy mapping bài giảng cũ -> mới
                // Đồng thời lấy IdVideo của cả 2 bài giảng để so sánh
                var baiGiangs = await (
                    from p in _phanRepository.GetQueryable()
                    join bgMoi in _baiGiangRepository.GetQueryable()
                        on p.Id equals bgMoi.IdPhan
                    join bgCu in _baiGiangRepository.GetQueryable()
                        on bgMoi.IdBanGhiTruoc equals bgCu.Id
                    where p.IdKhoaHoc == idKhoaHocMoi
                          && !p.IsDeleted
                          && !bgMoi.IsDeleted
                          && !bgCu.IsDeleted
                    select new
                    {
                        IdBaiGiangMoi = bgMoi.Id,
                        IdBaiGiangCu = bgCu.Id,

                        IdVideoMoi = bgMoi.IdVideoBaiGiang,
                        IdVideoCu = bgCu.IdVideoBaiGiang
                    }
                ).ToListAsync();

                if (!baiGiangs.Any())
                    return true;

                // 2. Chỉ giữ những bài giảng có cùng video
                var baiGiangMapping = baiGiangs
                    .Where(x => x.IdVideoMoi == x.IdVideoCu)
                    .ToList();

                if (!baiGiangMapping.Any())
                    return true;

                // Mapping:
                // IdBaiGiangCu -> IdBaiGiangMoi
                var mapBaiGiang = baiGiangMapping.ToDictionary(x => x.IdBaiGiangCu,x => x.IdBaiGiangMoi);

                // 3. Mapping đăng ký cũ -> mới
                var mapDangKy = danhSachMappingDangKy.ToDictionary(x => x.IdDangKyCu,x => x.IdDangKyMoi);

                // 4. Lấy toàn bộ tiến độ của các bài giảng cũ
                var baiGiangCuIds = baiGiangMapping
                    .Select(x => x.IdBaiGiangCu)
                    .Distinct()
                    .ToList();

                var tienDos = await _tienDoHocTapRepository
                    .GetQueryable()
                    .Where(x =>x.IdBaiGiang.HasValue && baiGiangCuIds.Contains(x.IdBaiGiang.Value))
                    .ToListAsync();

                foreach (var tienDo in tienDos)
                {
                    if (!tienDo.IdDangKi.HasValue ||
                        !tienDo.IdBaiGiang.HasValue)
                    {
                        continue;
                    }

                    // Tìm bài giảng mới tương ứng
                    if (!mapBaiGiang.TryGetValue(tienDo.IdBaiGiang.Value,out var idBaiGiangMoi))
                    {
                        continue;
                    }

                    // Tìm đăng ký mới tương ứng
                    if (!mapDangKy.TryGetValue(tienDo.IdDangKi.Value, out var idDangKyMoi))
                    {
                        _logger?.LogWarning(
                            "Khong tim thay dang ky moi tuong ung " +
                            "(IdTienDo={IdTienDo}, IdDangKyCu={IdDangKyCu})",
                            tienDo.Id,
                            tienDo.IdDangKi);

                        continue;
                    }

                    // Chỉ những bài giảng có cùng IdVideo
                    tienDo.IdDangKi = idDangKyMoi;
                    tienDo.IdBaiGiang = idBaiGiangMoi;
                    _tienDoHocTapRepository.Update(tienDo);
                }
                await _tienDoHocTapRepository.SaveAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Lỗi cập nhật tiến độ học: {ex.Message}",
                    ex);
            }
        }
        #endregion


        #region KiemDuyetInputAIandThuCong
        public async Task KiemTraVaNemExceptionAsync(string noiDung)
        {
            if (string.IsNullOrWhiteSpace(noiDung)) return;

            //// 1. Kiểm tra từ cấm cơ bản (luôn thực hiện)
            //var listtucam = TuCams._tuCam;
            //var tuTimThay = listtucam.Where(t => noiDung.ToLower().Contains(t)).ToList();
            //if (tuTimThay.Any())
            //{
            //    throw new KiemDuyetException(
            //        $"Noi dung chua tu ngu nhay cam: {string.Join(", ", tuTimThay)}",
            //        "TuCamCoBan",
            //        tuTimThay,
            //        "Vui long loai bo cac tu ngu khong phu hop"
            //    );
            //}

            try
            {
                var ketQua = await _geminiService.KiemDuyetInputAsync(noiDung);

                if (!ketQua.HopLe)
                {
                    throw new KiemDuyetException(
                        ketQua.ThongBao ?? "Noi dung vi pham",
                        ketQua.Loai ?? "ViPham",
                        ketQua.TuViPham ?? new List<string>(),
                        ketQua.GoiYSua
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini service unavailable, falling back to basic word filter only");
   
            }
        }
        #endregion


        #region KiemDuyetOuputAI
        //// ===============================================================
        //// 1. KHOA HOC — map ngay khi DaDuyet, không có điều kiện phụ
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetKhoaHocAsync(Guid idBanNhap)
        //{
        //    var nhap = await _khoaHocRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap KhoaHoc voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap KhoaHoc {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Tieu de: {nhap.TieuDe}\nMo ta: {nhap.MoTa}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThaiPheDuyet = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //         _khoaHocRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThaiPheDuyet = TrangThaiPheDuyet.ChoAdminDuyet;
        //         _khoaHocRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    // DaDuyet -> map ngay
        //    var goc = await _khoaHocRepository.GetByIdAsync(nhap.IdBanGhiTruoc.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc KhoaHoc voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TieuDe = nhap.TieuDe;
        //    goc.MoTa = nhap.MoTa;
        //    goc.Gia = nhap.Gia;
        //    goc.GiaGoc = nhap.GiaGoc;
        //    goc.LoaiKhoaHoc = nhap.LoaiKhoaHoc;
        //    goc.HinhAnhKhoaHoc = nhap.HinhAnhKhoaHoc;
        //    goc.IdHinhAnhKhoaHoc = nhap.IdHinhAnhKhoaHoc;
        //    goc.URLViewPreviewKhoaHoc = nhap.URLViewPreviewKhoaHoc;
        //    goc.CapDo = nhap.CapDo;
        //    goc.TongThoiLuong = nhap.TongThoiLuong;
        //    goc.TongBaiGiang = nhap.TongBaiGiang;
        //    goc.NgayCapNhat = DateTime.Now;
        //    // Khong dong: TrangThaiPheDuyet, TrangThai (hien thi), SoLuongHocVien cua goc

        //    nhap.TrangThaiPheDuyet = TrangThaiPheDuyet.DaDuyet;
        //    nhap.IsDeleted = true; // da map xong, khong can giu nhap nua

        //    _khoaHocRepository.Update(goc);
        //    _khoaHocRepository.Update(nhap);

        //    return KetQua(idBanNhap, TrangThaiPheDuyet.DaDuyet, true, "Da map du lieu KhoaHoc vao ban goc");
        //}

        //// ===============================================================
        //// 2. PHAN — map ngay khi DaDuyet, không có điều kiện phụ
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetPhanAsync(Guid idBanNhap)
        //{
        //    var nhap = await _phanRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap Phan voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap Phan {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Ten phan: {nhap.TenPhan}\nMieu ta: {nhap.MieuTa}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //         _phanRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.ChoAdminDuyet;
        //         _phanRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    var goc = await _phanRepository.GetByIdAsync(nhap.IdBanGhiTruoc.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc Phan voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TenPhan = nhap.TenPhan;
        //    goc.MieuTa = nhap.MieuTa;
        //    goc.ThuTuSapXep = nhap.ThuTuSapXep;
        //    // TrangThai cua goc giu nguyen y nghia hien thi, khong bi ghi de boi DaDuyet

        //    nhap.TrangThai = TrangThaiPheDuyet.DaDuyet;
        //    nhap.IsDeleted = true;

        //     _phanRepository.Update(goc);
        //     _phanRepository.Update(nhap);

        //    return KetQua(idBanNhap, TrangThaiPheDuyet.DaDuyet, true, "Da map du lieu Phan vao ban goc");
        //}

        //// ===============================================================
        //// 3. BAI GIANG — KHÔNG tự map. Chỉ đánh dấu IsPendingSwap trên bản
        //// gốc; SwapPendingBaiGiang() (đã có sẵn, chạy lúc đạt 100%) sẽ map.
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetBaiGiangAsync(Guid idBanNhap)
        //{
        //    var nhap = await _baiGiangRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap BaiGiang voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap BaiGiang {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Tieu de bai giang: {nhap.TieuDe}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //        _baiGiangRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.ChoAdminDuyet;
        //        _baiGiangRepository.Update(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    // DaDuyet -> KHONG map ngay. Chi bao hieu cho co che swap co san:
        //    // danh dau ban GOC (id cu) la "co ban thay the dang cho", tro toi nhap.
        //    var goc = await _baiGiangRepository.GetByIdAsync(nhap.IdBanGhiTruoc.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc BaiGiang voi Id {nhap.IdBanGhiTruoc}");

        //    nhap.TrangThai = TrangThaiPheDuyet.DaDuyet;

        //    goc.IdBaiGiangMoi = nhap.Id;
        //    goc.IsPendingSwap = true;
        //    // KHONG xoa nhap, KHONG copy field sang goc o day -
        //    // SwapPendingBaiGiang() se lam viec do khi hoc vien dat 100%.

        //    _baiGiangRepository.Update(nhap);
        //    _baiGiangRepository.Update(goc);

        //    return KetQua(
        //        idBanNhap,
        //        TrangThaiPheDuyet.DaDuyet,
        //        false,
        //        "AI da duyet. Da danh dau cho swap, se duoc ap dung khi hoc vien hoan thanh 100% khoa hoc");
        //}

        //// ===============================================================
        //// 4. BAI KIEM TRA — map khi không có LanLamBaiKiemTra nào DangLam
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetBaiKiemTraAsync(Guid idBanNhap)
        //{
        //    var nhap = await _baiKiemTraService.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap BaiKiemTra voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap BaiKiemTra {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Ten bai kiem tra: {nhap.TenBaiKiemTra}\nMo ta: {nhap.MoTa}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.TuChoi;
        //        nhap.IsDeleted = true;
        //        await _baiKiemTraService.UpdateAsync(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        nhap.TrangThai = TrangThaiPheDuyet.ChoAdminDuyet;
        //        await _baiKiemTraService.UpdateAsync(nhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    nhap.TrangThai = TrangThaiPheDuyet.DaDuyet;
        //    await _baiKiemTraService.UpdateAsync(nhap);
        //    await _baiKiemTraService.SaveAsync();

        //    var daMap = await ThuMapBaiKiemTraNeuDuDieuKienAsync(nhap);

        //    return KetQua(
        //        idBanNhap,
        //        TrangThaiPheDuyet.DaDuyet,
        //        daMap,
        //        daMap
        //            ? "Da map du lieu BaiKiemTra vao ban goc"
        //            : "AI da duyet, nhung CHUA map - dang co nguoi DangLam bai kiem tra nay");
        //}

        ///// <summary>
        ///// Map 1 bản nháp BaiKiemTra đã DaDuyet vào bản gốc, nếu không có
        ///// LanLamBaiKiemTra nào (của bài kiểm tra GỐC) đang ở trạng thái
        ///// DangLam. Nên được gọi lại khi 1 LanLamBaiKiemTra chuyển khỏi
        ///// DangLam (nộp bài/hết giờ), không chỉ ngay lúc AI duyệt.
        ///// </summary>
        //public async Task<bool> ThuMapBaiKiemTraNeuDuDieuKienAsync(BaiKiemTra nhap)
        //{
        //    if (nhap.TrangThai != TrangThaiPheDuyet.DaDuyet)
        //        return false;

        //    var coAiDangLam = await _lanLamBaiKiemTraRepository.AnyAsync(
        //        x => x.IdBaiKiemTra == nhap.IdBanGhiTruoc && x.TrangThai == TrangThaiLamBai.DangLam);

        //    if (coAiDangLam)
        //        return false;

        //    var goc = await _baiKiemTraService.GetByIdAsync(nhap.IdBanGhiTruoc!.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc BaiKiemTra voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TenBaiKiemTra = nhap.TenBaiKiemTra;
        //    goc.MoTa = nhap.MoTa;
        //    goc.DiemDat = nhap.DiemDat;
        //    goc.GioiHanThoiGian = nhap.GioiHanThoiGian;
        //    goc.ChoLamLai = nhap.ChoLamLai;
        //    goc.SoLanLamLai = nhap.SoLanLamLai;
        //    goc.SoLanLamToiDa = nhap.SoLanLamToiDa;

        //    nhap.IsDeleted = true;

        //    await _baiKiemTraService.UpdateAsync(goc);
        //    await _baiKiemTraService.UpdateAsync(nhap);
        //    await _baiKiemTraService.SaveAsync();

        //    return true;
        //}

        //// ===============================================================
        //// 5. CAU HOI — map theo cùng điều kiện với BaiKiemTra cha của nó
        //// (không có LanLamBaiKiemTra nào DangLam). DapAn đi kèm CauHoi
        //// được map cùng lúc, không kiểm duyệt AI riêng (không có text rời).
        //// ===============================================================
        //public async Task<KetQuaXuLyDuyetDto> KiemDuyetCauHoiAsync(Guid idBanNhap)
        //{
        //    var nhap = await _cauHoiRepository.GetByIdAsync(idBanNhap);
        //    if (nhap == null || nhap.IsBanHienTai)
        //        throw new InvalidOperationException($"Khong tim thay ban nhap CauHoi voi Id {idBanNhap}");

        //    if (nhap.IdBanGhiTruoc == null)
        //        throw new InvalidOperationException($"Ban nhap CauHoi {idBanNhap} khong co IdBanGhiTruoc");

        //    var ketQuaAi = await _geminiService.KiemDuyetOuputAsync($"Cau hoi: {nhap.TenCauHoi}\nNoi dung: {nhap.NoiDungCauHoi}");
        //    var phanLoai = PhanLoaiTheoDiem(ketQuaAi.DiemSo);

        //    if (phanLoai == TrangThaiPheDuyet.TuChoi)
        //    {
        //        nhap.IsDeleted = true;
        //        _cauHoiRepository.Update(nhap);
        //        // DapAn cua nhap CauHoi nay cung khong con can thiet -> xoa mem theo
        //        await XoaMemDapAnCuaCauHoiAsync(nhap.Id);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.TuChoi, false, ketQuaAi.ThongBao);
        //    }

        //    if (phanLoai == TrangThaiPheDuyet.ChoAdminDuyet)
        //    {
        //        // LUU Y: entity CauHoi duoc gui khong co cot TrangThai rieng.
        //        // Neu can luu trang thai ChoAdminDuyet cho CauHoi, can bo sung
        //        // cot TrangThai vao entity CauHoi truoc. Hien tai chi log lai.
        //        _logger.LogWarning("CauHoi {Id} can ChoAdminDuyet nhung entity chua co cot TrangThai - vui long bo sung", idBanNhap);
        //        return KetQua(idBanNhap, TrangThaiPheDuyet.ChoAdminDuyet, false, ketQuaAi.ThongBao);
        //    }

        //    var daMap = await ThuMapCauHoiNeuDuDieuKienAsync(nhap);

        //    return KetQua(
        //        idBanNhap,
        //        TrangThaiPheDuyet.DaDuyet,
        //        daMap,
        //        daMap
        //            ? "Da map du lieu CauHoi + DapAn vao ban goc"
        //            : "AI da duyet, nhung CHUA map - dang co nguoi DangLam bai kiem tra chua cau hoi nay");
        //}

        ///// <summary>
        ///// Map 1 bản nháp CauHoi (+ DapAn con của nó) vào bản gốc, theo cùng
        ///// điều kiện với BaiKiemTra: không map khi có LanLamBaiKiemTra nào
        ///// đang DangLam cho BaiKiemTra chứa câu hỏi này.
        ///// </summary>
        //public async Task<bool> ThuMapCauHoiNeuDuDieuKienAsync(CauHoi nhap)
        //{
        //    if (nhap.IdBaiKiemTra == null)
        //    {
        //        _logger.LogWarning("CauHoi {Id} khong co IdBaiKiemTra, khong the kiem tra dieu kien map", nhap.Id);
        //        return false;
        //    }

        //    var coAiDangLam = await _lanLamBaiKiemTraRepository.AnyAsync(
        //        x => x.IdBaiKiemTra == nhap.IdBaiKiemTra && x.TrangThai == TrangThaiLamBai.DangLam);

        //    if (coAiDangLam)
        //        return false;

        //    var goc = await _cauHoiRepository.GetByIdAsync(nhap.IdBanGhiTruoc!.Value);
        //    if (goc == null)
        //        throw new InvalidOperationException($"Khong tim thay ban goc CauHoi voi Id {nhap.IdBanGhiTruoc}");

        //    goc.TenCauHoi = nhap.TenCauHoi;
        //    goc.NoiDungCauHoi = nhap.NoiDungCauHoi;
        //    goc.LoaiCauHoi = nhap.LoaiCauHoi;
        //    goc.Diem = nhap.Diem;
        //    goc.ThuTuSapXep = nhap.ThuTuSapXep;
        //    goc.DoKho = nhap.DoKho;

        //    nhap.IsDeleted = true;

        //     _cauHoiRepository.Update(goc);
        //     _cauHoiRepository.Update(nhap);
        //    await _cauHoiRepository.SaveAsync();

        //    // Map DapAn nhap (cua CauHoi nhap) -> ghi de DapAn cua CauHoi goc
        //    await MapDapAnTheoCauHoiAsync(idCauHoiNhap: nhap.Id, idCauHoiGoc: goc.Id);

        //    return true;
        //}

        ///// <summary>
        ///// Map toàn bộ DapAn thuộc 1 CauHoi nháp sang CauHoi gốc tương ứng:
        ///// xóa mềm DapAn cũ của gốc, tạo lại theo DapAn của nháp.
        ///// (DapAn không có quy trình duyệt AI riêng — đi theo CauHoi cha.)
        ///// </summary>
        //private async Task MapDapAnTheoCauHoiAsync(Guid idCauHoiNhap, Guid idCauHoiGoc)
        //{
        //    var dapAnGocCu = _dapAnRepository.GetQueryable()
        //        .Where(x => x.IdCauHoi == idCauHoiGoc)
        //        .ToList();

        //    foreach (var da in dapAnGocCu)
        //    {
        //        _dapAnRepository.Delete(da);
        //        await _dapAnRepository.SaveAsync();
        //    }
        //    if (dapAnGocCu.Any())
        //    {
        //        foreach (var da in dapAnGocCu)
        //        {
        //            _dapAnRepository.Update(da);
        //        }
        //    }

        //    var dapAnNhap = _dapAnRepository.GetQueryable()
        //        .Where(x => x.IdCauHoi == idCauHoiNhap)
        //        .ToList();

        //    var dapAnMoi = dapAnNhap.Select(da => new DapAn
        //    {
        //        Id = Guid.NewGuid(),
        //        NoiDungDapAn = da.NoiDungDapAn,
        //        LaDapAnDung = da.LaDapAnDung,
        //        ThuTuSapXep = da.ThuTuSapXep,
        //        IdCauHoi = idCauHoiGoc,
        //        IsBanHienTai = true
        //    }).ToList();

        //    if (dapAnMoi.Any())
        //    {
        //         _dapAnRepository.AddRange(dapAnMoi);
        //    }

        //    // Don ban nhap DapAn cu (gan voi CauHoi nhap, da map xong khong can nua)
        //    foreach (var da in dapAnNhap)
        //    {
        //         _dapAnRepository.Delete(da);
        //        await _dapAnRepository.SaveAsync();
        //    }
        //    if (dapAnNhap.Any())
        //    {
        //        foreach (var da in dapAnNhap)
        //        {
        //             _dapAnRepository.Update(da);
        //        }
        //    }
        //}

        //private async Task XoaMemDapAnCuaCauHoiAsync(Guid idCauHoi)
        //{
        //    var dapAns = _dapAnRepository.GetQueryable().Where(x => x.IdCauHoi == idCauHoi).ToList();
        //    foreach (var da in dapAns)
        //    {
        //         _dapAnRepository.Delete(da);
        //    }
        //    if (dapAns.Any())
        //    {
        //        foreach (var da in dapAns)
        //        {
        //             _dapAnRepository.Update(da);
        //        }
        //    }
        //}

        //// ===============================================================
        //// HELPERS DÙNG CHUNG
        //// ===============================================================

        //private static KetQuaXuLyDuyetDto KetQua(Guid id, string trangThai, bool daMap, string ghiChu) =>
        //    new()
        //    {
        //        IdBanNhap = id,
        //        TrangThaiMoi = trangThai,
        //        DaMapDuLieu = daMap,
        //        GhiChu = ghiChu
        //    };

        //private static string PhanLoaiTheoDiem(double diemSo)
        //{
        //    if (diemSo >= NGUONG_CHAN) return TrangThaiPheDuyet.TuChoi;
        //    if (diemSo >= NGUONG_PHAN_VAN) return TrangThaiPheDuyet.ChoAdminDuyet;
        //    return TrangThaiPheDuyet.DaDuyet;
        //}
        #endregion
    }
}

