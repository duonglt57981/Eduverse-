using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.DangKyKhoaHocRepository;
using Eduverse.Repository.HoiDapRepository;
using Eduverse.Repository.KhoaHoc_GiangVienRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LikeHoiDapRepository;
using Eduverse.Service.AppUserService;
using Eduverse.Service.CauHoiService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.GeminiService;
using Eduverse.Service.HoiDapService.Dto;
using Eduverse.Service.HoiDapService.Request;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.ThongBaoService;
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
        private readonly INotificationPublisher _notificationPublisher;
        private readonly IKhoaHocRepository _khoaHocRepo;  
        private readonly IGeminiService _geminiService;
        private readonly ITaiLieuService _taiLieuService;
        public HoiDapService(
        IHoiDapRepository hoiDapRepo,
        ILikeHoiDapRepository likeRepo,
        IBaiGiangRepository baiGiangRepo,
        IDangKyKhoaHocRepository dangKyRepo,
        IKhoaHoc_GiangVienRepository khoaHocGVRepo,
        IAppUserService appUserService,
        IHttpContextAccessor httpContextAccessor,
        EduverseContext context,
        IKhoaHocRepository khoaHocRepo,     
        IGeminiService geminiService,
        INotificationPublisher notificationPublisher,
        ITaiLieuService taiLieuService) : base(hoiDapRepo)
        {
            _hoiDapRepo = hoiDapRepo;
            _likeRepo = likeRepo;
            _baiGiangRepo = baiGiangRepo;
            _dangKyRepo = dangKyRepo;
            _khoaHocGVRepo = khoaHocGVRepo;
            _appUserService = appUserService;
            _httpContextAccessor = httpContextAccessor;
            _context = context;
            _notificationPublisher = notificationPublisher;
            _khoaHocRepo = khoaHocRepo;
            _geminiService = geminiService;
            _taiLieuService = taiLieuService;
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
            await ThongBaoCauHoiMoi(cauHoi, userId);

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
            await _hoiDapRepo.SaveAsync();

            // Chỉ báo cho người hỏi nếu người trả lời là giảng viên VÀ không phải tự trả lời câu hỏi của chính mình
            if (laGV && cauHoi.IdNguoiDung.HasValue && cauHoi.IdNguoiDung.Value != userId)
            {
                await ThongBaoTraLoiMoi(cauHoi, traLoi);
            }

            return await MapTraLoiDto(traLoi, userId);
        }

        private async Task ThongBaoTraLoiMoi(HoiDap cauHoi, HoiDap traLoi)
        {
            var dangKy = await _dangKyRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == cauHoi.IdKhoaHoc
                                       && x.IdNguoiDangKi == cauHoi.IdNguoiDung
                                       && !x.IsDeleted);

            // Học sinh không còn đăng ký (hiếm) → không có chỗ để dẫn tới, bỏ qua
            if (dangKy == null) return;

            var giangVien = await _appUserService.GetQueryable()
                .Where(x => x.Id == traLoi.IdNguoiDung)
                .Select(x => x.HoTen)
                .FirstOrDefaultAsync();

            var query = new List<string> { "tab=qna" };
            if (cauHoi.IdBaiGiang.HasValue)
                query.Add($"idBaiGiang={cauHoi.IdBaiGiang.Value}");
            query.Add($"idCauHoi={cauHoi.Id}");

            var link = $"/student/courses/my-courses/learning/{dangKy.Id}?{string.Join("&", query)}";

            await _notificationPublisher.NotifyUserAsync(cauHoi.IdNguoiDung!.Value, new NotificationPayload
            {
                TieuDe = "Câu hỏi của bạn đã được trả lời",
                NoiDung = $"{giangVien ?? "Giảng viên"} vừa trả lời câu hỏi của bạn.",
                LoaiThongBao = "TraLoiCauHoi",
                Link = link,
                FromUser = traLoi.IdNguoiDung,
                ItemId = cauHoi.Id,
                ItemName = cauHoi.NoiDung
            });
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
                LaCuaToi = traLoi.IdNguoiDung == userId,
                IdTraLoiDuocReply = traLoi.IdTraLoiDuocReply,
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
                    IdTraLoiDuocReply = t.IdTraLoiDuocReply,
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
                IdTraLoiDuocReply = request.IdTraLoiDuocReply,
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
                IdTraLoiDuocReply = reply.IdTraLoiDuocReply,
            };
        }

        public async Task GhimCauHoi(Guid idCauHoi, bool ghim)
        {
            var userId = LayUserId();
            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idCauHoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            if (!await CoQuyenQnA(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền ghim câu hỏi");

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

            if (!await CoQuyenQnA(traLoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền ghim câu trả lời");

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

            if (!await CoQuyenQnA(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền đóng/mở câu hỏi");

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
           || await CoQuyenQnA(cauHoi.IdKhoaHoc!.Value, userId);
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
           || await CoQuyenQnA(traLoi.IdKhoaHoc!.Value, userId);
            if (!coQuyen) throw new Exception("Bạn không có quyền xóa câu trả lời này");

            _hoiDapRepo.Delete(traLoi);
            await _hoiDapRepo.SaveAsync();
        }
        public async Task<PagedList<HoiDapDto>> GetDanhSachChoGiangVien(SearchHoiDapRequest request)
        {
            var userId = LayUserId();

            var coQuyen = await CoQuyenQnA(request.IdKhoaHoc, userId);
            if (!coQuyen) throw new Exception("Bạn không có quyền xem Q&A của khóa học này");

            var query = _hoiDapRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == request.IdKhoaHoc
                         && x.IdHoiDapCha == null
                         && !x.IsDeleted);

            if (request.IdBaiGiang.HasValue)
                query = query.Where(x => x.IdBaiGiang == request.IdBaiGiang);

            if (!string.IsNullOrWhiteSpace(request.Keyword))
                query = query.Where(x => x.NoiDung != null && x.NoiDung.Contains(request.Keyword));

            if (request.ChuaTraLoi == true)
                query = query.Where(x => !_hoiDapRepo.GetQueryable()
                    .Any(t => t.IdHoiDapCha == x.Id && !t.IsDeleted));

            if (request.ChuaDoc == true)
                query = query.Where(x => !_hoiDapRepo.GetQueryable()
                    .Any(t => t.IdHoiDapCha == x.Id && t.LaGiangVien && !t.IsDeleted));

            if (request.NhieuLike == true)
            {
                query = query.OrderByDescending(x =>
                    _hoiDapRepo.GetQueryable()
                        .Where(t => t.IdHoiDapCha == x.Id && !t.IsDeleted)
                        .Sum(t => t.SoLike));
            }
            else
            {
                query = query.OrderByDescending(x => x.DaGhim)
                             .ThenByDescending(x => x.NgayTao);
            }

            // ❌ ĐÃ XÓA: var baiGiangIds = ...; var baiGiangs = await ...ToListAsync();
            // ❌ ĐÃ XÓA: var nguoiHoiIds = ...; var users = await ...ToListAsync();
            // → thay bằng subquery trực tiếp bên dưới để EF dịch được sang SQL

            var dtoQuery = query.Select(x => new HoiDapDto
            {
                Id = x.Id,
                IdBaiGiang = x.IdBaiGiang,
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
                                   .Count(t => t.IdHoiDapCha == x.Id && !t.IsDeleted),
                TongLike = _hoiDapRepo.GetQueryable()
                                   .Where(t => t.IdHoiDapCha == x.Id && !t.IsDeleted)
                                   .Sum(t => t.SoLike),
                NguoiHoiId = x.IdNguoiDung,
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

            return await PagedList<HoiDapDto>.CreateAsync(dtoQuery, request);
        }

        public async Task GhimTopAnswer(Guid idTraLoi, bool ghim)
        {
            var userId = LayUserId();

            var traLoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idTraLoi && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu trả lời");

            if (!await CoQuyenQnA(traLoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền đánh dấu Top Answer");

            if (ghim)
            {
                // Bỏ ghim các top answer cũ trong cùng câu hỏi
                var topCu = await _hoiDapRepo.GetQueryable()
                    .Where(x => x.IdHoiDapCha == traLoi.IdHoiDapCha
                             && x.GhimTraLoi
                             && x.Id != idTraLoi
                             && !x.IsDeleted)
                    .ToListAsync();
                foreach (var t in topCu)
                {
                    t.GhimTraLoi = false;
                    _hoiDapRepo.Update(t);
                }
            }

            traLoi.GhimTraLoi = ghim;
            _hoiDapRepo.Update(traLoi);
            await _hoiDapRepo.SaveAsync();
        }

        private async Task<bool> CoQuyenQnA(Guid idKhoaHoc, Guid userId)
        {
            var gv = await _khoaHocGVRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.IdKhoaHoc == idKhoaHoc
                                       && x.IdGiangVien == userId
                                       && !x.IsDeleted);
            if (gv == null) return false;
            return gv.LaChuSoHuu || gv.QnA;
        }

        public async Task<AISuggestionDto> GoiYTraLoiAsync(Guid idCauHoi, Guid? idTraLoiDuocReply = null)
        {
            var userId = LayUserId();

            var cauHoi = await _hoiDapRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idCauHoi && x.IdHoiDapCha == null && !x.IsDeleted)
                ?? throw new Exception("Không tìm thấy câu hỏi");

            if (!await CoQuyenQnA(cauHoi.IdKhoaHoc!.Value, userId))
                throw new Exception("Bạn không có quyền dùng AI gợi ý cho câu hỏi này");

            var khoaHoc = await _khoaHocRepo.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == cauHoi.IdKhoaHoc && !x.IsDeleted);

            string? noiDungBaiGiang = cauHoi.IdBaiGiang.HasValue
            ? await _taiLieuService.LayNoiDungTaiLieuTheoBaiGiangAsync(cauHoi.IdBaiGiang.Value)
            : null;

            string? tieuDeBaiGiang = null;
            if (cauHoi.IdBaiGiang.HasValue)
            {
                tieuDeBaiGiang = await _baiGiangRepo.GetQueryable()
                    .Where(x => x.Id == cauHoi.IdBaiGiang && !x.IsDeleted)
                    .Select(x => x.TieuDe)
                    .FirstOrDefaultAsync();
            }

            // Dựng đúng 1 nhánh dẫn từ câu hỏi gốc tới điểm đang reply
            var luongHoiThoai = new List<string>();
            string? tenNguoiDangDuocReply = null;

            if (idTraLoiDuocReply.HasValue)
            {
                // Lấy toàn bộ trả lời của câu hỏi này 1 lần, dùng để truy vết trong bộ nhớ (tránh N query)
                var tatCaTraLoi = await _hoiDapRepo.GetQueryable()
                    .Where(x => x.IdHoiDapCha == idCauHoi && !x.IsDeleted)
                    .ToListAsync();

                var userIds = tatCaTraLoi
                    .Where(x => x.IdNguoiDung.HasValue)
                    .Select(x => x.IdNguoiDung!.Value)
                    .Distinct()
                    .ToList();
                var users = await _appUserService.GetQueryable()
                    .Where(x => userIds.Contains(x.Id))
                    .Select(x => new { x.Id, x.HoTen })
                    .ToListAsync();

                // Truy vết ngược từ điểm đang reply lên tới gốc, theo IdTraLoiDuocReply
                var nhanh = new List<HoiDap>();
                var current = tatCaTraLoi.FirstOrDefault(x => x.Id == idTraLoiDuocReply.Value)
                    ?? throw new Exception("Không tìm thấy câu trả lời cần phản hồi");

                tenNguoiDangDuocReply = users.FirstOrDefault(u => u.Id == current.IdNguoiDung)?.HoTen;

                while (current != null)
                {
                    nhanh.Insert(0, current); // chèn đầu để giữ thứ tự gốc -> ngọn
                    if (!current.IdTraLoiDuocReply.HasValue) break;
                    current = tatCaTraLoi.FirstOrDefault(x => x.Id == current.IdTraLoiDuocReply.Value);
                }

                luongHoiThoai = nhanh.Select(t =>
                {
                    var ten = users.FirstOrDefault(u => u.Id == t.IdNguoiDung)?.HoTen ?? "Ẩn danh";
                    var vaiTro = t.LaGiangVien ? "Giảng viên" : "Học viên";
                    return $"{ten} ({vaiTro}): {t.NoiDung}";
                }).ToList();
            }

            var qnaGanDay = await _hoiDapRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == cauHoi.IdKhoaHoc
                         && x.IdHoiDapCha == null
                         && x.Id != cauHoi.Id
                         && !x.IsDeleted)
                .OrderByDescending(x => x.NgayTao)
                .Take(3)
                .Select(x => x.NoiDung)
                .ToListAsync();

            var prompt = BuildPromptGoiYTraLoi(
                cauHoiNoiDung: cauHoi.NoiDung ?? "",
                tenKhoaHoc: khoaHoc?.TieuDe,
                moTaKhoaHoc: khoaHoc?.MoTa,
                noiDungBaiGiang: noiDungBaiGiang,
                tieuDeBaiGiang: tieuDeBaiGiang,
                luongHoiThoai: luongHoiThoai,
                tenNguoiDangDuocReply: tenNguoiDangDuocReply,
                cacCauHoiTruoc: qnaGanDay.Where(q => !string.IsNullOrWhiteSpace(q)).Select(q => q!).ToList());

            Console.WriteLine("===== PROMPT GỬI GEMINI =====");
            Console.WriteLine(prompt);

            var noiDungGoiY = await _geminiService.GoiYTraLoiCauHoiAsync(prompt);

            return new AISuggestionDto
            {
                NoiDungGoiY = noiDungGoiY,
                CoNoiDungBaiGiang = !string.IsNullOrWhiteSpace(noiDungBaiGiang)
            };
        }

        private string BuildPromptGoiYTraLoi(
            string cauHoiNoiDung,
            string? tenKhoaHoc,
            string? moTaKhoaHoc,
            string? tieuDeBaiGiang,
            string? noiDungBaiGiang,
            List<string> luongHoiThoai,
            string? tenNguoiDangDuocReply,
            List<string> cacCauHoiTruoc)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Bạn là trợ lý hỗ trợ giảng viên trả lời câu hỏi/bình luận của học viên trên nền tảng khóa học trực tuyến Eduverse.");
            sb.AppendLine("Hãy soạn MỘT câu trả lời nháp, ngắn gọn, đúng trọng tâm, giọng văn thân thiện và chuyên nghiệp như một giảng viên thật.");
            sb.AppendLine("Đây chỉ là bản nháp — giảng viên sẽ đọc và chỉnh sửa trước khi đăng, nên không cần rào trước đón sau.");
            sb.AppendLine();

            if (!string.IsNullOrWhiteSpace(tenKhoaHoc)) sb.AppendLine($"Khóa học: {tenKhoaHoc}");
            if (!string.IsNullOrWhiteSpace(moTaKhoaHoc)) sb.AppendLine($"Mô tả khóa học: {moTaKhoaHoc}");
            if (!string.IsNullOrWhiteSpace(tieuDeBaiGiang)) sb.AppendLine($"Bài giảng liên quan: {tieuDeBaiGiang}");

            if (!string.IsNullOrWhiteSpace(noiDungBaiGiang))   // ✅ thêm
            {
                sb.AppendLine();
                sb.AppendLine("Nội dung tài liệu bài giảng (dùng để trả lời bám sát bài học, không bịa nội dung ngoài phạm vi này):");
                sb.AppendLine(noiDungBaiGiang);
            }

            sb.AppendLine();
            sb.AppendLine($"Câu hỏi gốc của học viên: \"{cauHoiNoiDung}\"");

            if (luongHoiThoai.Any())
            {
                sb.AppendLine();
                sb.AppendLine("Diễn biến hội thoại tiếp theo, theo đúng thứ tự thời gian (chú ý các tiền tố @Tên cho biết ai đang nói với ai):");
                foreach (var dong in luongHoiThoai)
                    sb.AppendLine($"- {dong}");
            }

            if (!string.IsNullOrWhiteSpace(tenNguoiDangDuocReply))
            {
                sb.AppendLine();
                sb.AppendLine($"Bạn CẦN PHẢN HỒI TRỰC TIẾP vào ý kiến của {tenNguoiDangDuocReply} trong luồng trên, không phải trả lời lại câu hỏi gốc từ đầu.");
                sb.AppendLine("Nếu ý đó đã được người khác giải đáp đúng trong luồng, hãy bổ sung góc nhìn mới hoặc xác nhận thay vì lặp lại.");
            }

            if (cacCauHoiTruoc.Any())
            {
                sb.AppendLine();
                sb.AppendLine("Một vài câu hỏi khác gần đây trong khóa học này (chỉ để tham khảo ngữ cảnh, không cần trả lời):");
                foreach (var q in cacCauHoiTruoc) sb.AppendLine($"- {q}");
            }

            sb.AppendLine();
            sb.AppendLine("Chỉ trả về nội dung câu trả lời, không thêm tiêu đề hay giải thích gì khác.");
            return sb.ToString();
        }

        private async Task ThongBaoCauHoiMoi(HoiDap cauHoi, Guid nguoiHoiId)
        {
            var giangVienCoQuyen = await _khoaHocGVRepo.GetQueryable()
                .Where(x => x.IdKhoaHoc == cauHoi.IdKhoaHoc && !x.IsDeleted
                         && (x.LaChuSoHuu || x.QnA))
                .Select(x => x.IdGiangVien)
                .ToListAsync();

            if (!giangVienCoQuyen.Any()) return;

            var nguoiHoi = await _appUserService.GetQueryable()
                .Where(x => x.Id == nguoiHoiId)
                .Select(x => x.HoTen)
                .FirstOrDefaultAsync();

            foreach (var idGv in giangVienCoQuyen)
            {
                await _notificationPublisher.NotifyUserAsync(idGv, new NotificationPayload
                {
                    TieuDe = "Câu hỏi mới từ học viên",
                    NoiDung = $"{nguoiHoi ?? "Học viên"} vừa đặt câu hỏi mới trong khóa học của bạn.",
                    LoaiThongBao = "CauHoiMoi",
                    Link = $"/instructor/courses/{cauHoi.IdKhoaHoc}/qna?idCauHoi={cauHoi.Id}",   // ← cần bạn xác nhận route thật
                    FromUser = nguoiHoiId,
                    ItemId = cauHoi.Id,
                    ItemName = cauHoi.NoiDung
                });
            }
        }
    }
}
