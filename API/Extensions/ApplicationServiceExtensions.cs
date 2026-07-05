using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Interfaces;
using API.Services;
using API.Helpers;
using API.SignalR;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContext<DataContext>(options =>
            {
                options.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });

            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .WithOrigins("http://localhost:4200")
                        .AllowCredentials();
                });
            });

            services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly);

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ILikesRepository, LikesRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();
            services.AddScoped<LogUserActivity>();

            services.Configure<SupabaseSettings>(config.GetSection("Supabase"));
            services.AddScoped<IPhotoService, PhotoService>();

            services.AddSignalR();
            services.AddSingleton<PresenceTracker>();

            return services;
        }
    }
}
