using System.Security.Cryptography;
using System.Text;
using API.Entities;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(DataContext context)
        {
            if (context.Users.Any()) return;

            var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            var users = System.Text.Json.JsonSerializer.Deserialize<List<AppUser>>(userData);

            if (users is null) return;

            foreach (var user in users)
            {
                using var hmac = new HMACSHA512();

                user.UserName = user.UserName.ToLower();
                user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
                user.PasswordSalt = hmac.Key;

                context.Users.Add(user);
            }

            await context.SaveChangesAsync();
        }
    }
}
