using Eduverse.Model.Entities;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.CauHoiRepository;
using Eduverse.Repository.DapAnRepositoryRepository;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiKiemTraService.Dto;
using Eduverse.Service.BaiKiemTraService.Request;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.ChiTietLamBaiKiemTraService;
using Eduverse.Service.Common;
using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.LanLamBaiKiemTraService;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.BaiKiemTraService
{
    public class BaiKiemTraService : Service<BaiKiemTra>, IBaiKiemTraSevice
    {
        private readonly ICauHoiRepository _cauHoiRepository;
        private readonly IDapAnRepository _dapAnRepository;
        private readonly ILanLamBaiKiemTraService _lanLamBaiKiemTraService;
        private readonly IChiTietLamBaiKiemTraService _chiTietLamBaiKiemTraService;
        public BaiKiemTraService(
            IBaiKiemTraRepository baiKiemTraRepository, 
            ICauHoiRepository cauHoiRepository,
            IDapAnRepository dapAnRepository,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IChiTietLamBaiKiemTraService chiTietLamBaiKiemTraService) : base(baiKiemTraRepository)
        {
            _cauHoiRepository = cauHoiRepository;
            _dapAnRepository = dapAnRepository;
            _lanLamBaiKiemTraService = lanLamBaiKiemTraService;
            _chiTietLamBaiKiemTraService = chiTietLamBaiKiemTraService;
        }

        public async Task<BaiKiemTraDto> GetQuiz(Guid id)
        {
            var quiz = await (from q in GetQueryable()
                where q.Id == id
                select new BaiKiemTraDto
                {
                    Id = q.Id,
                    TenBaiKiemTra = q.TenBaiKiemTra,
                    MoTa = q.MoTa,
                    DiemDat = q.DiemDat,
                    GioiHanThoiGian = q.GioiHanThoiGian,

                    DanhSachCauHoi = (from ch in _cauHoiRepository.GetQueryable()
                                      where ch.IdBaiKiemTra == q.Id
                                      orderby ch.ThuTuSapXep
                                      select new CauHoiDto
                                      {
                                          Id = ch.Id,
                                          TenCauHoi = ch.TenCauHoi,
                                          NoiDungCauHoi = ch.NoiDungCauHoi,
                                          LoaiCauHoi = ch.LoaiCauHoi,
                                          Diem = ch.Diem,

                                          DanhSachDapAn = (from da in _dapAnRepository.GetQueryable()
                                                        where da.IdCauHoi == ch.Id
                                                           orderby da.ThuTuSapXep
                                                        select new DapAnDto
                                                        {
                                                            Id = da.Id,
                                                            NoiDungDapAn = da.NoiDungDapAn
                                                        }
                                                        ).ToList()
                                      }
                                      ).ToList()
                }
            ).FirstOrDefaultAsync();

            if (quiz == null)
                throw new Exception("Không tìm thấy bài kiểm tra");

            return quiz;
        }

        public async Task<Guid> StartQuiz(Guid idQuiz, Guid idNguoiDung)
        {
            var count = await _lanLamBaiKiemTraService
                .GetQueryable()
                .CountAsync(x =>x.IdBaiKiemTra == idQuiz &&x.IdNguoiDung == idNguoiDung);

            var lan = new LanLamBaiKiemTra
            {
                Id = Guid.NewGuid(),
                IdBaiKiemTra = idQuiz,
                IdNguoiDung = idNguoiDung,
                ThoiGianBatDau = DateTime.UtcNow,
                LamLanThu = count + 1
            };

             await _lanLamBaiKiemTraService.CreateAsync(lan);

            return lan.Id;
        }


        public async Task<object> SubmitQuiz(SubmitQuizRequest request)
        {
            try
            {
                var lanLamBai = await _lanLamBaiKiemTraService
                    .GetByIdAsync(request.IdLanLamBaiKiemTra);

                if (lanLamBai == null)
                    throw new Exception("Không tìm thấy lượt làm bài");

                if (lanLamBai.ThoiGianNop != null)
                    throw new Exception("Bài kiểm tra đã được nộp");

                if (request.Answers == null || !request.Answers.Any())
                    throw new Exception("Danh sách câu trả lời trống");

                double tongDiem = 0;
                int soCauDung = 0;

                foreach (var item in request.Answers)
                {
                    // ===== Lấy câu hỏi =====
                    var cauHoi = await _cauHoiRepository
                        .GetByIdAsync(item.IdCauHoi);

                    if (cauHoi == null)
                        continue;

                    // ===== Lấy đáp án đúng =====
                    var dapAnDung = await _dapAnRepository
                        .GetQueryable()
                        .FirstOrDefaultAsync(x =>x.IdCauHoi == item.IdCauHoi && x.LaDapAnDung == true);

                    if (dapAnDung == null)
                        continue;

                    // ===== Kiểm tra đúng/sai =====
                    bool laDung =dapAnDung.Id == item.IdDapAn;

                    double diemNhanDuoc = laDung ? (cauHoi.Diem ?? 0) : 0;

                    if (laDung)
                    {
                        tongDiem += cauHoi.Diem ?? 0;
                        soCauDung++;
                    }

                    // ===== Lưu chi tiết =====
                    var chiTiet = new ChiTietLamBaiKiemTra
                    {
                        Id = Guid.NewGuid(),

                        IdLanLamBaiKiemTra = lanLamBai.Id,

                        IdCauHoi = item.IdCauHoi,

                        IdDapAnChon = item.IdDapAn,

                        LaDung = laDung,

                        DiemNhanDuoc = diemNhanDuoc
                    };

                    await _chiTietLamBaiKiemTraService
                        .CreateAsync(chiTiet);
                }

                // ===== Lấy bài kiểm tra =====
                var baiKiemTra = await GetByIdAsync(lanLamBai.IdBaiKiemTra);

                if (baiKiemTra == null)
                    throw new Exception("Không tìm thấy bài kiểm tra");

                // ===== Cập nhật kết quả =====
                lanLamBai.ThoiGianNop = DateTime.UtcNow;

                //lanLamBai.TongDiem = tongDiem;

                lanLamBai.Dat =
                    tongDiem >= baiKiemTra.DiemDat;

                await _lanLamBaiKiemTraService
                    .UpdateAsync(lanLamBai);

                return new
                {
                    TongDiem = tongDiem,

                    DiemDat = baiKiemTra.DiemDat,

                    Dat = lanLamBai.Dat,

                    SoCauDung = soCauDung,

                    TongSoCau = request.Answers.Count
                };
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
