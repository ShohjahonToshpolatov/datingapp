using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options) { }

        public DbSet<AppUser> Users { get; set; }

        public DbSet<UserLike> Likes { get; set; }

        public DbSet<Message> Messages { get; set; }

        public DbSet<Group> Groups { get; set; }

        public DbSet<Connection> Connections { get; set; }

        public DbSet<AppRole> Roles { get; set; }

        public DbSet<AppUserRole> UserRoles { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<UserLike>()
                .HasKey(k => new { k.SourceUserId, k.TargetUserId });

            builder.Entity<UserLike>()
                .HasOne(s => s.SourceUser)
                .WithMany(l => l.LikedUsers)
                .HasForeignKey(s => s.SourceUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserLike>()
                .HasOne(s => s.TargetUser)
                .WithMany(l => l.LikedByUsers)
                .HasForeignKey(s => s.TargetUserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Message>()
                .HasOne(m => m.Recipient)
                .WithMany()
                .HasForeignKey(m => m.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Connection>()
                .HasKey(c => c.ConnectionId);

            builder.Entity<Group>()
                .HasKey(g => g.Name);

            builder.Entity<Group>()
                .HasMany(g => g.Connections)
                .WithOne();

            builder.Entity<AppUserRole>()
                .HasKey(ur => new { ur.AppUserId, ur.AppRoleId });

            builder.Entity<AppUserRole>()
                .HasOne(ur => ur.AppUser)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.AppUserId)
                .IsRequired();

            builder.Entity<AppUserRole>()
                .HasOne(ur => ur.AppRole)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.AppRoleId)
                .IsRequired();
        }
    }
}