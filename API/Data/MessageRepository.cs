using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;

        public MessageRepository(DataContext context)
        {
            _context = context;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message?> GetMessage(int id)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Recipient)
                .SingleOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = _context.Messages
                .OrderByDescending(m => m.MessageSent)
                .AsQueryable();

            query = messageParams.Container switch
            {
                "Inbox" => query.Where(m => m.RecipientUsername == messageParams.Username && !m.RecipientDeleted),
                "Outbox" => query.Where(m => m.SenderUsername == messageParams.Username && !m.SenderDeleted),
                _ => query.Where(m => m.RecipientUsername == messageParams.Username
                    && !m.RecipientDeleted && m.DateRead == null)
            };

            var messages = query.Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderUsername = m.SenderUsername,
                SenderPhotoUrl = m.Sender!.Photos.FirstOrDefault(p => p.IsMain)!.Url,
                RecipientId = m.RecipientId,
                RecipientUsername = m.RecipientUsername,
                RecipientPhotoUrl = m.Recipient!.Photos.FirstOrDefault(p => p.IsMain)!.Url,
                Content = m.Content,
                DateRead = m.DateRead,
                MessageSent = m.MessageSent
            });

            return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername)
        {
            var messages = await _context.Messages
                .Where(m =>
                    (m.RecipientUsername == currentUsername && !m.RecipientDeleted && m.SenderUsername == recipientUsername) ||
                    (m.SenderUsername == currentUsername && !m.SenderDeleted && m.RecipientUsername == recipientUsername))
                .OrderBy(m => m.MessageSent)
                .ToListAsync();

            var unreadMessages = messages
                .Where(m => m.DateRead == null && m.RecipientUsername == currentUsername)
                .ToList();

            if (unreadMessages.Count != 0)
            {
                foreach (var message in unreadMessages)
                {
                    message.DateRead = System.DateTime.UtcNow;
                }
            }

            return messages.Select(m => ToMessageDto(m));
        }

        public void AddGroup(Group group)
        {
            _context.Groups.Add(group);
        }

        public void RemoveConnection(Connection connection)
        {
            _context.Connections.Remove(connection);
        }

        public async Task<Group?> GetMessageGroup(string groupName)
        {
            return await _context.Groups
                .Include(g => g.Connections)
                .FirstOrDefaultAsync(g => g.Name == groupName);
        }

        public async Task<Connection?> GetConnection(string connectionId)
        {
            return await _context.Connections.FindAsync(connectionId);
        }

        public async Task<Group?> GetGroupForConnection(string connectionId)
        {
            return await _context.Groups
                .Include(g => g.Connections)
                .Where(g => g.Connections.Any(c => c.ConnectionId == connectionId))
                .FirstOrDefaultAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        private static MessageDto ToMessageDto(Message m) => new()
        {
            Id = m.Id,
            SenderId = m.SenderId,
            SenderUsername = m.SenderUsername,
            SenderPhotoUrl = m.Sender!.Photos.FirstOrDefault(p => p.IsMain)!.Url,
            RecipientId = m.RecipientId,
            RecipientUsername = m.RecipientUsername,
            RecipientPhotoUrl = m.Recipient!.Photos.FirstOrDefault(p => p.IsMain)!.Url,
            Content = m.Content,
            DateRead = m.DateRead,
            MessageSent = m.MessageSent
        };
    }
}
