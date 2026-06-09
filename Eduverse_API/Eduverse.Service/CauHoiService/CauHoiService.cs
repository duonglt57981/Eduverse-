using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.Common;
using Eduverse.Service.DapAnService;
using Eduverse.Service.DapAnService.Dto;
using Microsoft.EntityFrameworkCore;
namespace Eduverse.Service.CauHoiService
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        private readonly EduverseContext _context;
        private readonly IDapAnService _dapAnService;

        public CauHoiService(
            ICauHoiRepository repository,
            IDapAnService dapAnService,
            EduverseContext context) : base(repository)
        {
            _context = context;
            _dapAnService = dapAnService;
        }

        //public async Task<CauHoiDto> CreateCauHoi(CreateCauHoiRequest request)
        //{
        //    var BaiKiemTra = await _baiKiemTraService.GetByIdAsync(request.idBaiKiemTra);
        //    if (BaiKiemTra == null)
        //        throw new Exception("Bài kiểm tra không tồn tại");

        //    if (string.IsNullOrWhiteSpace(request.TenCauHoi))
        //        throw new Exception("Tên câu hỏi không được để trống");

        //    if (request.DanhSachDapAns == null || request.DanhSachDapAns.Count < 2)
        //        throw new Exception("Mỗi câu hỏi phải có ít nhất 2 đáp án");

        //    if (request.DanhSachDapAns.Count(x => x.LaDapAnDung) != 1)
        //        throw new Exception("Mỗi câu hỏi phải có đúng 1 đáp án đúng");

        //    // Tạo câu hỏi
        //    int thutu = 0;
        //    var cauHoi = new CauHoi
        //    {
        //        Id = Guid.NewGuid(),
        //        IdBaiKiemTra = BaiKiemTra.Id,
        //        TenCauHoi = request.TenCauHoi,
        //        NoiDungCauHoi = request.NoiDungCauHoi,
        //        ThuTuSapXep = thutu++,
        //        LoaiCauHoi = 1, // 1: đơn, 2: đa (có thể tính sau)
        //        IsDeleted = false,
        //        CreatedDate = DateTime.UtcNow
        //    };
        //    await CreateAsync(cauHoi);

        //    // Tạo danh sách đáp án
        //    var listDapAn = new List<DapAn>();
        //    foreach (var item in request.DanhSachDapAns)
        //    {
        //        listDapAn.Add(new DapAn
        //        {
        //            Id = Guid.NewGuid(),
        //            IdCauHoi = cauHoi.Id,
        //            NoiDungDapAn = item.NoiDungDapAn,
        //            LaDapAnDung = item.LaDapAnDung,
        //            ThuTuSapXep = item.ThuTuSapXep,
        //            IsDeleted = false,
        //            CreatedDate = DateTime.UtcNow
        //        });
        //    }
        //    await _dapAnRepository.CreateRange(listDapAn);
        //    await _context.SaveChangesAsync(); // hoặc SaveAsync

        //    // Map to DTO
        //    return new CauHoiDto
        //    {
        //        Id = cauHoi.Id,
        //        TenCauHoi = cauHoi.TenCauHoi,
        //        NoiDungCauHoi = cauHoi.NoiDungCauHoi,
        //        Diem = cauHoi.Diem,
        //        ThuTuSapXep = cauHoi.ThuTuSapXep,
        //        DanhSachDapAns = listDapAn.Select(d => new DapAnDto
        //        {
        //            NoiDungDapAn = d.NoiDungDapAn,
        //            LaDapAnDung = d.LaDapAnDung,
        //            ThuTuSapXep = d.ThuTuSapXep
        //        }).ToList()
        //    };

        //}


        public async Task<Guid> CreateQuestion(CreateCauHoiRequest request)
        {
            var baiKiemTra = await GetByIdOrThrowAsync(request.idBaiKiemTra);

            if (request.DanhSachDapAns == null ||!request.DanhSachDapAns.Any())
            {
                throw new Exception(
                    "Câu hỏi phải có ít nhất 1 đáp án.");   
            }

            if (!request.DanhSachDapAns.Any(x => x.LaDapAnDung))
            {
                throw new Exception(
                    "Phải có ít nhất 1 đáp án đúng.");
            }

            int ttsapxep = 0;

            var cauHoi = new CauHoi
            {
                Id = Guid.NewGuid(),
                TenCauHoi = request.TenCauHoi,
                NoiDungCauHoi = request.NoiDungCauHoi,
                LoaiCauHoi = request.DanhSachDapAns.Count(x => x.LaDapAnDung) > 1 ? 2 : 1,
                Diem = request.Diem,
                ThuTuSapXep = ttsapxep++,
                IdBaiKiemTra = baiKiemTra.Id
            };

            await CreateAsync(cauHoi);

            var ttsapxepDapAn = 0;

            var dapAns = request.DanhSachDapAns
                .Select(x => new DapAn
                {
                    Id = Guid.NewGuid(),
                    NoiDungDapAn = x.NoiDungDapAn,
                    LaDapAnDung = x.LaDapAnDung,
                    ThuTuSapXep = ttsapxepDapAn++,
                    IdCauHoi = cauHoi.Id
                })
                .ToList();

            await _dapAnService.CreateRange(dapAns);

            return cauHoi.Id;
        }



        public async Task<Guid> UpdateQuestion(UpdateCauHoiRequest request)
        {
            var cauHoi = await GetByIdOrThrowAsync(request.Id);

            cauHoi.TenCauHoi = request.TenCauHoi;
            cauHoi.NoiDungCauHoi = request.NoiDungCauHoi;
            cauHoi.LoaiCauHoi = request.LoaiCauHoi;
            cauHoi.Diem = request.Diem;
            cauHoi.ThuTuSapXep = request.ThuTuSapXep;

            await UpdateAsync(cauHoi);

            var currentAnswers = await _dapAnService
                .GetQueryable()
                .Where(x =>
                    x.IdCauHoi == cauHoi.Id &&
                    !x.IsDeleted)
                .ToListAsync();

            var requestIds = request.DapAns
                .Where(x => x.Id.HasValue)
                .Select(x => x.Id!.Value)
                .ToHashSet();

            var deleteAnswers = currentAnswers
                .Where(x => !requestIds.Contains(x.Id))
                .ToList();

            foreach (var item in deleteAnswers)
            {
                item.IsDeleted = true;
            }

            var updateAnswers = currentAnswers
                .Where(x => requestIds.Contains(x.Id))
                .ToDictionary(x => x.Id);

            foreach (var item in request.DapAns
                         .Where(x => x.Id.HasValue))
            {
                var answer = updateAnswers[item.Id!.Value];

                answer.NoiDungDapAn = item.NoiDungDapAn;
                answer.LaDapAnDung = item.LaDapAnDung;
                answer.ThuTuSapXep = item.ThuTuSapXep;
            }

            var newAnswers = request.DapAns
                .Where(x => !x.Id.HasValue)
                .Select(x => new DapAn
                {
                    Id = Guid.NewGuid(),
                    IdCauHoi = cauHoi.Id,
                    NoiDungDapAn = x.NoiDungDapAn,
                    LaDapAnDung = x.LaDapAnDung,
                    ThuTuSapXep = x.ThuTuSapXep
                })
                .ToList();

            if (deleteAnswers.Any())
                await _dapAnService.UpdateAsync(deleteAnswers);

            if (updateAnswers.Any())
                await _dapAnService.UpdateAsync(updateAnswers.Values);

            if (newAnswers.Any())
                await _dapAnService.CreateRange(newAnswers);

            return cauHoi.Id;
        }
    }
}
