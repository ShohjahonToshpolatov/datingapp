using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data
{
    public static class Seed
    {
        public static async Task SeedUsers(DataContext context)
        {
            if (await context.Users.AnyAsync()) return;

            var users = new List<AppUser>();
            var rng = new Random();

            for (int i = 0; i < 10; i++)
            {
                var username = $"user{rng.Next(1000, 9999)}";
                var password = "Pa$$w0rd";

                using var hmac = new HMACSHA512();
                var passwordBytes = Encoding.UTF8.GetBytes(password);

                var user = new AppUser
                {
                    UserName = username,
                    PasswordHash = hmac.ComputeHash(passwordBytes),
                    PasswordSalt = hmac.Key
                };

                users.Add(user);
            }

            context.Users.AddRange(users);
            await context.SaveChangesAsync();
        }
    }
}
