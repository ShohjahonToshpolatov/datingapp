using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace API.Interfaces
{
    public interface IPhotoService
    {
        Task<PhotoUploadResult> AddPhotoAsync(IFormFile file, string folder);
        Task<bool> DeletePhotoAsync(string path);
    }

    public class PhotoUploadResult
    {
        public string Url { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
    }
}
