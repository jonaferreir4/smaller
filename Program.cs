using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using smaller.Data;
using smaller.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

Env.Load();
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks();

// Swagger Generator with JWT Bearer and API Key Security Definitions
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Smaller SaaS API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "API Key authentication. Example: \"X-API-Key: sk_live_...\"",
        Name = "X-API-Key",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        },
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "ApiKey" }
            },
            Array.Empty<string>()
        }
    });
});

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

// JWT Authentication Setup
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "SuperSecretKeySmallerSaaSProduction2026!Key";
var keyBytes = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuer = true,
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "smaller-api",
        ValidateAudience = true,
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "smaller-client",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Services Registration
builder.Services.AddSingleton<RedisCacheService>();
builder.Services.AddSingleton<AccessLogQueue>();
builder.Services.AddSingleton<QrCodeService>();
builder.Services.AddHostedService<AccessLogProcessor>();
builder.Services.AddScoped<UrlShorteningService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ApiKeyService>();

// Rate Limiting Policy
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter(policyName: "shorten-policy", options =>
    {
        options.PermitLimit = 10; // Max 10 requests per minute
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 2;
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var maxRetries = 5;
    var delay = TimeSpan.FromSeconds(2);

    for (int retry = 1; retry <= maxRetries; retry++)
    {
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            context.Database.Migrate();
            logger.LogInformation("Migrações do banco de dados aplicadas com sucesso.");
            break;
        }
        catch (Exception ex)
        {
            if (retry == maxRetries)
            {
                logger.LogError(ex, "Ocorreu um erro definitivo ao aplicar as migrações após {MaxRetries} tentativas.", maxRetries);
            }
            else
            {
                logger.LogWarning("Tentativa {Retry}/{MaxRetries} de conexão com o banco de dados falhou. Tentando novamente em {Delay}s...", retry, maxRetries, delay.TotalSeconds);
                System.Threading.Thread.Sleep(delay);
            }
        }
    }
}

// OWASP Security Headers Middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

// Middleware de Autenticação por X-API-Key
app.Use(async (context, next) =>
{
    if (context.Request.Headers.TryGetValue("X-API-Key", out var apiKeyHeader) && !string.IsNullOrWhiteSpace(apiKeyHeader))
    {
        var apiKeyService = context.RequestServices.GetRequiredService<ApiKeyService>();
        var user = await apiKeyService.ValidateApiKeyAsync(apiKeyHeader.ToString());
        if (user != null)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("plan", user.Plan)
            };
            var identity = new ClaimsIdentity(claims, "ApiKey");
            context.User = new ClaimsPrincipal(identity);
        }
    }
    await next();
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/healthz");
app.MapControllers();

app.Run();
