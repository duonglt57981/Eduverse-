using CloudinaryDotNet.Actions;
using Eduverse.Model.Entities;
using Eduverse.Repository.BaiGiangRepository;
using Eduverse.Repository.BaiKiemTraRepository;
using Eduverse.Repository.DanhMuc_KhoaHocRepository;
using Eduverse.Repository.DanhMucRepository;
using Eduverse.Repository.KhoaHocRepository;
using Eduverse.Repository.LichSuKiemDuyetKhoaHocRepository;
using Eduverse.Repository.PhanRepository;
using Eduverse.Repository.TaiLieuRepository;
using Eduverse.Service.BaiGiangService;
using Eduverse.Service.BaiGiangService.Dto;
using Eduverse.Service.Common;
using Eduverse.Service.DanhMuc_KhoaHocService;
using Eduverse.Service.GeminiService;
using Eduverse.Service.KhoaHocService;
using Eduverse.Service.KhoaHocService.Dto;
using Eduverse.Service.KhoaHocService.Request;
using Eduverse.Service.LanLamBaiKiemTraService;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Exceptions;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Request;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate;
using Eduverse.Service.LichSuKiemDuyetKhoaHocService.Validate.YourNamespace.KiemDuyet;
using Eduverse.Service.PhanService;
using Eduverse.Service.PhanService.Dto;
using Eduverse.Service.TaiLieuService;
using Eduverse.Service.TaiLieuService.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService
{
    public static class ClaimsPrincipalExtensions
    {
        public static string GetDisplayName(this ClaimsPrincipal user)
        {
            if (user == null) return "Unknown User";

            var givenName = user.FindFirstValue(ClaimTypes.GivenName);
            var surname = user.FindFirstValue(ClaimTypes.Surname);
            var name = user.FindFirstValue(ClaimTypes.Name);
            var email = user.FindFirstValue(ClaimTypes.Email);

            // Ưu tiên: GivenName + Surname
            if (!string.IsNullOrEmpty(givenName) && !string.IsNullOrEmpty(surname))
                return $"{givenName} {surname}";

            // Fallback 1: Name
            if (!string.IsNullOrEmpty(name))
                return name;

            // Fallback 2: Email
            if (!string.IsNullOrEmpty(email))
                return email;

            return "Unknown User";
        }

        public static string GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user?.FindFirstValue(ClaimTypes.NameIdentifier);
            return userIdClaim ?? string.Empty;
        }

        public static Guid GetUserIdGuid(this ClaimsPrincipal user)
        {
            var userIdClaim = user?.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdClaim, out var userId))
                return userId;

            return Guid.Empty;
        }

        public static string GetUserRole(this ClaimsPrincipal user)
        {
            return user?.FindFirstValue(ClaimTypes.Role) ?? "Unknown";
        }

        public static bool IsAdmin(this ClaimsPrincipal user)
        {
            return user?.FindFirstValue(ClaimTypes.Role) == "Admin";
        }

        public static bool IsAuthenticated(this ClaimsPrincipal user)
        {
            return user?.Identity?.IsAuthenticated == true;
        }
    }

    public class LichSuKiemDuyetKhoaHocService : Service<Model.Entities.LichSuKiemDuyetKhoaHoc>, ILichSuKiemDuyetKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;
        private readonly IKhoaHocService _khoaHocService;
        private readonly IPhanRepository _phanRepository;
        private readonly IPhanService _phanService;
        private readonly IBaiGiangRepository _baiGiangRepository;
        private readonly ITaiLieuRepository _taiLieuRepository;
        private readonly IBaiKiemTraRepository _kiemTraRepository;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private readonly IBaiGiangService _baiGiangService;
        private readonly ITaiLieuService _taiLieuService;
        private readonly IDanhMuc_KhoaHocRepository _danhMuc_KhoaHocRepository;
        private readonly IDanhMucRepository _danhMucRepository;
        private readonly IDanhMuc_KhoaHocService _danhMuc_KhoaHocService;


        private readonly IGeminiService _geminiService;
        private readonly ILogger<LichSuKiemDuyetKhoaHocService> _logger;

        ////Tu cam co ban(kiem tra nhanh truoc khi goi AI)
        //public static readonly HashSet<string> _tuCam = new(){
    
        //    // 1. Thô tục, chửi thề
        //    "cac", "cặc", "lon", "lồn", "dit", "địt", "vai", "vãi",
        //    "dm", "đm", "ml", "cc", "deo", "đéo", "vcl", "vãi lồn",
        //    "loz", "lồz", "cmm", "dit me", "địt mẹ", "ngu", "ngu dốt",
        //    "dien", "điên", "khung", "khùng", "dai", "dại", "cho", "chó",
        //    "cho deo", "đồ con", "con cac", "con cặc", "me may", "mẹ mày",
        //    "du", "đu", "du ma", "đụ má", "thang", "thằng", "thang cho", "thằng chó",
        //    "vo van", "vô văn", "do con", "đồ con", "con me may", "con mẹ mày",
    
        //    // 2. Bạo lực, vũ khí
        //    "giet", "giết", "chem", "chém", "danh", "đánh", "ban", "bắn",
        //    "dap", "đập", "tan cong", "tấn công", "bao luc", "bạo lực",
        //    "vu khi", "vũ khí", "sung", "súng", "dao", "bom", "lua", "lửa",
        //    "sat hai", "sát hại", "hanh hung", "hành hung", "tra tan", "tra tấn",
        //    "dau dap", "đầu đập", "xa hoi den", "xã hội đen", "gay", "gậy",
        //    "cuop", "cướp", "cuop giat", "cướp giật", "choi", "chơi",
        //    "danh nhau", "đánh nhau", "bao hanh", "bạo hành",
    
        //    // 3. Chính trị nhạy cảm
        //    "lat do", "lật đổ", "bieu tinh", "biểu tình", "dao chinh", "đảo chính",
        //    "cach mang", "cách mạng", "khung bo", "khủng bố", "phan dong", "phản động",
        //    "noi loan", "nổi loạn", "xam luoc", "xâm lược", "doan di", "đoàn di",
        //    "diet chung", "diệt chủng", "tan sat", "tàn sát", "bo may", "bộ máy",
        //    "chong doi", "chống đối", "chong pha", "chống phá", "lien minh", "liên minh",
        //    "phe phai", "phe phái", "do thai", "đồ tể", "dân chủ", "dan chu",
    
        //    // 4. Kỳ thị, phân biệt
        //    "phan biet", "phân biệt", "ky thi", "kỳ thị", "chung toc", "chủng tộc",
        //    "dan toc", "dân tộc", "ton giao", "tôn giáo", "xuat than", "xuất thân",
        //    "gia cap", "gia cấp", "ngheo", "nghèo", "nguoi den", "người đen",
        //    "nguoi trang", "người trắng", "hoi giao", "hồi giáo", "phat giao", "phật giáo",
        //    "thieu so", "thiểu số", "da so", "đa số",
    
        //    // 5. Ma túy, chất cấm
        //    "ma tuy", "ma túy", "can sa", "cần sa", "thuoc lac", "thuốc lắc",
        //    "thuoc phien", "thuốc phiện", "heroin", "cocaine", "meth",
        //    "am phet", "amphet", "chat gay nghien", "chất gây nghiện",
        //    "chat kich thich", "chất kích thích", "xach", "sách",
    
        //    // 6. Khiêu dâm, 18+
        //    "sex", "lam tinh", "làm tình", "quan he", "quan hệ",
        //    "du dam", "dụ dỗ", "khiêu dam", "khiêu dâm", "dong tinh", "đồng tính",
        //    "nguoi lon", "người lớn", "phim cap ba", "phim cấp ba",
        //    "anh nong", "ảnh nóng", "truyen cap ba", "truyện cấp ba",
        //    "ga", "gái", "danh nhau", "đánh nhau", "giai tri", "giải trí",
        //    "nong", "nóng", "khoa than", "khỏa thân", "truy cap", "truy cập",
    
        //    // 7. Lừa đảo, gian lận
        //    "lua dao", "lừa đảo", "gian lan", "gian lận", "man tra", "mán trá",
        //    "do tru", "đồ trụ", "trom cap", "trộm cắp", "luoc do", "lược đồ",
        //    "xam hoi", "xâm hội", "choi bai", "chơi bài", "da ban", "đá ban",
    
        //    // 8. Quấy rối, bắt nạt
        //    "quay roi", "quấy rối", "bat nat", "bắt nạt", "doa", "đe dọa",
        //    "de doa", "đe dọa", "cat nhat", "cắt nhật", "u hiep", "ủy hiếp",
        //    "dien gay", "điên gây", "ham doa", "hăm dọa", "khung bo", "khủng bố",
    
        //    // 9. Từ ngữ nhạy cảm khác
        //    "xoi", "xối", "no", "nổ", "dau", "đau", "che", "chê",
        //    "noi xau", "nói xấu", "nhuoc ma", "nhục mạ", "si nhi", "sỉ nhục",
        //    "xuc pham", "xúc phạm", "miệt thị", "coi thuong", "coi thường",
        //    "khinh thuong", "khinh thường", "khinh bi", "khinh bỉ",
    
    
        //    // ========== TIẾNG ANH ==========
    
        //    // 1. Profanity (Thô tục)
        //    "fuck", "fucking", "motherfucker", "shit", "bullshit",
        //    "bitch", "bastard", "damn", "hell", "ass", "asshole",
        //    "dick", "pussy", "cunt", "whore", "slut", "porn",
        //    "cock", "suck", "sucks", "piss", "pissed", "pissing",
    
        //    // 2. Violence (Bạo lực)
        //    "kill", "killing", "murder", "slaughter", "execute",
        //    "assassinate", "violence", "abuse", "assault", "attack",
        //    "assail", "strike", "weapon", "gun", "knife", "bomb",
        //    "explosion", "grenade", "shoot", "shooting", "stab",
        //    "strangle", "torture", "rape", "molest", "terror",
        //    "terrorism", "terrorist", "jihad", "extremist", "radical",
        //    "war", "battle", "conflict", "invasion", "occupation",
        //    "coup", "rebellion", "revolution", "overthrow", "uprising",
        //    "riot", "protest", "sedition", "mutiny", "genocide",
        //    "massacre", "slay", "behead", "crucify", "lynch",
        //    "violent", "brutal", "savage", "bloody", "bloodshed",
        //    "mass murder", "serial killer", "homicide", "manslaughter",
    
        //    // 3. Hate Speech (Kỳ thị)
        //    "hate", "hatred", "racist", "racism", "sexist", "sexism",
        //    "discrimination", "segregation", "supremacy", "white power",
        //    "nazi", "fascist", "fascism", "holocaust", "xenophobia",
        //    "homophobic", "transphobic", "bigot", "bigotry", "prejudice",
        //    "stereotype", "racial", "ethnic", "minority", "majority",
        //    "black power", "white supremacy", "hate crime",
    
        //    // 4. Politics (Chính trị)
        //    "dictator", "dictatorship", "tyranny", "oppression",
        //    "communist", "propaganda", "sabotage", "espionage",
        //    "subversion", "insurrection", "secession", "rebel",
        //    "anarchist", "anarchy", "civil war", "guerrilla",
        //    "insurgency", "militant", "jihadist", "extremism",
    
        //    // 5. Drugs (Ma túy)
        //    "drug", "narcotic", "opium", "morphine", "ecstasy",
        //    "cocaine", "heroin", "meth", "amphetamine", "cannabis",
        //    "marijuana", "weed", "pot", "hashish", "LSD", "acid",
        //    "addict", "addiction", "overdose", "dealer", "trafficking",
    
        //    // 6. Porn/Adult (Khiêu dâm)
        //    "porn", "porno", "xxx", "nude", "naked", "sex",
        //    "hentai", "incest", "bestiality", "pedophile", "pedophilia",
        //    "prostitute", "prostitution", "strip", "stripper",
        //    "erotic", "erotica", "obscene", "obscenity",
    
        //    // 7. Bullying/Abuse (Bắt nạt)
        //    "bully", "bullying", "harass", "harassment",
        //    "intimidate", "menace", "threat", "threaten",
        //    "coerce", "coercion", "humiliate", "degrade",
        //    "torture", "abusive", "cruel", "inhumane",
    
        //    // 8. Spam/Scam (Lừa đảo)
        //    "scam", "fraud", "phishing", "spam", "malware",
        //    "virus", "hack", "hacker", "blackmail", "extortion",
        //    "phishing", "scamming", "defraud", "deception",
    
        //    // 9. Other
        //    "stupid", "idiot", "moron", "retard", "retarded",
        //    "loser", "gay", "queer", "dyke", "faggot",
        //    "crap", "dumb", "dummy", "fool", "foolish"
        //};

        public LichSuKiemDuyetKhoaHocService(
            ILichSuKiemDuyetKhoaHocRepository repository,
            ILanLamBaiKiemTraService lanLamBaiKiemTraService,
            IKhoaHocRepository khoaHocRepository,
            IPhanRepository phanRepository,
            IBaiGiangRepository baiGiangRepository,
            IBaiGiangService baiGiangService,
            ITaiLieuRepository taiLieuRepository,
            IBaiKiemTraRepository kiemTraRepository,
            IKhoaHocService khoaHocService,
            ITaiLieuService taiLieuService,
            IDanhMuc_KhoaHocRepository danhMuc_KhoaHocRepository,
            IDanhMucRepository _danhMucRepository,
            IDanhMuc_KhoaHocService danhMuc_KhoaHocService,
            IGeminiService geminiService,
            ILogger<LichSuKiemDuyetKhoaHocService> logger,
            IHttpContextAccessor? httpContextAccessor = null) : base(repository)
        {
            _khoaHocRepository = khoaHocRepository;
            _phanRepository = phanRepository;
            _baiGiangRepository = baiGiangRepository;
            _taiLieuRepository = taiLieuRepository;
            _kiemTraRepository = kiemTraRepository;
            _khoaHocService = khoaHocService;
            this._httpContextAccessor = httpContextAccessor;
            _baiGiangService = baiGiangService;
            _taiLieuService = taiLieuService;
            _danhMuc_KhoaHocRepository = danhMuc_KhoaHocRepository;
            _danhMuc_KhoaHocService = danhMuc_KhoaHocService;
            _geminiService = geminiService;
            _logger = logger;
        }

        #region GetListKhoaHocKiemDuyet
        /// <summary>
        /// Danh sách khóa học đang chờ duyệt (ChoDuyet).
        /// Chỉ trả về bản clone mới nhất, KHÔNG trả về bản gốc đang HoatDong.
        /// </summary>
        public async Task<PagedList<GetListKiemDuyetDto>> GetListKhoaHocKiemDuyet(KhoaHocKiemDuyetSearchDto search)
        {
            search ??= new KhoaHocKiemDuyetSearchDto();

            // Chỉ lấy bản đang chờ duyệt (bản clone mới hoặc khóa học tạo mới lần đầu)
            var query = _khoaHocRepository.GetQueryable()
                .AsNoTracking()
                .Where(kh => !kh.IsDeleted && kh.TrangThaiPheDuyet == "ChoDuyet");

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim();
                query = query.Where(x =>
                    (x.TieuDe ?? "").Contains(keyword) ||
                    (x.LoaiKhoaHoc ?? "").Contains(keyword));
            }

            var ordered = query.OrderBy(x => x.CreatedDate);

            var totalCount = await ordered.CountAsync();

            var pageData = await ordered
                .Skip((search.PageIndex - 1) * search.PageSize)
                .Take(search.PageSize)
                .Select(kh => new GetListKiemDuyetDto
                {
                    Id = kh.Id,
                    TieuDe = kh.TieuDe,
                    MoTa = kh.MoTa,
                    LoaiKhoaHoc = kh.LoaiKhoaHoc,
                    HinhAnhKhoaHoc = kh.HinhAnhKhoaHoc,
                    CapDo = kh.CapDo,
                    Gia = kh.Gia,
                    GiaGoc = kh.GiaGoc,
                    TrangThai = kh.TrangThai,
                    TrangThaiPheDuyet = kh.TrangThaiPheDuyet,
                    IdBanGhiTruoc = kh.IdBanGhiTruoc,   // null = tạo mới, có giá trị = update
                })
                .ToListAsync();

            if (!pageData.Any())
                return new PagedList<GetListKiemDuyetDto>(new List<GetListKiemDuyetDto>(),
                    search.PageIndex, search.PageSize, totalCount);

            var khoaHocIds = pageData.Select(x => x.Id).ToList();

            // 3 dictionary thống kê — chỉ tính cho trang hiện tại
            var tongBaiGiangDict = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !ph.IsDeleted && !bg.IsDeleted
                group bg by ph.IdKhoaHoc.Value into g
                select new { IdKhoaHoc = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Count);

            var tongTaiLieuDict = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join bg in _baiGiangRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals bg.IdPhan
                join tl in _taiLieuRepository.GetQueryable().AsNoTracking()
                    on bg.Id equals tl.IdBaiGiang
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !ph.IsDeleted && !bg.IsDeleted && !tl.IsDeleted
                group tl by ph.IdKhoaHoc.Value into g
                select new { IdKhoaHoc = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Count);

            var tongQizzDict = await (
                from ph in _phanRepository.GetQueryable().AsNoTracking()
                join kt in _kiemTraRepository.GetQueryable().AsNoTracking()
                    on ph.Id equals kt.IdPhan
                where ph.IdKhoaHoc.HasValue
                      && khoaHocIds.Contains(ph.IdKhoaHoc.Value)
                      && !ph.IsDeleted && !kt.IsDeleted
                group kt by ph.IdKhoaHoc.Value into g
                select new { IdKhoaHoc = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.IdKhoaHoc, x => x.Count);

            foreach (var item in pageData)
            {
                item.TongBaiGiang = tongBaiGiangDict.GetValueOrDefault(item.Id, 0);
                item.TongTaiLieu = tongTaiLieuDict.GetValueOrDefault(item.Id, 0);
                item.TongQizz = tongQizzDict.GetValueOrDefault(item.Id, 0);
            }

            return new PagedList<GetListKiemDuyetDto>(pageData, search.PageIndex, search.PageSize, totalCount);
        }
        #endregion


        #region KiemDuyetKhoaHoc
        public async Task<KiemDuyetKhoaHocDto> KiemDuyetKhoaHoc(KiemDuyetKhoaHocRequest request)
        {
            // ── Kiểm tra quyền ──────────────────────────────────
            var role = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (role != "Admin")
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền kiểm duyệt khóa học.");

            if (request.TrangThaiPheDuyet != "DaDuyet" && request.TrangThaiPheDuyet != "TuChoi")
                throw new Exception("Trạng thái phê duyệt không hợp lệ.");

            if (request.TrangThaiPheDuyet == "TuChoi" && string.IsNullOrWhiteSpace(request.LyDo))
                throw new Exception("Phải nhập lý do khi từ chối khóa học.");

            var khoaHocNhap = await _khoaHocService.GetByIdOrThrowAsync(request.IdKhoaHoc);

            if (khoaHocNhap.TrangThaiPheDuyet != "ChoDuyet" && khoaHocNhap.TrangThaiPheDuyet != "DangDuyet")
                throw new Exception("Khóa học không ở trạng thái chờ duyệt.");

            Guid.TryParse(
                _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
                out var idNguoiDuyet);
            var ngayDuyet = DateTime.Now;

            // ── TuChoi ──────────────────────────────────────────
            if (request.TrangThaiPheDuyet == "TuChoi")
            {
                khoaHocNhap.TrangThaiPheDuyet = "TuChoi";

                if (khoaHocNhap.IdBanGhiTruoc.HasValue)
                {
                    await _khoaHocService.DeleteAsync(khoaHocNhap);
                }

                await _khoaHocService.UpdateAsync(khoaHocNhap);
                await _khoaHocService.SaveAsync();
            }
            // ── DaDuyet ─────────────────────────────────────────
            else
            {
                var phanIds = await _phanService.GetQueryable()
                    .Where(x => x.IdKhoaHoc == khoaHocNhap.Id && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                var baiGiangIds = await _baiGiangService.GetQueryable()
                    .Where(x => phanIds.Contains(x.IdPhan) && !x.IsDeleted)
                    .Select(x => x.Id)
                    .ToListAsync();

                // ── Lần đầu duyệt (tạo mới, không có bản gốc) ──
                if (!khoaHocNhap.IdBanGhiTruoc.HasValue)
                {
                    khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
                    khoaHocNhap.TrangThai = "HoatDong";
                    khoaHocNhap.IsBanHienTai = true;

                    await _phanService.GetQueryable()
                        .Where(x => phanIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    await _baiGiangService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    await _taiLieuService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));
                }
                // ── Duyệt bản nháp (GV đã update, có bản gốc) ──
                else
                {
                    var idBanGoc = khoaHocNhap.IdBanGhiTruoc.Value;

                    var banGoc = await _khoaHocService.GetByIdOrThrowAsync(idBanGoc);

                    // ① Copy field từ bản nháp → bản gốc (giữ Id gốc để FK DangKy không vỡ)
                    banGoc.TieuDe = khoaHocNhap.TieuDe;
                    banGoc.MoTa = khoaHocNhap.MoTa;
                    banGoc.HinhAnhKhoaHoc = khoaHocNhap.HinhAnhKhoaHoc;
                    banGoc.IdHinhAnhKhoaHoc = khoaHocNhap.IdHinhAnhKhoaHoc;
                    banGoc.Gia = khoaHocNhap.Gia;
                    banGoc.GiaGoc = khoaHocNhap.GiaGoc;
                    banGoc.CapDo = khoaHocNhap.CapDo;
                    banGoc.LoaiKhoaHoc = khoaHocNhap.LoaiKhoaHoc;
                    banGoc.TrangThaiPheDuyet = "DaDuyet";
                    banGoc.TrangThai = "HoatDong";
                    banGoc.IsBanHienTai = true;
                    banGoc.UpdatedDate = DateTime.UtcNow;

                    // ⭐ ② Copy danh mục từ bản nháp sang bản gốc
                    await CopyDanhMucFromNhapToGoc(khoaHocNhap.Id, idBanGoc);

                    // ③ Lấy phan/baigiang gốc để soft-delete
                    var phanGocIds = await _phanService.GetQueryable()
                        .Where(x => x.IdKhoaHoc == idBanGoc && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    var baiGiangGocIds = await _baiGiangService.GetQueryable()
                        .Where(x => phanGocIds.Contains(x.IdPhan) && !x.IsDeleted)
                        .Select(x => x.Id)
                        .ToListAsync();

                    // ④ Soft-delete tailieu → baigiang → phan gốc
                    await _taiLieuService.GetQueryable()
                        .Where(x => baiGiangGocIds.Contains(x.IdBaiGiang))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));

                    await _baiGiangService.GetQueryable()
                        .Where(x => baiGiangGocIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));

                    await _phanService.GetQueryable()
                        .Where(x => phanGocIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IsDeleted, true)
                            .SetProperty(p => p.DeletedDate, DateTime.Now));

                    // ⑤ Chuyển phan/baigiang nháp sang IdKhoaHoc gốc + activate
                    await _phanService.GetQueryable()
                        .Where(x => phanIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x
                            .SetProperty(p => p.IdKhoaHoc, idBanGoc)
                            .SetProperty(p => p.TrangThai, "HoatDong"));

                    await _baiGiangService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.Id))
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    await _taiLieuService.GetQueryable()
                        .Where(x => baiGiangIds.Contains(x.IdBaiGiang) && !x.IsDeleted)
                        .ExecuteUpdateAsync(x => x.SetProperty(p => p.TrangThai, "HoatDong"));

                    // ⑥ Reset bản nháp (giữ lại, tái sử dụng lần sau)
                    khoaHocNhap.TrangThaiPheDuyet = "DaDuyet";
                    khoaHocNhap.TrangThai = "Nhap";
                    khoaHocNhap.IsBanHienTai = false;
                    khoaHocNhap.UpdatedDate = DateTime.UtcNow;

                    await _khoaHocService.UpdateAsync(banGoc);
                    await _khoaHocService.UpdateAsync(khoaHocNhap);
                }

                await _khoaHocService.SaveAsync();
            }

            // ── Ghi lịch sử ─────────────────────────────────────
            var lichSu = new LichSuKiemDuyetKhoaHoc
            {
                Id = Guid.NewGuid(),
                IdKhoaHoc = request.IdKhoaHoc,
                IdNguoiDuyet = idNguoiDuyet,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                LyDo = request.LyDo,
                NgayDuyet = ngayDuyet
            };

            await CreateAsync(lichSu);
            await SaveAsync();

            return new KiemDuyetKhoaHocDto
            {
                IdKhoaHoc = khoaHocNhap.IdBanGhiTruoc ?? khoaHocNhap.Id,
                TrangThaiPheDuyet = request.TrangThaiPheDuyet,
                NgayDuyet = ngayDuyet
            };
        }

        // ── Helper copy danh mục từ bản nháp sang bản gốc ──
        private async Task CopyDanhMucFromNhapToGoc(Guid idKhoaHocNhap, Guid idKhoaHocGoc)
        {
            // ① Lấy danh mục của bản nháp (chưa bị xóa)
            var danhMucNhap = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHocNhap && !x.IsDeleted)
                .ToListAsync();

            // ② Lấy danh mục hiện tại của bản gốc
            var danhMucGoc = await _danhMuc_KhoaHocService.GetQueryable()
                .Where(x => x.IdKhoaHoc == idKhoaHocGoc && !x.IsDeleted)
                .ToListAsync();

            var danhMucGocIds = danhMucGoc.Select(x => x.IdDanhMuc).ToHashSet();
            var danhMucNhapIds = danhMucNhap.Select(x => x.IdDanhMuc).ToHashSet();

            // ③ Xóa những danh mục của bản gốc không có trong bản nháp
            var canXoa = danhMucGoc
                .Where(x => !danhMucNhapIds.Contains(x.IdDanhMuc))
                .ToList();

            if (canXoa.Any())
            {
                await _danhMuc_KhoaHocService.DeleteAsync(canXoa);
                await _danhMuc_KhoaHocService.SaveAsync();
            }

            // ④ Thêm những danh mục của bản nháp chưa có trong bản gốc
            var canThem = danhMucNhapIds
                .Where(id => !danhMucGocIds.Contains(id))
                .Select(id => new DanhMuc_KhoaHoc
                {
                    Id = Guid.NewGuid(),
                    IdKhoaHoc = idKhoaHocGoc,
                    IdDanhMuc = id
                }).ToList();

            if (canThem.Any())
            {
                await _danhMuc_KhoaHocService.CreateRange(canThem);
                await _danhMuc_KhoaHocService.SaveAsync();
            }
        }
        #endregion


        public async Task<List<LichSuKiemDuyetDto>> GetLichSuKiemDuyet(Guid idKhoaHoc)
        {
            return await GetQueryable()
                .AsNoTracking()
                .Where(x => x.IdKhoaHoc == idKhoaHoc && !x.IsDeleted)
                .OrderByDescending(x => x.NgayDuyet)
                .Select(x => new LichSuKiemDuyetDto
                {
                    Id = x.Id,
                    IdKhoaHoc = x.IdKhoaHoc,
                    IdNguoiDuyet = x.IdNguoiDuyet,
                    TrangThaiPheDuyet = x.TrangThaiPheDuyet,
                    LyDo = x.LyDo,
                    NgayDuyet = x.NgayDuyet
                })
                .ToListAsync();
        }


        public async Task KiemTraVaNemExceptionAsync(string noiDung)
        {
            if (string.IsNullOrWhiteSpace(noiDung)) return;

            //// 1. Kiem tra tu cam co ban
            var listtucam = TuCams._tuCam;
            var tuTimThay = listtucam.Where(t => noiDung.ToLower().Contains(t)).ToList();
            if (tuTimThay.Any())
            {
                throw new KiemDuyetException(
                    $"Noi dung chua tu ngu nhay cam: {string.Join(", ", tuTimThay)}", 
                    "TuCamCoBan",
                    tuTimThay,
                    "Vui long loai bo cac tu ngu khong phu hop"
                );
            }

            // 2. Kiem tra bang Gemini
            var ketQua = await _geminiService.KiemTraAsync(noiDung);

            if (!ketQua.HopLe)
            {
                throw new KiemDuyetException(
                    ketQua.ThongBao ?? "Noi dung vi pham",
                    ketQua.Loai ?? "ViPham",
                    ketQua.TuViPham ?? new List<string>(),
                    ketQua.GoiYSua
                );
            }
        }
    }
}
