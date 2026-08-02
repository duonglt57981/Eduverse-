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
using Eduverse.Service.TienDoHocTapService;
using Eduverse.Repository.TienDoHocTapRepository;
using Eduverse.Service.ThongBaoService;

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
        private readonly ITienDoHocTapRepository _tienDoHocTapRepository;
        private readonly INotificationPublisher _notificationPublisher;

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
            INotificationPublisher notificationPublisher,


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
            _notificationPublisher = notificationPublisher;
        }

        #region GetDanhSachKiemDuyet
        public async Task<PagedList<KhoaHocKiemDuyetListDto>> GetDanhSachKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

            // Lấy danh sách Id đang duyệt của user
            var lichSuDangDuyetIds = await GetQueryable()
                .Where(x => x.CreatedId == userId && x.TrangThaiPheDuyet == "DangDuyet")
                .Select(x => x.IdDoiTuong)
                .ToListAsync();

            var khoaHocQuery = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    (x.TrangThaiPheDuyet == "ChoDuyet") ||
                    lichSuDangDuyetIds.Contains(x.Id));

            // Lọc thêm theo trạng thái nếu có chỉ định (ví dụ chỉ lấy ChoDuyet hoặc DangDuyet)
            if (!string.IsNullOrWhiteSpace(search.TrangThaiPheDuyet))
            {
                if (search.TrangThaiPheDuyet == "ChoDuyet")
                {
                    khoaHocQuery = khoaHocQuery.Where(x => x.TrangThaiPheDuyet == "ChoDuyet");
                }
                else if (search.TrangThaiPheDuyet == "DangDuyet")
                {
                    khoaHocQuery = khoaHocQuery.Where(x => lichSuDangDuyetIds.Contains(x.Id));
                }
                // Nếu khác, không lọc thêm
            }

            if (!string.IsNullOrWhiteSpace(search.Keyword))
                khoaHocQuery = khoaHocQuery.Where(x => x.TieuDe.Contains(search.Keyword));

            // Sắp xếp
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
                // Mặc định cũ nhất trước
                khoaHocQuery = khoaHocQuery.OrderBy(x => x.CreatedDate);
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


        #region GetListLichSuKiemDuyet
        public async Task<PagedList<KhoaHocKiemDuyetListDto>> GetListLichSuKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

            var khoaHocQuery = _khoaHocRepository.GetAll()
                .AsNoTracking()
                .Where(x =>
                    (x.TrangThaiPheDuyet == "DaDuyet" || x.TrangThaiPheDuyet == "TuChoi")
                    && GetQueryable()
                        .Any(h => h.CreatedId == userId && h.IdDoiTuong == x.Id));

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
                khoaHocQuery = khoaHocQuery.OrderByDescending(x => x.CreatedDate);
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
                .FirstOrDefaultAsync(x => x.Id == idKhoaHoc && !x.IsDeleted);

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
                LichSuKiemDuyetDto = lichSuKiemDuyet
            };

            return result;
        }
        #endregion


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

            var GetLichSuKiemDuyetKhoaHoc = await GetQueryable().Where(x => x.IdDoiTuong == khoaHoc.Id).FirstOrDefaultAsync();

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

                if (GetLichSuKiemDuyetKhoaHoc != null)
                {
                    GetLichSuKiemDuyetKhoaHoc.TrangThaiPheDuyet = request.TrangThaiPheDuyet;
                    GetLichSuKiemDuyetKhoaHoc.LyDo = request.LyDo;
                    GetLichSuKiemDuyetKhoaHoc.NgayDuyet = DateTime.UtcNow;
                    GetLichSuKiemDuyetKhoaHoc.IdNguoiDuyet = userId;

                    await UpdateAsync(GetLichSuKiemDuyetKhoaHoc);
                    await SaveAsync();
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

                if (GetLichSuKiemDuyetKhoaHoc != null)
                {
                    GetLichSuKiemDuyetKhoaHoc.TrangThaiPheDuyet = request.TrangThaiPheDuyet;
                    GetLichSuKiemDuyetKhoaHoc.LyDo = request.LyDo;
                    GetLichSuKiemDuyetKhoaHoc.NgayDuyet = DateTime.UtcNow;
                    GetLichSuKiemDuyetKhoaHoc.IdNguoiDuyet = userId;

                    await UpdateAsync(GetLichSuKiemDuyetKhoaHoc);
                    await SaveAsync();
                }

                //update đăng kí khóa học 
                var dangkikhoahoc = await _dangKyKhoaHocRepository.GetQueryable().FirstOrDefaultAsync(x => x.IdKhoaHoc == khoaHoc.IdBanGhiTruoc);
                if(dangkikhoahoc != null)
                {
                    await CapNhatDangKyKhoaHoc(khoaHoc.Id, khoaHoc.IdBanGhiTruoc.Value);
                }
                
            }

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
                    FromUser = userId,
                    ItemId = khoaHoc.Id,
                    ItemName = khoaHoc.TieuDe
                });
            }

            return new KiemDuyetKhoaHocDto
            {
                IdDoiTuong = request.IdKhoaHoc,
                LoaiDoiTuong = "KhoaHoc",
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
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

                // Thêm hàng loạt, chỉ Save 1 lần (tránh N+1 query)
                foreach (var item in danhSachDangKyMoi)
                {
                    _dangKyKhoaHocRepository.Add(item);
                }
                await _dangKyKhoaHocRepository.SaveAsync();

                // Xóa mềm đăng ký cũ, chỉ Save 1 lần
                foreach (var dkCu in danhSachDangKyCu)
                {
                    dkCu.IsDeleted = true;
                    _dangKyKhoaHocRepository.Delete(dkCu);
                }
                await _dangKyKhoaHocRepository.SaveAsync();

                //update tiến độ bài giảng
                await CapNhatTienDoHoc(idKhoaHocMoi, mappingList);

                return mappingList;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi cập nhật đăng ký khóa học: {ex.Message}", ex);
            }
        }


        private async Task<bool> CapNhatTienDoHoc(Guid idKhoaHocMoi, List<DangKyMapping> danhSachMappingDangKy)
        {
            try
            {
                // Lấy toàn bộ bài giảng của khóa học mới, map với bài giảng cũ tương ứng
                var baiGiangs = await (
                    from p in _phanRepository.GetQueryable()
                    join bg in _baiGiangRepository.GetQueryable()
                        on p.Id equals bg.IdPhan
                    where p.IdKhoaHoc == idKhoaHocMoi
                          && !p.IsDeleted
                          && !bg.IsDeleted
                          && bg.IdBanGhiTruoc != null
                    select new
                    {
                        IdBaiGiangMoi = bg.Id,
                        IdBaiGiangCu = bg.IdBanGhiTruoc.Value
                    }
                ).ToListAsync();

                if (!baiGiangs.Any())
                    return true;

                // Dictionary tra cứu nhanh: IdDangKyCu -> IdDangKyMoi
                var mapDangKy = danhSachMappingDangKy
                    .ToDictionary(m => m.IdDangKyCu, m => m.IdDangKyMoi);

                foreach (var bg in baiGiangs)
                {
                    var tienDos = await _tienDoHocTapRepository.GetQueryable()
                        .Where(x => x.IdBaiGiang == bg.IdBaiGiangCu)
                        .ToListAsync();

                    foreach (var tienDo in tienDos)
                    {
                        // Chỉ cập nhật nếu tìm được đăng ký mới tương ứng
                        if (mapDangKy.TryGetValue(tienDo.IdDangKi.Value, out var idDangKyMoi))
                        {
                            tienDo.IdDangKi = idDangKyMoi;
                            tienDo.IdBaiGiang = bg.IdBaiGiangMoi;
                            _tienDoHocTapRepository.Update(tienDo);
                        }
                        else
                        {
                            // Không tìm thấy đăng ký mới tương ứng -> log để kiểm tra thủ công
                            _logger?.LogWarning(
                                "Khong tim thay dang ky moi tuong ung cho tien do (IdTienDo={IdTienDo}, IdDangKyCu={IdDangKyCu})",
                                tienDo.Id, tienDo.IdDangKi);
                        }
                    }
                }

                await _tienDoHocTapRepository.SaveAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi cập nhật tiến độ học: {ex.Message}", ex);
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

