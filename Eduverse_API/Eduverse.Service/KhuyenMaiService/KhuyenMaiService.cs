using Eduverse.Model.Entities;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhuyenMai_KhoaHocRepository;
using Eduverse.Repository.KhuyenMaiRepository;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhuyenMaiService.Dto;
using Eduverse.Service.KhuyenMaiService.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhuyenMaiService
{
    public class KhuyenMaiService : Service<KhuyenMai>, IKhuyenMaiService
    {
        private readonly IKhuyenMai_KhoaHocRepository _khuyenMai_KhoaHocRepository;
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public KhuyenMaiService(
            IKhuyenMaiRepository khuyenMaiRepository,
            IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository,
            IKhoaHocRepository khoaHocRepository,
            IHttpContextAccessor httpContextAccessor
        ) : base(khuyenMaiRepository)
        {
            _khuyenMai_KhoaHocRepository = khuyenMai_KhoaHocRepository;
            _khoaHocRepository = khoaHocRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentUserId()
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            return userId;
        }

        // ── Trang "Quản lý khuyến mãi": toàn bộ mã của giảng viên + khóa học liên kết ──
        public async Task<List<KhuyenMaiDto>> GetListAll()
        {
            var userId = GetCurrentUserId();

            var khuyenMais = await GetQueryable()
                .Where(x => x.CreatedId == userId)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();

            if (!khuyenMais.Any())
                return new List<KhuyenMaiDto>();

            var khuyenMaiIds = khuyenMais.Select(x => x.Id).ToList();

            var links = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai.HasValue && khuyenMaiIds.Contains(x.IdKhuyenMai.Value))
                .ToListAsync();

            var khoaHocIds = links
                .Where(x => x.IdKhoaHoc.HasValue)
                .Select(x => x.IdKhoaHoc!.Value)
                .Distinct()
                .ToList();

            var khoaHocs = await _khoaHocRepository.GetQueryable()
                .Where(x => khoaHocIds.Contains(x.Id))
                .Select(x => new KhoaHocMiniDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc
                })
                .ToListAsync();

            var khoaHocDict = khoaHocs.ToDictionary(x => x.Id);

            return khuyenMais.Select(km =>
            {
                var linkedIds = links
                    .Where(l => l.IdKhuyenMai == km.Id && l.IdKhoaHoc.HasValue)
                    .Select(l => l.IdKhoaHoc!.Value)
                    .ToList();

                return new KhuyenMaiDto
                {
                    Id = km.Id,
                    MaGiamGia = km.MaGiamGia,
                    PhanTramGiam = km.PhanTramGiam,
                    NgayBatDau = km.NgayBatDau,
                    NgayKetThuc = km.NgayKetThuc,
                    SoLuongHieuLuc = km.SoLuongHieuLuc,
                    CreatedDate = km.CreatedDate,
                    DanhSachKhoaHoc = linkedIds
                        .Where(id => khoaHocDict.ContainsKey(id))
                        .Select(id => khoaHocDict[id])
                        .ToList()
                };
            }).ToList();
        }

        private void ValidateInput(string? maGiamGia, int? phanTramGiam, DateTime? batDau, DateTime? ketThuc)
        {
            if (string.IsNullOrWhiteSpace(maGiamGia))
                throw new Exception("Vui lòng nhập mã giảm giá");

            if (phanTramGiam == null || phanTramGiam <= 0 || phanTramGiam > 100)
                throw new Exception("Phần trăm giảm phải trong khoảng 1-100");

            if (batDau.HasValue && ketThuc.HasValue && batDau.Value > ketThuc.Value)
                throw new Exception("Ngày bắt đầu không được sau ngày kết thúc");
        }

        // ── Chỉ chấp nhận khóa học: thuộc quyền sở hữu + đã ở trạng thái DaDuyet ──
        private async Task<List<KhoaHoc>> ValidateAndGetApprovedCourses(List<Guid>? idsKhoaHoc, Guid userId)
        {
            if (idsKhoaHoc == null || !idsKhoaHoc.Any())
                throw new Exception("Vui lòng chọn ít nhất một khóa học để áp dụng mã giảm giá");

            var ids = idsKhoaHoc.Distinct().ToList();

            var khoaHocs = await _khoaHocRepository.GetQueryable()
                .Where(x => ids.Contains(x.Id))
                .ToListAsync();

            var idsTonTai = khoaHocs.Select(x => x.Id).ToList();
            var idsKhongTonTai = ids.Except(idsTonTai).ToList();
            if (idsKhongTonTai.Any())
                throw new Exception($"Không tìm thấy khóa học: {string.Join(", ", idsKhongTonTai)}");

            var khongThuocQuyen = khoaHocs.Where(x => x.CreatedId != userId).Select(x => x.Id).ToList();
            if (khongThuocQuyen.Any())
                throw new Exception("Bạn không có quyền áp dụng mã giảm giá cho một số khóa học đã chọn");

            var chuaDuyet = khoaHocs.Where(x => x.TrangThaiPheDuyet != "DaDuyet").Select(x => x.TieuDe).ToList();
            if (chuaDuyet.Any())
                throw new Exception($"Chỉ áp dụng được cho khóa học đã duyệt. Chưa duyệt: {string.Join(", ", chuaDuyet)}");

            return khoaHocs;
        }

        public async Task<KhuyenMaiDto> CreateKhuyenMai(CreateKhuyenMaiRequest request)
        {
            var userId = GetCurrentUserId();

            ValidateInput(request.MaGiamGia, request.PhanTramGiam, request.NgayBatDau, request.NgayKetThuc);

            var khoaHocs = await ValidateAndGetApprovedCourses(request.IdsKhoaHoc, userId);

            var maCode = request.MaGiamGia!.Trim().ToUpper();

            var trung = await AnyAsync(x => x.MaGiamGia == maCode);
            if (trung)
                throw new Exception($"Mã giảm giá '{maCode}' đã tồn tại");

            var khuyenMai = new KhuyenMai
            {
                MaGiamGia = maCode,
                PhanTramGiam = request.PhanTramGiam,
                NgayBatDau = request.NgayBatDau,
                NgayKetThuc = request.NgayKetThuc,
                SoLuongHieuLuc = request.SoLuongHieuLuc,
            };

            await CreateAsync(khuyenMai);
            await SaveAsync();

            var lienKets = khoaHocs.Select(kh => new KhuyenMai_KhoaHoc
            {
                IdKhuyenMai = khuyenMai.Id,
                IdKhoaHoc = kh.Id
            }).ToList();

            _khuyenMai_KhoaHocRepository.AddRange(lienKets);
            await _khuyenMai_KhoaHocRepository.SaveAsync();

            return new KhuyenMaiDto
            {
                Id = khuyenMai.Id,
                MaGiamGia = khuyenMai.MaGiamGia,
                PhanTramGiam = khuyenMai.PhanTramGiam,
                NgayBatDau = khuyenMai.NgayBatDau,
                NgayKetThuc = khuyenMai.NgayKetThuc,
                SoLuongHieuLuc = khuyenMai.SoLuongHieuLuc,
                CreatedDate = khuyenMai.CreatedDate,
                DanhSachKhoaHoc = khoaHocs.Select(kh => new KhoaHocMiniDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc
                }).ToList()
            };
        }

        public async Task<KhuyenMaiDto> UpdateKhuyenMai(UpdateKhuyenMaiRequest request)
        {
            var userId = GetCurrentUserId();

            var khuyenMai = await GetQueryable().FirstOrDefaultAsync(x => x.Id == request.Id);
            if (khuyenMai == null)
                throw new Exception("Không tìm thấy mã giảm giá");

            if (khuyenMai.CreatedId != userId)
                throw new Exception("Bạn không có quyền hạn để sửa mã giảm giá này");

            ValidateInput(request.MaGiamGia, request.PhanTramGiam, request.NgayBatDau, request.NgayKetThuc);

            var khoaHocs = await ValidateAndGetApprovedCourses(request.IdsKhoaHoc, userId);

            var maCode = request.MaGiamGia!.Trim().ToUpper();

            var trung = await AnyAsync(x => x.MaGiamGia == maCode && x.Id != request.Id);
            if (trung)
                throw new Exception($"Mã giảm giá '{maCode}' đã tồn tại");

            khuyenMai.MaGiamGia = maCode;
            khuyenMai.PhanTramGiam = request.PhanTramGiam;
            khuyenMai.NgayBatDau = request.NgayBatDau;
            khuyenMai.NgayKetThuc = request.NgayKetThuc;
            khuyenMai.SoLuongHieuLuc = request.SoLuongHieuLuc;

            await UpdateAsync(khuyenMai);
            await SaveAsync();

            // ── Xoá liên kết cũ, gắn lại theo danh sách khóa học mới ──
            var lienKetCu = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai == khuyenMai.Id)
                .ToListAsync();

            if (lienKetCu.Any())
            {
                _khuyenMai_KhoaHocRepository.Delete(lienKetCu);
                await _khuyenMai_KhoaHocRepository.SaveAsync();
            }

            var lienKetMoi = khoaHocs.Select(kh => new KhuyenMai_KhoaHoc
            {
                IdKhuyenMai = khuyenMai.Id,
                IdKhoaHoc = kh.Id
            }).ToList();

            _khuyenMai_KhoaHocRepository.AddRange(lienKetMoi);
            await _khuyenMai_KhoaHocRepository.SaveAsync();

            return new KhuyenMaiDto
            {
                Id = khuyenMai.Id,
                MaGiamGia = khuyenMai.MaGiamGia,
                PhanTramGiam = khuyenMai.PhanTramGiam,
                NgayBatDau = khuyenMai.NgayBatDau,
                NgayKetThuc = khuyenMai.NgayKetThuc,
                SoLuongHieuLuc = khuyenMai.SoLuongHieuLuc,
                CreatedDate = khuyenMai.CreatedDate,
                DanhSachKhoaHoc = khoaHocs.Select(kh => new KhoaHocMiniDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc
                }).ToList()
            };
        }

        public async Task<bool> DeleteKhuyenMai(Guid id)
        {
            var userId = GetCurrentUserId();

            var khuyenMai = await GetQueryable().FirstOrDefaultAsync(x => x.Id == id);
            if (khuyenMai == null)
                throw new Exception("Không tìm thấy mã giảm giá");

            if (khuyenMai.CreatedId != userId)
                throw new Exception("Bạn không có quyền hạn để xoá mã giảm giá này");

            var lienKets = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai == khuyenMai.Id)
                .ToListAsync();

            if (lienKets.Any())
            {
                _khuyenMai_KhoaHocRepository.Delete(lienKets);
                await _khuyenMai_KhoaHocRepository.SaveAsync();
            }

            await DeleteAsync(khuyenMai);
            await SaveAsync();
            return true;
        }
    }
}
