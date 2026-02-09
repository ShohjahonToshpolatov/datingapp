using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Supabase;
using System;
using System.IO;
using System.Threading.Tasks;

namespace API.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly SupabaseSettings _settings;

        public PhotoService(IOptions<SupabaseSettings> options)
        {
            _settings = options.Value;

            if (string.IsNullOrWhiteSpace(_settings.Url))
                throw new Exception("Supabase:Url missing in appsettings.json");

            if (string.IsNullOrWhiteSpace(_settings.ServiceRoleKey))
                throw new Exception("Supabase:ServiceRoleKey missing in appsettings.json");

            if (string.IsNullOrWhiteSpace(_settings.Bucket))
                _settings.Bucket = "photos";
        }

        private async Task<Client> CreateClient()
        {
            var client = new Client(_settings.Url, _settings.ServiceRoleKey);
            await client.InitializeAsync();
            return client;
        }

        public async Task<PhotoUploadResult> AddPhotoAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File is empty");

            var client = await CreateClient();

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext)) ext = ".jpg";

            var fileName = $"{Guid.NewGuid():N}{ext}";
            folder = (folder ?? "").Trim().Trim('/');
            var path = string.IsNullOrEmpty(folder) ? fileName : $"{folder}/{fileName}";

            // bytes
            await using var stream = file.OpenReadStream();
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms);
            var bytes = ms.ToArray();

            // ✅ Upload (Supabase.Storage) — ko‘p versiyalarda shunaqa:
            await client.Storage
                .From(_settings.Bucket)
                .Upload(bytes, path); // optionssiz sinab ko‘ring

            var publicUrl = client.Storage
                .From(_settings.Bucket)
                .GetPublicUrl(path);

            return new PhotoUploadResult { Url = publicUrl, Path = path };
        }

        public async Task<bool> DeletePhotoAsync(string path)
        {
            if (string.IsNullOrWhiteSpace(path)) return false;

            var client = await CreateClient();

            await client.Storage
                .From(_settings.Bucket)
                .Remove(new List<string> { path });

            return true;
        }
    }
}
