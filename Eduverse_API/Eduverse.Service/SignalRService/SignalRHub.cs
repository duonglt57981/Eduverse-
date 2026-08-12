using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Eduverse.Service.SignalRService
{
    [Authorize]
    public class SignalRHub : Hub
    {
        public async Task JoinCourseGroup(Guid courseId)
        {
            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"course_{courseId}"
            );
        }

        public async Task LeaveCourseGroup(Guid courseId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"course_{courseId}"
            );
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine(
                $"[SignalR] Connected: {Context.ConnectionId}, User: {Context.User?.Identity?.Name}"
            );

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine(
                $"[SignalR] Disconnected: {Context.ConnectionId}, Error: {exception?.Message}"
            );

            await base.OnDisconnectedAsync(exception);
        }
    }
}
