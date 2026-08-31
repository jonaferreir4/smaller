using smaller.Models;
using smaller.utils;
using Microsoft.EntityFrameworkCore;

namespace smaller.Data;

public class ApplicationDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<ShortenedUrl> ShortenedUrls { get; set; }
    public DbSet<AccessLog> AccessLogs { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<ApiKey> ApiKeys { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShortenedUrl>(builder =>
        {
            builder.HasKey(s => s.Id);

            builder.Property(shortenedUrl => shortenedUrl.Code)
                .HasMaxLength(ShortLinkSettings.Length);

            builder.HasIndex(shortenedUrl => shortenedUrl.Code)
                .IsUnique();

            builder.HasMany(s => s.AccessLogs)
                .WithOne(a => a.ShortenedUrl)
                .HasForeignKey(a => a.ShortenedUrlId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.User)
                .WithMany(u => u.ShortenedUrls)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AccessLog>(builder =>
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.IpAdress)
                .IsRequired()
                .HasMaxLength(45);

            builder.Property(a => a.UserAgent)
                .HasMaxLength(512);

            builder.Property(a => a.Browser)
                .HasMaxLength(100);

            builder.Property(a => a.OperatingSystem)
                .HasMaxLength(100);

            builder.Property(a => a.DeviceType)
                .HasMaxLength(50);
        });

        modelBuilder.Entity<User>(builder =>
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(256);

            builder.HasIndex(u => u.Email)
                .IsUnique();

            builder.Property(u => u.PasswordHash)
                .IsRequired();

            builder.Property(u => u.Role)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.Plan)
                .IsRequired()
                .HasMaxLength(50);
        });

        modelBuilder.Entity<ApiKey>(builder =>
        {
            builder.HasKey(k => k.Id);

            builder.Property(k => k.KeyHash)
                .IsRequired()
                .HasMaxLength(128);

            builder.HasIndex(k => k.KeyHash)
                .IsUnique();

            builder.Property(k => k.KeyPrefix)
                .IsRequired()
                .HasMaxLength(16);

            builder.Property(k => k.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasOne(k => k.User)
                .WithMany(u => u.ApiKeys)
                .HasForeignKey(k => k.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}