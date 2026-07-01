using Eduverse.Api.Hubs;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using Eduverse.Service.Common;
using Eduverse.Service.Core.Mapper;
using Eduverse.Service.ThongBaoService;
using Eduverse.Service.ThongBaoService.Request;
using Hinet.Api.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Eduverse.Api.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ThongBaoController : ControllerBase
    {
        private readonly IRepository<ThongBao> _repo;
        private readonly IThongBaoService _thongBaoService;
        private readonly IMapper _mapper;
        private readonly ILogger<ThongBaoController> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ThongBaoController(
            IRepository<ThongBao> repo,
            IThongBaoService thongBaoService,
            IMapper mapper,
            ILogger<ThongBaoController> logger,
            IHubContext<NotificationHub> hubContext)
        {
            _repo = repo;
            _thongBaoService = thongBaoService;
            _mapper = mapper;
            _logger = logger;
            _hubContext = hubContext;
        }

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        private bool IsAdmin() => User.IsInRole("Admin");

        [HttpGet]
        public async Task<IActionResult> GetCuaToi()
        {
            var result = await _repo.GetQueryable()
                .Where(t => t.IdNguoiDung == GetUserId())
                .OrderByDescending(t => t.ThoiGianTao)
                .Take(50)
                .ToListAsync();
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpGet("list")]
        public async Task<DataResponse<PagedList<ThongBao>>> GetList([FromQuery] ThongBaoSearch search)
        {
            try
            {
                search ??= new ThongBaoSearch();
                var query = ApplySearch(_repo.GetQueryable(), search);
                if (!IsAdmin())
                {
                    var userId = GetUserId();
                    query = query.Where(t => t.IdNguoiDung == userId || t.ToUser == userId);
                }

                query = query.OrderByDescending(t => t.ThoiGianTao).ThenByDescending(t => t.CreatedDate);
                var result = await PagedList<ThongBao>.CreateAsync(query, search);
                return DataResponse<PagedList<ThongBao>>.Success(result, "Thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách thông báo");
                return DataResponse<PagedList<ThongBao>>.False("Đã xảy ra lỗi khi lấy dữ liệu.");
            }
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdmin()
        {
            var result = await _repo.GetQueryable()
                .Where(t => t.IdNguoiDung == null)
                .OrderByDescending(t => t.ThoiGianTao)
                .ToListAsync();
            return Ok(DataResponse.Success(result, "Thành công"));
        }

        [HttpGet("chua-doc")]
        public async Task<IActionResult> GetSoChuaDoc()
        {
            var count = await _repo.GetQueryable()
                .CountAsync(t => t.IdNguoiDung == GetUserId() && t.DaDoc == false);
            return Ok(DataResponse.Success(count, "Thành công"));
        }

        [HttpGet("chua-doc/danh-sach")]
        public async Task<DataResponse<List<ThongBao>>> GetDanhSachChuaDoc()
        {
            var userId = GetUserId();
            var result = await _repo.GetQueryable()
                .Where(t => t.IdNguoiDung == userId && t.DaDoc == false)
                .OrderByDescending(t => t.ThoiGianTao)
                .ToListAsync();
            return DataResponse<List<ThongBao>>.Success(result, "Thành công");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDetail(Guid id)
        {
            var entity = await _repo.GetQueryable().FirstOrDefaultAsync(t => t.Id == id);
            if (entity == null) return NotFound(DataResponse.False("Thông báo không tồn tại."));
            if (!CanAccess(entity)) return Forbid();
            return Ok(DataResponse.Success(entity, "Thành công"));
        }

        [HttpPost("Create")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<ThongBao>> Create([FromBody] ThongBaoRequest model)
        {
            try
            {
                var entity = _mapper.Map<ThongBaoRequest, ThongBao>(model);
                entity.Message = string.IsNullOrWhiteSpace(model.Message) ? "." : model.Message;
                entity.FromUser = ParseNullableGuid(model.FromUser);
                entity.ToUser = ParseNullableGuid(model.ToUser);
                entity.IdNguoiDung ??= entity.ToUser;
                entity.ItemName = string.IsNullOrWhiteSpace(model.ItemName) ? "." : model.ItemName;
                entity.IsRead = model.IsRead ?? false;
                entity.DaDoc = entity.IsRead;
                entity.NoiDung = string.IsNullOrWhiteSpace(entity.NoiDung) ? entity.Message : entity.NoiDung;
                entity.TieuDe = string.IsNullOrWhiteSpace(entity.TieuDe) ? entity.Type ?? "Thông báo" : entity.TieuDe;
                entity.ThoiGianTao ??= DateTime.Now;
                entity.NguoiTao ??= GetUserId();

                await _thongBaoService.CreateAsync(entity);
                await SendRealtimeNotification(entity);

                return new DataResponse<ThongBao>() { Data = entity, Status = true };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo thông báo");
                return new DataResponse<ThongBao>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi tạo dữ liệu."
                };
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<DataResponse<ThongBao>> Update(Guid id, [FromBody] ThongBaoRequest model)
        {
            try
            {
                var entity = await _repo.GetByIdAsync(id);
                if (entity == null || entity.IsDeleted) return DataResponse<ThongBao>.False("Thông báo không tồn tại.");

                UpdateEntity(entity, model);
                await _thongBaoService.UpdateAsync(entity);
                return DataResponse<ThongBao>.Success(entity, "Cập nhật thông báo thành công.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật thông báo");
                return DataResponse<ThongBao>.False("Đã xảy ra lỗi khi cập nhật dữ liệu.");
            }
        }

        [HttpPut("{id}/da-doc")]
        public async Task<IActionResult> DanhDauDaDoc(Guid id)
        {
            var tb = await _repo.GetByIdAsync(id);
            if (tb == null || tb.IsDeleted) return NotFound(DataResponse.False("Thông báo không tồn tại."));
            if (!CanAccess(tb)) return Forbid();

            tb.DaDoc = true;
            tb.IsRead = true;
            tb.ThoiGianDoc = DateTime.Now;
            tb.UpdatedDate = DateTime.Now;
            _repo.Update(tb);
            await _repo.SaveAsync();
            return Ok(DataResponse.Success(null, "Đã đọc"));
        }

        [HttpPut("doc-tat-ca")]
        public async Task<IActionResult> DocTatCa()
        {
            var userId = GetUserId();
            var list = await _repo.GetQueryableWithTracking()
                .Where(t => t.IdNguoiDung == userId && t.DaDoc == false)
                .ToListAsync();
            foreach (var tb in list)
            {
                tb.DaDoc = true;
                tb.IsRead = true;
                tb.ThoiGianDoc = DateTime.Now;
                tb.UpdatedDate = DateTime.Now;
                _repo.Update(tb);
            }
            await _repo.SaveAsync();
            return Ok(DataResponse.Success(null, "Đã đọc tất cả"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,GiaoVien")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _repo.GetByIdAsync(id);
            if (entity == null || entity.IsDeleted) return NotFound(DataResponse.False("Thông báo không tồn tại."));

            await _thongBaoService.DeleteAsync(entity);
            return Ok(DataResponse.Success(null, "Xóa thông báo thành công."));
        }

        private IQueryable<ThongBao> ApplySearch(IQueryable<ThongBao> query, ThongBaoSearch search)
        {
            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var keyword = search.Keyword.Trim().ToLower();
                query = query.Where(t =>
                    (t.TieuDe != null && t.TieuDe.ToLower().Contains(keyword)) ||
                    (t.NoiDung != null && t.NoiDung.ToLower().Contains(keyword)) ||
                    (t.Message != null && t.Message.ToLower().Contains(keyword)) ||
                    (t.ItemName != null && t.ItemName.ToLower().Contains(keyword)) ||
                    (t.ProductName != null && t.ProductName.ToLower().Contains(keyword)));
            }

            if (!string.IsNullOrWhiteSpace(search.LoaiThongBao)) query = query.Where(t => t.LoaiThongBao == search.LoaiThongBao);
            if (!string.IsNullOrWhiteSpace(search.Type)) query = query.Where(t => t.Type == search.Type);
            if (search.IdNguoiDung.HasValue) query = query.Where(t => t.IdNguoiDung == search.IdNguoiDung);
            if (search.FromUser.HasValue) query = query.Where(t => t.FromUser == search.FromUser);
            if (search.ToUser.HasValue) query = query.Where(t => t.ToUser == search.ToUser);
            if (search.IsRead.HasValue) query = query.Where(t => t.IsRead == search.IsRead || t.DaDoc == search.IsRead);
            if (search.IsDisplay.HasValue) query = query.Where(t => t.IsDisplay == search.IsDisplay);
            if (search.IsXuatBan.HasValue) query = query.Where(t => t.IsXuatBan == search.IsXuatBan);
            if (search.FromDate.HasValue) query = query.Where(t => t.ThoiGianTao >= search.FromDate.Value);
            if (search.ToDate.HasValue) query = query.Where(t => t.ThoiGianTao <= search.ToDate.Value);

            return query;
        }

        private void UpdateEntity(ThongBao entity, ThongBaoRequest model)
        {
            if (!string.IsNullOrWhiteSpace(model.Message)) entity.Message = model.Message;
            if (model.Link != null) entity.Link = model.Link;
            if (model.FromUser != null) entity.FromUser = ParseNullableGuid(model.FromUser);
            if (model.ToUser != null)
            {
                entity.ToUser = ParseNullableGuid(model.ToUser);
                entity.IdNguoiDung = entity.ToUser;
            }
            if (model.IsRead.HasValue)
            {
                entity.IsRead = model.IsRead.Value;
                entity.DaDoc = model.IsRead.Value;
                entity.ThoiGianDoc = model.IsRead.Value ? DateTime.Now : null;
            }

            if (model.Type != null) entity.Type = model.Type;
            if (model.SendToFrontEndUser.HasValue) entity.SendToFrontEndUser = model.SendToFrontEndUser;
            if (model.ItemId.HasValue) entity.ItemId = model.ItemId;
            if (model.ItemName != null) entity.ItemName = model.ItemName;
            if (model.ItemType.HasValue) entity.ItemType = model.ItemType;
            if (model.IsDisplay.HasValue) entity.IsDisplay = model.IsDisplay;
            if (model.DonViId.HasValue) entity.DonViId = model.DonViId;
            if (model.Email != null) entity.Email = model.Email;
            if (model.LoaiThongBao != null) entity.LoaiThongBao = model.LoaiThongBao;
            if (model.ProductId != null) entity.ProductId = model.ProductId;
            if (model.ProductName != null) entity.ProductName = model.ProductName;
            if (model.TieuDe != null) entity.TieuDe = model.TieuDe;
            if (model.NoiDung != null) entity.NoiDung = model.NoiDung;
            if (model.NguoiTao.HasValue) entity.NguoiTao = model.NguoiTao;
            if (model.FileDinhKem != null) entity.FileDinhKem = model.FileDinhKem;
            if (model.IsXuatBan.HasValue) entity.IsXuatBan = model.IsXuatBan;
            if (model.IdNguoiDung.HasValue) entity.IdNguoiDung = model.IdNguoiDung;
        }

        private bool CanAccess(ThongBao entity)
        {
            if (IsAdmin()) return true;
            var userId = GetUserId();
            return entity.IdNguoiDung == userId || entity.ToUser == userId;
        }

        private async Task SendRealtimeNotification(ThongBao entity)
        {
            if (entity.ToUser.HasValue)
            {
                await _hubContext.Clients.Group(entity.ToUser.Value.ToString()).SendAsync("ReceiveNotification", entity);
                return;
            }

            if (entity.IdNguoiDung.HasValue)
            {
                await _hubContext.Clients.Group(entity.IdNguoiDung.Value.ToString()).SendAsync("ReceiveNotification", entity);
                return;
            }

            await _hubContext.Clients.All.SendAsync("ReceiveNotification", entity);
        }

        private static Guid? ParseNullableGuid(string? value)
        {
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }
}
