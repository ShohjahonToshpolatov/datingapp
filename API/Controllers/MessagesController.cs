using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MessagesController : BaseApiController
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;

        public MessagesController(IMessageRepository messageRepository, IUserRepository userRepository)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
        }

        [HttpPost]
        public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var username = User.GetUsername();

            if (username == createMessageDto.RecipientUsername)
                return BadRequest("You cannot send messages to yourself");

            var sender = await _userRepository.GetUserByUsernameAsync(username);
            var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUsername);

            if (sender == null || recipient == null || sender.UserName == null || recipient.UserName == null)
                return BadRequest("Cannot send message at this time");

            var message = new Message
            {
                SenderId = sender.Id,
                SenderUsername = sender.UserName,
                RecipientId = recipient.Id,
                RecipientUsername = recipient.UserName,
                Content = createMessageDto.Content
            };

            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync())
            {
                return Ok(new MessageDto
                {
                    Id = message.Id,
                    SenderId = message.SenderId,
                    SenderUsername = message.SenderUsername,
                    SenderPhotoUrl = sender.Photos?.FirstOrDefault(p => p.IsMain)?.Url,
                    RecipientId = message.RecipientId,
                    RecipientUsername = message.RecipientUsername,
                    RecipientPhotoUrl = recipient.Photos?.FirstOrDefault(p => p.IsMain)?.Url,
                    Content = message.Content,
                    MessageSent = message.MessageSent
                });
            }

            return BadRequest("Failed to send message");
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
        {
            messageParams.Username = User.GetUsername();

            var messages = await _messageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHead(new PaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages));

            return Ok(messages);
        }

        [HttpGet("thread/{username}")]
        public async Task<ActionResult> GetMessageThread(string username)
        {
            var currentUsername = User.GetUsername();
            if (currentUsername == null) return BadRequest();

            var thread = await _messageRepository.GetMessageThread(currentUsername, username);
            await _messageRepository.SaveAllAsync();

            return Ok(thread);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            var username = User.GetUsername();

            var message = await _messageRepository.GetMessage(id);
            if (message == null) return NotFound();

            if (message.SenderUsername != username && message.RecipientUsername != username)
                return Forbid();

            if (message.SenderUsername == username) message.SenderDeleted = true;
            if (message.RecipientUsername == username) message.RecipientDeleted = true;

            if (message.SenderDeleted && message.RecipientDeleted)
                _messageRepository.DeleteMessage(message);

            if (await _messageRepository.SaveAllAsync()) return Ok();

            return BadRequest("Problem deleting the message");
        }
    }
}
