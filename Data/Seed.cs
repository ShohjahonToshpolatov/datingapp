using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data
{
    public static class Seed
    {
        public static async Task SeedUsers(DataContext context)
        {
            // Barcha mavjud userlarni o'chirish
            var allUsers = await context.Users.ToListAsync();
            if (allUsers.Any())
            {
                context.Users.RemoveRange(allUsers);
                await context.SaveChangesAsync();
            }

            // Yangi user yaratish
            var password = "testuser";
            var username = "testuser1";

            using var hmac = new HMACSHA512();
            var user = new AppUser
            {
                UserName = username,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                PasswordSalt = hmac.Key
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();
        }
    }
}
