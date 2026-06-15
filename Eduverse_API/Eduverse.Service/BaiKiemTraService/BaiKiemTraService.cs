using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.CauHoiService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.ChiTietLamBaiKiemTraService;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DapAnService;
using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LanLamBaiKiemTraService.Dto;
using Eduverse.Service.PhanService;
using Eduverse.Service.TienDoHocTapService;
using Microsoft.EntityFrameworkCore;

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
            IDangKyKhoaHocRepository dangKyKhoaHocRepository) : base(baiKiemTraRepository)
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
        }


        public async Task<CreateBaiKiemTraDto> CreateQuiz( CreateBaiKiemTraRequest request)
        {
            if (request.IdPhan == null)
                throw new Exception("Phần học không hợp lệ.");

            var phan = await _phanService.GetByIdAsync(request.IdPhan);

            if (phan == null)
                throw new Exception("Không tìm thấy phần học.");

            var entity = new BaiKiemTra
            {
                IdPhan = request.IdPhan,
                TenBaiKiemTra = request.TenBaiKiemTra,
                MoTa = request.MoTa,
                DiemDat = request.DiemDat,
                GioiHanThoiGian = request.GioiHanThoiGian,
                ChoLamLai = true,
                SoLanLamToiDa = request.ChoLamLai == true ? request.SoLanLamToiDa : 0,
                TrangThai = "HoatDong",
            };

            await CreateAsync(entity);
            await SaveAsync();
            return _mapper.Map<BaiKiemTra, CreateBaiKiemTraDto>(entity);
        }


        public async Task<UpdateBaiKiemTraDto> UpdateQuiz(UpdateBaiKiemTraRequest request)
        {
            var quiz = await GetByIdOrThrowAsync(request.Id);

            quiz.TenBaiKiemTra = request.TenBaiKiemTra;
            quiz.MoTa = request.MoTa;
            quiz.DiemDat = request.DiemDat;
            quiz.GioiHanThoiGian = request.GioiHanThoiGian;
            quiz.ChoLamLai = true;
            quiz.SoLanLamLai = request.ChoLamLai == true ? request.SoLanLamLai : 0;
            quiz.SoLanLamToiDa = request.ChoLamLai == true ? request.SoLanLamToiDa : 0;

            if (!string.IsNullOrWhiteSpace(request.TrangThai))
            {
                quiz.TrangThai = request.TrangThai;
            }

            await UpdateAsync(quiz);
            await SaveAsync();

            return _mapper.Map<BaiKiemTra, UpdateBaiKiemTraDto>(quiz);
        }


        public async Task<bool> DeleteQuiz(Guid id)
        {
            var quiz = await GetByIdOrThrowAsync(id);

            var daCoNguoiLam = await _lanLamBaiKiemTraService
                .AnyAsync(x =>
                    x.IdBaiKiemTra == id &&
                    !x.IsDeleted);

            if (daCoNguoiLam)
                throw new Exception(
                    "Bài kiểm tra đã có người làm, không thể xóa.");

            quiz.IsDeleted = true;

            await UpdateAsync(quiz);

            return true;
        }


        public async Task<LanLamBaiKiemTraDto> StartQuiz(StartQuizRequest request)
        {
            var baiKiemTra = await GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == request.IdBaiKiemTra &&
                    !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            var dangKy = await _dangKyKhoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == request.IdDangKi && !x.IsDeleted)
                .Select(x => new { x.IdNguoiDangKi, x.IdDangKi })
                .FirstOrDefaultAsync();

            if (dangKy == null)
                throw new Exception("Bạn chưa đăng ký khóa học này.");

            //Kiểm tra bài kiểm tra này có thuộc 1 phần học của khóa học đã đăng ký không
            var quizThuocKhoaHoc = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.Id == request.IdBaiKiemTra && !x.IsDeleted)
                .Join(_phanService.GetQueryable().AsNoTracking().Where(p => !p.IsDeleted),
                      bkt => bkt.IdPhan,
                      phan => phan.Id,
                      (bkt, phan) => phan.IdKhoaHoc)
                .FirstOrDefaultAsync();

            if (quizThuocKhoaHoc == null)
                throw new Exception("Không tìm thấy bài kiểm tra hoặc bài kiểm tra không thuộc phần học nào.");

            if (quizThuocKhoaHoc != dangKy.IdDangKi)
                throw new Exception("Bài kiểm tra không thuộc khóa học bạn đã đăng ký.");


            var idNguoiDung = dangKy.IdNguoiDangKi;

            var lanLamDangLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x =>
                    x.IdNguoiDung == idNguoiDung &&
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
                    x.IdNguoiDung == idNguoiDung &&
                    x.IdBaiKiemTra == request.IdBaiKiemTra &&
                    x.ThoiGianNop != null &&
                    !x.IsDeleted);

            if (baiKiemTra.ChoLamLai != true && soLanDaLam > 0)
                throw new Exception("Bài kiểm tra không cho phép làm lại.");

            if (baiKiemTra.SoLanLamToiDa.HasValue &&
                soLanDaLam >= baiKiemTra.SoLanLamToiDa.Value)
                throw new Exception("Đã vượt quá số lần làm bài.");

            var lanLam = new LanLamBaiKiemTra
            {
                IdBaiKiemTra = request.IdBaiKiemTra,
                IdNguoiDung = idNguoiDung,
                LamLanThu = soLanDaLam + 1,
                ThoiGianBatDau = DateTime.Now,
                ThoiGianTiepTuc = DateTime.Now,
                TrangThai = "DangLam"
            };

            await _lanLamBaiKiemTraService.CreateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            return _mapper.Map<LanLamBaiKiemTra, LanLamBaiKiemTraDto>(lanLam);
        }


        // Lấy đề thi cho học viên
        public async Task<BaiKiemTraLamBaiDto> GetQuizForStudent(Guid idBaiKiemTra)
        {
            var baiKiemTra = await GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == idBaiKiemTra &&
                    !x.IsDeleted); 

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            var cauHois = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>x.IdBaiKiemTra == idBaiKiemTra &&!x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var cauHoiIds = cauHois
                .Select(x => x.Id)
                .ToList();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdCauHoi.HasValue &&
                    cauHoiIds.Contains(x.IdCauHoi.Value) &&
                    !x.IsDeleted)
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


        // Nộp bài và chấm điểm
        /// <summary>
        /// Nộp bài kiểm tra (có thể do người dùng chủ động nộp hoặc hết thời gian tự động nộp)
        /// Hỗ trợ câu hỏi nhiều đáp án đúng: điểm mỗi đáp án đúng = điểm_câu / số_đáp_án_đúng, không trừ điểm sai
        /// </summary>
            public async Task<KetQuaLanKiemTraDto> SubmitQuiz(SubmitQizRequest request)
            {
                // 1. Lấy thông tin lần làm bài
                var lanLam = await _lanLamBaiKiemTraService
                    .GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == request.IdLanLamBaiKiemTra && !x.IsDeleted);
                if (lanLam == null)
                    throw new Exception("Không tìm thấy lần làm bài.");

                var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);

                // 2. Kiểm tra hết thời gian
                bool hetThoiGian = false;
                if (baiKiemTra.GioiHanThoiGian.HasValue && baiKiemTra.GioiHanThoiGian.Value > 0)
                {
                    var thoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0);
                    if (lanLam.ThoiGianTiepTuc.HasValue)
                        thoiGianDaLam += (DateTime.Now - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;

                    if (thoiGianDaLam > baiKiemTra.GioiHanThoiGian.Value)
                        hetThoiGian = true;
                }

                // 3. Lấy danh sách câu trả lời (chuyển thành kiểu trung gian)
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
                    // Chuyển từ CauTraLoiRequest sang CauTraLoiSubmitDto một cách tường minh
                    if (request.CauTraLois != null)
                    {
                        cauTraLois = request.CauTraLois.Select(r => new CauTraLoiSubmitDto
                        {
                            IdCauHoi = r.IdCauHoi,
                            IdDapAnChons = r.IdDapAnChons ?? new List<Guid>()
                        }).ToList();
                    }
                }


                // Nếu không có câu trả lời nào -> 0 điểm
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
                var nhomDoKho = cauHois
                    .GroupBy(x => x.DoKho ?? "De")
                    .ToDictionary(x => x.Key, x => x.ToList());

                foreach (var nhom in nhomDoKho)
                {
                    var trongSo = trongSoMap.GetValueOrDefault(nhom.Key, 1);
                    var soCau = nhom.Value.Count;
                    var diemMoiCau = Math.Round((double)trongSo / tongTrongSo * 100 / soCau, 2);
                    foreach (var ch in nhom.Value)
                        diemTheoCauHoi[ch.Id] = diemMoiCau;
                }

                // Xử lý làm tròn
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

                if (lanLam.ThoiGianTiepTuc.HasValue)
                {
                    var thoiGianVuaLam = (DateTime.Now - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;
                    lanLam.TongThoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0) + thoiGianVuaLam;
                    lanLam.ThoiGianTiepTuc = null;
                }

                await _lanLamBaiKiemTraService.UpdateAsync(lanLam);


                // 9. Lưu chi tiết mới
                foreach (var ct in chiTietsMoi)
                    await _chiTietLamBaiKiemTraService.CreateAsync(ct);
                await _chiTietLamBaiKiemTraService.SaveAsync();

                // 10. Trả về kết quả
                return new KetQuaLanKiemTraDto
                {
                    IdLanLamBaiKiemTra = lanLam.Id,
                    DatYeuCau = datYeuCau,
                    TongDiem = tongDiem,
                    TongDiemToiDa = 100,
                    SoCauDung = soCauDung,
                    TongSoCau = cauHois.Count,
                    ThoiGianBatDau = lanLam.ThoiGianBatDau,
                    ThoiGianKetThuc = DateTime.UtcNow
                };
            }


        // Lấy kết quả bài thi
        public async Task<KetQuaLanKiemTraDto> GetResult(Guid idLanLamBai)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>x.Id == idLanLamBai && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy kết quả.");

            var chiTiets = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>x.IdLanLamBaiKiemTra == idLanLamBai && !x.IsDeleted)
                .ToListAsync();

            return new KetQuaLanKiemTraDto
            {
                IdLanLamBaiKiemTra = lanLam.Id,
                Dat = lanLam.Dat ?? false,
                TongDiem = chiTiets.Sum(x => x.DiemNhanDuoc ?? 0),
                SoCauDung = chiTiets.Count(x => x.LaDung == true),
                TongSoCau = chiTiets.Count,
                ThoiGianNop = lanLam.ThoiGianNop
            };
        }


        // Kiểm tra có được làm lại hay không
        public async Task<bool> CheckCanRetake(Guid idBaiKiemTra,Guid idNguoiDung)
        {
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


        // Lịch sử các lần làm bài
        public async Task<List<LichSuLamBaiDto>> GetHistory(Guid idBaiKiemTra,Guid idNguoiDung)
        {
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

        // Xem lại chi tiết bài làm
        public async Task<ReviewQizzDto> GetReviewQuiz(Guid idLanLamBai)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == idLanLamBai &&
                    !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            var chiTiets = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdLanLamBaiKiemTra == idLanLamBai &&
                    !x.IsDeleted)
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
                .Where(x =>
                    cauHoiIds.Contains(x.Id) &&
                    !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdCauHoi.HasValue &&
                    cauHoiIds.Contains(x.IdCauHoi.Value) &&
                    !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            var chiTietLookup = chiTiets
                .Where(x => x.IdCauHoi.HasValue)
                .ToDictionary(
                    x => x.IdCauHoi!.Value,
                    x => x);

            var dapAnDungLookup = dapAns
                .Where(x =>
                    x.LaDapAnDung == true &&
                    x.IdCauHoi.HasValue)
                .ToDictionary(
                    x => x.IdCauHoi!.Value,
                    x => x);

            var dapAnLookup = dapAns
                .Where(x => x.IdCauHoi.HasValue)
                .GroupBy(x => x.IdCauHoi!.Value)
                .ToDictionary(
                    x => x.Key,
                    x => x.ToList());

            var review = new ReviewQizzDto
            {
                IdLanLamBaiKiemTra = lanLam.Id,
                Dat = lanLam.Dat ?? false,
                TongDiem = chiTiets.Sum(x => x.DiemNhanDuoc ?? 0),
                CauHois = new List<CauHoiReviewDto>()
            };

            foreach (var cauHoi in cauHois)
            {
                if (!chiTietLookup.TryGetValue(cauHoi.Id, out var chiTiet))
                    continue;

                dapAnDungLookup.TryGetValue(
                    cauHoi.Id,
                    out var dapAnDung);

                dapAnLookup.TryGetValue(
                    cauHoi.Id,
                    out var dsDapAn);

                var cauHoiReview = new CauHoiReviewDto
                {
                    IdCauHoi = cauHoi.Id,
                    TenCauHoi = cauHoi.TenCauHoi,
                    NoiDungCauHoi = cauHoi.NoiDungCauHoi,

                    IdDapAnChon = chiTiet.IdDapAnChon,

                    IdDapAnDung = dapAnDung?.Id,

                    LaDung = chiTiet.LaDung ?? false,

                    DiemNhanDuoc =
                        chiTiet.DiemNhanDuoc ?? 0,

                    DapAns = dsDapAn?
                        .Select(x => new DapAnReviewDto
                        {
                            Id = x.Id,
                            NoiDungDapAn = x.NoiDungDapAn,
                            LaDapAnDung =
                                x.LaDapAnDung ?? false
                        })
                        .ToList()
                        ?? new List<DapAnReviewDto>()
                };

                review.CauHois.Add(cauHoiReview);
            }

            return review;
        }


        #region Auto-Save Câu Trả Lời 
        /// <summary>
        /// Auto-save câu trả lời - CHỈ cho phép lưu câu hiện tại hoặc câu đã làm trước đó
        /// Không cho phép bỏ qua câu hỏi để làm câu sau
        /// </summary>
        public async Task<AutoSaveDapAnDto> AutoSaveCauTraLoi(AutoSaveRequest request)
        {
            // 1. Kiểm tra lần làm bài
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdLanLamBaiKiemTra && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            // 2. Lấy thông tin bài kiểm tra
            var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);
            var gioiHanThoiGian = baiKiemTra.GioiHanThoiGian ?? 0;

            // 3. Kiểm tra thời gian (nếu có giới hạn)
            if (gioiHanThoiGian > 0)
            {
                var thoiGianConLais = TinhThoiGianConLai(lanLam, gioiHanThoiGian);
                if (thoiGianConLais <= 0)
                    throw new Exception("Đã hết thời gian làm bài. Vui lòng nộp bài.");
            }

            // 4. Lấy danh sách câu hỏi theo thứ tự
            var allQuestions = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra == baiKiemTra.Id && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .Select(x => x.Id)
                .ToListAsync();

            // 5. Lấy các câu đã trả lời
            var answeredQuestions = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdLanLamBaiKiemTra == request.IdLanLamBaiKiemTra &&
                            !x.IsDeleted &&
                            x.IdCauHoi.HasValue)
                .Select(x => x.IdCauHoi!.Value)
                .Distinct()
                .ToListAsync();

            // 6. Tìm câu hỏi tiếp theo cần làm (câu đầu tiên chưa trả lời)
            var nextRequiredQuestion = allQuestions.FirstOrDefault(x => !answeredQuestions.Contains(x));

            // 7. ⭐ KIỂM TRA TUẦN TỰ - QUAN TRỌNG
            // Chỉ được lưu nếu là câu hiện tại (câu tiếp theo cần làm) HOẶC câu đã làm trước đó
            var isCurrentQuestion = request.IdCauHoi == nextRequiredQuestion;
            var isAlreadyAnswered = answeredQuestions.Contains(request.IdCauHoi);
            var isAllowed = isCurrentQuestion || isAlreadyAnswered;

            if (!isAllowed)
            {
                var nextQuestionNumber = allQuestions.IndexOf(nextRequiredQuestion) + 1;
                throw new Exception($"Vui lòng trả lời câu hỏi số {nextQuestionNumber} trước khi chuyển sang câu khác.");
            }

            // 8. Kiểm tra câu hỏi có tồn tại không
            var cauHoi = await _cauHoiService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdCauHoi && !x.IsDeleted);

            if (cauHoi == null)
                throw new Exception("Không tìm thấy câu hỏi.");

            // 9. Xóa đáp án cũ của câu hỏi này (nếu có)
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

            // 10. Lưu đáp án mới
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

            // 11. Cập nhật thời gian làm bài
            if (lanLam.ThoiGianTiepTuc.HasValue)
            {
                var thoiGianVuaLam = (DateTime.Now - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;
                lanLam.TongThoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0) + thoiGianVuaLam;
                lanLam.ThoiGianTiepTuc = DateTime.Now;
            }
            lanLam.ThoiGianCapNhat = DateTime.Now;
            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            // 12. Tính toán kết quả trả về
            var soCauDaLam = await GetSoCauDaLam(request.IdLanLamBaiKiemTra);
            var tongSoCau = allQuestions.Count;
            var daHoanThanh = soCauDaLam == tongSoCau;

            // Tìm câu tiếp theo để FE tự động chuyển
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

            // Tính thời gian còn lại
            var thoiGianConLai = gioiHanThoiGian > 0 ? TinhThoiGianConLai(lanLam, gioiHanThoiGian) : 0;

            return new AutoSaveDapAnDto
            {
                Success = true,
                SoCauDaLam = soCauDaLam,
                TongSoCau = tongSoCau,
                DaHoanThanh = daHoanThanh,
                NextQuestionId = nextQuestionId,
                ThoiGianConLai = thoiGianConLai,
                CoGioiHan = gioiHanThoiGian > 0,
                Message = daHoanThanh ? "Bạn đã hoàn thành tất cả câu hỏi! Hãy nộp bài." : "Đã lưu câu trả lời."
            };
        }
        #endregion

        #region Pause Quiz - Tạm dừng bài làm (khi user thoát)
        /// <summary>
        /// Tạm dừng bài làm - dừng đếm thời gian
        /// Gọi khi user đóng tab, chuyển trang, hoặc mất điện
        /// </summary>
        public async Task<TamDungQuizResultDto> PauseQuiz(Guid idLanLamBaiKiemTra)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLanLamBaiKiemTra && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            // Tính thời gian đã làm từ lần cuối tiếp tục
            if (lanLam.ThoiGianTiepTuc.HasValue)
            {
                var thoiGianVuaLam = (DateTime.Now - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;
                lanLam.TongThoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0) + thoiGianVuaLam;
                lanLam.ThoiGianTiepTuc = null; // Xóa thời gian tiếp tục - báo hiệu đang tạm dừng
            }

            lanLam.ThoiGianTamDung = DateTime.Now;
            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            return new TamDungQuizResultDto
            {
                Success = true,
                ThoiGianDaLam = lanLam.TongThoiGianDaLam ?? 0,
                Message = "Đã tạm dừng bài làm. Khi quay lại sẽ tiếp tục từ thời điểm này."
            };
        }
        #endregion

        #region Continue Quiz Full - Tiếp tục bài làm (khôi phục toàn bộ)
        /// <summary>
        /// Tiếp tục bài làm - khôi phục toàn bộ trạng thái
        /// Gọi khi user vào lại bài kiểm tra
        /// </summary>
        public async Task<ContinueQuizFullDto> ContinueQuizFull(Guid idLanLamBaiKiemTra)
        {
            // 1. Lấy lần làm bài
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idLanLamBaiKiemTra && !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            if (lanLam.ThoiGianNop != null)
                throw new Exception("Bài kiểm tra đã được nộp.");

            // 2. Lấy bài kiểm tra
            var baiKiemTra = await GetByIdOrThrowAsync(lanLam.IdBaiKiemTra.Value);
            var gioiHanThoiGian = baiKiemTra.GioiHanThoiGian ?? 0;

            // 3. Kiểm tra thời gian (nếu có giới hạn)
            if (gioiHanThoiGian > 0)
            {
                var thoiGianConLai = TinhThoiGianConLai(lanLam, gioiHanThoiGian);
                if (thoiGianConLai <= 0)
                    throw new Exception("Đã hết thời gian làm bài. Vui lòng nộp bài để xem kết quả.");
            }

            // 4. Nếu đang tạm dừng, khôi phục thời gian tiếp tục
            if (!lanLam.ThoiGianTiepTuc.HasValue)
            {
                var lastActive = lanLam.ThoiGianCapNhat ?? lanLam.ThoiGianTiepTuc.Value;
                var elapsed = (lastActive - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;
                if (elapsed < 0) elapsed = 0;

                lanLam.TongThoiGianDaLam = (lanLam.TongThoiGianDaLam ?? 0) + elapsed;
            }

            // Reset mốc tiếp tục = bây giờ
            lanLam.ThoiGianTiepTuc = DateTime.Now;
            await _lanLamBaiKiemTraService.UpdateAsync(lanLam);
            await _lanLamBaiKiemTraService.SaveAsync();

            // 5. Lấy tất cả câu hỏi
            var allQuestions = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra == baiKiemTra.Id && !x.IsDeleted)
                .OrderBy(x => x.ThuTuSapXep)
                .ToListAsync();

            // 6. Lấy câu trả lời đã lưu
            var savedAnswers = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdLanLamBaiKiemTra == idLanLamBaiKiemTra &&
                            !x.IsDeleted &&
                            x.IdCauHoi.HasValue &&
                            x.IdDapAnChon.HasValue)  // ⭐ Thêm điều kiện này
                .GroupBy(x => x.IdCauHoi!.Value)
                .ToDictionaryAsync(
                    g => g.Key,
                    g => g.Select(x => x.IdDapAnChon!.Value).ToList()  // ⭐ Dùng !.Value
                );

            // 7. Xác định câu hỏi đang làm dở (câu đầu tiên chưa trả lời)
            var answeredQuestionIds = savedAnswers.Keys.ToList();
            var currentQuestion = allQuestions.FirstOrDefault(x => !answeredQuestionIds.Contains(x.Id));
            var currentQuestionIndex = currentQuestion != null
                ? allQuestions.FindIndex(x => x.Id == currentQuestion.Id)
                : allQuestions.Count - 1;

            // 8. Xây dựng dữ liệu trả về cho FE
            var quizData = await GetQuizForStudent(baiKiemTra.Id);

            // Đánh dấu câu đã trả lời
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
                // Mốc hoạt động cuối cùng được ghi nhận (lần AutoSave gần nhất)
                // Nếu chưa autosave lần nào, dùng chính ThoiGianTiepTuc (elapsed = 0)
                var lastActive = lanLam.ThoiGianCapNhat ?? lanLam.ThoiGianTiepTuc.Value;

                // Chỉ tính thời gian THỰC SỰ ĐANG LÀM (đến lần hoạt động cuối),
                // không tính khoảng "im lặng" do mất điện/đóng tab đột ngột
                var elapsed = (lastActive - lanLam.ThoiGianTiepTuc.Value).TotalSeconds;
                if (elapsed < 0) elapsed = 0;

                thoiGianDaLam += elapsed;
            }

            return Math.Max(0, gioiHanThoiGian - thoiGianDaLam);
        }
        #endregion
    }
}
