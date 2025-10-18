using smaller.Models;
using smaller.utils;
using Microsoft.EntityFrameworkCore;

namespace smaller.Data;

public class ApplicationDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<ShortenedUrl> ShortenedUrls { get; set; }
    public DbSet<AccessLog> AccessLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ShortenedUrl>(builder =>
        {

            builder.HasKey(s => s.Id);

            builder
                .Property(shortenedUrl => shortenedUrl.Code)
                .HasMaxLength(ShortLinkSettings.Length);

            builder
                .HasIndex(ShortenedUrl => ShortenedUrl.Code)
                .IsUnique();

            builder.HasMany(s => s.AccessLogs)
            .WithOne(a => a.shortenedUrl)
            .HasForeignKey(a => a.ShortenedUrlId)
            .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<AccessLog>(builder =>
        {

            builder.HasKey(a => a.Id);

            builder.Property(a => a.IpAdress)
            .IsRequired()
            .HasMaxLength(45);

            builder.Property(a => a.UserAgent)
                .HasMaxLength(512);
        });
    }
}