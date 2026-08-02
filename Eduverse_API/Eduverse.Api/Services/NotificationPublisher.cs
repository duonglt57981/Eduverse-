using Eduverse.Api.Hubs;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using Eduverse.Service.ThongBaoService;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace Eduverse.Api.Services
{
    public sealed class NotificationPublisher : INotificationPublisher
    {
        private readonly IRepository<ThongBao> _repository;
        private readonly UserManager<AppUser> _userManager;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationPublisher(
            IRepository<ThongBao> repository,
            UserManager<AppUser> userManager,
            IHubContext<NotificationHub> hubContext)
        {
            _repository = repository;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        public Task NotifyUserAsync(Guid userId, NotificationPayload payload) =>
            NotifyUsersAsync(new[] { userId }, payload);

        public async Task NotifyUsersAsync(IEnumerable<Guid> userIds, NotificationPayload payload)
        {
            var recipients = userIds.Where(id => id != Guid.Empty).Distinct().ToList();
            if (recipients.Count == 0) return;

            var notifications = recipients.Select(userId => CreateNotification(userId, payload)).ToList();
            _repository.AddRange(notifications);
            await _repository.SaveAsync();

            await Task.WhenAll(notifications.Select(notification =>
                _hubContext.Clients
                    .Group(notification.IdNguoiDung!.Value.ToString())
                    .SendAsync("ReceiveNotification", notification)));
        }

        public async Task NotifyRoleAsync(
            string role,
            NotificationPayload payload,
            IEnumerable<Guid>? excludeUserIds = null)
        {
            var excluded = excludeUserIds?.ToHashSet() ?? new HashSet<Guid>();
            var users = await _userManager.GetUsersInRoleAsync(role);
            await NotifyUsersAsync(
                users.Where(user => !user.IsDeleted && !excluded.Contains(user.Id)).Select(user => user.Id),
                payload);
        }

        private static ThongBao CreateNotification(Guid userId, NotificationPayload payload)
        {
            var now = DateTime.Now;
            return new ThongBao
            {
                TieuDe = payload.TieuDe,
                NoiDung = payload.NoiDung,
                Message = payload.NoiDung,
                Type = payload.LoaiThongBao,
                LoaiThongBao = payload.LoaiThongBao,
                Link = payload.Link,
                FromUser = payload.FromUser,
                ToUser = userId,
                IdNguoiDung = userId,
                ItemId = payload.ItemId,
                ItemName = payload.ItemName,
                IsRead = false,
                DaDoc = false,
                IsDisplay = true,
                SendToFrontEndUser = true,
                TrangThai = "MoiNhan",
                ThoiGianTao = now,
                CreatedDate = now,
                UpdatedDate = now
            };
        }
    }
}
