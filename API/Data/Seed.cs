using System.Security.Cryptography;
using System.Text;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(DataContext context)
        {
            await SeedRoles(context);
            await SeedMembers(context);
            await SeedAdmin(context);
        }

        private static async Task SeedRoles(DataContext context)
        {
            if (await context.Roles.AnyAsync()) return;

            var roles = new List<AppRole>
            {
                new() { Name = "Member" },
                new() { Name = "Moderator" },
                new() { Name = "Admin" }
            };

            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();
        }

        private static async Task SeedMembers(DataContext context)
        {
            if (await context.Users.AnyAsync()) return;

            var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            var users = System.Text.Json.JsonSerializer.Deserialize<List<AppUser>>(userData);

            if (users is null) return;

            var memberRole = await context.Roles.SingleAsync(r => r.Name == "Member");

            foreach (var user in users)
            {
                using var hmac = new HMACSHA512();

                user.UserName = user.UserName!.ToLower();
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
                user.PasswordSalt = hmac.Key;

                foreach (var photo in user.Photos ?? [])
                {
                    photo.IsApproved = true;
                }

                user.UserRoles.Add(new AppUserRole { AppRole = memberRole });

                context.Users.Add(user);
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedAdmin(DataContext context)
        {
            if (await context.Users.AnyAsync(u => u.UserName == "admin")) return;

            using var hmac = new HMACSHA512();

            var admin = new AppUser
            {
                UserName = "admin",
                KnownAs = "Admin",
                Gender = "male",
                DateOfBirth = new DateTime(1990, 1, 1),
                City = "Tashkent",
                Country = "Uzbekistan",
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd")),
                PasswordSalt = hmac.Key
            };

            var roles = await context.Roles.Where(r => r.Name == "Admin" || r.Name == "Moderator").ToListAsync();
            foreach (var role in roles)
            {
                admin.UserRoles.Add(new AppUserRole { AppRole = role });
            }

            context.Users.Add(admin);
            await context.SaveChangesAsync();
        }
    }
}
