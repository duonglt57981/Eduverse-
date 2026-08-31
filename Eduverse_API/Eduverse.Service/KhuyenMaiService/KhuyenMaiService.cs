using Eduverse.Model.Entities;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.KhuyenMai_KhoaHocRepository;
using Eduverse.Repository.KhuyenMaiRepository;
using Eduverse.Service.Common;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhuyenMaiService.Dto;
using Eduverse.Service.KhuyenMaiService.Request;
using Eduverse.Service.LoiMoiGiangVienService;              // ★ MỚI
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
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
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepository;
        private readonly ILoiMoiGiangVienService _loiMoiGiangVienService;
        private readonly UserManager<AppUser> _userManager;

        public KhuyenMaiService(
            IKhuyenMaiRepository khuyenMaiRepository,
            IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository,
            IKhoaHocRepository khoaHocRepository,
            IHttpContextAccessor httpContextAccessor,
            IKhoaHoc_GiangVienRepository khoaHocGVRepository,
            ILoiMoiGiangVienService loiMoiGiangVienService,
            UserManager<AppUser> userManager
        ) : base(khuyenMaiRepository)
        {
            _khuyenMai_KhoaHocRepository = khuyenMai_KhoaHocRepository;
            _khoaHocRepository = khoaHocRepository;
            _httpContextAccessor = httpContextAccessor;
            _khoaHocGVRepository = khoaHocGVRepository;
            _loiMoiGiangVienService = loiMoiGiangVienService;
            _userManager = userManager;
        }

        private bool IsAdmin() =>
            _httpContextAccessor.HttpContext?.User?.IsInRole("Admin") ?? false;

        private Guid GetCurrentUserId()
        {
            Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId);
            return userId;
        }

        // ── Trang "Quản lý khuyến mãi": toàn bộ mã của giảng viên + khóa học liên kết ──
        public async Task<List<KhuyenMaiDto>> GetListAll()
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();

            List<KhuyenMai> khuyenMais;

            if (isAdmin)
            {
                var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                var adminIds = adminUsers.Select(u => u.Id).ToHashSet();

                khuyenMais = await GetQueryable()
                    .Where(x => x.CreatedId.HasValue && adminIds.Contains(x.CreatedId.Value))
                    .OrderByDescending(x => x.CreatedDate)
                    .ToListAsync();
            }
            else
            {
                var khoaHocIdsCoQuyen = await _khoaHocGVRepository.GetQueryable()
                    .Where(x => x.IdGiangVien == userId && !x.IsDeleted
                             && (x.LaChuSoHuu || x.Promotions))
                    .Select(x => x.IdKhoaHoc)
                    .Distinct()
                    .ToListAsync();

                var khuyenMaiIdsLienQuan = await _khuyenMai_KhoaHocRepository.GetQueryable()
                    .Where(x => x.IdKhoaHoc.HasValue && khoaHocIdsCoQuyen.Contains(x.IdKhoaHoc.Value)
                             && x.IdKhuyenMai.HasValue)
                    .Select(x => x.IdKhuyenMai!.Value)
                    .Distinct()
                    .ToListAsync();

                var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
                var adminIds = adminUsers.Select(u => u.Id).ToHashSet();

                khuyenMais = await GetQueryable()
                    .Where(x => (x.CreatedId == userId || khuyenMaiIdsLienQuan.Contains(x.Id))
                             && !(x.CreatedId.HasValue && adminIds.Contains(x.CreatedId.Value)))
                    .OrderByDescending(x => x.CreatedDate)
                    .ToListAsync();
            }

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
                .Where(x => khoaHocIds.Contains(x.Id) && x.TrangThai == "HoatDong")
                .Select(x => new KhoaHocMiniDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc
                })
                .ToListAsync();

            var khoaHocDict = khoaHocs.ToDictionary(x => x.Id);

            // ★ MỚI: lấy trạng thái các lời mời đang chờ/bị từ chối cho từng mã KM
            //         (chỉ Admin cần thấy phần này để biết còn ai chưa duyệt)
            var loiMoiTheoKM = new Dictionary<Guid, List<LoiMoiApDungKhuyenMaiDto>>();
            if (isAdmin)
            {
                foreach (var kmId in khuyenMaiIds)
                {
                    var ds = await _loiMoiGiangVienService.GetLoiMoiApDungTheoKhuyenMai(kmId);
                    var dangCho = ds.Where(x => x.TrangThai == "Pending").ToList();
                    if (dangCho.Any())
                        loiMoiTheoKM[kmId] = dangCho;
                }
            }

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
                        .ToList(),
                    DanhSachDangCho = loiMoiTheoKM.TryGetValue(km.Id, out var dc) ? dc : new List<LoiMoiApDungKhuyenMaiDto>(),
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

        // ── Chỉ chấp nhận khóa học: tồn tại + đã ở trạng thái DaDuyet.
        //    Kiểm tra QUYỀN được tách riêng ra PhanLoaiTheoQuyen bên dưới —
        //    "không có quyền trực tiếp" giờ không còn là lỗi cứng với Admin,
        //    mà có nghĩa "cần gửi lời mời xin duyệt". ────────────────────
        private async Task<List<KhoaHoc>> ValidateAndGetCourses(List<Guid>? idsKhoaHoc)
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

            var chuaDuyet = khoaHocs.Where(x => x.TrangThaiPheDuyet != "DaDuyet").Select(x => x.TieuDe).ToList();
            if (chuaDuyet.Any())
                throw new Exception($"Chỉ áp dụng được cho khóa học đã duyệt. Chưa duyệt: {string.Join(", ", chuaDuyet)}");

            var mienPhi = khoaHocs.Where(x => (x.Gia ?? 0) <= 0 || x.LoaiKhoaHoc == "Khóa học miễn phí" || x.LoaiKhoaHoc == "MienPhi").Select(x => x.TieuDe).ToList();
            if (mienPhi.Any())
                throw new Exception($"Không thể áp dụng mã giảm giá cho khóa học miễn phí: {string.Join(", ", mienPhi)}");

            return khoaHocs;
        }

        // ── Tách danh sách khóa học thành 2 nhóm: ────────────────────────
        //     ApNgay      = người gọi có quyền trực tiếp (LaChuSoHuu/Promotions)
        //                   -> giữ hành vi CŨ, gắn link ngay lập tức
        //     CanXinPhep  = người gọi KHÔNG có quyền trực tiếp
        //                   -> chỉ hợp lệ khi người gọi LÀ ADMIN, sẽ gửi
        //                      lời mời xin duyệt tới giảng viên phụ trách
        private async Task<(List<KhoaHoc> ApNgay, List<KhoaHoc> CanXinPhep)> PhanLoaiTheoQuyen(
            List<KhoaHoc> khoaHocs, Guid userId, bool isAdmin)
        {
            if (isAdmin)
            {
                // Admin: luôn phải xin phép giảng viên — Admin không tự áp trực tiếp.
                return (new List<KhoaHoc>(), khoaHocs);
            }

            var apNgay = new List<KhoaHoc>();
            var khongCoQuyen = new List<string>();

            foreach (var kh in khoaHocs)
            {
                var coQuyen = await CoQuyenPromotionTrenKhoaHoc(kh.Id, userId);
                if (coQuyen)
                    apNgay.Add(kh);
                else
                    khongCoQuyen.Add(kh.TieuDe ?? kh.Id.ToString());
            }

            // Giảng viên thường (không phải Admin) không có quyền trên khóa
            // học nào đó vẫn LÀ LỖI như code cũ — chỉ Admin mới được "xin
            // phép", giảng viên không được xin phép giảng viên khác.
            if (khongCoQuyen.Any())
                throw new Exception($"Bạn không có quyền áp dụng mã giảm giá cho: {string.Join(", ", khongCoQuyen)}");

            return (apNgay, new List<KhoaHoc>());
        }

        public async Task<KhuyenMaiDto> CreateKhuyenMai(CreateKhuyenMaiRequest request)
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();

            ValidateInput(request.MaGiamGia, request.PhanTramGiam, request.NgayBatDau, request.NgayKetThuc);

            var khoaHocs = await ValidateAndGetCourses(request.IdsKhoaHoc);
            var (apNgay, canXinPhep) = await PhanLoaiTheoQuyen(khoaHocs, userId, isAdmin);

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

            if (apNgay.Any())
            {
                var lienKets = apNgay.Select(kh => new KhuyenMai_KhoaHoc
                {
                    IdKhuyenMai = khuyenMai.Id,
                    IdKhoaHoc = kh.Id
                }).ToList();

                _khuyenMai_KhoaHocRepository.AddRange(lienKets);
                await _khuyenMai_KhoaHocRepository.SaveAsync();
            }

            if (canXinPhep.Any())
            {
                await _loiMoiGiangVienService.TaoLoiMoiApDungKhuyenMai(
                    khuyenMai.Id,
                    canXinPhep.Select(kh => kh.Id).ToList());
            }

            return await BuildKhuyenMaiDto(khuyenMai.Id);
        }

        public async Task<KhuyenMaiDto> UpdateKhuyenMai(UpdateKhuyenMaiRequest request)
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();

            var khuyenMai = await GetQueryable().FirstOrDefaultAsync(x => x.Id == request.Id);
            if (khuyenMai == null)
                throw new Exception("Không tìm thấy mã giảm giá");
            if (!request.Id.HasValue)
                throw new ArgumentNullException(nameof(request.Id), "(Id) không được phép bỏ trống.");

            var coQuyen = await CoQuyenSuaXoaKhuyenMai(request.Id.Value, userId);
            if (!coQuyen)
                throw new Exception("Bạn không có quyền hạn để sửa mã giảm giá này");

            ValidateInput(request.MaGiamGia, request.PhanTramGiam, request.NgayBatDau, request.NgayKetThuc);

            var khoaHocs = await ValidateAndGetCourses(request.IdsKhoaHoc);
            var (apNgayMoi, canXinPhepMoi) = await PhanLoaiTheoQuyen(khoaHocs, userId, isAdmin);

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

            // ── ★ FIX: so sánh DIFF thay vì xoá sạch làm lại toàn bộ ─────────────
            // Lấy đúng trạng thái ĐANG CÓ trong DB để biết khóa học nào đã áp
            // trực tiếp (link), khóa học nào đang Pending chờ duyệt.
            var lienKetHienTai = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai == khuyenMai.Id)
                .ToListAsync();
            var idsDaLinkTrucTiep = lienKetHienTai
                .Where(x => x.IdKhoaHoc.HasValue)
                .Select(x => x.IdKhoaHoc!.Value)
                .ToHashSet();

            var loiMoiHienTai = await _loiMoiGiangVienService.GetLoiMoiApDungTheoKhuyenMai(khuyenMai.Id);
            var idsDangChoDuyet = loiMoiHienTai
                .Where(x => x.TrangThai == "Pending")
                .Select(x => x.IdKhoaHoc)
                .ToHashSet();

            var idsChonMoi = khoaHocs.Select(x => x.Id).ToHashSet();

            // 1) Khóa học bị BỎ CHỌN (có trong link hoặc Pending cũ, nhưng không
            //    còn trong lựa chọn mới) → gỡ link + huỷ Pending tương ứng.
            var idsBiBoChon = idsDaLinkTrucTiep.Union(idsDangChoDuyet).Except(idsChonMoi).ToList();
            if (idsBiBoChon.Any())
            {
                var lienKetCanXoa = lienKetHienTai
                    .Where(x => x.IdKhoaHoc.HasValue && idsBiBoChon.Contains(x.IdKhoaHoc.Value))
                    .ToList();
                if (lienKetCanXoa.Any())
                {
                    _khuyenMai_KhoaHocRepository.Delete(lienKetCanXoa);
                    await _khuyenMai_KhoaHocRepository.SaveAsync();
                }
                await _loiMoiGiangVienService.HuyLoiMoiApDungKhuyenMaiTheoKhoaHoc(khuyenMai.Id, idsBiBoChon);
            }

            // 2) apNgay: CHỈ thêm link cho khóa học MỚI chưa từng được link.
            //    Khóa học đã link rồi (kể cả trước đó apNgay hay đã Accepted từ
            //    lời mời) mà vẫn được giữ chọn thì KHÔNG đụng tới — giữ nguyên
            //    CreatedDate, không ghi DB thừa.
            var apNgayCanThem = apNgayMoi.Where(kh => !idsDaLinkTrucTiep.Contains(kh.Id)).ToList();
            if (apNgayCanThem.Any())
            {
                var lienKetMoi = apNgayCanThem.Select(kh => new KhuyenMai_KhoaHoc
                {
                    IdKhuyenMai = khuyenMai.Id,
                    IdKhoaHoc = kh.Id
                }).ToList();
                _khuyenMai_KhoaHocRepository.AddRange(lienKetMoi);
                await _khuyenMai_KhoaHocRepository.SaveAsync();
            }

            // 3) canXinPhep: CHỈ gửi lời mời cho khóa học MỚI — chưa có Pending
            //    VÀ chưa có link trực tiếp (nếu đã link nghĩa là đã Accepted từ
            //    trước, không cần xin lại). Đây chính là phần bạn yêu cầu: khóa
            //    học đã áp dụng/đang chờ mà không đổi gì thì không gửi request.
            var canXinPhepCanMoi = canXinPhepMoi
                .Where(kh => !idsDangChoDuyet.Contains(kh.Id) && !idsDaLinkTrucTiep.Contains(kh.Id))
                .ToList();
            if (canXinPhepCanMoi.Any())
            {
                await _loiMoiGiangVienService.TaoLoiMoiApDungKhuyenMai(
                    khuyenMai.Id,
                    canXinPhepCanMoi.Select(kh => kh.Id).ToList());
            }

            return await BuildKhuyenMaiDto(khuyenMai.Id);
        }

        public async Task<bool> DeleteKhuyenMai(Guid id)
        {
            var userId = GetCurrentUserId();

            var khuyenMai = await GetQueryable().FirstOrDefaultAsync(x => x.Id == id);
            if (khuyenMai == null)
                throw new Exception("Không tìm thấy mã giảm giá");

            var coQuyen = await CoQuyenSuaXoaKhuyenMai(id, userId);
            if (!coQuyen)
                throw new Exception("Bạn không có quyền hạn để xoá mã giảm giá này");

            var lienKets = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai == khuyenMai.Id)
                .ToListAsync();

            if (lienKets.Any())
            {
                _khuyenMai_KhoaHocRepository.Delete(lienKets);
                await _khuyenMai_KhoaHocRepository.SaveAsync();
            }

            // ★ MỚI: dọn luôn các lời mời Pending còn treo của mã này
            await _loiMoiGiangVienService.HuyLoiMoiApDungKhuyenMaiTheoMa(khuyenMai.Id);

            await DeleteAsync(khuyenMai);
            await SaveAsync();
            return true;
        }

        public async Task<List<KhoaHocMiniDto>> GetAllApprovedKhoaHocAsync()
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();

            var query = _khoaHocRepository.GetQueryable()
                .Where(x => x.TrangThaiPheDuyet == "DaDuyet"
                         && x.IsBanHienTai == true
                         && !x.IsDeleted
                         && x.TrangThai == "HoatDong"
                         && (x.Gia ?? 0) > 0
                         && x.LoaiKhoaHoc != "Khóa học miễn phí"
                         && x.LoaiKhoaHoc != "MienPhi");

            // ★ Admin được chọn TẤT CẢ khóa học đã duyệt (kể cả không sở
            //   hữu) — vì Admin sẽ đi qua luồng "xin phép" chứ không tự áp
            //   trực tiếp. Giảng viên thường vẫn chỉ thấy khóa học mình có
            //   quyền, giữ nguyên hành vi cũ.
            if (!isAdmin)
            {
                var khoaHocIdsCoQuyen = await _khoaHocGVRepository.GetQueryable()
                    .Where(x => x.IdGiangVien == userId && !x.IsDeleted
                             && (x.LaChuSoHuu || x.Promotions))
                    .Select(x => x.IdKhoaHoc)
                    .Distinct()
                    .ToListAsync();

                query = query.Where(x => khoaHocIdsCoQuyen.Contains(x.Id));
            }

            return await query
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => new KhoaHocMiniDto
                {
                    Id = x.Id,
                    TieuDe = x.TieuDe,
                    HinhAnhKhoaHoc = x.HinhAnhKhoaHoc,
                    Gia = x.Gia,
                    LoaiKhoaHoc = x.LoaiKhoaHoc
                })
                .ToListAsync();
        }

        public async Task<List<KhuyenMaiKhaDungDto>> GetKhaDungTheoKhoaHoc(List<Guid> khoaHocIds)
        {
            if (khoaHocIds == null || !khoaHocIds.Any())
                return new List<KhuyenMaiKhaDungDto>();

            var idsDistinct = khoaHocIds.Distinct().ToList();
            var now = DateTime.Now;

            var links = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhoaHoc.HasValue && idsDistinct.Contains(x.IdKhoaHoc.Value)
                         && x.IdKhuyenMai.HasValue)
                .ToListAsync();

            var khuyenMaiIds = links.Select(x => x.IdKhuyenMai!.Value).Distinct().ToList();
            if (!khuyenMaiIds.Any())
                return new List<KhuyenMaiKhaDungDto>();

            var khuyenMais = await GetQueryable()
                .Where(x => khuyenMaiIds.Contains(x.Id)
                         && (!x.NgayKetThuc.HasValue || x.NgayKetThuc.Value >= now)
                         && (!x.NgayBatDau.HasValue || x.NgayBatDau.Value <= now)
                         && (!x.SoLuongHieuLuc.HasValue || x.SoLuongHieuLuc.Value > 0))
                .ToListAsync();

            if (!khuyenMais.Any())
                return new List<KhuyenMaiKhaDungDto>();

            var adminUsers = await _userManager.GetUsersInRoleAsync("Admin");
            var adminIds = adminUsers.Select(u => u.Id).ToHashSet();

            var khuyenMaiCuaAdmin = khuyenMais
                .Where(km => km.CreatedId.HasValue && adminIds.Contains(km.CreatedId.Value))
                .ToList();

            return khuyenMaiCuaAdmin.Select(km => new KhuyenMaiKhaDungDto
            {
                Id = km.Id,
                MaGiamGia = km.MaGiamGia,
                PhanTramGiam = km.PhanTramGiam,
                NgayKetThuc = km.NgayKetThuc,
                IdsKhoaHocApDung = links
                    .Where(l => l.IdKhuyenMai == km.Id && l.IdKhoaHoc.HasValue)
                    .Select(l => l.IdKhoaHoc!.Value)
                    .Where(id => idsDistinct.Contains(id))
                    .ToList()
            }).ToList();
        }

        private async Task<bool> CoQuyenPromotionTrenKhoaHoc(Guid idKhoaHoc, Guid userId)
        {
            var khoaHoc = await _khoaHocRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhoaHoc);
            if (khoaHoc == null) return false;
            if (khoaHoc.CreatedId == userId) return true;

            var thanhVien = await _khoaHocGVRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc && x.IdGiangVien == userId && !x.IsDeleted);
            if (thanhVien == null) return false;
            if (thanhVien.LaChuSoHuu) return true;

            return thanhVien.Promotions;
        }

        private async Task<bool> CoQuyenSuaXoaKhuyenMai(Guid idKhuyenMai, Guid userId)
        {
            if (IsAdmin()) return true;

            var khuyenMai = await GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhuyenMai);
            if (khuyenMai == null) return false;

            if (khuyenMai.CreatedId == userId) return true;

            var khoaHocIds = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai == idKhuyenMai && x.IdKhoaHoc.HasValue)
                .Select(x => x.IdKhoaHoc!.Value)
                .ToListAsync();

            foreach (var idKh in khoaHocIds)
            {
                if (await CoQuyenPromotionTrenKhoaHoc(idKh, userId))
                    return true;
            }
            return false;
        }

        private async Task<KhuyenMaiDto> BuildKhuyenMaiDto(Guid idKhuyenMai)
        {
            var khuyenMai = await GetQueryable().FirstOrDefaultAsync(x => x.Id == idKhuyenMai)
                ?? throw new Exception("Không tìm thấy mã giảm giá");

            var lienKetSauCung = await _khuyenMai_KhoaHocRepository.GetQueryable()
                .Where(x => x.IdKhuyenMai == idKhuyenMai)
                .ToListAsync();
            var idsLinkSauCung = lienKetSauCung
                .Where(x => x.IdKhoaHoc.HasValue)
                .Select(x => x.IdKhoaHoc!.Value)
                .ToList();
            var khoaHocLinkSauCung = await _khoaHocRepository.GetQueryable()
                .Where(x => idsLinkSauCung.Contains(x.Id))
                .ToListAsync();

            var loiMoiSauCung = await _loiMoiGiangVienService.GetLoiMoiApDungTheoKhuyenMai(idKhuyenMai);
            // ★ FIX: lọc đúng "Pending" (khớp với GetListAll đang dùng), không phải
            // "!= Accepted" như cũ — tránh Rejected bị hiện lẫn vào "đang chờ".
            var dangChoSauCung = loiMoiSauCung.Where(x => x.TrangThai == "Pending").ToList();

            return new KhuyenMaiDto
            {
                Id = khuyenMai.Id,
                MaGiamGia = khuyenMai.MaGiamGia,
                PhanTramGiam = khuyenMai.PhanTramGiam,
                NgayBatDau = khuyenMai.NgayBatDau,
                NgayKetThuc = khuyenMai.NgayKetThuc,
                SoLuongHieuLuc = khuyenMai.SoLuongHieuLuc,
                CreatedDate = khuyenMai.CreatedDate,
                DanhSachKhoaHoc = khoaHocLinkSauCung.Select(kh => new KhoaHocMiniDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc
                }).ToList(),
                DanhSachDangCho = dangChoSauCung,
            };
        }
    }
}