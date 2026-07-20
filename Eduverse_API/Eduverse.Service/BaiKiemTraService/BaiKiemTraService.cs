using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.ChiTietLamBaiKiemTraService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DapAnService;
using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.DapAnService.Request;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LanLamBaiKiemTraService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TienDoHocTapService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Eduverse.Service.BaiKiemTraService
{
    public class BaiKiemTraService : Service<BaiKiemTra>, IBaiKiemTraService
    {
        private readonly ILanLamBaiKiemTraService _lanLamBaiKiemTraService;
        private readonly ITienDoHocTapService _tienDoHocTapService;
        private readonly IChiTietLamBaiKiemTraService _chiTietLamBaiKiemTraService;
        private readonly IPhanService _phanService;
        private readonly ICauHoiService _cauHoiService;
        private readonly IDapAnService _dapAnService;
        private readonly IMapper _mapper;
        private readonly EduverseContext _eduverseContext;
        private readonly IDangKyKhoaHocRepository _dangKyKhoaHocRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly IPhanRepository _phanRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;

        private const int HEARTBEAT_TIMEOUT_SECONDS = 20;


        public BaiKiemTraService(
            IMapper mapper,
            IBaiKiemTraRepository baiKiemTraRepository,
            ICauHoiService cauHoiService,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IChiTietLamBaiKiemTraService chiTietLamBaiKiemTraService,
            IPhanService phanService,
            IDapAnService dapAnService,
            EduverseContext eduverseContext,
            ITienDoHocTapService tienDoHocTapService,
            IDangKyKhoaHocRepository dangKyKhoaHocRepository,
            IBaiGiangRepository baiGiangRepository,
            IPhanRepository phanRepository,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            IKhoaHocRepository khoaHocRepository,
            IHttpContextAccessor httpContextAccessor
            ) : base(baiKiemTraRepository)
        {
            _lanLamBaiKiemTraService = lanLamBaiKiemTraService;
            _chiTietLamBaiKiemTraService = chiTietLamBaiKiemTraService;
            _phanService = phanService;
            _cauHoiService = cauHoiService;
            _dapAnService = dapAnService;
            _mapper = mapper;
            _eduverseContext = eduverseContext;
            _tienDoHocTapService = tienDoHocTapService;
            _dangKyKhoaHocRepository = dangKyKhoaHocRepository;
            _httpContextAccessor = httpContextAccessor;
            _baiGiangRepository = baiGiangRepository;
            _phanRepository = phanRepository;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _eduverseContext = eduverseContext;
            _khoaHocRepository = khoaHocRepository;
        }

        #region GetListForManager
        public async Task<List<BaiKiemTraDto>> GetListForManager(Guid idPhan)
        {
            var baiKiemTras = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdPhan == idPhan && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            if (baiKiemTras.Count == 0)
                return new List<BaiKiemTraDto>();

            var baiKiemTraIds = baiKiemTras.Select(x => x.Id).ToList();

            var cauHois = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra.HasValue && baiKiemTraIds.Contains(x.IdBaiKiemTra.Value) && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois.Select(x => x.Id).ToList();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value) && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var result = baiKiemTras.Select(bkt =>
            {
                var item = _mapper.Map<BaiKiemTra, BaiKiemTraDto>(bkt);

                item.DanhSachCauHois = cauHois
                    .Where(c => c.IdBaiKiemTra == bkt.Id)
                    .Select(c =>
                    {
                        var cauHoiDto = _mapper.Map<CauHoi, CauHoiDto>(c);
                        cauHoiDto.DanhSachDapAns = dapAns
                            .Where(d => d.IdCauHoi == c.Id)
                            .Select(d => _mapper.Map<DapAn, CreateDapAnDto>(d))
                            .ToList();
                        return cauHoiDto;
                    })
                    .ToList();
                
                item.SoCauHoi = item.DanhSachCauHois.Count;

                return item;
            }).ToList();

            return result;
        }
        #endregion

        //public async Task<GetQuizToLearningDto> GetQuizToLearning(Guid idDangKy)
        //{
        //    // ─── 1. Lấy userId từ token ───
        //    Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);

        //    // ─── 2. Lấy thông tin đăng ký khóa học ───
        //    var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idDangKy && !x.IsDeleted)
        //        .Select(x => new { x.Id, x.IdKhoaHoc, x.IdNguoiDangKi, x.CreatedDate })
        //        .FirstOrDefaultAsync();

        //    if (dangKy == null)
        //        throw new Exception("Không tìm thấy đăng ký khóa học");

        //    if (dangKy.IdNguoiDangKi != userId)
        //        throw new Exception("Bạn chưa đăng ký khóa học này!");

        //    var idKhoaHoc = dangKy.IdKhoaHoc;

        //    // ─── 3. Lấy thông tin khóa học ───
        //    var khoaHoc = await _khoaHocRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.Id == idKhoaHoc && !x.IsDeleted)
        //        .Select(x => new { x.Id, x.TieuDe })
        //        .FirstOrDefaultAsync();

        //    if (khoaHoc == null)
        //        throw new Exception("Không tìm thấy khóa học");

        //    // ─── 4. Lấy danh sách phần học của khóa học ───
        //    var phanHocs = await _phanRepository.GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdKhoaHoc == idKhoaHoc
        //                 && !x.IsDeleted
        //                 && x.TrangThai == "HoatDong"
        //                 && x.TrangThaiPheDuyet == "DaDuyet")
        //        .OrderBy(x => x.ThuTuSapXep)
        //        .Select(x => new { x.Id, x.TenPhan, x.ThuTuSapXep })
        //        .ToListAsync();

        //    if (!phanHocs.Any())
        //    {
        //        // Không có phần học nào -> trả về sớm, tránh query thừa ở các bước sau
        //        return new GetQuizToLearningDto
        //        {
        //            IdKhoaHoc = khoaHoc.Id,
        //            TenKhoaHoc = khoaHoc.TieuDe,
        //            DanhSachTheoPhan = new List<PhanHocDto>(),
        //            DanhSachTatCa = new List<BaiKiemTraDto>(),
        //            TongSoBaiKiemTra = 0
        //        };
        //    }

        //    var phanIds = phanHocs.Select(x => x.Id).ToList();

        //    // ─── 5. Lấy bài kiểm tra theo các phần (chỉ lấy bản GỐC, IsBanHienTai = true) ───
        //    // FIX: dùng đúng _baiKiemTraRepository.GetQueryable() (tránh nhầm sang queryable khác).
        //    // FIX: entity BaiKiemTra không có SoCauHoi/DiemToiDa -> bỏ khỏi Select, sẽ tính SoCauHoi riêng ở bước 6.
        //    var baiKiemTras = await GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdPhan.HasValue
        //                 && phanIds.Contains(x.IdPhan.Value)
        //                 && !x.IsDeleted
        //                 && x.TrangThai == "HoatDong"
        //                 && x.TrangThaiPheDuyet == "DaDuyet"
        //                 && x.IsBanHienTai)
        //        .OrderBy(x => x.TenBaiKiemTra)
        //        .Select(x => new BaiKiemTraDto
        //        {
        //            Id = x.Id,
        //            IdGoc = x.Id,
        //            TenBaiKiemTra = x.TenBaiKiemTra,
        //            MoTa = x.MoTa,
        //            DiemDat = x.DiemDat,
        //            GioiHanThoiGian = x.GioiHanThoiGian,
        //            ChoLamLai = x.ChoLamLai,
        //            SoLanLamToiDa = x.SoLanLamToiDa,
        //            IdPhan = x.IdPhan,
        //            CreatedDate = x.CreatedDate,
        //            IsBanHienTai = x.IsBanHienTai,
        //            IdBanGhiTruoc = x.IdBanGhiTruoc,
        //            TrangThai = x.TrangThai,
        //            TrangThaiPheDuyet = x.TrangThaiPheDuyet,
        //            IsSwap = false
        //        })
        //        .ToListAsync();

        //    if (!baiKiemTras.Any())
        //    {
        //        var danhSachTheoPhanRong = phanHocs.Select(phan => new PhanHocDto
        //        {
        //            Id = phan.Id,
        //            TenPhan = phan.TenPhan,
        //            ThuTuSapXep = phan.ThuTuSapXep,
        //            DanhSachBaiKiemTra = new List<BaiKiemTraDto>()
        //        }).ToList();

        //        return new GetQuizToLearningDto
        //        {
        //            IdKhoaHoc = khoaHoc.Id,
        //            TenKhoaHoc = khoaHoc.TieuDe,
        //            DanhSachTheoPhan = danhSachTheoPhanRong,
        //            DanhSachTatCa = new List<BaiKiemTraDto>(),
        //            TongSoBaiKiemTra = 0
        //        };
        //    }

        //    // ─── 6. Đếm số câu hỏi cho từng bài kiểm tra gốc ───
        //    // FIX: khai báo baiKiemTraIds (thiếu trong bản gốc gây lỗi compile).
        //    // SoCauHoi chỉ là số đếm CauHoi hợp lệ (Count), không lấy từ entity vì BaiKiemTra không có field này.
        //    var baiKiemTraIds = baiKiemTras.Select(x => x.Id).ToList();

        //    if (baiKiemTraIds.Any())
        //    {
        //        var cauHoiCounts = await _cauHoiService.GetQueryable()
        //            .AsNoTracking()
        //            .Where(x => x.IdBaiKiemTra.HasValue
        //                     && baiKiemTraIds.Contains(x.IdBaiKiemTra.Value)
        //                     && !x.IsDeleted
        //                     && x.TrangThai == "HoatDong"
        //                     && x.TrangThaiPheDuyet == "DaDuyet"
        //                     && x.IsBanHienTai)
        //            .GroupBy(x => x.IdBaiKiemTra!.Value)
        //            .Select(g => new { IdBaiKiemTra = g.Key, Count = g.Count() })
        //            .ToDictionaryAsync(x => x.IdBaiKiemTra, x => x.Count);

        //        foreach (var baiKiemTra in baiKiemTras)
        //        {
        //            baiKiemTra.SoCauHoi = cauHoiCounts.TryGetValue(baiKiemTra.Id, out var count) ? count : 0;
        //        }
        //    }

        //    // ─── 7. Xử lý Swap cho từng bài kiểm tra (nếu có) ───
        //    var baiKiemTraGocIds = baiKiemTras.Select(x => x.Id).ToList();
        //    var swapBaiKiemTras = await GetQueryable()
        //        .AsNoTracking()
        //        .Where(x => x.IdBanGhiTruoc.HasValue
        //                 && baiKiemTraGocIds.Contains(x.IdBanGhiTruoc.Value)
        //                 && x.TrangThaiPheDuyet == "DaDuyet"
        //                 && x.TrangThai == "HoatDong"
        //                 && x.IsBanHienTai == false
        //                 && !x.IsDeleted)
        //        .Select(x => new
        //        {
        //            x.Id,
        //            x.IdBanGhiTruoc,
        //            x.TenBaiKiemTra,
        //            x.MoTa,
        //            x.DiemDat,
        //            x.GioiHanThoiGian,
        //            x.ChoLamLai,
        //            x.SoLanLamToiDa,
        //            x.CreatedDate,
        //            x.IsBanHienTai,
        //            x.TrangThai
        //        })
        //        .ToListAsync();

        //    // Đếm số câu hỏi cho các bài swap (giống bước 6, nhưng cho swap)
        //    var swapIds = swapBaiKiemTras.Select(x => x.Id).ToList();
        //    var swapCauHoiCounts = new Dictionary<Guid, int>();
        //    if (swapIds.Any())
        //    {
        //        swapCauHoiCounts = await _cauHoiService.GetQueryable()
        //            .AsNoTracking()
        //            .Where(x => x.IdBaiKiemTra.HasValue
        //                     && swapIds.Contains(x.IdBaiKiemTra.Value)
        //                     && !x.IsDeleted
        //                     && x.TrangThai == "HoatDong"
        //                     && x.TrangThaiPheDuyet == "DaDuyet"
        //                     && x.IsBanHienTai)
        //            .GroupBy(x => x.IdBaiKiemTra!.Value)
        //            .Select(g => new { IdBaiKiemTra = g.Key, Count = g.Count() })
        //            .ToDictionaryAsync(x => x.IdBaiKiemTra, x => x.Count);
        //    }

        //    // Map swap mới nhất theo bài kiểm tra gốc
        //    var swapMoiNhatByGoc = swapBaiKiemTras
        //        .GroupBy(x => x.IdBanGhiTruoc!.Value)
        //        .Select(g => new
        //        {
        //            IdGoc = g.Key,
        //            SwapMoiNhat = g.OrderByDescending(x => x.CreatedDate).First()
        //        })
        //        .ToDictionary(x => x.IdGoc, x => x.SwapMoiNhat);

        //    // Ngày đăng ký dùng để quyết định dùng swap hay gốc:
        //    // - swap được tạo TRƯỚC hoặc BẰNG ngày đăng ký => học viên đăng ký sau khi đã có swap => dùng swap
        //    // - swap được tạo SAU ngày đăng ký => học viên đăng ký từ trước khi có swap => vẫn dùng bản gốc
        //    var ngayDangKy = dangKy.CreatedDate;

        //    // ─── 8. Build danh sách bài kiểm tra cuối cùng (có xử lý swap) ───
        //    var baiKiemTraFinal = new List<BaiKiemTraDto>();
        //    foreach (var baiKiemTra in baiKiemTras)
        //    {
        //        BaiKiemTraDto item;

        //        if (swapMoiNhatByGoc.TryGetValue(baiKiemTra.Id, out var swap) && swap.CreatedDate <= ngayDangKy)
        //        {
        //            var soCauHoiSwap = swapCauHoiCounts.TryGetValue(swap.Id, out var c) ? c : 0;

        //            item = new BaiKiemTraDto
        //            {
        //                Id = swap.Id,
        //                IdGoc = baiKiemTra.Id,
        //                TenBaiKiemTra = swap.TenBaiKiemTra,
        //                MoTa = swap.MoTa,
        //                DiemDat = swap.DiemDat,
        //                GioiHanThoiGian = swap.GioiHanThoiGian,
        //                ChoLamLai = swap.ChoLamLai,
        //                SoLanLamToiDa = swap.SoLanLamToiDa,
        //                IdPhan = baiKiemTra.IdPhan,
        //                SoCauHoi = soCauHoiSwap,
        //                CreatedDate = swap.CreatedDate,
        //                IsBanHienTai = swap.IsBanHienTai,
        //                IdBanGhiTruoc = baiKiemTra.Id,
        //                TrangThai = swap.TrangThai,
        //                TrangThaiPheDuyet = "DaDuyet",
        //                IsSwap = true
        //            };
        //        }
        //        else
        //        {
        //            item = baiKiemTra; // bản gốc, giữ nguyên (đã có SoCauHoi từ bước 6)
        //        }

        //        baiKiemTraFinal.Add(item);
        //    }

        //    // ─── 9. Group theo phần (sau khi đã xử lý swap) ───
        //    var danhSachTheoPhanFinal = phanHocs.Select(phan => new PhanHocDto
        //    {
        //        Id = phan.Id,
        //        TenPhan = phan.TenPhan,
        //        ThuTuSapXep = phan.ThuTuSapXep,
        //        DanhSachBaiKiemTra = baiKiemTraFinal
        //            .Where(x => x.IdPhan == phan.Id)
        //            .ToList()
        //    }).ToList();

        //    // ─── 10. Tạo response ───
        //    return new GetQuizToLearningDto
        //    {
        //        IdKhoaHoc = khoaHoc.Id,
        //        TenKhoaHoc = khoaHoc.TieuDe,
        //        DanhSachTheoPhan = danhSachTheoPhanFinal,
        //        DanhSachTatCa = baiKiemTraFinal,
        //        TongSoBaiKiemTra = baiKiemTraFinal.Count
        //    };
        //}

        #region CreateQuiz
        private string GetQuizContent(CreateBaiKiemTraRequest request)
        {
            if (request == null) return "";

            var sb = new StringBuilder();

            // Thông tin bài kiểm tra
            sb.Append($",{request.TenBaiKiemTra},{request.MoTa}");

            // Câu hỏi và đáp án
            if (request.DanhSachCauHoi != null && request.DanhSachCauHoi.Any())
            {
                foreach (var c in request.DanhSachCauHoi)
                {
                    sb.Append($",{c.NoiDungCauHoi}");
                    if (c.DanhSachDapAn != null && c.DanhSachDapAn.Any())
                    {
                        foreach (var d in c.DanhSachDapAn)
                        {
                            sb.Append($",{d.NoiDungDapAn}");
                        }
                    }
                }
            }

            return sb.ToString();
        }

        public async Task<CreateBaiKiemTraDto> CreateQuiz(CreateBaiKiemTraRequest request)
        {
            // ===== 1. VALIDATE ĐẦU VÀO =====
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Yêu cầu không hợp lệ.");

            if (request.IdPhan == null || request.IdPhan == Guid.Empty)
                throw new ArgumentException("Phần học không hợp lệ.", nameof(request.IdPhan));

            var phan = await _phanService.GetByIdAsync(request.IdPhan.Value);
            if (phan == null)
                throw new Exception("Không tìm thấy phần học.");

            if (phan.TrangThai == "DaXoa" && phan.IsDeleted == true)
                throw new Exception("Phần học đã bị xóa");

            if (string.IsNullOrWhiteSpace(request.TenBaiKiemTra))
                throw new Exception("Tên bài kiểm tra không được để trống.");

            if (request.TenBaiKiemTra.Length < 3)
                throw new Exception("Tên bài kiểm tra phải có ít nhất 3 ký tự.");

            if (request.TenBaiKiemTra.Length > 99)
                throw new Exception("Tên bài kiểm tra không được vượt quá 99 ký tự.");

            if (request.MoTa != null && request.MoTa.Length > 999)
                throw new Exception("Mô tả không được vượt quá 999 ký tự.");

            //if (request.DiemDat < 50 || request.DiemDat > 100)
            //    throw new Exception("Điểm đạt phải từ 50 đến 100.");

            //if (request.GioiHanThoiGian < 0 || request.GioiHanThoiGian > 1000000000)
            //    throw new Exception("Giới hạn thời gian làm bài không hợp lệ.");

            //if (request.ChoLamLai == true && request.SoLanLamToiDa <= 0)
            //    throw new Exception("Khi cho phép làm lại, số lần làm lại tối đa phải lớn hơn 0.");

            //if (request.ChoLamLai == false && request.SoLanLamToiDa > 0)
            //    throw new Exception("Khi không cho phép làm lại, không được nhập số lần làm lại tối đa.");

            //if(request.SoLanLamToiDa <= 0 || request.SoLanLamToiDa > 1000000000)

            // ===== 2. VALIDATE CÂU HỎI =====
            if (request.DanhSachCauHoi.Count > 50)
                throw new Exception("Bài kiểm tra không được vượt quá 50 câu hỏi.");

            if (request.DanhSachCauHoi.Count < 2)
                throw new Exception("Bài kiểm tra phải có ít nhất 2 câu hỏi.");

            // ⭐ TỐI ƯU: Validate tất cả trong 1 lần duyệt
            ValidateQuestions(request.DanhSachCauHoi);

            //Duyệt AI

            await _lichSuKiemDuyetKhoaHocService.KiemTraVaNemExceptionAsync(GetQuizContent(request));

            var strings = GetQuizContent(request);
            Console.WriteLine(strings);

            // ===== 3. TẠO TRONG TRANSACTION =====
            await using var transaction = await _eduverseContext.Database.BeginTransactionAsync();
            try
            {
                // --- 3.1 Tạo bài kiểm tra ---
                var baiKiemTra = CreateBaiKiemTraEntity(request);
                await CreateAsync(baiKiemTra);
                await SaveAsync();

                // --- 3.2 Tạo câu hỏi và đáp án (BULK INSERT) ---
                var (cauHois, dapAns) = await CreateQuestionsAndAnswersAsync(baiKiemTra.Id, request.DanhSachCauHoi);

                await transaction.CommitAsync();

                // ===== 4. LẤY DỮ LIỆU ĐÃ TẠO (TỐI ƯU) =====
                var result = await GetQuizResultAsync(baiKiemTra.Id);


                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Tạo bài kiểm tra thất bại: {ex.Message}");
            }
        }

        // ===== TỐI ƯU: Validate Questions =====
        private void ValidateQuestions(List<CreateCauHoiRequest> questions)
        {
            var validDoKho = new HashSet<string> { "De", "TrungBinh", "Kho" };
            var cauHoiIndex = 1;

            foreach (var cauHoi in questions)
            {
                if (string.IsNullOrWhiteSpace(cauHoi.NoiDungCauHoi))
                    throw new Exception($"Nội dung câu hỏi {cauHoiIndex} không được để trống.");

                if (cauHoi.NoiDungCauHoi.Length < 3)
                    throw new Exception($"Nội dung câu hỏi {cauHoiIndex} phải > 3 kí tự");

                if (cauHoi.NoiDungCauHoi.Length > 255)
                    throw new Exception($"Nội dung câu hỏi {cauHoiIndex} không được vượt quá 255 ký tự.");

                if (string.IsNullOrWhiteSpace(cauHoi.DoKho) || !validDoKho.Contains(cauHoi.DoKho))
                    throw new Exception($"Độ khó '{cauHoi.DoKho}' không hợp lệ. Chỉ chấp nhận: De, TrungBinh, Kho.");

                if (cauHoi.DanhSachDapAn == null || cauHoi.DanhSachDapAn.Count < 2)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' phải có ít nhất 2 đáp án.");

                if (cauHoi.DanhSachDapAn.Count > 15)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' không được vượt quá 15 đáp án.");


                // ⭐ KIỂM TRA ĐÁP ÁN TRÙNG VÀ RỖNG
                ValidateAnswers(cauHoi);

                var soDapAnDung = cauHoi.DanhSachDapAn.Count(d => d.LaDapAnDung.Value);
                if (soDapAnDung == 0)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' phải có ít nhất một đáp án đúng.");

                if (soDapAnDung >= cauHoi.DanhSachDapAn.Count)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' Số đáp án đúng phải nhỏ hơn số đáp án hiện có");

                cauHoiIndex++;
            }

            

            // ⭐ KIỂM TRA CÂU HỎI TRÙNG NHAU
            var cauHoiTrung = questions
                .Where(c => !string.IsNullOrWhiteSpace(c.NoiDungCauHoi))
                .GroupBy(c => c.NoiDungCauHoi.Trim())
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (cauHoiTrung.Any())
                throw new Exception($"Các câu hỏi bị trùng nội dung: {string.Join(", ", cauHoiTrung)}");
        }

        // =====Validate Answers =====
        private void ValidateAnswers(CreateCauHoiRequest cauHoi)
        {
            var noiDungDapAns = new HashSet<string>();

            foreach (var dapAn in cauHoi.DanhSachDapAn)
            {
                if (string.IsNullOrWhiteSpace(dapAn.NoiDungDapAn))
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' có đáp án bị để trống.");

                if (cauHoi.NoiDungCauHoi.Length > 99)
                    throw new Exception("Đáp án không được vượt quá 99 kí tự");

                var trimmed = dapAn.NoiDungDapAn.Trim();
                if (!noiDungDapAns.Add(trimmed))
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' có đáp án bị trùng: {trimmed}");
            }
        }

        // ===== Tạo Entity =====
        private BaiKiemTra CreateBaiKiemTraEntity(CreateBaiKiemTraRequest request)
        {
            return new BaiKiemTra
            {
                Id = Guid.NewGuid(),
                IdPhan = request.IdPhan.Value,
                TenBaiKiemTra = request.TenBaiKiemTra.Trim(),
                MoTa = request.MoTa?.Trim(),
                DiemDat = 100,
                GioiHanThoiGian = 0,
                ChoLamLai = true,
                SoLanLamToiDa = 0,
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua",
                IsBanHienTai = true,
                ThuTuSapXep = request.ThuTuSapXep
            };
        }

        // ===== Tạo Questions và Answers (BULK INSERT) =====
        private async Task<(List<CauHoi> CauHois, List<DapAn> DapAns)> CreateQuestionsAndAnswersAsync(Guid baiKiemTraId,List<CreateCauHoiRequest> questionRequests)
        {
            var cauHois = new List<CauHoi>();
            var dapAns = new List<DapAn>();

            var thuTuCauHoi = 1;
            foreach (var cauHoiReq in questionRequests)
            {
                var soDapAnDung = cauHoiReq.DanhSachDapAn?.Count(d => d.LaDapAnDung == true) ?? 0;
                var cauHoi = new CauHoi
                {
                    Id = Guid.NewGuid(),
                    IdBaiKiemTra = baiKiemTraId,
                    TenCauHoi = cauHoiReq.TenCauHoi?.Trim(),
                    NoiDungCauHoi = cauHoiReq.NoiDungCauHoi.Trim(),
                    LoaiCauHoi = soDapAnDung == 1 ? "ONE" : "MULTI",
                    DoKho = cauHoiReq.DoKho,
                    ThuTuSapXep = cauHoiReq.ThuTuSapXep,
                    TrangThai = "DangSua",
                    TrangThaiPheDuyet = "DangSua",
                    IsBanHienTai = true,
                };

                cauHois.Add(cauHoi);

                var thuTuDapAn = 1;
                foreach (var dapAnReq in cauHoiReq.DanhSachDapAn)
                {
                    dapAns.Add(new DapAn
                    {
                        Id = Guid.NewGuid(),
                        IdCauHoi = cauHoi.Id,
                        NoiDungDapAn = dapAnReq.NoiDungDapAn.Trim(),
                        LaDapAnDung = dapAnReq.LaDapAnDung,
                        ThuTuSapXep = dapAnReq.ThuTuSapXep ?? thuTuDapAn,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        IsBanHienTai = true,
                    });
                    thuTuDapAn++;
                }
                thuTuCauHoi++;
            }

            if (cauHois.Any())
            {
                await _cauHoiService.CreateRange(cauHois);
                await _cauHoiService.SaveAsync();
            }

            if (dapAns.Any())
            {
                await _dapAnService.CreateRange(dapAns);
                await _dapAnService.SaveAsync();
            }

            return (cauHois, dapAns);
        }

        private async Task<CreateBaiKiemTraDto> GetQuizResultAsync(Guid baiKiemTraId)
        {
            var query = from c in _cauHoiService.GetQueryable()
                        join d in _dapAnService.GetQueryable() on c.Id equals d.IdCauHoi into dapAnGroup
                        where c.IdBaiKiemTra == baiKiemTraId && !c.IsDeleted
                        orderby c.ThuTuSapXep
                        select new
                        {
                            CauHoi = c,
                            DapAns = dapAnGroup.Where(d => !d.IsDeleted).OrderBy(d => d.ThuTuSapXep).ToList()
                        };

            var resultData = await query.ToListAsync();

            // ⭐ Lấy thông tin bài kiểm tra
            var baiKiemTra = await GetByIdAsync(baiKiemTraId);
            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            return new CreateBaiKiemTraDto
            {
                Id = baiKiemTra.Id,
                TenBaiKiemTra = baiKiemTra.TenBaiKiemTra,
                MoTa = baiKiemTra.MoTa,
                DiemDat = baiKiemTra.DiemDat,
                GioiHanThoiGian = baiKiemTra.GioiHanThoiGian,
                ChoLamLai = baiKiemTra.ChoLamLai,
                SoLanLamToiDa = baiKiemTra.SoLanLamToiDa,
                SoCauHoi = resultData.Count,
                TrangThai = baiKiemTra.TrangThai,
                TrangThaiPheDuyet = baiKiemTra.TrangThaiPheDuyet,
                DanhSachCauHoi = resultData.Select(x => new CauHoiDto
                {
                    Id = x.CauHoi.Id,
                    NoiDungCauHoi = x.CauHoi.NoiDungCauHoi,
                    TenCauHoi = x.CauHoi.TenCauHoi,
                    LoaiCauHoi = x.CauHoi.LoaiCauHoi,
                    DoKho = x.CauHoi.DoKho,
                    ThuTuSapXep = x.CauHoi.ThuTuSapXep,
                    TrangThai = x.CauHoi.TrangThai,
                    TrangThaiPheDuyet= x.CauHoi.TrangThaiPheDuyet,
                    DanhSachDapAns = x.DapAns.Select(d => new CreateDapAnDto
                    {
                        Id = d.Id,
                        NoiDungDapAn = d.NoiDungDapAn,
                        LaDapAnDung = d.LaDapAnDung,
                        ThuTuSapXep = d.ThuTuSapXep,
                        TrangThai = d.TrangThai,
                        TrangThaiPheDuyet = d.TrangThaiPheDuyet
                    }).ToList()
                }).ToList()
            };
        }
        #endregion

        #region UpdateQuiz

        public async Task<UpdateBaiKiemTraDto> UpdateQuiz(UpdateBaiKiemTraRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);


            var banGoc = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdBaiKiemTra && x.IsBanHienTai && !x.IsDeleted);

            if (banGoc == null)
                throw new Exception("Không tìm thấy bài kiểm tra");

            if (banGoc.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền hạn để sửa bài kiểm tra này");

            ValidateRequest(request);

            // ===== 5. XỬ LÝ THEO TRẠNG THÁI =====

            // ─── TRƯỜNG HỢP 1: Đang sửa (DangSua) ────────────────
            //  Chỉ DangSua mới có thể sửa trên 1 bản ghi
            if (banGoc.TrangThaiPheDuyet == "DangSua")
            {
                await UpdateDirectlyAsync(banGoc, request, nguoiTao);
                return _mapper.Map<BaiKiemTra, UpdateBaiKiemTraDto>(banGoc);
            }
            else
            {
                throw new Exception($"Không thể xử lý bài kiểm tra ở trạng thái: {banGoc.TrangThaiPheDuyet}");
            }

            //// ─── TRƯỜNG HỢP 2: Chờ duyệt (ChoDuyet) ──────────────
            ////  ChoDuyet => DangSua mới có thể sửa tiếp
            //if (banGoc.TrangThaiPheDuyet == "ChoDuyet")
            //    throw new Exception("Chuyển sang DangSua để sửa tiếp");
            
            //// ─── TRƯỜNG HỢP 3: Đang duyệt (DangDuyet) ────────────
            //// ❌ DangDuyet thì không làm được gì cả
            //if (banGoc.TrangThaiPheDuyet == "DangDuyet")
            //    throw new Exception(
            //        $"❌ BÀI KIỂM TRA ĐANG ĐƯỢC KIỂM DUYỆT!\n\n" +
            //        $"Hệ thống đang kiểm duyệt bài kiểm tra này.\n" +
            //        $"Bạn KHÔNG THỂ chỉnh sửa trong khi admin đang xem xét.\n" +
            //        $"Vui lòng chờ admin duyệt xong hoặc liên hệ admin để hủy kiểm duyệt."
            //    );

            //// ─── TRƯỜNG HỢP 4: Đã duyệt (DaDuyet) ─────────────────
            //// ✅ DaDuyet => xóa mềm (tạo bản nháp mới)
            //if (banGoc.TrangThaiPheDuyet == "DaDuyet")
            //{
            //    // Kiểm tra đã có bản nháp chưa
            //    var banNhap = await GetQueryable()
            //        .FirstOrDefaultAsync(x => x.IdBanGhiTruoc == banGoc.Id && !x.IsDeleted);

            //    //if (banNhap != null)
            //    //{
            //    //    // Nếu đã có bản nháp, cập nhật bản nháp
            //    //    await UpdateDraftAsync(banNhap, banGoc, request, nguoiTao);
            //    //    return _mapper.Map<BaiKiemTra, UpdateBaiKiemTraDto>(banNhap);
            //    //}

            //        // Tạo bản nháp mới từ bản gốc
            //        var banNhapMoi = await CreateDraftFromOriginalAsync(banGoc, request, nguoiTao);
            //        return _mapper.Map<BaiKiemTra, UpdateBaiKiemTraDto>(banNhapMoi);
                
            //}
        }

        // ===== VALIDATE REQUEST =====
        private void ValidateRequest(UpdateBaiKiemTraRequest request)
        {
            // Validate tên bài kiểm tra
            if (string.IsNullOrWhiteSpace(request.TenBaiKiemTra))
                throw new Exception("Tên bài kiểm tra không được để trống");

            if (request.TenBaiKiemTra.Length > 255)
                throw new Exception("Tên bài kiểm tra không được vượt quá 255 ký tự");

            if (request.TenBaiKiemTra.Length < 3)
                throw new Exception("Tên bài kiểm tra phải có ít nhất 3 ký tự");

            // Validate mô tả
            if (request.MoTa != null && request.MoTa.Length > 1000)
                throw new Exception("Mô tả không được vượt quá 1000 ký tự");

            //// Validate điểm đạt
            //if (request.DiemDat < 50 || request.DiemDat > 100)
            //    throw new Exception("Điểm đạt phải từ 50 đến 100");

            //// Validate thời gian
            //if (request.GioiHanThoiGian < 0 || request.GioiHanThoiGian > 1000000000)
            //    throw new Exception("Thời gian làm bài không hợp lệ (0 - 1.000.000.000)");

            //if (request.GioiHanThoiGian < 1)
            //    throw new Exception("Thời gian làm bài phải lớn hơn 0 phút");

            //// Validate số lần làm lại
            //if (request.ChoLamLai == true && request.SoLanLamToiDa <= 0)
            //    throw new Exception("Vui lòng nhập số lần làm lại tối đa khi cho phép làm lại.");

            //if (request.ChoLamLai == true && request.SoLanLamToiDa > 10)
            //    throw new Exception("Số lần làm lại tối đa không được vượt quá 10.");

            //if (request.ChoLamLai == false && request.SoLanLamToiDa > 0)
            //    throw new Exception("Không thể nhập số lần làm lại tối đa khi không cho phép làm lại.");

            // Validate câu hỏi
            if (request.DanhSachCauHoi == null || !request.DanhSachCauHoi.Any())
                throw new Exception("Bài kiểm tra phải có ít nhất một câu hỏi.");

            if (request.DanhSachCauHoi.Count > 50)
                throw new Exception("Bài kiểm tra không được vượt quá 50 câu hỏi.");

            if (request.DanhSachCauHoi.Count < 2)
                throw new Exception("Bài kiểm tra phải có ít nhất 2 câu hỏi.");

            // Validate từng câu hỏi
            ValidateQuestions(request.DanhSachCauHoi);
        }

        // ===== VALIDATE CÂU HỎI =====
        private void ValidateQuestions(List<UpdateCauHoiRequest> questions)
        {
            var validDoKho = new HashSet<string> { "De", "TrungBinh", "Kho" };
            var cauHoiIndex = 1;

            foreach (var cauHoi in questions)
            {
                if (string.IsNullOrWhiteSpace(cauHoi.NoiDungCauHoi))
                    throw new Exception($"Nội dung câu hỏi {cauHoiIndex} không được để trống.");

                if (cauHoi.NoiDungCauHoi.Length > 1000)
                    throw new Exception($"Nội dung câu hỏi {cauHoiIndex} không được vượt quá 1000 ký tự.");

                if (cauHoi.NoiDungCauHoi.Length < 5)
                    throw new Exception($"Nội dung câu hỏi {cauHoiIndex} phải có ít nhất 5 ký tự.");

                if (!string.IsNullOrWhiteSpace(cauHoi.TenCauHoi) && cauHoi.TenCauHoi.Length > 255)
                    throw new Exception($"Tên câu hỏi {cauHoiIndex} không được vượt quá 255 ký tự.");

                if (string.IsNullOrWhiteSpace(cauHoi.DoKho))
                    throw new Exception($"Độ khó câu hỏi {cauHoiIndex} không được để trống.");

                if (!validDoKho.Contains(cauHoi.DoKho))
                    throw new Exception($"Độ khó '{cauHoi.DoKho}' không hợp lệ. Chỉ chấp nhận: De, TrungBinh, Kho.");

                if (cauHoi.ThuTuSapXep.HasValue && cauHoi.ThuTuSapXep < 1)
                    throw new Exception($"Thứ tự sắp xếp câu hỏi {cauHoiIndex} không hợp lệ.");

                if (cauHoi.DanhSachDapAns == null || !cauHoi.DanhSachDapAns.Any())
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' phải có ít nhất 2 đáp án.");

                if (cauHoi.DanhSachDapAns.Count < 2)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' phải có ít nhất 2 đáp án.");

                if (cauHoi.DanhSachDapAns.Count > 6)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' không được vượt quá 6 đáp án.");

                ValidateAnswers(cauHoi, cauHoiIndex);

                var soDapAnDung = cauHoi.DanhSachDapAns.Count(d => d.LaDapAnDung == true);
                if (soDapAnDung == 0)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' phải có ít nhất một đáp án đúng.");

                if (soDapAnDung == cauHoi.DanhSachDapAns.Count)
                    throw new Exception($"Câu hỏi '{cauHoi.NoiDungCauHoi}' không được có tất cả đáp án đúng.");

                cauHoiIndex++;
            }

            // Kiểm tra câu hỏi trùng nội dung
            var cauHoiTrung = questions
                .Where(c => !string.IsNullOrWhiteSpace(c.NoiDungCauHoi))
                .GroupBy(c => c.NoiDungCauHoi.Trim())
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (cauHoiTrung.Any())
                throw new Exception($"Các câu hỏi bị trùng nội dung: {string.Join(", ", cauHoiTrung)}");
        }

        // ===== VALIDATE ĐÁP ÁN =====
        private void ValidateAnswers(UpdateCauHoiRequest cauHoi, int cauHoiIndex)
        {
            var noiDungDapAns = new HashSet<string>();

            foreach (var dapAn in cauHoi.DanhSachDapAns)
            {
                if (string.IsNullOrWhiteSpace(dapAn.NoiDungDapAn))
                    throw new Exception($"Câu hỏi {cauHoiIndex} có đáp án bị để trống.");

                if (dapAn.NoiDungDapAn.Length > 500)
                    throw new Exception($"Câu hỏi {cauHoiIndex} có đáp án vượt quá 500 ký tự.");

                var trimmed = dapAn.NoiDungDapAn.Trim();
                if (!noiDungDapAns.Add(trimmed))
                    throw new Exception($"Câu hỏi {cauHoiIndex} có đáp án bị trùng: {trimmed}");
            }
        }

        // ===== CẬP NHẬT TRỰC TIẾP (DangSua) =====
        private async Task UpdateDirectlyAsync(BaiKiemTra banGoc, UpdateBaiKiemTraRequest request, Guid nguoiTao)
        {
            banGoc.TenBaiKiemTra = request.TenBaiKiemTra.Trim();
            banGoc.MoTa = request.MoTa?.Trim();
            banGoc.DiemDat = 100;
            banGoc.GioiHanThoiGian = 0;
            banGoc.ChoLamLai = true;
            banGoc.SoLanLamToiDa = 0;
            banGoc.TrangThaiPheDuyet = "DangSua";
            banGoc.TrangThai = "DangSua";
            banGoc.IsBanHienTai = true;
            banGoc.UpdatedDate = DateTime.Now;
            banGoc.UpdatedBy = nguoiTao.ToString();
            banGoc.ThuTuSapXep = request.ThuTuSapXep;

            await UpdateAsync(banGoc);
            await SaveAsync();

            if (request.DanhSachCauHoi != null && request.DanhSachCauHoi.Any())
            {
                await UpdateQuestionsAndAnswersAsync(banGoc.Id, request.DanhSachCauHoi);
            }
        }

        // ===== CẬP NHẬT BẢN NHÁP =====
        private async Task UpdateDraftAsync(BaiKiemTra banNhap, BaiKiemTra banGoc, UpdateBaiKiemTraRequest request, Guid nguoiTao)
        {
            banNhap.IdBanGhiTruoc = banGoc.Id;
            banNhap.TenBaiKiemTra = request.TenBaiKiemTra.Trim();
            banNhap.MoTa = request.MoTa?.Trim();
            banNhap.DiemDat = 100;
            banNhap.GioiHanThoiGian = 0;
            banNhap.ChoLamLai = true;
            banNhap.SoLanLamToiDa = 0;
            banNhap.TrangThaiPheDuyet = "DangSua";
            banNhap.TrangThai = "DangSua";
            banNhap.IsBanHienTai = false;
            banNhap.UpdatedDate = DateTime.Now;
            banNhap.UpdatedBy = nguoiTao.ToString();
            banNhap.ThuTuSapXep = request.ThuTuSapXep;

            await UpdateAsync(banNhap);
            await SaveAsync();

            if (request.DanhSachCauHoi != null && request.DanhSachCauHoi.Any())
            {
                await UpdateQuestionsAndAnswersAsync(banNhap.Id, request.DanhSachCauHoi);
            }
        }

        // ===== TẠO BẢN NHÁP MỚI =====
        private async Task<BaiKiemTra> CreateDraftFromOriginalAsync(BaiKiemTra banGoc, UpdateBaiKiemTraRequest request, Guid nguoiTao)
        {
            var banNhapMoi = new BaiKiemTra
            {
                Id = Guid.NewGuid(),
                IdBanGhiTruoc = banGoc.Id,
                IdPhan = banGoc.IdPhan,
                TenBaiKiemTra = request.TenBaiKiemTra.Trim(),
                MoTa = request.MoTa?.Trim(),
                DiemDat = 100,
                GioiHanThoiGian = 0,
                ChoLamLai = true,
                SoLanLamLai = 0,
                SoLanLamToiDa = 0,
                TrangThai = "DangSua",
                TrangThaiPheDuyet = "DangSua",
                IsBanHienTai = false,
                ThuTuSapXep = request.ThuTuSapXep
            };

            await CreateAsync(banNhapMoi);
            await SaveAsync();

            if (request.DanhSachCauHoi != null && request.DanhSachCauHoi.Any())
            {
                await CopyQuestionsAndAnswersAsync(banGoc.Id, banNhapMoi.Id, request.DanhSachCauHoi);
            }

            return banNhapMoi;
        }

        // ===== CẬP NHẬT CÂU HỎI VÀ ĐÁP ÁN =====
        private async Task UpdateQuestionsAndAnswersAsync(Guid idBaiKiemTra, List<UpdateCauHoiRequest> cauHoiRequests)
        {
            var cauHoisCu = await _cauHoiService.GetQueryable()
                .Where(c => c.IdBaiKiemTra == idBaiKiemTra && !c.IsDeleted)
                .ToListAsync();

            var cauHoiIdsCu = cauHoisCu.Select(c => c.Id).ToHashSet();
            var cauHoiIdsMoi = cauHoiRequests.Select(c => c.Id).ToHashSet();

            // Xóa câu hỏi không còn trong danh sách mới
            var canXoa = cauHoisCu.Where(c => !cauHoiIdsMoi.Contains(c.Id)).ToList();
            if (canXoa.Any())
            {
                foreach (var c in canXoa)
                {
                    await _cauHoiService.DeleteAsync(c);
                }
                await _cauHoiService.SaveAsync();
            }

            // Thêm hoặc cập nhật câu hỏi
            foreach (var cauHoiReq in cauHoiRequests)
            {
                var soDapAnDung = cauHoiReq.DanhSachDapAns?.Count(d => d.LaDapAnDung == true) ?? 0;
                var loaiCauHoi = soDapAnDung == 1 ? "ONE" : "MULTI";

                if (cauHoiIdsCu.Contains(cauHoiReq.Id))
                {
                    var cauHoiCu = cauHoisCu.First(c => c.Id == cauHoiReq.Id);
                    cauHoiCu.TenCauHoi = cauHoiReq.TenCauHoi?.Trim();
                    cauHoiCu.NoiDungCauHoi = cauHoiReq.NoiDungCauHoi.Trim();
                    cauHoiCu.LoaiCauHoi = loaiCauHoi;
                    cauHoiCu.DoKho = cauHoiReq.DoKho;
                    cauHoiCu.ThuTuSapXep = cauHoiReq.ThuTuSapXep ?? 0;
                    cauHoiCu.UpdatedDate = DateTime.Now;
                    await _cauHoiService.UpdateAsync(cauHoiCu);

                    await UpdateAnswersAsync(cauHoiCu.Id, cauHoiReq.DanhSachDapAns);
                }
                else
                {
                    var cauHoiMoi = new CauHoi
                    {
                        Id = Guid.NewGuid(),
                        IdBaiKiemTra = idBaiKiemTra,
                        TenCauHoi = cauHoiReq.TenCauHoi?.Trim(),
                        NoiDungCauHoi = cauHoiReq.NoiDungCauHoi.Trim(),
                        LoaiCauHoi = loaiCauHoi,
                        DoKho = cauHoiReq.DoKho,
                        ThuTuSapXep = cauHoiReq.ThuTuSapXep ?? 0,
                        TrangThai = "HoatDong",
                        TrangThaiPheDuyet = "ChoDuyet",
                        IsBanHienTai = true,
                    };
                    await _cauHoiService.CreateAsync(cauHoiMoi);
                    await _cauHoiService.SaveAsync();

                    foreach (var dapAnReq in cauHoiReq.DanhSachDapAns)
                    {
                        var dapAnMoi = new DapAn
                        {
                            Id = Guid.NewGuid(),
                            IdCauHoi = cauHoiMoi.Id,
                            NoiDungDapAn = dapAnReq.NoiDungDapAn.Trim(),
                            LaDapAnDung = dapAnReq.LaDapAnDung,
                            ThuTuSapXep = dapAnReq.ThuTuSapXep ?? 0,
                            TrangThai = "HoatDong",
                            TrangThaiPheDuyet = "ChoDuyet",
                            IsBanHienTai = true,
                        };
                        await _dapAnService.CreateAsync(dapAnMoi);
                    }
                    await _dapAnService.SaveAsync();
                }
            }
        }

        // ===== CẬP NHẬT ĐÁP ÁN =====
        private async Task UpdateAnswersAsync(Guid idCauHoi, List<UpdateDapAnRequest> dapAnRequests)
        {
            if (dapAnRequests == null || !dapAnRequests.Any())
                return;

            var dapAnsCu = await _dapAnService.GetQueryable()
                .Where(d => d.IdCauHoi == idCauHoi && !d.IsDeleted)
                .ToListAsync();

            var dapAnIdsCu = dapAnsCu.Select(d => d.Id).ToHashSet();
            var dapAnIdsMoi = dapAnRequests.Select(d => d.Id).ToHashSet();

            var canXoa = dapAnsCu.Where(d => !dapAnIdsMoi.Contains(d.Id)).ToList();
            if (canXoa.Any())
            {
                foreach (var d in canXoa)
                {
                    d.IsDeleted = true;
                    d.UpdatedDate = DateTime.Now;
                    await _dapAnService.UpdateAsync(d);
                }
                await _dapAnService.SaveAsync();
            }

            foreach (var dapAnReq in dapAnRequests)
            {
                if (dapAnIdsCu.Contains(dapAnReq.Id.Value))
                {
                    var dapAnCu = dapAnsCu.First(d => d.Id == dapAnReq.Id);
                    dapAnCu.NoiDungDapAn = dapAnReq.NoiDungDapAn.Trim();
                    dapAnCu.LaDapAnDung = dapAnReq.LaDapAnDung;
                    dapAnCu.ThuTuSapXep = dapAnReq.ThuTuSapXep ?? 0;
                    dapAnCu.UpdatedDate = DateTime.Now;
                    await _dapAnService.UpdateAsync(dapAnCu);
                }
                else
                {
                    var dapAnMoi = new DapAn
                    {
                        Id = Guid.NewGuid(),
                        IdCauHoi = idCauHoi,
                        NoiDungDapAn = dapAnReq.NoiDungDapAn.Trim(),
                        LaDapAnDung = dapAnReq.LaDapAnDung,
                        ThuTuSapXep = dapAnReq.ThuTuSapXep ?? 0,
                        TrangThai = "HoatDong",
                        TrangThaiPheDuyet = "ChoDuyet",
                        IsBanHienTai = true,
                    };
                    await _dapAnService.CreateAsync(dapAnMoi);
                }
            }
            await _dapAnService.SaveAsync();
        }

        // ===== COPY CÂU HỎI VÀ ĐÁP ÁN =====
        private async Task CopyQuestionsAndAnswersAsync(Guid idBaiKiemTraGoc, Guid idBaiKiemTraMoi, List<UpdateCauHoiRequest> cauHoiRequests)
        {
            foreach (var cauHoiReq in cauHoiRequests)
            {
                var soDapAnDung = cauHoiReq.DanhSachDapAns?.Count(d => d.LaDapAnDung == true) ?? 0;
                var loaiCauHoi = soDapAnDung == 1 ? "ONE" : "MULTI";

                var cauHoiMoi = new CauHoi
                {
                    Id = Guid.NewGuid(),
                    IdBaiKiemTra = idBaiKiemTraMoi,
                    TenCauHoi = cauHoiReq.TenCauHoi?.Trim(),
                    NoiDungCauHoi = cauHoiReq.NoiDungCauHoi.Trim(),
                    LoaiCauHoi = loaiCauHoi,
                    DoKho = cauHoiReq.DoKho,
                    ThuTuSapXep = cauHoiReq.ThuTuSapXep ?? 0,
                    TrangThai = "HoatDong",
                    TrangThaiPheDuyet = "ChoDuyet",
                    IsBanHienTai = true,
                };
                await _cauHoiService.CreateAsync(cauHoiMoi);
                await _cauHoiService.SaveAsync();

                foreach (var dapAnReq in cauHoiReq.DanhSachDapAns)
                {
                    var dapAnMoi = new DapAn
                    {
                        Id = Guid.NewGuid(),
                        IdCauHoi = cauHoiMoi.Id,
                        NoiDungDapAn = dapAnReq.NoiDungDapAn.Trim(),
                        LaDapAnDung = dapAnReq.LaDapAnDung,
                        ThuTuSapXep = dapAnReq.ThuTuSapXep ?? 0,
                        TrangThai = "HoatDong",
                        TrangThaiPheDuyet = "ChoDuyet",
                        IsBanHienTai = true,
                    };
                    await _dapAnService.CreateAsync(dapAnMoi);
                }
                await _dapAnService.SaveAsync();
            }
        }

        // ===== HELPER: LẤY USER ID =====
        private Guid GetCurrentUserId()
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(userId, out var result) ? result : Guid.Empty;
        }

        #endregion

        public async Task<bool> DeleteQuiz(Guid id)
        {
            var quiz = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (quiz == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            // Kiểm tra đã có học viên đăng ký chưa
            var coNguoiHoc = await (
                from ph in _phanRepository.GetQueryable()
                join dk in _dangKyKhoaHocRepository.GetQueryable()
                    on ph.IdKhoaHoc equals dk.IdKhoaHoc
                where ph.Id == quiz.IdPhan
                select dk.Id
            ).AnyAsync();

            var trangThaiMoi = coNguoiHoc
                ? "NgungHoatDong"
                : "DaXoa";

            quiz.TrangThai = trangThaiMoi;

            // Cập nhật câu hỏi
            var cauHois = await _cauHoiService.GetQueryable()
                .Where(x => x.IdBaiKiemTra == id)
                .ToListAsync();

            foreach (var cauHoi in cauHois)
            {
                cauHoi.TrangThai = trangThaiMoi;
                cauHoi.IsDeleted = true;
            }

            var cauHoiIds = cauHois.Select(x => x.Id).ToList();

            var dapAns = await _dapAnService.GetQueryable()
                .Where(x => cauHoiIds.Contains(x.IdCauHoi.Value))
                .ToListAsync();

            foreach (var dapAn in dapAns)
            {
                dapAn.TrangThai = trangThaiMoi;
                dapAn.IsDeleted = true;
            }

            await DeleteAsync(quiz);

            foreach (var cauHoi in cauHois)
            {
                await _cauHoiService.DeleteAsync(cauHoi);
            }

            foreach (var dapAn in dapAns)
            {
                await _dapAnService.DeleteAsync(dapAn);
            }

            return true;
        }

        #region StartQuiz
        public async Task<LanLamBaiKiemTraDto> StartQuiz(StartQuizRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiDangKi);

            if (request.IdBaiKiemTra == Guid.Empty)
                throw new Exception("Thiếu thông tin bài kiểm tra.");

            if (nguoiDangKi == Guid.Empty)
                throw new Exception("Không xác định được người dùng hiện tại.");

            var baiKiemTra = await GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.IdBaiKiemTra && !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            var quizInfo = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == request.IdBaiKiemTra)
                .Join(_phanService.GetQueryable().AsNoTracking(),
                      bkt => bkt.IdPhan,
                      phan => phan.Id,
                      (bkt, phan) => new
                      {
                          QuizIsDeleted = bkt.IsDeleted,
                          PhanIsDeleted = phan.IsDeleted,
                          phan.IdKhoaHoc
                      })
                .FirstOrDefaultAsync();

            if (quizInfo == null)
                throw new Exception("Không tìm thấy bài kiểm tra hoặc phần học chứa bài kiểm tra này.");

            if (quizInfo.PhanIsDeleted)
                throw new Exception("Phần học chứa bài kiểm tra này đã bị xóa.");

            if (quizInfo.QuizIsDeleted)
                throw new Exception("Bài kiểm tra này đã bị xóa hoặc không còn tồn tại.");

            if (quizInfo.IdKhoaHoc == Guid.Empty || quizInfo.IdKhoaHoc == null)
                throw new Exception("Bài kiểm tra không thuộc khóa học nào.");

            var khoaHocTonTai = await _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .AnyAsync(x => x.Id == quizInfo.IdKhoaHoc && !x.IsDeleted);

            if (!khoaHocTonTai)
                throw new Exception("Khóa học chứa bài kiểm tra này không còn tồn tại.");

            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => !x.IsDeleted
                         && x.IdNguoiDangKi == nguoiDangKi
                         && x.IdKhoaHoc == quizInfo.IdKhoaHoc)
                .Select(x => new { x.Id, x.TrangThai })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này.");

            var lanLamDangLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x =>
                    x.IdNguoiDung == nguoiDangKi &&
                    x.IdBaiKiemTra == request.IdBaiKiemTra &&
                    x.TrangThai == "DangLam" &&
                    x.ThoiGianNop == null &&
                    !x.IsDeleted);

            if (lanLamDangLam != null)
                return _mapper.Map<LanLamBaiKiemTra, LanLamBaiKiemTraDto>(lanLamDangLam);

            var soLanDaLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .CountAsync(x =>
                    x.IdNguoiDung == nguoiDangKi &&
                    x.IdBaiKiemTra == request.IdBaiKiemTra &&
                    x.ThoiGianNop != null &&
                    !x.IsDeleted);

            if (baiKiemTra.ChoLamLai != true && soLanDaLam > 0)
                throw new Exception("Bài kiểm tra không cho phép làm lại.");

            if (baiKiemTra.SoLanLamToiDa.HasValue &&
                soLanDaLam >= baiKiemTra.SoLanLamToiDa.Value)
                throw new Exception("Đã vượt quá số lần làm bài.");

            var now = DateTime.Now;
            var lanLam = new LanLamBaiKiemTra
            {
                Id = new Guid(),
                IdBaiKiemTra = request.IdBaiKiemTra,
                IdNguoiDung = nguoiDangKi,
                LamLanThu = soLanDaLam + 1,
                ThoiGianBatDau = now,
                ThoiGianTiepTuc = now,
                ThoiGianCapNhat = now,
                TongThoiGianDaLam = 0,
                TrangThai = "DangLam"
            };

            await _lanLamBaiKiemTraService.CreateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            return _mapper.Map<LanLamBaiKiemTra, LanLamBaiKiemTraDto>(lanLam);
        }
        #endregion

        #region GetQuizForStudent
        public async Task<BaiKiemTraLamBaiDto> GetQuizForStudent(Guid idBaiKiemTra)
        {
            var baiKiemTra = await GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idBaiKiemTra && !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            var cauHois = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra == idBaiKiemTra && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois.Select(x => x.Id).ToList();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value) && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var result = _mapper.Map<BaiKiemTra, BaiKiemTraLamBaiDto>(baiKiemTra);

            result.CauHois = cauHois.Select(c =>
            {
                var item = _mapper.Map<CauHoi, CauHoiLamBaiDto>(c);
                item.DapAns = dapAns
                    .Where(d => d.IdCauHoi == c.Id)
                    .Select(d => _mapper.Map<DapAn, DapAnLamBaiDto>(d))
                    .ToList();
                return item;
            }).ToList();

            return result;
        }
        #endregion

        #region SubmitQuiz
        /// <summary>
        /// Nộp bài kiểm tra (chủ động nộp hoặc hết thời gian tự động nộp).
        /// Gọi CapNhatThoiGianLamBai() trước tiên để cộng nốt thời gian đang làm và tự
        /// loại bỏ khoảng chết nếu có.
        /// </summary>
        public async Task<KetQuaLanKiemTraDto> SubmitQuiz(SubmitQizRequest request)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdLanLamBaiKiemTra && !x.IsDeleted);
            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);

            // 1. Cập nhật thời gian làm bài lần cuối trước khi nộp
            CapNhatThoiGianLamBai(lanLam);
            lanLam.ThoiGianTiepTuc = null; // đóng phiên, không cộng thêm sau khi nộp

            // 2. Kiểm tra hết thời gian (dựa trên TongThoiGianDaLam đã chuẩn hóa)
            bool hetThoiGian = false;
            if (baiKiemTra.GioiHanThoiGian.HasValue && baiKiemTra.GioiHanThoiGian.Value > 0)
            {
                if ((lanLam.TongThoiGianDaLam ?? 0) > baiKiemTra.GioiHanThoiGian.Value)
                    hetThoiGian = true;
            }

            // 3. Lấy danh sách câu trả lời
            List<CauTraLoiSubmitDto> cauTraLois = new List<CauTraLoiSubmitDto>();

            if (hetThoiGian)
            {
                var chiTietList = await _chiTietLamBaiKiemTraService
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.IdLanLamBaiKiemTra == lanLam.Id && !x.IsDeleted && x.IdCauHoi.HasValue)
                    .ToListAsync();

                cauTraLois = chiTietList
                    .GroupBy(x => x.IdCauHoi!.Value)
                    .Select(g => new CauTraLoiSubmitDto
                    {
                        IdCauHoi = g.Key,
                        IdDapAnChons = g.Where(x => x.IdDapAnChon.HasValue)
                                         .Select(x => x.IdDapAnChon!.Value)
                                         .ToList()
                    })
                    .ToList();
            }
            else
            {
                if (request.CauTraLois != null)
                {
                    cauTraLois = request.CauTraLois.Select(r => new CauTraLoiSubmitDto
                    {
                        IdCauHoi = r.IdCauHoi,
                        IdDapAnChons = r.IdDapAnChons ?? new List<Guid>()
                    }).ToList();
                }
            }

            if (!cauTraLois.Any())
            {
                lanLam.ThoiGianNop = DateTime.Now;
                lanLam.Dat = false;
                lanLam.TongDiemLanKiemTra = 0;
                lanLam.TrangThai = "KhongDat";

                await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
                await _lanLamBaiKiemTraService.SaveAsync();

                return new KetQuaLanKiemTraDto
                {
                    IdLanLamBaiKiemTra = lanLam.Id,
                    DatYeuCau = false,
                    TongDiem = 0,
                    TongDiemToiDa = 100,
                    SoCauDung = 0,
                    TongSoCau = 0,
                    ThoiGianBatDau = lanLam.ThoiGianBatDau,
                    ThoiGianKetThuc = DateTime.UtcNow
                };
            }

            // 4. Lấy danh sách câu hỏi và đáp án liên quan
            var cauHoiIds = cauTraLois.Select(x => x.IdCauHoi).Distinct().ToList();
            var cauHois = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => cauHoiIds.Contains(x.Id) && !x.IsDeleted)
                .ToListAsync();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value) && !x.IsDeleted)
                .ToListAsync();

            var cauHoiLookup = cauHois.ToDictionary(x => x.Id);
            var dapAnLookup = dapAns
                .GroupBy(x => x.IdCauHoi!.Value)
                .ToDictionary(x => x.Key, x => x.ToList());

            // 5. Tính điểm theo trọng số độ khó (tổng 100)
            var trongSoMap = new Dictionary<string, int> { { "De", 1 }, { "TrungBinh", 2 }, { "Kho", 3 } };
            var tongTrongSo = cauHois.Sum(x => trongSoMap.GetValueOrDefault(x.DoKho ?? "De", 1));
            var diemTheoCauHoi = new Dictionary<Guid, double>();
            foreach (var ch in cauHois)
            {
                var trongSo = trongSoMap.GetValueOrDefault(ch.DoKho ?? "De", 1);
                var diem = Math.Round((double)trongSo / tongTrongSo * 100, 2);
                diemTheoCauHoi[ch.Id] = diem;
            }

            var tongDiemToiDaTinh = diemTheoCauHoi.Values.Sum();
            var chenh = Math.Round(100 - tongDiemToiDaTinh, 2);
            if (Math.Abs(chenh) > 0.01 && cauHois.Any())
            {
                var cauCuoiId = cauHois.Last().Id;
                diemTheoCauHoi[cauCuoiId] = Math.Round(diemTheoCauHoi[cauCuoiId] + chenh, 2);
            }

            // 6. Chấm bài (multiple-correct, không trừ điểm)
            double tongDiem = 0;
            int soCauDung = 0;
            var chiTietsMoi = new List<ChiTietLamBaiKiemTra>();

            foreach (var traLoi in cauTraLois)
            {
                if (!cauHoiLookup.TryGetValue(traLoi.IdCauHoi, out var cauHoi)) continue;
                if (!dapAnLookup.TryGetValue(traLoi.IdCauHoi, out var dapAnsCauHoi)) continue;

                var correctIds = dapAnsCauHoi
                    .Where(x => x.LaDapAnDung == true)
                    .Select(x => x.Id)
                    .ToHashSet();

                var selectedIds = traLoi.IdDapAnChons.ToHashSet();
                var diemCauNay = diemTheoCauHoi.GetValueOrDefault(cauHoi.Id, 0);
                var soDapAnDung = correctIds.Count;

                if (soDapAnDung == 0) continue;

                var diemMoiDapAnDung = diemCauNay / soDapAnDung;
                var soDapAnDungChon = selectedIds.Intersect(correctIds).Count();
                var diemNhanDuoc = soDapAnDungChon * diemMoiDapAnDung;
                if (diemNhanDuoc < 0) diemNhanDuoc = 0;

                tongDiem += diemNhanDuoc;
                if (selectedIds.SetEquals(correctIds))
                    soCauDung++;

                foreach (var dapAnId in selectedIds)
                {
                    var existed = await _chiTietLamBaiKiemTraService
                        .GetQueryable()
                        .AnyAsync(x => x.IdLanLamBaiKiemTra == lanLam.Id
                                    && x.IdCauHoi == cauHoi.Id
                                    && x.IdDapAnChon == dapAnId);
                    if (!existed)
                    {
                        chiTietsMoi.Add(new ChiTietLamBaiKiemTra
                        {
                            Id = Guid.NewGuid(),
                            IdLanLamBaiKiemTra = lanLam.Id,
                            IdCauHoi = cauHoi.Id,
                            IdDapAnChon = dapAnId,
                            LaDung = correctIds.Contains(dapAnId),
                            DiemNhanDuoc = correctIds.Contains(dapAnId) ? diemMoiDapAnDung : 0
                        });
                    }
                }
            }

            // 7. Cập nhật lần làm bài
            tongDiem = Math.Round(tongDiem, 2);
            var datYeuCau = tongDiem >= (baiKiemTra.DiemDat ?? 0);

            lanLam.ThoiGianNop = DateTime.Now;
            lanLam.Dat = datYeuCau;
            lanLam.TongDiemLanKiemTra = tongDiem;
            lanLam.TrangThai = datYeuCau ? "Dat" : "KhongDat";

            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            // 8. Lưu chi tiết mới
            foreach (var ct in chiTietsMoi)
                await _chiTietLamBaiKiemTraService.CreateAsync(ct);
            await _chiTietLamBaiKiemTraService.SaveAsync();

            // 9. Trả về kết quả
            return new KetQuaLanKiemTraDto
            {
                IdLanLamBaiKiemTra = lanLam.Id,
                DatYeuCau = datYeuCau,
                TongDiem = tongDiem,
                TongDiemToiDa = 100,
                SoCauDung = soCauDung,
                SoCauSai = cauHoiIds.Count - soCauDung,
                TongSoCau = cauHois.Count,
                ThoiGianBatDau = lanLam.ThoiGianBatDau,
                ThoiGianKetThuc = DateTime.UtcNow
            };
        }
        #endregion

        #region GetReviewQuiz 
        public async Task<ReviewQizzDto> GetReviewQuiz(Guid idLanLamBai)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idLanLamBai && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            var chiTiets = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdLanLamBaiKiemTra == idLanLamBai && !x.IsDeleted)
                .ToListAsync();

            if (!chiTiets.Any())
                throw new Exception("Không tìm thấy chi tiết bài làm.");

            var cauHoiIds = chiTiets
                .Where(x => x.IdCauHoi.HasValue)
                .Select(x => x.IdCauHoi!.Value)
                .Distinct()
                .ToList();

            var cauHois = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => cauHoiIds.Contains(x.Id) && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdCauHoi.HasValue && cauHoiIds.Contains(x.IdCauHoi.Value) && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var chiTietLookup = chiTiets
                .Where(x => x.IdCauHoi.HasValue)
                .ToDictionary(x => x.IdCauHoi!.Value, x => x);

            var dapAnDungLookup = dapAns
                .Where(x => x.LaDapAnDung == true && x.IdCauHoi.HasValue)
                .ToDictionary(x => x.IdCauHoi!.Value, x => x);

            var dapAnLookup = dapAns
                .Where(x => x.IdCauHoi.HasValue)
                .GroupBy(x => x.IdCauHoi!.Value)
                .ToDictionary(x => x.Key, x => x.ToList());

            var review = new ReviewQizzDto
            {
                IdLanLamBaiKiemTra = lanLam.Id,
                Dat = lanLam.Dat ?? false,
                TongDiem = chiTiets.Sum(x => x.DiemNhanDuoc ?? 0),
                ThoiGianNop = lanLam.ThoiGianNop,
                CauHois = new List<CauHoiReviewDto>()
            };

            foreach (var cauHoi in cauHois)
            {
                if (!chiTietLookup.TryGetValue(cauHoi.Id, out var chiTiet))
                    continue;

                dapAnDungLookup.TryGetValue(cauHoi.Id, out var dapAnDung);
                dapAnLookup.TryGetValue(cauHoi.Id, out var dsDapAn);

                var cauHoiReview = new CauHoiReviewDto
                {
                    IdCauHoi = cauHoi.Id,
                    TenCauHoi = cauHoi.TenCauHoi,
                    NoiDungCauHoi = cauHoi.NoiDungCauHoi,
                    IdDapAnChon = chiTiet.IdDapAnChon,
                    IdDapAnDung = dapAnDung?.Id,
                    LaDung = chiTiet.LaDung ?? false,
                    DiemNhanDuoc = chiTiet.DiemNhanDuoc ?? 0,
                    DapAns = dsDapAn?
                        .Select(x => new DapAnReviewDto
                        {
                            Id = x.Id,
                            NoiDungDapAn = x.NoiDungDapAn,
                            LaDapAnDung = x.LaDapAnDung ?? false
                        })
                        .ToList()
                        ?? new List<DapAnReviewDto>()
                };

                review.CauHois.Add(cauHoiReview);
            }

            return review;
        }
        #endregion

        #region CheckCanRetake
        public async Task<bool> CheckCanRetake(Guid idBaiKiemTra)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDung);

            var baiKiemTra = await GetByIdOrThrowAsync(idBaiKiemTra);

            if (baiKiemTra.ChoLamLai != true)
                return false;

            var soLanDaLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .CountAsync(x =>
                    x.IdNguoiDung == idNguoiDung &&
                    x.IdBaiKiemTra == idBaiKiemTra &&
                    !x.IsDeleted);

            return soLanDaLam < (baiKiemTra.SoLanLamToiDa ?? 1);
        }
        #endregion

        #region GetHistory
        public async Task<List<LichSuLamBaiDto>> GetHistory(Guid idBaiKiemTra)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var idNguoiDung);

            return await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdNguoiDung == idNguoiDung &&
                    x.IdBaiKiemTra == idBaiKiemTra &&
                    !x.IsDeleted)
                .OrderByDescending(x => x.LamLanThu)
                .Select(x => new LichSuLamBaiDto
                {
                    IdLanLamBaiKiemTra = x.Id,
                    LamLanThu = x.LamLanThu,
                    Dat = x.Dat,
                    ThoiGianBatDau = x.ThoiGianBatDau,
                    ThoiGianNop = x.ThoiGianNop
                })
                .ToListAsync();
        }
        #endregion

        #region AutoSaveCauTraLoi
        public async Task<AutoSaveDapAnDto> AutoSaveCauTraLoi(AutoSaveRequest request)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdLanLamBaiKiemTra && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);
            var gioiHanThoiGian = baiKiemTra.GioiHanThoiGian ?? 0;

            if (gioiHanThoiGian > 0)
            {
                var thoiGianConLai = TinhThoiGianConLai(lanLam, gioiHanThoiGian);
                if (thoiGianConLai <= 0)
                    throw new Exception("Đã hết thời gian làm bài. Vui lòng nộp bài.");
            }

            var allQuestions = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra == baiKiemTra.Id && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .Select(x => x.Id)
                .ToListAsync();

            var answeredQuestions = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdLanLamBaiKiemTra == request.IdLanLamBaiKiemTra &&
                            !x.IsDeleted &&
                            x.IdCauHoi.HasValue)
                .Select(x => x.IdCauHoi!.Value)
                .Distinct()
                .ToListAsync();

            var nextRequiredQuestion = allQuestions.FirstOrDefault(x => !answeredQuestions.Contains(x));

            var isCurrentQuestion = request.IdCauHoi == nextRequiredQuestion;
            var isAlreadyAnswered = answeredQuestions.Contains(request.IdCauHoi);
            var isAllowed = isCurrentQuestion || isAlreadyAnswered;

            if (!isAllowed)
            {
                var nextQuestionNumber = allQuestions.IndexOf(nextRequiredQuestion) + 1;
                throw new Exception($"Vui lòng trả lời câu hỏi số {nextQuestionNumber} trước khi chuyển sang câu khác.");
            }

            var cauHoi = await _cauHoiService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdCauHoi && !x.IsDeleted);

            if (cauHoi == null)
                throw new Exception("Không tìm thấy câu hỏi.");

            var existingAnswers = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .Where(x => x.IdLanLamBaiKiemTra == request.IdLanLamBaiKiemTra &&
                            x.IdCauHoi == request.IdCauHoi &&
                            !x.IsDeleted)
                .ToListAsync();

            foreach (var old in existingAnswers)
            {
                await _chiTietLamBaiKiemTraService.DeleteAsync(old);
            }

            var chiTiets = new List<ChiTietLamBaiKiemTra>();

            foreach (var idDapAn in request.IdDapAnChons)
            {
                var dapAn = await _dapAnService
                    .GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == idDapAn && !x.IsDeleted);

                if (dapAn != null)
                {
                    chiTiets.Add(new ChiTietLamBaiKiemTra
                    {
                        Id = Guid.NewGuid(),
                        IdLanLamBaiKiemTra = request.IdLanLamBaiKiemTra,
                        IdCauHoi = request.IdCauHoi,
                        IdDapAnChon = idDapAn,
                        LaDung = dapAn.LaDapAnDung == true,
                        DiemNhanDuoc = 0,
                        CreatedDate = DateTime.Now
                    });
                }
            }

            foreach (var ct in chiTiets)
            {
                await _chiTietLamBaiKiemTraService.CreateAsync(ct);
            }
            await _chiTietLamBaiKiemTraService.SaveAsync();

            // Cập nhật thời gian - tự phát hiện khoảng chết nếu user vừa mất điện rồi quay lại
            CapNhatThoiGianLamBai(lanLam);
            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            var soCauDaLam = await GetSoCauDaLam(request.IdLanLamBaiKiemTra);
            var tongSoCau = allQuestions.Count;
            var daHoanThanh = soCauDaLam == tongSoCau;

            Guid? nextQuestionId = null;
            if (!daHoanThanh)
            {
                var currentAnswered = await _chiTietLamBaiKiemTraService
                    .GetQueryable()
                    .Where(x => x.IdLanLamBaiKiemTra == request.IdLanLamBaiKiemTra &&
                                !x.IsDeleted &&
                                x.IdCauHoi.HasValue)
                    .Select(x => x.IdCauHoi!.Value)
                    .Distinct()
                    .ToListAsync();

                nextQuestionId = allQuestions.FirstOrDefault(x => !currentAnswered.Contains(x));
            }

            var thoiGianConLaiResult = gioiHanThoiGian > 0 ? TinhThoiGianConLai(lanLam, gioiHanThoiGian) : 0;

            return new AutoSaveDapAnDto
            {
                Success = true,
                SoCauDaLam = soCauDaLam,
                TongSoCau = tongSoCau,
                DaHoanThanh = daHoanThanh,
                NextQuestionId = nextQuestionId,
                ThoiGianConLai = thoiGianConLaiResult,
                CoGioiHan = gioiHanThoiGian > 0,
                Message = daHoanThanh ? "Bạn đã hoàn thành tất cả câu hỏi! Hãy nộp bài." : "Đã lưu câu trả lời."
            };
        }
        #endregion

        #region Heartbeat
        /// <summary>
        /// FE gọi định kỳ (10s) khi tab visible. Mất điện/đóng tab -> FE đơn giản không
        /// gọi được nữa, không cần báo gì. Lần gọi kế tiếp (heartbeat, autosave, continue,
        /// submit) sẽ tự phát hiện khoảng trống lớn qua CapNhatThoiGianLamBai và cắt bỏ.
        /// </summary>
        public async Task<HeartbeatResultDto> Heartbeat(Guid idLanLamBaiKiemTra)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLanLamBaiKiemTra && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            CapNhatThoiGianLamBai(lanLam);

            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);
            var gioiHanThoiGian = baiKiemTra.GioiHanThoiGian ?? 0;

            return new HeartbeatResultDto
            {
                TongThoiGianDaLam = lanLam.TongThoiGianDaLam ?? 0,
                ThoiGianConLai = gioiHanThoiGian > 0 ? TinhThoiGianConLai(lanLam, gioiHanThoiGian) : 0,
                CoGioiHan = gioiHanThoiGian > 0
            };
        }
        #endregion

        #region ContinueQuizFull
        public async Task<ContinueQuizFullDto> ContinueQuizFull(Guid idLanLamBaiKiemTra)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLanLamBaiKiemTra && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);
            var gioiHanThoiGian = baiKiemTra.GioiHanThoiGian ?? 0;

            // 1. Chuẩn hóa thời gian ngay khi resume - tự cắt khoảng chết nếu có
            CapNhatThoiGianLamBai(lanLam);
            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            // 2. Kiểm tra hết giờ SAU khi đã chuẩn hóa
            if (gioiHanThoiGian > 0)
            {
                var thoiGianConLai = TinhThoiGianConLai(lanLam, gioiHanThoiGian);
                if (thoiGianConLai <= 0)
                    throw new Exception("Đã hết thời gian làm bài. Vui lòng nộp bài để xem kết quả.");
            }

            var allQuestions = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra == baiKiemTra.Id && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var savedAnswers = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdLanLamBaiKiemTra == idLanLamBaiKiemTra &&
                            !x.IsDeleted &&
                            x.IdCauHoi.HasValue &&
                            x.IdDapAnChon.HasValue)
                .GroupBy(x => x.IdCauHoi!.Value)
                .ToDictionaryAsync(
                    g => g.Key,
                    g => g.Select(x => x.IdDapAnChon!.Value).ToList()
                );

            var answeredQuestionIds = savedAnswers.Keys.ToList();
            var currentQuestion = allQuestions.FirstOrDefault(x => !answeredQuestionIds.Contains(x.Id));
            var currentQuestionIndex = currentQuestion != null
                ? allQuestions.FindIndex(x => x.Id == currentQuestion.Id)
                : allQuestions.Count - 1;

            var quizData = await GetQuizForStudent(baiKiemTra.Id);

            foreach (var cauHoi in quizData.CauHois)
            {
                if (savedAnswers.ContainsKey(cauHoi.Id))
                {
                    cauHoi.DapAnDaChon = savedAnswers[cauHoi.Id];
                    cauHoi.DaTraLoi = true;
                }
                else
                {
                    cauHoi.DaTraLoi = false;
                    cauHoi.DapAnDaChon = new List<Guid>();
                }
            }

            return new ContinueQuizFullDto
            {
                IdLanLamBaiKiemTra = idLanLamBaiKiemTra,
                IdBaiKiemTra = baiKiemTra.Id,
                TenBaiKiemTra = baiKiemTra.TenBaiKiemTra,
                CurrentQuestionIndex = currentQuestionIndex,
                CurrentQuestionId = currentQuestion?.Id,
                SavedAnswers = savedAnswers,
                AllQuestions = quizData.CauHois,
                Progress = new TienDoQuizDto
                {
                    SoCauDaLam = answeredQuestionIds.Count,
                    TongSoCau = allQuestions.Count,
                    PhanTram = allQuestions.Count > 0 ? (double)answeredQuestionIds.Count / allQuestions.Count * 100 : 0,
                    DaHoanThanh = answeredQuestionIds.Count == allQuestions.Count
                },
                ThoiGian = new QuizTimeDto
                {
                    ThoiGianBatDau = lanLam.ThoiGianBatDau.Value,
                    ThoiGianDaLam = lanLam.TongThoiGianDaLam ?? 0,
                    ThoiGianConLai = gioiHanThoiGian > 0 ? TinhThoiGianConLai(lanLam, gioiHanThoiGian) : 0,
                    GioiHanThoiGian = gioiHanThoiGian,
                    CoGioiHan = gioiHanThoiGian > 0
                }
            };
        }
        #endregion

        #region PT hỗ trợ

        /// <summary>
        /// Hàm trung tâm xử lý thời gian làm bài - dùng chung cho Heartbeat, AutoSave,
        /// ContinueQuizFull, SubmitQuiz. Nơi DUY NHẤT cộng dồn TongThoiGianDaLam.
        /// </summary>
        private void CapNhatThoiGianLamBai(LanLamBaiKiemTra lanLam)
        {
            var now = DateTime.Now;

            if (lanLam.ThoiGianTiepTuc.HasValue)
            {
                var khoangCach = (now - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;

                if (khoangCach > 0 && khoangCach <= HEARTBEAT_TIMEOUT_SECONDS)
                {
                    lanLam.TongThoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0) + khoangCach;
                }
                else if (khoangCach > HEARTBEAT_TIMEOUT_SECONDS)
                {
                    lanLam.TongThoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0) + HEARTBEAT_TIMEOUT_SECONDS;
                }
            }

            lanLam.ThoiGianTiepTuc = now;
            lanLam.ThoiGianCapNhat = now;
        }

        private async Task<int> GetSoCauDaLam(Guid idLanLamBaiKiemTra)
        {
            return await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdLanLamBaiKiemTra == idLanLamBaiKiemTra &&
                            !x.IsDeleted &&
                            x.IdCauHoi.HasValue)
                .Select(x => x.IdCauHoi!.Value)
                .Distinct()
                .CountAsync();
        }

        private double TinhThoiGianConLai(LanLamBaiKiemTra lanLam, int gioiHanThoiGian)
        {
            if (gioiHanThoiGian <= 0) return 0;

            double thoiGianDaLam = lanLam.TongThoiGianDaLam ?? 0;

            if (lanLam.ThoiGianTiepTuc.HasValue)
            {
                var khoangCach = (DateTime.Now - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;
                thoiGianDaLam += Math.Min(Math.Max(0, khoangCach), HEARTBEAT_TIMEOUT_SECONDS);
            }

            return Math.Max(0, gioiHanThoiGian - thoiGianDaLam);
        }
        #endregion

        //FE
            //        let heartbeatTimer;

            //        function startHeartbeat(lanLamId)
            //        {
            //            heartbeatTimer = setInterval(() => {
            //            if (document.visibilityState === 'visible')
            //            {
            //                fetch(`/ api / quiz /${ lanLamId}/ heartbeat`, { method: 'POST' });
            //        }
            //    }, 10000); // 10s < HEARTBEAT_TIMEOUT_SECONDS (20s)
            //}

            //function stopHeartbeat()
            //{
            //    clearInterval(heartbeatTimer);
            //}
    }
}

