using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiKiemTraRepository;
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
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Service.BaiKiemTraService
{
    public class BaiKiemTraService : Service<BaiKiemTra>, IBaiKiemTraService
    {
        private readonly ILanLamBaiKiemTraService _lanLamBaiKiemTraService;
        private readonly IChiTietLamBaiKiemTraService _chiTietLamBaiKiemTraService;
        private readonly IPhanService _phanService;
        private readonly ICauHoiService _cauHoiService;
        private readonly IDapAnService _dapAnService;
        private readonly IMapper _mapper;
        private readonly EduverseContext _eduverseContext;

        public BaiKiemTraService(
            IMapper mapper,
            IBaiKiemTraRepository baiKiemTraRepository,
            ICauHoiService cauHoiService,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IChiTietLamBaiKiemTraService chiTietLamBaiKiemTraService,
            IPhanService phanService,
            IDapAnService dapAnService,
            EduverseContext eduverseContext) : base(baiKiemTraRepository)
        {
            _lanLamBaiKiemTraService = lanLamBaiKiemTraService;
            _chiTietLamBaiKiemTraService = chiTietLamBaiKiemTraService;
            _phanService = phanService;
            _cauHoiService = cauHoiService;
            _dapAnService = dapAnService;
            _mapper = mapper;
            _eduverseContext = eduverseContext;
        }


        public async Task<Guid> CreateQuiz( CreateBaiKiemTraRequest request)
        {
            if (request.IdPhan == null)
                throw new Exception("Phần học không hợp lệ.");

            var phan = await _phanService.GetByIdAsync(request.IdPhan);

            if (phan == null)
                throw new Exception("Không tìm thấy phần học.");

            var entity = _mapper.Map<CreateBaiKiemTraRequest,BaiKiemTra>(request);

            if(entity.ChoLamLai == false)
            {

            }

            entity.Id = Guid.NewGuid();
            entity.NgayTao = DateTime.Now;
            entity.TrangThai = "HDI";

            await CreateAsync(entity);

            return entity.Id;
        }


        public async Task<Guid> UpdateQuiz(UpdateBaiKiemTraRequest request)
        {
            var quiz = await GetByIdOrThrowAsync(request.Id);

            quiz.TenBaiKiemTra = request.TenBaiKiemTra;
            quiz.MoTa = request.MoTa;
            quiz.DiemDat = request.DiemDat;
            quiz.GioiHanThoiGian = request.GioiHanThoiGian;
            quiz.ChoLamLai = request.ChoLamLai;
            quiz.SoLanLamToiDa = request.SoLanLamToiDa;

            if (!string.IsNullOrWhiteSpace(request.TrangThai))
            {
                quiz.TrangThai = request.TrangThai;
            }

            await UpdateAsync(quiz);

            return quiz.Id;
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


        public async Task<Guid> StartQuiz(StartQuizRequest request)
        {
            var baiKiemTra = await GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == request.IdBaiKiemTra &&
                    !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            var soLanDaLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .CountAsync(x =>
                    x.IdNguoiDung == request.IdNguoiDung &&
                    x.IdBaiKiemTra == request.IdBaiKiemTra &&
                    !x.IsDeleted);

            if (baiKiemTra.ChoLamLai != true && soLanDaLam > 0)
                throw new Exception("Bài kiểm tra không cho phép làm lại.");

            if (baiKiemTra.SoLanLamToiDa.HasValue &&
                soLanDaLam >= baiKiemTra.SoLanLamToiDa.Value)
                throw new Exception("Đã vượt quá số lần làm bài.");

            var lanLam = new LanLamBaiKiemTra
            {
                Id = Guid.NewGuid(),
                IdBaiKiemTra = request.IdBaiKiemTra,
                IdNguoiDung = request.IdNguoiDung,
                LamLanThu = soLanDaLam + 1,
                ThoiGianBatDau = DateTime.Now
            };

            await _lanLamBaiKiemTraService.CreateAsync(lanLam);

            return lanLam.Id;
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
                .Where(x =>
                    x.IdBaiKiemTra == idBaiKiemTra &&
                    !x.IsDeleted)
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
        public async Task<KetQuaLanKiemTraDto> SubmitQuiz(SubmitQizRequest request)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .FirstOrDefaultAsync(x =>
                    x.Id == request.IdLanLamBaiKiemTra &&
                    !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy lần làm bài.");

            var baiKiemTra = await GetByIdOrThrowAsync(
                lanLam.IdBaiKiemTra);

            var cauHoiIds = request.CauTraLois
                .Select(x => x.IdCauHoi)
                .Distinct()
                .ToList();

            var cauHois = await _cauHoiService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    cauHoiIds.Contains(x.Id) &&
                    !x.IsDeleted)
                .ToListAsync();

            var dapAns = await _dapAnService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdCauHoi.HasValue &&
                    cauHoiIds.Contains(x.IdCauHoi.Value) &&
                    !x.IsDeleted)
                .ToListAsync();

            var cauHoiLookup = cauHois
                .ToDictionary(x => x.Id);

            var dapAnLookup = dapAns
                .GroupBy(x => x.IdCauHoi!.Value)
                .ToDictionary(
                    x => x.Key,
                    x => x.ToList());

            double tongDiem = 0;
            int soCauDung = 0;

            var chiTiets = new List<ChiTietLamBaiKiemTra>();

            foreach (var traLoi in request.CauTraLois)
            {
                if (!cauHoiLookup.TryGetValue(
                    traLoi.IdCauHoi,
                    out var cauHoi))
                    continue;

                if (!dapAnLookup.TryGetValue(
                    traLoi.IdCauHoi,
                    out var dapAnsCauHoi))
                    continue;

                var correctIds = dapAnsCauHoi
                    .Where(x => x.LaDapAnDung == true)
                    .Select(x => x.Id)
                    .ToHashSet();

                var selectedIds = traLoi.IdDapAnChons
                    .ToHashSet();

                var diemMoiDapAn =
                    (cauHoi.Diem ?? 0) /
                    Math.Max(correctIds.Count, 1);

                double diemNhanDuoc = 0;

                foreach (var dapAnId in selectedIds)
                {
                    if (correctIds.Contains(dapAnId))
                    {
                        diemNhanDuoc += diemMoiDapAn;
                    }
                    else
                    {
                        diemNhanDuoc -= diemMoiDapAn;
                    }
                }

                if (diemNhanDuoc < 0)
                    diemNhanDuoc = 0;

                tongDiem += diemNhanDuoc;

                bool dung =
                    selectedIds.SetEquals(correctIds);

                if (dung)
                    soCauDung++;

                foreach (var dapAnId in selectedIds)
                {
                    chiTiets.Add(new ChiTietLamBaiKiemTra
                    {
                        Id = Guid.NewGuid(),
                        IdLanLamBaiKiemTra = lanLam.Id,
                        IdCauHoi = cauHoi.Id,
                        IdDapAnChon = dapAnId,
                        LaDung = correctIds.Contains(dapAnId),
                        DiemNhanDuoc = diemNhanDuoc
                    });
                }
            }

            await _chiTietLamBaiKiemTraService
                .CreateRange(chiTiets);

            lanLam.Dat =
                tongDiem >= (baiKiemTra.DiemDat ?? 0);

            lanLam.ThoiGianNop = DateTime.Now;

            await _lanLamBaiKiemTraService
                .UpdateAsync(lanLam);

            return new KetQuaLanKiemTraDto
            {
                IdLanLamBaiKiemTra = lanLam.Id,
                Dat = lanLam.Dat ?? false,
                TongDiem = tongDiem,
                SoCauDung = soCauDung,
                TongSoCau = cauHois.Count,
                ThoiGianNop = lanLam.ThoiGianNop
            };
        }


        // Lấy kết quả bài thi
        public async Task<KetQuaLanKiemTraDto> GetResult(Guid idLanLamBai)
        {
            var lanLam = await _lanLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.Id == idLanLamBai &&
                    !x.IsDeleted);

            if (lanLam == null)
                throw new Exception("Không tìm thấy kết quả.");

            var chiTiets = await _chiTietLamBaiKiemTraService
                .GetQueryable()
                .AsNoTracking()
                .Where(x =>
                    x.IdLanLamBaiKiemTra == idLanLamBai &&
                    !x.IsDeleted)
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

            return soLanDaLam <
                   (baiKiemTra.SoLanLamToiDa ?? 1);
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

    }
}
