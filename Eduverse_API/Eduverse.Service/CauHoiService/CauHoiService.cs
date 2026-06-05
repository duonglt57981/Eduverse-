using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Service.BaiKiemTraService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.CauHoiService.Request;
using Eduverse.Service.Common;
using Eduverse.Service.DapAnService.Dto;
namespace Eduverse.Service.CauHoiService
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        private readonly IDapAnRepository _dapAnRepository;
        private readonly EduverseContext _context;
        private readonly IBaiKiemTraService _baiKiemTraService;

        public CauHoiService(
            ICauHoiRepository repository,
            IDapAnRepository dapAnRepository,
            EduverseContext context,
            IBaiKiemTraService baiKiemTraService) : base(repository)
        {
            _dapAnRepository = dapAnRepository;
            _context = context;
            _baiKiemTraService = baiKiemTraService;
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
    }
}
