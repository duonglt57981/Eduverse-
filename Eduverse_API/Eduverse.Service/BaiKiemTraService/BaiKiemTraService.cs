using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Service.BaiGiangService;
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
using Eduverse.Service.PhanService;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        public async Task<BaiKiemTraDto> CreateQuiz(CreateQizzRequest request)
        {
            var phan = await _phanService.GetByIdAsync(request.IdPhan);
            if (phan == null)
                throw new Exception("Phần học không tồn tại");

            if (string.IsNullOrWhiteSpace(request.TenBaiKiemTra))
                throw new Exception("Tên bài kiểm tra không được để trống.");

            if (request.DanhSachCauHois == null || request.DanhSachCauHois.Count == 0)
                throw new Exception("Bài kiểm tra phải có ít nhất một câu hỏi.");

            foreach (var cauHoi in request.DanhSachCauHois)
            {
                if (cauHoi.DanhSachDapAns == null || cauHoi.DanhSachDapAns.Count < 2)
                    throw new Exception($"Câu hỏi '{cauHoi.TenCauHoi}' phải có ít nhất 2 đáp án.");

                if (cauHoi.DanhSachDapAns.Count(x => x.LaDapAnDung) != 1)
                    throw new Exception($"Câu hỏi '{cauHoi.TenCauHoi}' phải có đúng 1 đáp án đúng.");
            }


            try
            {
                var baiKiemTra = new BaiKiemTra
                {

                    TenBaiKiemTra = request.TenBaiKiemTra,
                    MoTa = request.MoTa,
                    GioiHanThoiGian = request.GioiHanThoiGian,
                    ChoLamLai = true,
                    SoLanLamToiDa = request.SoLanLamToiDa,
                    SoLanLamLai = 0,
                    DiemDat = request.DiemDat,
                    IdPhan = request.IdPhan,
                    TrangThai = "HDI",
                    IsDeleted = false,
                    CreatedDate = DateTime.UtcNow
                };
                await CreateAsync(baiKiemTra);
                await SaveAsync();


                var listCauHoi = new List<CauHoi>();
                int thuTuCauHoi = 1;
                foreach (var itemQuestion in request.DanhSachCauHois)
                {
                    int soDapAnDung = itemQuestion.DanhSachDapAns.Count(x => x.LaDapAnDung);
                    listCauHoi.Add(new CauHoi
                    {
                        IdBaiKiemTra = baiKiemTra.Id,
                        TenCauHoi = itemQuestion.TenCauHoi,
                        NoiDungCauHoi = itemQuestion.NoiDungCauHoi,
                        LoaiCauHoi = soDapAnDung == 1 ? 1 : 2,
                        ThuTuSapXep = thuTuCauHoi++,
                        IsDeleted = false,
                        CreatedDate = DateTime.UtcNow
                    });
                }
                await _cauHoiService.CreateAsync(listCauHoi);
                await _cauHoiService.SaveAsync();


                var listDapAn = new List<DapAn>();
                int idx = 0;
                foreach (var itemQuestion in request.DanhSachCauHois)
                {
                    var cauHoiDaTao = listCauHoi[idx++];
                    int thuTuDapAn = 1;
                    foreach (var itemAnswer in itemQuestion.DanhSachDapAns)
                    {
                        listDapAn.Add(new DapAn
                        {
                            Id = Guid.NewGuid(),
                            IdCauHoi = cauHoiDaTao.Id,  // Chỉ dùng FK, không gán navigation property
                            NoiDungDapAn = itemAnswer.NoiDungDapAn,
                            LaDapAnDung = itemAnswer.LaDapAnDung,
                            ThuTuSapXep = thuTuDapAn++,
                            IsDeleted = false,
                            CreatedDate = DateTime.UtcNow
                        });
                    }
                }
                await _dapAnService.CreateAsync(listDapAn);
                await _dapAnService.SaveAsync();


                return _mapper.Map<BaiKiemTra, BaiKiemTraDto>(baiKiemTra);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }


        }


        //public async Task<BaiKiemTraDto> CreateQuiz(CreateQizzRequest request)
        //{
        //    var phan = await _phanService.GetByIdAsync(request.IdPhan);
        //    if (phan == null)
        //        throw new Exception("Phần học không tồn tại");

        //    if (string.IsNullOrWhiteSpace(request.TenBaiKiemTra))
        //        throw new Exception("Tên bài kiểm tra không được để trống.");

        //    var baiKiemTra = new BaiKiemTra
        //    {
        //        Id = Guid.NewGuid(),
        //        TenBaiKiemTra = request.TenBaiKiemTra,
        //        MoTa = request.MoTa,
        //        GioiHanThoiGian = request.GioiHanThoiGian,
        //        ChoLamLai = true,
        //        SoLanLamToiDa = request.SoLanLamToiDa,
        //        SoLanLamLai = 0,
        //        DiemDat = request.DiemDat,
        //        IdPhan = request.IdPhan,
        //        TrangThai = "HDI",
        //    };

        //    return _mapper.Map<BaiKiemTra, BaiKiemTraDto>(baiKiemTra);
        //}

        //public async Task<BaiKiemTraDto> UpdateQizz(CreateQizzRequest request)
        //{
        //    var phan = await _phanService.GetByIdAsync(request.IdPhan);
        //    if (phan == null)
        //        throw new Exception("Phần học không tồn tại");

        //    var baiKiemTra = await GetByIdAsync(request.id);

        //    if (string.IsNullOrWhiteSpace(request.TenBaiKiemTra))
        //        throw new Exception("Tên bài kiểm tra không được để trống.");

        //    var baiKiemTra = new BaiKiemTra
        //    {
        //        Id = Guid.NewGuid(),
        //        TenBaiKiemTra = request.TenBaiKiemTra,
        //        MoTa = request.MoTa,
        //        GioiHanThoiGian = request.GioiHanThoiGian,
        //        ChoLamLai = true,
        //        SoLanLamToiDa = request.SoLanLamToiDa,
        //        SoLanLamLai = 0,
        //        DiemDat = request.DiemDat,
        //        IdPhan = request.IdPhan,
        //        TrangThai = "HDI",
        //    };

        //    return _mapper.Map<BaiKiemTra, BaiKiemTraDto>(baiKiemTra);
        //}
    }
}
