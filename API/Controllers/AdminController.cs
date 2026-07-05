using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AdminController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly IPhotoService _photoService;

        public AdminController(DataContext context, IPhotoService photoService)
        {
            _context = context;
            _photoService = photoService;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users-with-roles")]
        public async Task<ActionResult<IEnumerable<UserWithRolesDto>>> GetUsersWithRoles()
        {
            var users = await _context.Users
                .OrderBy(u => u.UserName)
                .Select(u => new UserWithRolesDto
                {
                    Id = u.Id,
                    Username = u.UserName!,
                    Roles = u.UserRoles.Select(r => r.AppRole.Name).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("edit-roles/{username}")]
        public async Task<ActionResult<IEnumerable<string>>> EditRoles(string username, [FromQuery] string roles)
        {
            var selectedRoles = roles.Split(',').Where(r => !string.IsNullOrWhiteSpace(r)).ToArray();

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(r => r.AppRole)
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null) return NotFound("Could not find user");

            var allRoles = await _context.Roles.ToListAsync();

            var currentRoleNames = user.UserRoles.Select(r => r.AppRole.Name).ToArray();

            var rolesToAdd = allRoles.Where(r => selectedRoles.Contains(r.Name) && !currentRoleNames.Contains(r.Name));
            foreach (var role in rolesToAdd)
            {
                user.UserRoles.Add(new AppUserRole { AppUserId = user.Id, AppRoleId = role.Id });
            }

            var rolesToRemove = user.UserRoles.Where(ur => !selectedRoles.Contains(ur.AppRole.Name)).ToList();
            foreach (var userRole in rolesToRemove)
            {
                user.UserRoles.Remove(userRole);
            }

            if (await _context.SaveChangesAsync() >= 0)
                return Ok(await _context.Entry(user).Collection(u => u.UserRoles).Query()
                    .Select(ur => ur.AppRole.Name).ToListAsync());

            return BadRequest("Failed to update roles");
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photos-to-moderate")]
        public async Task<ActionResult<IEnumerable<PhotoForApprovalDto>>> GetPhotosForModeration()
        {
            var photos = await _context.Users
                .SelectMany(u => u.Photos!.Where(p => !p.IsApproved), (u, p) => new PhotoForApprovalDto
                {
                    Id = p.Id,
                    Url = p.Url,
                    IsApproved = p.IsApproved,
                    AppUserId = u.Id,
                    Username = u.UserName!
                })
                .ToListAsync();

            return Ok(photos);
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("approve-photo/{photoId}")]
        public async Task<ActionResult> ApprovePhoto(int photoId)
        {
            var photo = await _context.Set<Photo>().FindAsync(photoId);
            if (photo == null) return NotFound();

            photo.IsApproved = true;

            var user = await _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Photos!.Any(p => p.Id == photoId));
            if (user != null && !user.Photos!.Any(p => p.IsMain))
            {
                photo.IsMain = true;
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPost("reject-photo/{photoId}")]
        public async Task<ActionResult> RejectPhoto(int photoId)
        {
            var photo = await _context.Set<Photo>().FindAsync(photoId);
            if (photo == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(photo.PublicId))
            {
                await _photoService.DeletePhotoAsync(photo.PublicId);
            }

            _context.Set<Photo>().Remove(photo);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
