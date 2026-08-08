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

            if (request.MoTa != null && request.MoTa.Length > 299)
                throw new Exception("Mô tả không được vượt quá 299 ký tự.");
            try
            {
                var newQuiz = new BaiKiemTra
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

                await CreateAsync(newQuiz);
                await SaveAsync();
                return new CreateBaiKiemTraDto
                {
                    Id = newQuiz.Id,
                    IdPhan = newQuiz.IdPhan,
                    TenBaiKiemTra = newQuiz.TenBaiKiemTra,
                    MoTa = newQuiz.MoTa,
                    DiemDat = newQuiz.DiemDat,
                    GioiHanThoiGian = newQuiz.GioiHanThoiGian,
                    ChoLamLai = newQuiz.ChoLamLai,
                    SoLanLamToiDa = newQuiz.SoLanLamToiDa,
                    TrangThai = newQuiz.TrangThai,
                    TrangThaiPheDuyet = newQuiz.TrangThaiPheDuyet,
                    IsBanHienTai = newQuiz.IsBanHienTai,
                    ThuTuSapXep = newQuiz.ThuTuSapXep
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Tạo bài kiểm tra thất bại: {ex.Message}");
            }
        }

        public async Task<UpdateBaiKiemTraDto> UpdateQuiz(UpdateBaiKiemTraRequest request)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);
            var entity = await GetQueryable().FirstOrDefaultAsync(x => x.Id == request.IdBaiKiemTra);

            if (request == null)
                throw new ArgumentNullException(nameof(request), "Yêu cầu không hợp lệ.");

            if (entity == null)
                throw new Exception("Không tìm thấy bài kiểm tra");

            if (entity.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền chỉnh sửa bài kiểm tra này");

            if (string.IsNullOrWhiteSpace(request.TenBaiKiemTra))
                throw new Exception("Tên bài kiểm tra không được để trống.");

            if (request.TenBaiKiemTra.Length < 3)
                throw new Exception("Tên bài kiểm tra phải có ít nhất 3 ký tự.");

            if (request.TenBaiKiemTra.Length > 99)
                throw new Exception("Tên bài kiểm tra không được vượt quá 99 ký tự.");

            if (request.MoTa != null && request.MoTa.Length > 299)
                throw new Exception("Mô tả không được vượt quá 299 ký tự.");
            try
            {
                entity.TenBaiKiemTra = request.TenBaiKiemTra.Trim();
                entity.MoTa = request.MoTa?.Trim();
                entity.TrangThai = "DangSua";
                entity.TrangThaiPheDuyet = "DangSua";
                entity.IsBanHienTai = true;
                entity.ThuTuSapXep = request.ThuTuSapXep;

                await UpdateAsync(entity);
                await SaveAsync();

                return _mapper.Map<BaiKiemTra, UpdateBaiKiemTraDto>(entity);
            }
            catch (Exception ex)
            {
                throw new Exception($"Cập nhật bài kiểm tra thất bại: {ex.Message}");
            }
        }

        public async Task<bool> DeleteQuiz(Guid id)
        {
            var quiz = await GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (quiz == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiXoaQuiz);
            if (quiz.CreatedId != nguoiXoaQuiz)
                throw new Exception("Bạn không có quyền hạn để xóa bài kiểm tra này!");

            if (quiz.TrangThaiPheDuyet == "ChoDuyet" || quiz.TrangThaiPheDuyet == "DangDuyet")
                throw new Exception("Đang gửi duyệt không thể xóa");

            // Kiểm tra đã có học viên đăng ký chưa
            var coNguoiHoc = await (
                from ph in _phanRepository.GetQueryable()
                join dk in _dangKyKhoaHocRepository.GetQueryable()
                    on ph.IdKhoaHoc equals dk.IdKhoaHoc
                where ph.Id == quiz.IdPhan
                select dk.Id
            ).AnyAsync();

            quiz.TrangThai = coNguoiHoc ? "NgungHoatDong" : "DaXoa";
            await DeleteAsync(quiz);
            await SaveAsync();
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

            if (baiKiemTra.ChoLamLai == false && soLanDaLam > 0)
                throw new Exception("Bài kiểm tra không cho phép làm lại.");

            if (baiKiemTra.SoLanLamToiDa.HasValue &&
                baiKiemTra.SoLanLamToiDa.Value > 0 &&
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
                // 🔽 CẢI TIẾN: Nếu request gửi lên bị null, vẫn lấy từ DB để tránh mất điểm oan
                if (request.CauTraLois != null && request.CauTraLois.Any())
                {
                    cauTraLois = request.CauTraLois.Select(r => new CauTraLoiSubmitDto
                    {
                        IdCauHoi = r.IdCauHoi,
                        IdDapAnChons = r.IdDapAnChons ?? new List<Guid>()
                    }).ToList();
                }
                else
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
            if (Math.Abs(chenh) >= 0.01 && cauHois.Any())
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
            var datYeuCau = Math.Round(tongDiem) >= (baiKiemTra.DiemDat ?? 0);

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

            // 🚀 Tính flag cho xem đáp án: Chỉ được xem nếu Đúng 100%
            var tongDiem = chiTiets.Sum(x => x.DiemNhanDuoc ?? 0);
            var choXemDapAn = lanLam.Dat == true && Math.Round(tongDiem, 2) >= 99.99;

            var review = new ReviewQizzDto
            {
                IdLanLamBaiKiemTra = lanLam.Id,
                Dat = lanLam.Dat ?? false,
                TongDiem = tongDiem,
                ThoiGianNop = lanLam.ThoiGianNop,
                ChoXemDapAn = choXemDapAn, // <-- Gán giá trị vào DTO
                CauHois = new List<CauHoiReviewDto>()
            };

            foreach (var cauHoi in cauHois)
            {
                if (!chiTietLookup.TryGetValue(cauHoi.Id, out var chiTiet))
                    continue;

                dapAnDungLookup.TryGetValue(cauHoi.Id, out var dapAnDung);
                dapAnLookup.TryGetValue(cauHoi.Id, out var dsDapAn);

                // 🚀 Quyết định gửi đáp án nào về FE
                List<DapAnReviewDto> dapAnGuiVe;
                if (choXemDapAn)
                {
                    // Nếu được xem, gửi toàn bộ
                    dapAnGuiVe = dsDapAn?
                        .Select(x => new DapAnReviewDto
                        {
                            Id = x.Id,
                            NoiDungDapAn = x.NoiDungDapAn,
                            LaDapAnDung = x.LaDapAnDung ?? false
                        })
                        .ToList() ?? new List<DapAnReviewDto>();
                }
                else
                {
                    // Nếu không được xem, ẩn toàn bộ đáp án đúng (set LaDapAnDung = false)
                    dapAnGuiVe = dsDapAn?
                        .Select(x => new DapAnReviewDto
                        {
                            Id = x.Id,
                            NoiDungDapAn = x.NoiDungDapAn,
                            LaDapAnDung = false // 🛡️ Không cho FE biết đâu là đáp án đúng
                        })
                        .ToList() ?? new List<DapAnReviewDto>();
                }

                var cauHoiReview = new CauHoiReviewDto
                {
                    IdCauHoi = cauHoi.Id,
                    TenCauHoi = cauHoi.TenCauHoi,
                    NoiDungCauHoi = cauHoi.NoiDungCauHoi,
                    IdDapAnChon = chiTiet.IdDapAnChon,
                    IdDapAnDung = dapAnDung?.Id,
                    LaDung = chiTiet.LaDung ?? false,
                    DiemNhanDuoc = chiTiet.DiemNhanDuoc ?? 0,
                    DapAns = dapAnGuiVe
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
            x.ThoiGianNop != null &&   // ← chỉ đếm lần đã nộp
            !x.IsDeleted);

            if (!baiKiemTra.SoLanLamToiDa.HasValue || baiKiemTra.SoLanLamToiDa.Value == 0)
                return true;

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
                    TongDiem = x.TongDiemLanKiemTra,
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
    }
}