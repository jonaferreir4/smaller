using DotNetEnv;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace smaller.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        Env.Load();

        var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost"};" +
                               $"Port={Environment.GetEnvironmentVariable("DB_PORT") ?? "5432"};" +
                               $"Database={Environment.GetEnvironmentVariable("DB_NAME") ?? "smallerdb"};" +
                               $"Username={Environment.GetEnvironmentVariable("DB_USER") ?? "postgres"};" +
                               $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "12345"}";

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
