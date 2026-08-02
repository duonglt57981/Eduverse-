namespace Eduverse.Service.ThongBaoService
{
    public sealed class NotificationPayload
    {
        public required string TieuDe { get; init; }
        public required string NoiDung { get; init; }
        public required string LoaiThongBao { get; init; }
        public string? Link { get; init; }
        public Guid? FromUser { get; init; }
        public Guid? ItemId { get; init; }
        public string? ItemName { get; init; }
    }

    public interface INotificationPublisher
    {
        Task NotifyUserAsync(Guid userId, NotificationPayload payload);
        Task NotifyUsersAsync(IEnumerable<Guid> userIds, NotificationPayload payload);
        Task NotifyRoleAsync(string role, NotificationPayload payload, IEnumerable<Guid>? excludeUserIds = null);
    }
}
