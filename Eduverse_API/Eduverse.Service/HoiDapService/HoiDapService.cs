using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.HoiDapRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.LikeHoiDapRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.Common;
using Eduverse.Service.HoiDapService.Dto;
using Eduverse.Service.HoiDapService.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.HoiDapService
{
    public class HoiDapService : Service<HoiDap>, IHoiDapService
    {
        private readonly IHoiDapRepository _hoiDapRepo;
        private readonly ILikeHoiDapRepository _likeRepo;
        private readonly IBaiGiangRepository _baiGiangRepo;
        private readonly IDangKyKhoaHocRepository _dangKyRepo;
        private readonly IKhoaHoc_GiangVienRepository _khoaHocGVRepo;
        private readonly IAppUserService _appUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly EduverseContext _context;
        public HoiDapService(
        IHoiDapRepository hoiDapRepo,
        ILikeHoiDapRepository likeRepo,
        IBaiGiangRepository baiGiangRepo,
        IDangKyKhoaHocRepository dangKyRepo,
        IKhoaHoc_GiangVienRepository khoaHocGVRepo,
        IAppUserService appUserService,
        IHttpContextAccessor httpContextAccessor,
        EduverseContext context) : base(hoiDapRepo)
        {
            _hoiDapRepo = hoiDapRepo;
            _likeRepo = likeRepo;
            _baiGiangRepo = baiGiangRepo;
            _dangKyRepo = dangKyRepo;
            _khoaHocGVRepo = khoaHocGVRepo;
            _appUserService = appUserService;
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        private Guid LayUserId()
        {
            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User
                    ?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var userId);
            return userId;
        }

        // ── Kiểm tra user có trong khóa học không (đăng ký hoặc là GV) ──────
        private async Task<bool> CoTrongKhoaHoc(Guid idKhoaHoc, Guid userId)
        {

            Console.WriteLine("========== HOI DAP CHECK ==========");
            Console.WriteLine($"CourseId: {idKhoaHoc}");
            Console.WriteLine($"UserId:   {userId}");
            var laGV = await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdGiangVien == userId
                            && !x.IsDeleted);
            if (laGV) return true;
            Console.WriteLine($"LaGiangVien = {laGV}");

            var daDangKy = await _dangKyRepo.GetQueryable()
        .AnyAsync(x =>
            x.IdKhoaHoc == idKhoaHoc &&
            x.IdNguoiDangKi == userId &&
            !x.IsDeleted);

            Console.WriteLine($"DaDangKy = {daDangKy}");

            Console.WriteLine($"CoQuyen = {laGV || daDangKy}");
            Console.WriteLine("========================================");

            return laGV || daDangKy;
        }

        // ── Kiểm tra là giảng viên của khóa học ─────────────────────────────
        private async Task<bool> LaGiangVien(Guid idKhoaHoc, Guid userId)
        {
            return await _khoaHocGVRepo.GetQueryable()
                .AnyAsync(x => x.IdKhoaHoc == idKhoaHoc
                            && x.IdGiangVien == userId
                            && !x.IsDeleted);
        }

        public async Task<HoiDapDto> DatCauHoi(DatCauHoiRequest request)
        {
            var userId = LayUserId();
            if (!await CoTrongKhoaHoc(request.IdKhoaHoc, userId))
                throw new Exception("Bạn không có quyền đặt câu hỏi trong khóa học này");

            var cauHoi = new HoiDap
            {
                NoiDung = request.NoiDung.Trim(),
                IdNguoiDung = userId,
                IdKhoaHoc = request.IdKhoaHoc,
                IdBaiGiang = request.IdBaiGiang,
                IdHoiDapCha = null,   // câu hỏi gốc
                NgayTao = DateTime.Now,
            };

            _hoiDapRepo.Add(cauHoi);
            await _hoiDapRepo.SaveAsync();

            return await GetChiTiet(cauHoi.Id);
        }

        public async Task<TraLoiDto> TraLoi(TraLoiRequest request)
        {
            var userId = LayUserId();

            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdCauHoi
                                       && x.IdHoiDapCha == null
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            if (cauHoi.DaDong)
                throw new Exception("Câu hỏi đã bị đóng, không thể trả lời");

            if (!await CoTrongKhoaHoc(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền trả lời");

            var laGV = await LaGiangVien(cauHoi.IdKhoaHoc!.Value, userId);

            var traLoi = new HoiDap
            {
                NoiDung = request.NoiDung.Trim(),
                IdNguoiDung = userId,
                IdKhoaHoc = cauHoi.IdKhoaHoc,
                IdBaiGiang = cauHoi.IdBaiGiang,
                IdHoiDapCha = request.IdCauHoi,
                LaGiangVien = laGV,
                NgayTao = DateTime.Now,
            };

            _hoiDapRepo.Add(traLoi);

            // Tăng đếm trả lời ở câu hỏi gốc
            cauHoi.SoLike = cauHoi.SoLike; // không đụng field này
                                           // Dùng subquery đếm realtime thay vì cache
            await _hoiDapRepo.SaveAsync();

            return await MapTraLoiDto(traLoi, userId);
        }

        private async Task<TraLoiDto> MapTraLoiDto(HoiDap traLoi, Guid userId)
        {
            var nguoiDung = await _appUserService.GetQueryable()
                .Where(x => x.Id == traLoi.IdNguoiDung)
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .FirstOrDefaultAsync();

            var daLike = await _likeRepo.GetQueryable()
                .AnyAsync(x => x.IdHoiDap == traLoi.Id
                            && x.IdNguoiDung == userId
                            && !x.IsDeleted);

            return new TraLoiDto
            {
                Id = traLoi.Id,
                NoiDung = traLoi.NoiDung ?? "",
                LaGiangVien = traLoi.LaGiangVien,
                GhimTraLoi = traLoi.GhimTraLoi,
                SoLike = traLoi.SoLike,
                DaLike = daLike,
                NguoiTraLoiId = traLoi.IdNguoiDung,
                NguoiTraLoiTen = nguoiDung?.HoTen,
                NguoiTraLoiAnh = nguoiDung?.AnhDaiDien,
                NgayTao = traLoi.NgayTao ?? traLoi.CreatedDate,
                LaCuaToi = traLoi.IdNguoiDung == userId
            };
        }

        public async Task<PagedList<HoiDapDto>> GetDanhSachCauHoi(
    SearchHoiDapRequest request)
        {
            var userId = LayUserId();

            var query = _hoiDapRepo.GetQueryable()
                .Where(x =>
                    x.IdKhoaHoc == request.IdKhoaHoc &&
                    x.IdHoiDapCha == null &&
                    !x.IsDeleted);

            if (request.IdBaiGiang.HasValue)
            {
                query = query.Where(x =>
                    x.IdBaiGiang == request.IdBaiGiang);
            }

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                query = query.Where(x =>
                    x.NoiDung != null &&
                    x.NoiDung.Contains(request.Keyword));
            }

            if (request.ChiCuaToi == true)
            {
                query = query.Where(x =>
                    x.IdNguoiDung == userId);
            }

            query = request.SapXep switch
            {
                "NhieuTraLoi" =>
                    query.OrderByDescending(x =>
                        _hoiDapRepo.GetQueryable()
                            .Count(t =>
                                t.IdHoiDapCha == x.Id &&
                                !t.IsDeleted)),

                "DaGhim" =>
                    query
                        .OrderByDescending(x => x.DaGhim)
                        .ThenByDescending(x => x.NgayTao),

                _ =>
                    query.OrderByDescending(x => x.NgayTao),
            };

            var dtoQuery = query.Select(x => new HoiDapDto
            {
                Id = x.Id,

                IdBaiGiang = x.IdBaiGiang,

                // Lấy tên bài giảng trực tiếp từ DB
                TenBaiGiang = x.IdBaiGiang.HasValue
                    ? _baiGiangRepo.GetQueryable()
                        .Where(b => b.Id == x.IdBaiGiang.Value)
                        .Select(b => b.TieuDe)
                        .FirstOrDefault()
                    : null,

                NoiDung = x.NoiDung ?? "",

                DaGhim = x.DaGhim,

                DaDong = x.DaDong,

                SoTraLoi = _hoiDapRepo.GetQueryable()
                    .Count(t =>
                        t.IdHoiDapCha == x.Id &&
                        !t.IsDeleted),

                NguoiHoiId = x.IdNguoiDung,

                // Lấy thông tin người hỏi trực tiếp từ DB
                NguoiHoiTen = x.IdNguoiDung.HasValue
                    ? _appUserService.GetQueryable()
                        .Where(u => u.Id == x.IdNguoiDung.Value)
                        .Select(u => u.HoTen)
                        .FirstOrDefault()
                    : null,

                NguoiHoiAnh = x.IdNguoiDung.HasValue
                    ? _appUserService.GetQueryable()
                        .Where(u => u.Id == x.IdNguoiDung.Value)
                        .Select(u => u.AnhDaiDien)
                        .FirstOrDefault()
                    : null,

                NgayTao = x.NgayTao ?? x.CreatedDate,

                LaCuaToi = x.IdNguoiDung == userId,
            });

            return await PagedList<HoiDapDto>.CreateAsync(
                dtoQuery,
                request);
        }

        public async Task<HoiDapDto> GetChiTiet(Guid idCauHoi)
        {
            var userId = LayUserId();

            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idCauHoi
                                       && x.IdHoiDapCha == null
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            var nguoiHoi = await _appUserService.GetQueryable()
                .Where(x => x.Id == cauHoi.IdNguoiDung)
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .FirstOrDefaultAsync();

            string? tenBaiGiang = null;
            if (cauHoi.IdBaiGiang.HasValue)
            {
                tenBaiGiang = await _baiGiangRepo.GetQueryable()
                    .Where(x => x.Id == cauHoi.IdBaiGiang)
                    .Select(x => x.TieuDe)
                    .FirstOrDefaultAsync();
            }

            // Lấy toàn bộ câu trả lời
            var traLois = await _hoiDapRepo.GetQueryable()
                .Where(x => x.IdHoiDapCha == idCauHoi && !x.IsDeleted)
                .OrderBy(x => x.GhimTraLoi ? 0 : 1)   // ghim lên đầu
                .ThenBy(x => x.NgayTao)
                .ToListAsync();

            var traLoiUserIds = traLois
                .Where(x => x.IdNguoiDung.HasValue)
                .Select(x => x.IdNguoiDung!.Value)
                .Distinct()
                .ToList();

            var traLoiUsers = await _appUserService.GetQueryable()
                .Where(x => traLoiUserIds.Contains(x.Id))
                .Select(x => new { x.Id, x.HoTen, x.AnhDaiDien })
                .ToListAsync();

            // Like của user hiện tại
            var traLoiIds = traLois.Select(x => x.Id).ToList();
            var likedIds = await _likeRepo.GetQueryable()
                .Where(x => traLoiIds.Contains(x.IdHoiDap)
                         && x.IdNguoiDung == userId
                         && !x.IsDeleted)
                .Select(x => x.IdHoiDap)
                .ToListAsync();

            var danhSachTraLoi = traLois.Select(t =>
            {
                var u = traLoiUsers.FirstOrDefault(x => x.Id == t.IdNguoiDung);
                return new TraLoiDto
                {
                    Id = t.Id,
                    NoiDung = t.NoiDung ?? "",
                    LaGiangVien = t.LaGiangVien,
                    GhimTraLoi = t.GhimTraLoi,
                    SoLike = t.SoLike,
                    DaLike = likedIds.Contains(t.Id),
                    NguoiTraLoiId = t.IdNguoiDung,
                    NguoiTraLoiTen = u?.HoTen,
                    NguoiTraLoiAnh = u?.AnhDaiDien,
                    NgayTao = t.NgayTao ?? t.CreatedDate,
                    LaCuaToi = t.IdNguoiDung == userId,
                };
            }).ToList();

            return new HoiDapDto
            {
                Id = cauHoi.Id,
                IdBaiGiang = cauHoi.IdBaiGiang,
                TenBaiGiang = tenBaiGiang,
                NoiDung = cauHoi.NoiDung ?? "",
                DaGhim = cauHoi.DaGhim,
                DaDong = cauHoi.DaDong,
                SoTraLoi = traLois.Count,
                NguoiHoiId = cauHoi.IdNguoiDung,
                NguoiHoiTen = nguoiHoi?.HoTen,
                NguoiHoiAnh = nguoiHoi?.AnhDaiDien,
                NgayTao = cauHoi.NgayTao ?? cauHoi.CreatedDate,
                LaCuaToi = cauHoi.IdNguoiDung == userId,
                DanhSachTraLoi = danhSachTraLoi,
            };
        }

        public async Task<int> ToggleLike(Guid idTraLoi)
        {
            var userId = LayUserId();

            var traLoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idTraLoi
                                       && x.IdHoiDapCha != null
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu trả lời");

            var like = await _likeRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdHoiDap == idTraLoi
                                       && x.IdNguoiDung == userId
                                       && !x.IsDeleted);

            if (like != null)
            {
                // Unlike
                _likeRepo.Delete(like);
                traLoi.SoLike = Math.Max(0, traLoi.SoLike - 1);
            }
            else
            {
                // Like
                _likeRepo.Add(new LikeHoiDap
                {
                    IdHoiDap = idTraLoi,
                    IdNguoiDung = userId,
                });
                traLoi.SoLike++;
            }

            _hoiDapRepo.Update(traLoi);
            await _context.SaveChangesAsync();
            return traLoi.SoLike;
        }

        public async Task<TraLoiDto> Reply(ReplyRequest request)
        {
            var userId = LayUserId();

            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdCauHoi
                                       && x.IdHoiDapCha == null
                                       && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            if (cauHoi.DaDong)
                throw new Exception("Câu hỏi đã bị đóng");

            if (!await CoTrongKhoaHoc(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền reply");

            // Lấy tên @mention
            var traLoiDuocReply = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdTraLoiDuocReply && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu trả lời");

            var mentionUser = await _appUserService.GetQueryable()
                .Where(x => x.Id == traLoiDuocReply.IdNguoiDung)
                .Select(x => new { x.HoTen })
                .FirstOrDefaultAsync();

            var laGV = await LaGiangVien(cauHoi.IdKhoaHoc!.Value, userId);

            // Ghép @mention vào đầu nội dung
            var noiDungCuoiCung = mentionUser?.HoTen != null
                ? $"@{mentionUser.HoTen} {request.NoiDung.Trim()}"
                : request.NoiDung.Trim();

            var reply = new HoiDap
            {
                NoiDung = noiDungCuoiCung,
                IdNguoiDung = userId,
                IdKhoaHoc = cauHoi.IdKhoaHoc,
                IdBaiGiang = cauHoi.IdBaiGiang,
                IdHoiDapCha = request.IdCauHoi,  // ← luôn gán về câu hỏi GỐC HD01
                LaGiangVien = laGV,
                NgayTao = DateTime.Now,
            };

            _hoiDapRepo.Add(reply);
            await _hoiDapRepo.SaveAsync();

            var nguoiReply = await _appUserService.GetQueryable()
                .Where(x => x.Id == userId)
                .Select(x => new { x.HoTen, x.AnhDaiDien })
                .FirstOrDefaultAsync();

            return new TraLoiDto
            {
                Id = reply.Id,
                NoiDung = reply.NoiDung ?? "",
                LaGiangVien = reply.LaGiangVien,
                GhimTraLoi = false,
                SoLike = 0,
                DaLike = false,
                NguoiTraLoiId = userId,
                NguoiTraLoiTen = nguoiReply?.HoTen,
                NguoiTraLoiAnh = nguoiReply?.AnhDaiDien,
                NgayTao = reply.NgayTao ?? DateTime.Now,
                LaCuaToi = true,
                DanhSachReply = new(),
            };
        }

        public async Task GhimCauHoi(Guid idCauHoi, bool ghim)
        {
            var userId = LayUserId();
            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idCauHoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            if (!await LaGiangVien(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Chỉ giảng viên mới được ghim");

            cauHoi.DaGhim = ghim;
            _hoiDapRepo.Update(cauHoi);
            await _hoiDapRepo.SaveAsync();
        }

        public async Task GhimTraLoi(Guid idTraLoi, bool ghim)
        {
            var userId = LayUserId();
            var traLoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idTraLoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu trả lời");

            if (!await LaGiangVien(traLoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Chỉ giảng viên mới được ghim câu trả lời");

            traLoi.GhimTraLoi = ghim;
            _hoiDapRepo.Update(traLoi);
            await _hoiDapRepo.SaveAsync();
        }

        public async Task DongCauHoi(Guid idCauHoi, bool dong)
        {
            var userId = LayUserId();
            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idCauHoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            if (!await LaGiangVien(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Chỉ giảng viên mới được đóng/mở câu hỏi");

            cauHoi.DaDong = dong;
            _hoiDapRepo.Update(cauHoi);
            await _hoiDapRepo.SaveAsync();
        }

        public async Task XoaCauHoi(Guid idCauHoi)
        {
            var userId = LayUserId();
            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idCauHoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            // Chủ câu hỏi hoặc giảng viên mới được xóa
            var coQuyen = cauHoi.IdNguoiDung == userId
                       || await LaGiangVien(cauHoi.IdKhoaHoc!.Value, userId);
            if (!coQuyen) throw new Exception("Bạn không có quyền xóa câu hỏi này");

            // Soft-delete toàn bộ câu trả lời
            var traLois = await _hoiDapRepo.GetQueryable()
                .Where(x => x.IdHoiDapCha == idCauHoi && !x.IsDeleted)
                .ToListAsync();
            foreach (var t in traLois) _hoiDapRepo.Delete(t);

            _hoiDapRepo.Delete(cauHoi);
            await _hoiDapRepo.SaveAsync();
        }

        public async Task XoaTraLoi(Guid idTraLoi)
        {
            var userId = LayUserId();
            var traLoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idTraLoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu trả lời");

            var coQuyen = traLoi.IdNguoiDung == userId
                       || await LaGiangVien(traLoi.IdKhoaHoc!.Value, userId);
            if (!coQuyen) throw new Exception("Bạn không có quyền xóa câu trả lời này");

            _hoiDapRepo.Delete(traLoi);
            await _hoiDapRepo.SaveAsync();
        }
    }
}
