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
using Eduverse.Service.DapAnService.Request;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace Eduverse.Service.CauHoiService
{
    public class CauHoiService : Service<Model.Entities.CauHoi>, ICauHoiService
    {
        private readonly IMapper _mapper;
        private readonly EduverseContext _context;
        private readonly IDapAnService _dapAnService;
        private readonly IBaiKiemTraRepository _baiKiemTraRepository;
        private readonly ILichSuKiemDuyetKhoaHocService _lichSuKiemDuyetKhoaHocService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private static readonly HashSet<string> ValidDoKho = new() { "De", "TrungBinh", "Kho" };

        public CauHoiService(
            IMapper mapper,
            ICauHoiRepository repository,
            IDapAnService dapAnService,
            IBaiKiemTraRepository baiKiemTraRepository,
            EduverseContext context,
            ILichSuKiemDuyetKhoaHocService lichSuKiemDuyetKhoaHocService,
            IHttpContextAccessor httpContextAccessor
            ) : base(repository)
        {
            _mapper = mapper;
            _context = context;
            _dapAnService = dapAnService;
            _baiKiemTraRepository = baiKiemTraRepository;
            _lichSuKiemDuyetKhoaHocService = lichSuKiemDuyetKhoaHocService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<CauHoiDto> CreateCauHoiAsync(CreateCauHoiRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Yêu cầu không hợp lệ.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            // ===== 1. Kiểm tra bài kiểm tra =====
            var baiKiemTra = await _baiKiemTraRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdBaiKiemTra && x.IsBanHienTai && !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra.");

            if (baiKiemTra.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền thêm câu hỏi vào bài kiểm tra này.");

            if (baiKiemTra.TrangThaiPheDuyet != "DangSua")
                throw new Exception($"Không thể thêm câu hỏi khi bài kiểm tra đang ở trạng thái: {baiKiemTra.TrangThaiPheDuyet}");

            // ===== 2. Validate nội dung câu hỏi + đáp án =====
            ValidateCauHoiContent(request.NoiDungCauHoi, request.DoKho, request.TenCauHoi);
            ValidateDapAnList(request.DanhSachDapAn, request.NoiDungCauHoi);

            // ===== 3. Kiểm tra trùng nội dung câu hỏi trong cùng bài kiểm tra =====
            var trungNoiDung = await GetQueryable()
                .AnyAsync(c => c.IdBaiKiemTra == request.IdBaiKiemTra
                            && !c.IsDeleted
                            && c.IsBanHienTai
                            && c.NoiDungCauHoi == request.NoiDungCauHoi.Trim());

            if (trungNoiDung)
                throw new Exception("Câu hỏi này đã tồn tại trong bài kiểm tra.");

            try
            {
                var soDapAnDung = request.DanhSachDapAn.Count(d => d.LaDapAnDung);

                var cauHoi = new CauHoi
                {
                    Id = Guid.NewGuid(),
                    IdBaiKiemTra = request.IdBaiKiemTra,
                    TenCauHoi = request.TenCauHoi?.Trim(),
                    NoiDungCauHoi = request.NoiDungCauHoi.Trim(),
                    LoaiCauHoi = soDapAnDung == 1 ? "ONE" : "MULTI",
                    DoKho = request.DoKho,
                    ThuTuSapXep = request.ThuTuSapXep,
                    TrangThai = "DangSua",
                    TrangThaiPheDuyet = "DangSua",
                    IsBanHienTai = true,
                };

                await CreateAsync(cauHoi);
                await SaveAsync();

                var thuTu = 1;
                var dapAns = request.DanhSachDapAn.Select(d => new DapAn
                {
                    Id = Guid.NewGuid(),
                    IdCauHoi = cauHoi.Id,
                    NoiDungDapAn = d.NoiDungDapAn.Trim(),
                    LaDapAnDung = d.LaDapAnDung,
                    ThuTuSapXep = d.ThuTuSapXep ?? thuTu++,
                    TrangThai = "DangSua",
                    TrangThaiPheDuyet = "DangSua",
                    IsBanHienTai = true
                }).ToList();

                await _dapAnService.CreateRange(dapAns);
                await _dapAnService.SaveAsync();


                return MapToDto(cauHoi, dapAns);
            }
            catch (Exception ex)
            {
                throw new Exception($"Tạo câu hỏi thất bại: {ex.Message}");
            }
        }

        public async Task<CauHoiDto> UpdateCauHoiAsync(UpdateCauHoiRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Yêu cầu không hợp lệ.");

            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            var cauHoi = await GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == request.Id && c.IsBanHienTai && !c.IsDeleted);

            if (cauHoi == null)
                throw new Exception("Không tìm thấy câu hỏi.");

            var baiKiemTra = await _baiKiemTraRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == cauHoi.IdBaiKiemTra && x.IsBanHienTai && !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra chứa câu hỏi này.");

            if (baiKiemTra.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền sửa câu hỏi này.");

            if (baiKiemTra.TrangThaiPheDuyet != "DangSua")
                throw new Exception($"Không thể sửa câu hỏi khi bài kiểm tra đang ở trạng thái: {baiKiemTra.TrangThaiPheDuyet}");

            // ===== 3. Validate =====
            ValidateCauHoiContent(request.NoiDungCauHoi, request.DoKho, request.TenCauHoi);
            ValidateDapAnList(request.DanhSachDapAns, request.NoiDungCauHoi);

            var trungNoiDung = await GetQueryable()
                .AnyAsync(c => c.IdBaiKiemTra == cauHoi.IdBaiKiemTra
                            && c.Id != cauHoi.Id
                            && !c.IsDeleted
                            && c.IsBanHienTai
                            && c.NoiDungCauHoi == request.NoiDungCauHoi.Trim());

            if (trungNoiDung)
                throw new Exception("Nội dung câu hỏi bị trùng với câu hỏi khác trong bài kiểm tra.");

            try
            {
                var soDapAnDung = request.DanhSachDapAns.Count(d => d.LaDapAnDung);

                cauHoi.TenCauHoi = request.TenCauHoi?.Trim();
                cauHoi.NoiDungCauHoi = request.NoiDungCauHoi.Trim();
                cauHoi.LoaiCauHoi = soDapAnDung == 1 ? "ONE" : "MULTI";
                cauHoi.DoKho = request.DoKho;
                cauHoi.ThuTuSapXep = request.ThuTuSapXep;
                cauHoi.UpdatedDate = DateTime.Now;
                cauHoi.UpdatedBy = nguoiTao.ToString();

                await UpdateAsync(cauHoi);
                await SaveAsync();

                var dapAnsKetQua = await SyncDapAnAsync(cauHoi.Id, request.DanhSachDapAns);


                return MapToDto(cauHoi, dapAnsKetQua);
            }
            catch (Exception ex)
            {
                throw new Exception($"Cập nhật câu hỏi thất bại: {ex.Message}");
            }
        }

        private async Task<List<DapAn>> SyncDapAnAsync(Guid idCauHoi, List<UpdateDapAnRequest> requests)
        {
            var dapAnsCu = await _dapAnService.GetQueryable()
                .Where(d => d.IdCauHoi == idCauHoi && !d.IsDeleted)
                .ToListAsync();

            var idsGiuLai = requests.Where(r => r.Id.HasValue).Select(r => r.Id!.Value).ToHashSet();

            // Xóa đáp án không còn trong danh sách mới
            var canXoa = dapAnsCu.Where(d => !idsGiuLai.Contains(d.Id)).ToList();
            foreach (var d in canXoa)
            {
                d.TrangThai = "DaXoa";
                d.IsDeleted = true;
                await _dapAnService.DeleteAsync(d);
            }

            var thuTu = 1;
            var ketQua = new List<DapAn>();

            foreach (var req in requests)
            {
                if (req.Id.HasValue && dapAnsCu.Any(d => d.Id == req.Id.Value))
                {
                    var dapAnCu = dapAnsCu.First(d => d.Id == req.Id.Value);
                    dapAnCu.NoiDungDapAn = req.NoiDungDapAn.Trim();
                    dapAnCu.LaDapAnDung = req.LaDapAnDung;
                    dapAnCu.ThuTuSapXep = req.ThuTuSapXep ?? thuTu++;
                    await _dapAnService.UpdateAsync(dapAnCu);
                    ketQua.Add(dapAnCu);
                }
                else
                {
                    var dapAnMoi = new DapAn
                    {
                        Id = Guid.NewGuid(),
                        IdCauHoi = idCauHoi,
                        NoiDungDapAn = req.NoiDungDapAn.Trim(),
                        LaDapAnDung = req.LaDapAnDung,
                        ThuTuSapXep = req.ThuTuSapXep ?? thuTu++,
                        TrangThai = "DangSua",
                        TrangThaiPheDuyet = "DangSua",
                        IsBanHienTai = true
                    };
                    await _dapAnService.CreateAsync(dapAnMoi);
                    ketQua.Add(dapAnMoi);
                }
            }

            await _dapAnService.SaveAsync();
            return ketQua;
        }

        public async Task<bool> DeleteCauHoiAsync(Guid idCauHoi)
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var nguoiTao);

            var cauHoi = await GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == idCauHoi && !c.IsDeleted);

            if (cauHoi == null)
                throw new Exception("Không tìm thấy câu hỏi.");

            var baiKiemTra = await _baiKiemTraRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == cauHoi.IdBaiKiemTra && x.IsBanHienTai && !x.IsDeleted);

            if (baiKiemTra == null)
                throw new Exception("Không tìm thấy bài kiểm tra chứa câu hỏi này.");

            if (baiKiemTra.CreatedId != nguoiTao)
                throw new Exception("Bạn không có quyền xóa câu hỏi này.");

            if (baiKiemTra.TrangThaiPheDuyet != "DangSua")
                throw new Exception($"Không thể xóa câu hỏi khi bài kiểm tra đang ở trạng thái: {baiKiemTra.TrangThaiPheDuyet}");

            // Bài kiểm tra phải còn tối thiểu 2 câu hỏi sau khi xóa
            var soCauHoiConLai = await GetQueryable()
                .CountAsync(c => c.IdBaiKiemTra == cauHoi.IdBaiKiemTra
                               && c.Id != idCauHoi
                               && !c.IsDeleted
                               && c.IsBanHienTai);

            if (soCauHoiConLai < 2)
                throw new Exception("Bài kiểm tra phải có ít nhất 2 câu hỏi, không thể xóa câu hỏi này.");
            try
            {
                cauHoi.TrangThai = "DaXoa";
                cauHoi.IsDeleted = true;
                await DeleteAsync(cauHoi);

                var dapAns = await _dapAnService.GetQueryable()
                    .Where(d => d.IdCauHoi == idCauHoi && !d.IsDeleted)
                    .ToListAsync();

                foreach (var d in dapAns)
                {
                    d.TrangThai = "DaXoa";
                    d.IsDeleted = true;
                    await _dapAnService.DeleteAsync(d);
                }

                await SaveAsync();
                await _dapAnService.SaveAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Xóa câu hỏi thất bại: {ex.Message}");
            }
        }

        private void ValidateCauHoiContent(string noiDungCauHoi, string doKho, string? tenCauHoi)
        {
            if (string.IsNullOrWhiteSpace(noiDungCauHoi))
                throw new Exception("Nội dung câu hỏi không được để trống.");

            if (noiDungCauHoi.Trim().Length < 3)
                throw new Exception("Nội dung câu hỏi phải có ít nhất 3 ký tự.");

            if (noiDungCauHoi.Trim().Length > 200)
                throw new Exception("Nội dung câu hỏi không được vượt quá 200 ký tự.");

            if (!string.IsNullOrWhiteSpace(tenCauHoi) && tenCauHoi.Trim().Length > 200)
                throw new Exception("Tên câu hỏi không được vượt quá 200 ký tự.");

            if (string.IsNullOrWhiteSpace(doKho) || !ValidDoKho.Contains(doKho))
                throw new Exception($"Độ khó '{doKho}' không hợp lệ. Chỉ chấp nhận: De, TrungBinh, Kho.");
        }

        private void ValidateDapAnList<T>(List<T> danhSachDapAn, string noiDungCauHoi)
        {
            if (danhSachDapAn == null || !danhSachDapAn.Any())
                throw new Exception($"Câu hỏi '{noiDungCauHoi}' phải có ít nhất 2 đáp án.");

            if (danhSachDapAn.Count < 2)
                throw new Exception($"Câu hỏi '{noiDungCauHoi}' phải có ít nhất 2 đáp án.");

            if (danhSachDapAn.Count > 15)
                throw new Exception($"Câu hỏi '{noiDungCauHoi}' không được vượt quá 15 đáp án.");

            var noiDungSet = new HashSet<string>();
            var soDapAnDung = 0;

            foreach (var item in danhSachDapAn)
            {
                var (noiDung, laDapAnDung) = item switch
                {
                    CreateDapAnRequest c => (c.NoiDungDapAn, c.LaDapAnDung),
                    UpdateDapAnRequest u => (u.NoiDungDapAn, u.LaDapAnDung),
                    _ => throw new InvalidOperationException("Kiểu đáp án không hợp lệ.")
                };

                if (string.IsNullOrWhiteSpace(noiDung))
                    throw new Exception($"Câu hỏi '{noiDungCauHoi}' có đáp án bị để trống.");

                if (noiDung.Trim().Length > 99)
                    throw new Exception($"Câu hỏi '{noiDungCauHoi}' có đáp án vượt quá 99 ký tự.");

                var trimmed = noiDung.Trim();
                if (!noiDungSet.Add(trimmed))
                    throw new Exception($"Câu hỏi '{noiDungCauHoi}' có đáp án bị trùng: {trimmed}");

                if (laDapAnDung) soDapAnDung++;
            }

            if (soDapAnDung == 0)
                throw new Exception($"Câu hỏi '{noiDungCauHoi}' phải có ít nhất một đáp án đúng.");

            if (soDapAnDung == danhSachDapAn.Count)
                throw new Exception($"Câu hỏi '{noiDungCauHoi}' không được có tất cả đáp án đều đúng.");
        }

        private CauHoiDto MapToDto(CauHoi cauHoi, List<DapAn> dapAns)
        {
            return new CauHoiDto
            {
                Id = cauHoi.Id,
                IdBaiKiemTra = cauHoi.IdBaiKiemTra.Value,
                TenCauHoi = cauHoi.TenCauHoi,
                NoiDungCauHoi = cauHoi.NoiDungCauHoi,
                LoaiCauHoi = cauHoi.LoaiCauHoi,
                DoKho = cauHoi.DoKho,
                ThuTuSapXep = cauHoi.ThuTuSapXep,
                TrangThai = cauHoi.TrangThai,
                TrangThaiPheDuyet = cauHoi.TrangThaiPheDuyet,
                DanhSachDapAns = dapAns.OrderBy(d => d.ThuTuSapXep).Select(d => new DapAnDto
                {
                    Id = d.Id,
                    IdCauHoi = d.IdCauHoi ?? Guid.Empty,
                    NoiDungDapAn = d.NoiDungDapAn,
                    LaDapAnDung = d.LaDapAnDung ?? false,
                    ThuTuSapXep = d.ThuTuSapXep,
                    TrangThai = d.TrangThai,
                    TrangThaiPheDuyet = d.TrangThaiPheDuyet
                }).ToList()
            };
        }
    }
}
