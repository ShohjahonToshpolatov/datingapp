using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class PresenceTracker
    {
        private static readonly Dictionary<string, List<string>> OnlineUsers = new();

        public Task<bool> UserConnected(string username, string connectionId)
        {
            var isOnline = false;

            lock (OnlineUsers)
            {
                if (OnlineUsers.TryGetValue(username, out var connections))
                {
                    connections.Add(connectionId);
                }
                else
                {
                    OnlineUsers[username] = new List<string> { connectionId };
                    isOnline = true;
                }
            }

            return Task.FromResult(isOnline);
        }

        public Task<bool> UserDisconnected(string username, string connectionId)
        {
            var isOffline = false;

            lock (OnlineUsers)
            {
                if (!OnlineUsers.TryGetValue(username, out var connections)) return Task.FromResult(isOffline);

                connections.Remove(connectionId);

                if (connections.Count == 0)
                {
                    OnlineUsers.Remove(username);
                    isOffline = true;
                }
            }

            return Task.FromResult(isOffline);
        }

        public Task<string[]> GetOnlineUsers()
        {
            string[] onlineUsers;

            lock (OnlineUsers)
            {
                onlineUsers = OnlineUsers.OrderBy(k => k.Key).Select(k => k.Key).ToArray();
            }

            return Task.FromResult(onlineUsers);
        }
    }
}
