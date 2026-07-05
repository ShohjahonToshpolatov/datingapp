using System;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly PresenceTracker _tracker;

        public MessageHub(IMessageRepository messageRepository, IUserRepository userRepository,
            IHubContext<PresenceHub> presenceHub, PresenceTracker tracker)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _presenceHub = presenceHub;
            _tracker = tracker;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext?.Request.Query["user"].ToString();
            var currentUsername = Context.User?.GetUsername();

            if (string.IsNullOrEmpty(otherUser) || currentUsername == null) throw new HubException("Cannot join group");

            var groupName = GetGroupName(currentUsername, otherUser);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);

            var messages = await _messageRepository.GetMessageThread(currentUsername, otherUser);
            await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var group = await RemoveFromMessageGroup();
            if (group != null)
                await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(CreateMessageDto createMessageDto)
        {
            var username = Context.User?.GetUsername();
            if (username == null || username == createMessageDto.RecipientUsername)
                throw new HubException("You cannot send messages to yourself");

            var sender = await _userRepository.GetUserByUsernameAsync(username);
            var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

            if (sender?.UserName == null || recipient?.UserName == null)
                throw new HubException("Cannot send message at this time");

            var message = new Message
            {
                SenderId = sender.Id,
                SenderUsername = sender.UserName,
                RecipientId = recipient.Id,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            var groupName = GetGroupName(sender.UserName, recipient.UserName);
            var group = await _messageRepository.GetMessageGroup(groupName);

            if (group != null && group.Connections.Any(c => c.Username == recipient.UserName))
            {
                message.DateRead = DateTime.UtcNow;
            }
            else
            {
                var onlineUsers = await _tracker.GetOnlineUsers();
                if (onlineUsers.Contains(recipient.UserName))
                {
                    await _presenceHub.Clients.User(recipient.Id.ToString()).SendAsync("NewMessageReceived",
                        new { username = sender.UserName, knownAs = sender.KnownAs });
                }
            }

            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync())
            {
                await Clients.Group(groupName).SendAsync("NewMessage", new MessageDto
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    SenderUsername = message.SenderUsername,
                    SenderPhotoUrl = sender.Photos?.FirstOrDefault(p => p.IsMain)?.Url,
                    RecipientId = message.RecipientId,
                    RecipientUsername = message.RecipientUsername,
                    RecipientPhotoUrl = recipient.Photos?.FirstOrDefault(p => p.IsMain)?.Url,
                    Content = message.Content,
                    DateRead = message.DateRead,
                    MessageSent = message.MessageSent
                });
            }
        }

        private async Task<Group> AddToGroup(string groupName)
        {
            var username = Context.User?.GetUsername() ?? throw new HubException("Cannot get username");

            var group = await _messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(Context.ConnectionId, username);

            if (group == null)
            {
                group = new Group(groupName);
                _messageRepository.AddGroup(group);
            }

            group.Connections.Add(connection);

            if (await _messageRepository.SaveAllAsync()) return group;

            throw new HubException("Failed to join group");
        }

        private async Task<Group?> RemoveFromMessageGroup()
        {
            var group = await _messageRepository.GetGroupForConnection(Context.ConnectionId);
            var connection = group?.Connections.FirstOrDefault(c => c.ConnectionId == Context.ConnectionId);

            if (connection != null && group != null)
            {
                _messageRepository.RemoveConnection(connection);
                if (await _messageRepository.SaveAllAsync()) return group;
            }

            throw new HubException("Failed to remove from group");
        }

        private static string GetGroupName(string caller, string? other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
    }
}
