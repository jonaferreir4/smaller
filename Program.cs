using smaller.Data;
using smaller.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

Env.Load();
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost"};" +
                       $"Port={Environment.GetEnvironmentVariable("DB_PORT") ?? "5432"};" +
                       $"Database={Environment.GetEnvironmentVariable("DB_NAME") ?? "smallerdb"};" +
                       $"Username={Environment.GetEnvironmentVariable("DB_USER") ?? "postgres"};" +
                       $"Password={Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "12345"}";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Redis Cache Configuration
var redisHost = Environment.GetEnvironmentVariable("REDIS_HOST") ?? "localhost";
var redisPort = Environment.GetEnvironmentVariable("REDIS_PORT") ?? "6379";

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = $"{redisHost}:{redisPort}";
    options.InstanceName = "smaller:";
});

// Services Registration
builder.Services.AddSingleton<RedisCacheService>();
builder.Services.AddSingleton<AccessLogQueue>();
builder.Services.AddHostedService<AccessLogProcessor>();
builder.Services.AddScoped<UrlShorteningService>();

// Rate Limiting Policy
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter(policyName: "shorten-policy", options =>
    {
        options.PermitLimit = 30; // Max 30 link creation requests per minute
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 5;
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocorreu um erro ao aplicar as migrações.");
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();

app.Run();
