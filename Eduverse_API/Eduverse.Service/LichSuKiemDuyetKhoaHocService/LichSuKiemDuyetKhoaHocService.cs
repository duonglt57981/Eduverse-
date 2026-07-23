using CloudinaryDotNet.Actions;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.DapAnService;
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
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Eduverse.Service.ElasticsearchService;
using System.Linq.Expressions;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Elastic.Clients.Elasticsearch;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{
    public class LichSuKiemDuyetKhoaHocService : Service<Model.Entities.LichSuKiemDuyetKhoaHoc>, ILichSuKiemDuyetKhoaHocService
    {
        private const double NGUONG_CHAN = 0.7;      // Reject if score >= 0.7
        private const double NGUONG_PHAN_VAN = 0.4;  // Need admin review if score >= 0.4 and < 0.7

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
        }

        #region GetDanhSachKiemDuyet

        public async Task<PagedList<KhoaHocKiemDuyetListDto>> GetDanhSachKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

            var lichSuDangDuyetIds =  await GetQueryable()
                .Where(x => x.CreatedId == userId && x.TrangThaiPheDuyet == "DangDuyet")
                .Select(x => x.IdDoiTuong)
                .ToListAsync();

            var khoaHocQuery = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.TrangThaiPheDuyet == "ChoDuyet" ||
                    lichSuDangDuyetIds.Contains(x.Id));

            if (!string.IsNullOrWhiteSpace(search.Keyword))
                khoaHocQuery = khoaHocQuery.Where(x => x.TieuDe.Contains(search.Keyword));

            var query = khoaHocQuery
                .OrderBy(x => x.CreatedDate)
                .Select(x => new KhoaHocKiemDuyetListDto
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


        #region GetDetailKiemDuyet

        public async Task<KiemDuyetDetailDto> GetDetailKiemDuyet(Guid idKhoaHoc)
        {
            // 1. Lấy đúng bản khóa học theo Id được truyền vào
            var targetVersion = await _khoaHocRepository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc);

            if (targetVersion == null)
                return null;

            // 2. Lấy toàn bộ cây dữ liệu (không dùng khóa ngoại, so khớp thủ công qua Id list)
            var phans = await _phanRepository.GetAll()
                .Where(x => x.IdKhoaHoc == targetVersion.Id && (x.TrangThai == "ChoDuyet" || x.TrangThai == "DangDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var phanIds = phans.Select(p => p.Id).ToList();

            var baiGiangs = await _baiGiangRepository.GetAll()
                .Where(x => phanIds.Contains(x.IdPhan) && (x.TrangThai == "ChoDuyet" || x.TrangThai == "DangDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiGiangIds = baiGiangs.Select(b => b.Id).ToList();

            var taiLieus = await _taiLieuRepository.GetAll()
                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && (x.TrangThai == "ChoDuyet" || x.TrangThai == "DangDuyet"))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository.GetAll()
                .Where(x => x.IdPhan.HasValue && phanIds.Contains(x.IdPhan.Value) && (x.TrangThai == "ChoDuyet" || x.TrangThai == "DangDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var baiKiemTraIds = baiKiemTras.Select(b => b.Id).ToList();

            var cauHois = await _cauHoiRepository.GetAll()
                .Where(x => baiKiemTraIds.Contains(x.IdBaiKiemTra.Value) && (x.TrangThai == "ChoDuyet" || x.TrangThai == "DangDuyet"))
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois.Select(c => c.Id).ToList();

            var dapAns = await _dapAnRepository.GetAll()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value) && (x.TrangThai == "ChoDuyet" || x.TrangThai == "DangDuyet"))
                .ToListAsync();

            // 3. Chuyển toàn bộ cây sang trạng thái "DangDuyet" — mỗi item xử lý ĐỘC LẬP
            if (targetVersion.TrangThaiPheDuyet == "ChoDuyet" || targetVersion.TrangThaiPheDuyet == null)
            {
                var KiemDuyetKhoaHoc = new LichSuKiemDuyetKhoaHoc
                {
                    IdDoiTuong = targetVersion.Id,
                    LoaiDoiTuong = "KhoaHoc",
                    TrangThaiPheDuyet = "DangDuyet"
                };

                await CreateAsync(KiemDuyetKhoaHoc);
                await SaveAsync();

                targetVersion.TrangThaiPheDuyet = "DangDuyet";
                targetVersion.TrangThai = "DangDuyet";

                _khoaHocRepository.Update(targetVersion);
                _khoaHocRepository.SaveAsync();
                
            }

            foreach (var phan in phans)
            {
                if (phan.TrangThaiPheDuyet == "ChoDuyet" || phan.TrangThaiPheDuyet == null)
                {
                    phan.TrangThaiPheDuyet = "DangDuyet";
                    phan.TrangThai = "DangDuyet";

                     _phanRepository.Update(phan);
                }
            }

            foreach (var item in baiGiangs)
            {
                if (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null)
                {
                    item.TrangThaiPheDuyet = "DangDuyet";
                    item.TrangThai = "DangDuyet";

                    _baiGiangRepository.Update(item);

                }
            }

            foreach (var item in taiLieus)
            {
                if (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null)
                {
                    item.TrangThaiPheDuyet = "DangDuyet";
                    item.TrangThai = "DangDuyet";

                     _taiLieuRepository.Update(item);
                }
            }

            foreach (var item in baiKiemTras)
            {
                if (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null)
                {
                    item.TrangThaiPheDuyet = "DangDuyet";
                    item.TrangThai = "DangDuyet";

                     _baiKiemTraRepository.Update(item);
                }
            }

            // DapAn có TrangThai/TrangThaiPheDuyet riêng theo DTO → chuyển trạng thái tương tự
            foreach (var item in dapAns)
            {
                if (item.TrangThaiPheDuyet == "ChoDuyet" || item.TrangThaiPheDuyet == null)
                {
                    item.TrangThaiPheDuyet = "DangDuyet";
                    item.TrangThai = "DangDuyet";

                    _dapAnRepository.Update(item);
                }
            }

            // Lưu toàn bộ thay đổi trạng thái + lịch sử kiểm duyệt trong 1 lần
            await SaveAsync();

            // 4. Dựng cây lồng nhau: Phan -> BaiGiang -> TaiLieu, Phan -> BaiKiemTra -> CauHoi -> DapAn
            var taiLieuLookup = taiLieus.ToLookup(t => t.IdBaiGiang);
            var baiGiangLookup = baiGiangs.ToLookup(b => b.IdPhan);
            var dapAnLookup = dapAns.Where(d => d.IdCauHoi.HasValue).ToLookup(d => d.IdCauHoi.Value);
            var cauHoiLookup = cauHois.ToLookup(c => c.IdBaiKiemTra);
            var baiKiemTraLookup = baiKiemTras
                .Where(b => b.IdPhan.HasValue)
                .ToLookup(b => b.IdPhan.Value);

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
                Phans = phanDtos
            };

            return result;
        }

        #endregion


        #region GetLichSuKiemDuyet
        public async Task<List<LichSuKiemDuyetDto>> GetLichSuKiemDuyet(Guid idKhoaHoc)
        {
            return await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdDoiTuong == idKhoaHoc && !x.IsDeleted)
                .OrderByDescending(x => x.NgayDuyet)
                .Select(x => new LichSuKiemDuyetDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdDoiTuong,
                    IdNguoiDuyet = x.IdNguoiDuyet,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    LyDo = x.LyDo,
                    NgayDuyet = x.NgayDuyet
                })
                .ToListAsync();
        }
        #endregion


        //#region KiemDuyetKhoaHoc
        //public async Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        //{
        //    // ── Kiểm tra quyền ──────────────────────────────────
        //    var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        //    if (role != "Admin")
        //        throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt khóa học.");

        //    if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
        //        throw new Exception("Trạng thái phê duyệt không hợp lệ.");

        //    if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
        //        throw new Exception("Phải nhập lý do khi từ chối khóa học.");

        //    var khoaHocNhap = await _khoaHocService.GetByIdOrThrowAsync(request.IdKhoaHoc);

        //    if (khoaHocNhap.TrangThaiPheDuyet != "ChoDuyet" && khoaHocNhap.TrangThaiPheDuyet != "DangDuyet")
        //        throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

        //    Guid.TryParse(
        //        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
        //        out var idNguoiDuyet);
        //    var ngayDuyet = DateTime.Now;

        //    // ── TuChoi ──────────────────────────────────────────
        //    if (request.TrangThaiPheDuyet == "TuChoi")
        //    {
        //        khoaHocNhap.TrangThaiPheDuyet = "TuChoi";

        //        if (khoaHocNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            await _khoaHocService.DeleteAsync(khoaHocNhap);
        //        }

        //        await _khoaHocService.UpdateAsync(khoaHocNhap);
        //        await _khoaHocService.SaveAsync();
        //    }
        //    // ── DaDuyet ─────────────────────────────────────────
        //    else
        //    {
        //        var phanIds = await _phanService.GetQueryable()
        //            .Where(x => x.IdKhoaHoc == khoaHocNhap.Id && !x.IsDeleted)
        //            .Select(x => x.Id)
        //            .ToListAsync();

        //        var baiGiangIds = await _baiGiangService.GetQueryable()
        //            .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
        //            .Select(x => x.Id)
        //            .ToListAsync();

        //        // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
        //        if (!khoaHocNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
        //            khoaHocNhap.TrangThai = "HoatDong";
        //            khoaHocNhap.IsBanHienTai = true;

        //            await _phanService.GetQueryable()
        //                .Where(x => phanIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _baiGiangService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _taiLieuService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));
        //        }
        //        // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
        //        else
        //        {
        //            var idBanGoc = khoaHocNhap.IdBanGhiTruoc.Value;

        //            var banGoc = await _khoaHocService.GetByIdOrThrowAsync(idBanGoc);

        //            // ① Copy field từ bản nháp → bản gốc (giữ Id gốc để FK DangKy không vỡ)
        //            banGoc.TieuDe = khoaHocNhap.TieuDe;
        //            banGoc.MoTa = khoaHocNhap.MoTa;
        //            banGoc.HinhAnhKhoaHoc = khoaHocNhap.HinhAnhKhoaHoc;
        //            banGoc.IdHinhAnhKhoaHoc = khoaHocNhap.IdHinhAnhKhoaHoc;
        //            banGoc.Gia = khoaHocNhap.Gia;
        //            banGoc.GiaGoc = khoaHocNhap.GiaGoc;
        //            banGoc.CapDo = khoaHocNhap.CapDo;
        //            banGoc.LoaiKhoaHoc = khoaHocNhap.LoaiKhoaHoc;
        //            banGoc.TrangThaiPheDuyet = "DaDuyet";
        //            banGoc.TrangThai = "HoatDong";
        //            banGoc.IsBanHienTai = true;
        //            banGoc.UpdatedDate = DateTime.UtcNow;

        //            // ⭐ ② Copy danh mục từ bản nháp sang bản gốc
        //            await CopyDanhMucFromNhapToGoc(khoaHocNhap.Id, idBanGoc);

        //            // ③ Lấy phan/baigiang gốc để soft-delete
        //            var phanGocIds = await _phanService.GetQueryable()
        //                .Where(x => x.IdKhoaHoc == idBanGoc && !x.IsDeleted)
        //                .Select(x => x.Id)
        //                .ToListAsync();

        //            var baiGiangGocIds = await _baiGiangService.GetQueryable()
        //                .Where(x => phanGocIds.Contains(x.IdPhan) && !x.IsDeleted)
        //                .Select(x => x.Id)
        //                .ToListAsync();

        //            // ④ Soft-delete tailieu → baigiang → phan gốc
        //            await _taiLieuService.GetQueryable()
        //                .Where(x => baiGiangGocIds.Contains(x.IdBaiGiang))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IsDeleted, true)
        //                    .SetProperty(p => p.DeletedDate, DateTime.Now));

        //            await _baiGiangService.GetQueryable()
        //                .Where(x => baiGiangGocIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IsDeleted, true)
        //                    .SetProperty(p => p.DeletedDate, DateTime.Now));

        //            await _phanService.GetQueryable()
        //                .Where(x => phanGocIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IsDeleted, true)
        //                    .SetProperty(p => p.DeletedDate, DateTime.Now));

        //            // ⑤ Chuyển phan/baigiang nháp sang IdKhoaHoc gốc + activate
        //            await _phanService.GetQueryable()
        //                .Where(x => phanIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x
        //                    .SetProperty(p => p.IdKhoaHoc, idBanGoc)
        //                    .SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _baiGiangService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.Id))
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            await _taiLieuService.GetQueryable()
        //                .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
        //                .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

        //            // ⑥ Reset bản nháp (giữ lại, tái sử dụng lần sau)
        //            khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
        //            khoaHocNhap.TrangThai = "Nhap";
        //            khoaHocNhap.IsBanHienTai = false;
        //            khoaHocNhap.UpdatedDate = DateTime.UtcNow;

        //            await _khoaHocService.UpdateAsync(banGoc);
        //            await _khoaHocService.UpdateAsync(khoaHocNhap);
        //        }

        //        await _khoaHocService.SaveAsync();
        //    }

        //    // ── Ghi lịch sử ─────────────────────────────────────
        //    var lichSu = new LichSuKiemDuyetKhoaHoc
        //    {
        //        Id = Guid.NewGuid(),
        //        IdKhoaHoc = request.IdKhoaHoc,
        //        IdNguoiDuyet = idNguoiDuyet,
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        LyDo = request.LyDo,
        //        NgayDuyet = ngayDuyet
        //    };

        //    await CreateAsync(lichSu);
        //    await SaveAsync();

        //    return new KiemDuyetKhoaHocDto
        //    {
        //        IdKhoaHoc = khoaHocNhap.IdBanGhiTruoc ?? khoaHocNhap.Id,
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        NgayDuyet = ngayDuyet
        //    };
        //}

        //// ── Helper copy danh mục từ bản nháp sang bản gốc ──
        //private async Task CopyDanhMucFromNhapToGoc(Guid idKhoaHocNhap, Guid idKhoaHocGoc)
        //{
        //    // ① Lấy danh mục của bản nháp (chưa bị xóa)
        //    var danhMucNhap = await _danhMuc_KhoaHocService.GetQueryable()
        //        .Where(x => x.IdKhoaHoc == idKhoaHocNhap && !x.IsDeleted)
        //        .ToListAsync();

        //    // ② Lấy danh mục hiện tại của bản gốc
        //    var danhMucGoc = await _danhMuc_KhoaHocService.GetQueryable()
        //        .Where(x => x.IdKhoaHoc == idKhoaHocGoc && !x.IsDeleted)
        //        .ToListAsync();

        //    var danhMucGocIds = danhMucGoc.Select(x => x.IdDanhMuc).ToHashSet();
        //    var danhMucNhapIds = danhMucNhap.Select(x => x.IdDanhMuc).ToHashSet();

        //    // ③ Xóa những danh mục của bản gốc không có trong bản nháp
        //    var canXoa = danhMucGoc
        //        .Where(x => !danhMucNhapIds.Contains(x.IdDanhMuc))
        //        .ToList();

        //    if (canXoa.Any())
        //    {
        //        await _danhMuc_KhoaHocService.DeleteAsync(canXoa);
        //        await _danhMuc_KhoaHocService.SaveAsync();
        //    }

        //    // ④ Thêm những danh mục của bản nháp chưa có trong bản gốc
        //    var canThem = danhMucNhapIds
        //        .Where(id => !danhMucGocIds.Contains(id))
        //        .Select(id => new DanhMuc_KhoaHoc
        //        {
        //            Id = Guid.NewGuid(),
        //            IdKhoaHoc = idKhoaHocGoc,
        //            IdDanhMuc = id
        //        }).ToList();

        //    if (canThem.Any())
        //    {
        //        await _danhMuc_KhoaHocService.CreateRange(canThem);
        //        await _danhMuc_KhoaHocService.SaveAsync();
        //    }
        //}
        //#endregion


        #region KiemDuyetOuputThuCong
        #region KiemDuyetKhoaHoc
        public async Task<KiemDuyetKhoaHocDto> KiemDuyetFullKhoaHoc(KiemDuyetKhoaHocRequest request)
        {
            // ── Kiểm tra quyền ──────────────────────────────────
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin")
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt");

            var GetKiemDuyetByKhoaHoc = await GetQueryable().Where(x => x.IdDoiTuong == request.IdKhoaHoc && x.CreatedId == userId).FirstOrDefaultAsync();
            if (GetKiemDuyetByKhoaHoc == null)
                throw new Exception("Khóa học này đã có người khác đang duyệt!");

            if (request.TrangThaiPheDuyet == null)
                throw new Exception("Vui lòng chọn Duyệt khóa học ");

            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối.");

            var khoaHoc = await _khoaHocRepository.GetByIdAsync(request.IdKhoaHoc);
            if (khoaHoc == null)
                throw new Exception("Không tìm thấy khóa học");

            if (khoaHoc.TrangThaiPheDuyet != "ChoDuyet" && khoaHoc.TrangThaiPheDuyet != "DangDuyet")
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
            var taiLieus = await _taiLieuRepository
                .GetQueryable()
                .Where(x => idBaiGiangs.Contains(x.IdBaiGiang))
                .ToListAsync();

            var baiKiemTras = await _baiKiemTraRepository
                .GetQueryable()
                .Where(x => idPhans.Contains(x.IdPhan.Value))
                .ToListAsync();

            var idBaiKiemTras = baiKiemTras.Select(x => x.Id).ToList();
            var cauHois = await _cauHoiRepository
                .GetQueryable()
                .Where(x => idBaiKiemTras.Contains(x.IdBaiKiemTra.Value))
                .ToListAsync();

            var idCauHois = cauHois.Select(x => x.Id).ToList();
            var dapAns = await _dapAnRepository
                .GetQueryable()
                .Where(x => idCauHois.Contains(x.IdCauHoi.Value))
                .ToListAsync();

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                khoaHoc.TrangThaiPheDuyet = "TuChoi";
                khoaHoc.TrangThai = "DaXoa";
                _khoaHocRepository.Update(khoaHoc);
                await _khoaHocRepository.SaveAsync();

                foreach (var phan in phans)
                {
                    phan.TrangThaiPheDuyet = "TuChoi";
                    phan.TrangThai = "DaXoa";
                    _phanRepository.Update(phan);
                    await _phanRepository.SaveAsync();
                }

                foreach (var bg in baiGiangs)
                {
                    bg.TrangThaiPheDuyet = "TuChoi";
                    bg.TrangThai = "DaXoa";
                    _baiGiangRepository.Update(bg);
                    await _baiGiangRepository.SaveAsync();
                }

                foreach (var tl in taiLieus)
                {
                    tl.TrangThaiPheDuyet = "TuChoi";
                    tl.TrangThai = "DaXoa";
                    _taiLieuRepository.Update(tl);
                    await _taiLieuRepository.SaveAsync();
                }

                foreach (var bkt in baiKiemTras)
                {
                    bkt.TrangThaiPheDuyet = "TuChoi";
                    bkt.TrangThai = "DaXoa";
                    _baiKiemTraRepository.Update(bkt);
                    await _baiKiemTraRepository.SaveAsync();
                }

                foreach (var ch in cauHois)
                {
                    ch.TrangThaiPheDuyet = "TuChoi";
                    ch.TrangThai = "DaXoa";
                    _cauHoiRepository.Update(ch);
                    await _cauHoiRepository.SaveAsync();
                }

                foreach (var da in dapAns)
                {
                    da.TrangThaiPheDuyet = "TuChoi";
                    da.TrangThai = "DaXoa";
                    _dapAnRepository.Update(da);
                    await _dapAnRepository.SaveAsync();
                }
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                khoaHoc.TrangThaiPheDuyet = "DaDuyet";
                khoaHoc.TrangThai = "HoatDong";
                _khoaHocRepository.Update(khoaHoc);
                await _khoaHocRepository.SaveAsync();

                foreach (var phan in phans)
                {
                    phan.TrangThaiPheDuyet = "DaDuyet";
                    phan.TrangThai = "HoatDong";
                    _phanRepository.Update(phan);
                    await _phanRepository.SaveAsync();
                }

                foreach (var bg in baiGiangs)
                {
                        bg.TrangThaiPheDuyet = "DaDuyet";
                        bg.TrangThai = "HoatDong";
                        await _phanRepository.SaveAsync();

                    _baiGiangRepository.Update(bg);
                    await _baiGiangRepository.SaveAsync();
                }

                foreach (var tl in taiLieus)
                {
                    tl.TrangThaiPheDuyet = "DaDuyet";
                    tl.TrangThai = "HoatDong";
                    _taiLieuRepository.Update(tl);
                    await _taiLieuRepository.SaveAsync();
                }

                foreach (var bkt in baiKiemTras)
                {
                        bkt.TrangThaiPheDuyet = "DaDuyet";
                        bkt.TrangThai = "HoatDong";

                    _baiKiemTraRepository.Update(bkt);
                    await _baiKiemTraRepository.SaveAsync();
                }

                foreach (var ch in cauHois)
                {
                    ch.TrangThaiPheDuyet = "DaDuyet";
                    ch.TrangThai = "HoatDong";
                    _cauHoiRepository.Update(ch);
                    await _cauHoiRepository.SaveAsync();
                }

                foreach (var da in dapAns)
                {
                    da.TrangThaiPheDuyet = "DaDuyet";
                    da.TrangThai = "HoatDong";
                    _dapAnRepository.Update(da);
                    await _dapAnRepository.SaveAsync();
                }
                // Chỉ thay thế bản cũ khi đây là một phiên bản cập nhật.
                if (khoaHoc.IdBanGhiTruoc.HasValue)
                {
                    var khoaHocCu = await _khoaHocRepository
                        .GetByIdAsync(khoaHoc.IdBanGhiTruoc.Value);

                    if (khoaHocCu != null)
                    {
                        khoaHocCu.IsBanHienTai = false;
                        _khoaHocRepository.Update(khoaHocCu);
                        await _khoaHocRepository.SaveAsync();
                    }

                    await CapNhatDangKyKhoaHoc(
                        khoaHoc.Id,
                        khoaHoc.IdBanGhiTruoc.Value);
                }
                //update tiến độ bài giảng

            }


            var GetLichSuKiemDuyetKhoaHoc = await GetQueryable().Where(x => x.IdDoiTuong == khoaHoc.Id).FirstOrDefaultAsync();


            if (GetLichSuKiemDuyetKhoaHoc != null)
            {
                GetLichSuKiemDuyetKhoaHoc.IdDoiTuong = request.IdKhoaHoc;
                GetLichSuKiemDuyetKhoaHoc.TrangThaiPheDuyet = request.TrangThaiPheDuyet;
                GetLichSuKiemDuyetKhoaHoc.LyDo = request.LyDo;
                GetLichSuKiemDuyetKhoaHoc.NgayDuyet = DateTime.UtcNow;

                await UpdateAsync(GetLichSuKiemDuyetKhoaHoc);
                await SaveAsync();
            }

            try
            {
                if (request.TrangThaiPheDuyet == "DaDuyet")
                {
                    await _elasticsearchService.IndexCourseAsync(khoaHoc.Id);

                    if (khoaHoc.IdBanGhiTruoc.HasValue)
                    {
                        await _elasticsearchService.DeleteCourseAsync(khoaHoc.IdBanGhiTruoc.Value);
                    }
                }
                else
                {
                    await _elasticsearchService.DeleteCourseAsync(khoaHoc.Id);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Elasticsearch approval sync failed: {ex.Message}");
            }

            return new KiemDuyetKhoaHocDto
            {
                IdDoiTuong = request.IdKhoaHoc,
                LoaiDoiTuong = "KhoaHoc",
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }

        private async Task<bool> CapNhatDangKyKhoaHoc(Guid idKhoaHocMoi, Guid idKhoaHocCu)
        {
            try
            {
                var danhSachDangKyCu = await _dangKyKhoaHocRepository.GetQueryable()
                    .Where(x => x.IdKhoaHoc == idKhoaHocCu && !x.IsDeleted)
                    .ToListAsync();

                if (danhSachDangKyCu.Any())
                {
                    var danhSachDangKyMoi = danhSachDangKyCu.Select(dk => new DangKyKhoaHoc
                    {
                        Id = Guid.NewGuid(),
                        IdKhoaHoc = idKhoaHocMoi,
                        IdNguoiDangKi = dk.IdNguoiDangKi,
                        TrangThai = dk.TrangThai,
                    }).ToList();

                    foreach (var item in danhSachDangKyMoi)
                    {
                        _dangKyKhoaHocRepository.Add(item);
                        await _dangKyKhoaHocRepository.SaveAsync();
                    }

                    foreach (var dkCu in danhSachDangKyCu)
                    {
                        _dangKyKhoaHocRepository.Delete(dkCu);
                    }
                    await _dangKyKhoaHocRepository.SaveAsync();

                    return true;
                }

                return true;

            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi cập nhật đăng ký khóa học: {ex.Message}");
            }
        }
        #endregion

        //#region KiemDuyetKhoaHoc
        //public async Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        //{
        //    var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        //    if (role != "Admin")
        //        throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt khóa học.");

        //    if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
        //        throw new Exception("Trạng thái phê duyệt không hợp lệ.");

        //    if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
        //        throw new Exception("Phải nhập lý do khi từ chối khóa học.");

        //    var khoaHoc = await _khoaHocRepository.GetByIdAsync(request.IdKhoaHoc);
        //    if (khoaHoc == null)
        //        throw new Exception("Không tìm thấy khóa học");

        //    if (khoaHoc.TrangThaiPheDuyet != "ChoDuyet" || khoaHoc.TrangThaiPheDuyet != "DangDuyet")
        //        throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

        //    var KiemDuyetByKhoaHoc = await GetQueryable().Where(x => x.IdDoiDuong == khoaHoc.Id).FirstOrDefaultAsync();

        //    // ── TuChoi ──────────────────────────────────────────
        //    if (request.TrangThaiPheDuyet == "TuChoi")
        //    {
        //        khoaHoc.TrangThaiPheDuyet = "TuChoi";
        //        khoaHoc.TrangThai = "DaXoa";

        //         _khoaHocRepository.Delete(khoaHoc);
        //        await _khoaHocRepository.SaveAsync();
        //    }
        //    // ── DaDuyet ─────────────────────────────────────────
        //    else
        //    {
        //        khoaHoc.TrangThaiPheDuyet = "DaDuyet";
        //        khoaHoc.TrangThai = "HoatDong";

        //        _khoaHocRepository.Update(khoaHoc);
        //        await _khoaHocRepository.SaveAsync();
        //    }

        //    var LichSuKiemDuyet = new LichSuKiemDuyetKhoaHoc
        //    {
        //        IdDoiDuong = KiemDuyetByKhoaHoc.IdDoiDuong,
        //        LoaiDoiTuong = "KhoaHoc",
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        LyDo = request.LyDo,

        //    };

        //    await UpdateAsync(LichSuKiemDuyet);
        //    await SaveAsync();

        //    return new KiemDuyetKhoaHocDto
        //    {
        //        IdDoiTuong = KiemDuyetByKhoaHoc.IdDoiDuong,
        //        LoaiDoiTuong = "KhoaHoc",
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        NgayDuyet = DateTime.UtcNow
        //    };
        //}
        //#endregion
        //#region KiemDuyetBaiGiang
        //public async Task<KiemDuyetKhoaHocDto> KiemDuyetBaiGiang(KiemDuyetKhoaHocRequest request)
        //{
        //    // ── Kiểm tra quyền ──────────────────────────────────
        //    var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        //    if (role != "Admin")
        //        throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt bài giảng.");

        //    if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
        //        throw new Exception("Trạng thái phê duyệt không hợp lệ.");

        //    if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
        //        throw new Exception("Phải nhập lý do khi từ chối.");

        //    var baiGiangNhap = await _baiGiangRepository.GetByIdAsync(request.IdBanNhap);

        //    if (baiGiangNhap == null)
        //        throw new Exception("Không tìm thấy bản nháp");

        //    if (baiGiangNhap.TrangThaiPheDuyet != "ChoDuyet")
        //        throw new Exception("BaiGiang không ở trạng thái chờ duyệt.");


        //    var ngayDuyet = DateTime.Now;

        //    // ── TuChoi ──────────────────────────────────────────
        //    if (request.TrangThaiPheDuyet == "TuChoi")
        //    {
        //        baiGiangNhap.TrangThaiPheDuyet = "TuChoi";
        //        baiGiangNhap.TrangThai = "DaXoa";

        //        if (baiGiangNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            _baiGiangRepository.Delete(baiGiangNhap);
        //        }

        //        _baiGiangRepository.Update(baiGiangNhap);
        //        await _baiGiangRepository.SaveAsync();
        //    }
        //    // ── DaDuyet ─────────────────────────────────────────
        //    else
        //    {
        //        // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
        //        if (!baiGiangNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            baiGiangNhap.TrangThaiPheDuyet = "DaDuyet";
        //            baiGiangNhap.TrangThai = "HoatDong";
        //            baiGiangNhap.IsBanHienTai = true;

        //            _baiGiangRepository.Update(baiGiangNhap);
        //        }
        //        // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
        //        else
        //        {
        //            baiGiangNhap.TrangThaiPheDuyet = "DaDuyet";
        //            baiGiangNhap.TrangThai = "BanSwap";
        //            baiGiangNhap.IsBanHienTai = false;

        //            _baiGiangRepository.Update(baiGiangNhap);
        //        }
        //        await _baiGiangRepository.SaveAsync();
        //    }

        //    // ── Ghi lịch sử ─────────────────────────────────────
        //    var lichSu = new LichSuKiemDuyetKhoaHoc
        //    {
        //        Id = Guid.NewGuid(),
        //        IdDoiDuong = request.IdBanNhap,
        //        LoaiDoiTuong = "BaiGiang",
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        LyDo = request.LyDo,
        //        NgayDuyet = ngayDuyet
        //    };

        //    await CreateAsync(lichSu);
        //    await SaveAsync();

        //    return new KiemDuyetKhoaHocDto
        //    {
        //        IdDoiTuong = baiGiangNhap.IdBanGhiTruoc ?? baiGiangNhap.Id,
        //        LoaiDoiTuong = lichSu.LoaiDoiTuong,
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        NgayDuyet = ngayDuyet
        //    };
        //}
        //#endregion
        //#region KiemDuyetTaiLieu
        //        public async Task<KiemDuyetKhoaHocDto> KiemDuyetTaiLieu(KiemDuyetKhoaHocRequest request)
        //        {
        //            // ── Kiểm tra quyền ──────────────────────────────────
        //            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        //            if (role != "Admin")
        //                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt");

        //            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
        //                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

        //            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
        //                throw new Exception("Phải nhập lý do khi từ chối");

        //            var baiKiemTraNhap = await _taiLieuRepository.GetByIdAsync(request.IdBanNhap);
        //            if (baiKiemTraNhap == null)
        //                throw new Exception("Không tìm thấy bản nháp");

        //            if (baiKiemTraNhap.TrangThaiPheDuyet != "ChoDuyet")
        //                throw new Exception("Bài giảng không ở trạng thái chờ duyệt.");

        //            var ngayDuyet = DateTime.Now;

        //            // ── TuChoi ──────────────────────────────────────────
        //            if (request.TrangThaiPheDuyet == "TuChoi")
        //            {
        //                baiKiemTraNhap.TrangThaiPheDuyet = "TuChoi";
        //                baiKiemTraNhap.TrangThai = "TuChoi";

        //                _taiLieuRepository.Update(baiKiemTraNhap);
        //                _taiLieuRepository.Delete(baiKiemTraNhap);
        //            }
        //            // ── DaDuyet ─────────────────────────────────────────
        //            else
        //            {
        //                baiKiemTraNhap.TrangThaiPheDuyet = "DaDuyet";
        //                baiKiemTraNhap.TrangThai = "HoatDong";
        //                _taiLieuRepository.Update(baiKiemTraNhap);

        //            }

        //            // ── Ghi lịch sử ─────────────────────────────────────
        //            var lichSu = new LichSuKiemDuyetKhoaHoc
        //            {
        //                Id = Guid.NewGuid(),
        //                IdDoiDuong = request.IdBanNhap,
        //                LoaiDoiTuong = "TaiLieu",
        //                LyDo = request.LyDo,
        //                NgayDuyet = ngayDuyet
        //            };

        //            await CreateAsync(lichSu);
        //            await _taiLieuRepository.SaveAsync();
        //            await SaveAsync();

        //            return new KiemDuyetKhoaHocDto
        //            {
        //                IdDoiTuong = baiKiemTraNhap.Id,
        //                LoaiDoiTuong = lichSu.LoaiDoiTuong,
        //                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //                NgayDuyet = ngayDuyet
        //            };
        //        }
        //        #endregion
        //#region KiemDuyetBaiKiemTra
        //public async Task<KiemDuyetKhoaHocDto> KiemDuyetBaiKiemTra(KiemDuyetKhoaHocRequest request)
        //{
        //    // ── Kiểm tra quyền ──────────────────────────────────
        //    var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
        //    if (role != "Admin")
        //        throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt");

        //    if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
        //        throw new Exception("Trạng thái phê duyệt không hợp lệ.");

        //    if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
        //        throw new Exception("Phải nhập lý do khi từ chối");

        //    var baiKiemTraNhap = await _baiKiemTraService.GetByIdAsync(request.IdBanNhap);
        //    if (baiKiemTraNhap == null)
        //        throw new Exception("Không tìm thấy bản nháp");

        //    if (baiKiemTraNhap.TrangThaiPheDuyet != "ChoDuyet")
        //        throw new Exception("Tài liệu không ở trạng thái chờ duyệt.");


        //    var ngayDuyet = DateTime.Now;

        //    // ── TuChoi ──────────────────────────────────────────
        //    if (request.TrangThaiPheDuyet == "TuChoi")
        //    {
        //        baiKiemTraNhap.TrangThaiPheDuyet = "TuChoi";
        //        baiKiemTraNhap.TrangThai = "DaXoa";

        //        if (baiKiemTraNhap.IdBanGhiTruoc.HasValue)
        //        {
        //            await _baiKiemTraService.DeleteAsync(baiKiemTraNhap);
        //        }

        //        _baiKiemTraService.UpdateAsync(baiKiemTraNhap);
        //        await _baiKiemTraService.SaveAsync();
        //    }
        //    // ── DaDuyet ─────────────────────────────────────────
        //    else
        //    {
        //        // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
        //        if (!baiKiemTraNhap.IdBanGhiTruoc.HasValue && baiKiemTraNhap.TrangThaiPheDuyet =="ChoDuyet")
        //        {
        //            baiKiemTraNhap.TrangThaiPheDuyet = "DaDuyet";
        //            baiKiemTraNhap.TrangThai = "HoatDong";
        //            baiKiemTraNhap.IsBanHienTai = true;
        //        }
        //        // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
        //        else if(baiKiemTraNhap.IdBanGhiTruoc.HasValue && baiKiemTraNhap.TrangThaiPheDuyet == "ChoDuyet")
        //        {

        //            baiKiemTraNhap.TrangThaiPheDuyet = "DaDuyet";
        //            baiKiemTraNhap.TrangThai = "BanSwap";
        //            baiKiemTraNhap.IsBanHienTai = false;
        //        }
        //        await _khoaHocRepository.SaveAsync();
        //    }

        //    // ── Ghi lịch sử ─────────────────────────────────────
        //    var lichSu = new LichSuKiemDuyetKhoaHoc
        //    {
        //        Id = Guid.NewGuid(),
        //        IdDoiDuong = request.IdBanNhap,
        //        LoaiDoiTuong = "BaiKiemTra",
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        LyDo = request.LyDo,
        //        NgayDuyet = ngayDuyet
        //    };

        //    await CreateAsync(lichSu);
        //    await SaveAsync();

        //    return new KiemDuyetKhoaHocDto
        //    {
        //        IdDoiTuong = baiKiemTraNhap.IdBanGhiTruoc ?? baiKiemTraNhap.Id,
        //        LoaiDoiTuong = lichSu.LoaiDoiTuong,
        //        TrangThaiPheDuyet = request.TrangThaiPheDuyet,
        //        NgayDuyet = ngayDuyet
        //    };
        //}
        //#endregion
        #endregion


        #region KiemDuyetInputAIandThuCong
        public async Task KiemTraVaNemExceptionAsync(string noiDung)
        {
            if (string.IsNullOrWhiteSpace(noiDung)) return;

            // 1. Kiểm tra từ cấm cơ bản (luôn thực hiện)
            var listtucam = TuCams._tuCam;
            var tuTimThay = listtucam.Where(t => noiDung.ToLower().Contains(t)).ToList();
            if (tuTimThay.Any())
            {
                throw new KiemDuyetException(
                    $"Noi dung chua tu ngu nhay cam: {string.Join(", ", tuTimThay)}",
                    "TuCamCoBan",
                    tuTimThay,
                    "Vui long loai bo cac tu ngu khong phu hop"
                );
            }

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

