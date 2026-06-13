using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.DapAnService;
using Eduverse.Service.DapAnService.Dto;
using Microsoft.EntityFrameworkCore;
namespace Eduverse.Service.CauHoiService
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        private readonly IMapper _mapper;
        private readonly EduverseContext _context;
        private readonly IDapAnService _dapAnService;
        private readonly IBaiKiemTraRepository _baiKiemTraRepository;

        public CauHoiService(
            IMapper mapper,
            ICauHoiRepository repository,
            IDapAnService dapAnService,
            IBaiKiemTraRepository baiKiemTraRepository,
            EduverseContext context) : base(repository)
        {
            _mapper = mapper;
            _context = context;
            _dapAnService = dapAnService;
            _baiKiemTraRepository = baiKiemTraRepository;
        }


        public async Task<CreateCauHoiDto> CreateQuestion(CreateCauHoiRequest request)
        {
            var baiKiemTra = await _baiKiemTraRepository.GetByIdAsync(request.IdBaiKiemTra);
            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra");

            if (request.DanhSachDapAns == null || !request.DanhSachDapAns.Any())
                throw new Exception("Câu hỏi phải có ít nhất 1 đáp án.");

            if (!request.DanhSachDapAns.Any(x => x.LaDapAnDung))
                throw new Exception("Phải có ít nhất 1 đáp án đúng.");

            var maxThuTu = await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdBaiKiemTra == request.IdBaiKiemTra && !x.IsDeleted)
                .Select(x => (int?)x.ThuTuSapXep)
                .MaxAsync() ?? -1;

            var cauHoi = new CauHoi
            {
                Id = Guid.NewGuid(),
                TenCauHoi = request.TenCauHoi,
                NoiDungCauHoi = request.NoiDungCauHoi,
                LoaiCauHoi = request.DanhSachDapAns.Count(x => x.LaDapAnDung) > 1 ? "multi" : "one",
                ThuTuSapXep = maxThuTu + 1,
                IdBaiKiemTra = baiKiemTra.Id,
                DoKho = request.DoKho
                
            };

            await CreateAsync(cauHoi);
            await SaveAsync();

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
            await _dapAnService.SaveAsync();

            var cauHoiDto = _mapper.Map<CauHoi, CreateCauHoiDto>(cauHoi);
            cauHoiDto.DanhSachDapAns = _mapper.MapToList<DapAn, DapAnDto>(dapAns);

            return cauHoiDto;
        }


        public async Task<Guid> UpdateQuestion(UpdateCauHoiRequest request)
        {
            var cauHoi = await GetByIdOrThrowAsync(request.Id);

            cauHoi.TenCauHoi = request.TenCauHoi;
            cauHoi.NoiDungCauHoi = request.NoiDungCauHoi;
            cauHoi.LoaiCauHoi = request.DanhSachDapAns.Count(x => x.LaDapAnDung) > 1 ? "multi" : "one";
            cauHoi.Diem = request.Diem;
            cauHoi.ThuTuSapXep = request.ThuTuSapXep;

            await UpdateAsync(cauHoi);

            var currentAnswers = await _dapAnService
                .GetQueryable()
                .Where(x =>
                    x.IdCauHoi == cauHoi.Id &&
                    !x.IsDeleted)
                .ToListAsync();

            var requestIds = request.DanhSachDapAns
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

            foreach (var item in request.DanhSachDapAns
                         .Where(x => x.Id.HasValue))
            {
                var answer = updateAnswers[item.Id!.Value];

                answer.NoiDungDapAn = item.NoiDungDapAn;
                answer.LaDapAnDung = item.LaDapAnDung;
                answer.ThuTuSapXep = item.ThuTuSapXep;
            }

            var newAnswers = request.DanhSachDapAns
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
