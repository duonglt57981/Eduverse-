using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;

namespace Eduverse.Api.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        //public async Task JoinUserGroup(string userId)
        //{
        //    await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        //    Console.WriteLine($"User {userId} đã join Group {userId}");
        //}

        public NotificationHub()
        {
            Console.WriteLine("🔥 NotificationHub CREATED");
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
                Console.WriteLine($"User {userId} joined group {userId}");
            }

            await base.OnConnectedAsync();
        }
    }
}
