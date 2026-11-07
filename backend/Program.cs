using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using smaller.Data;
using smaller.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

Env.Load();
var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// Forwarded Headers Configuration (crucial behind Traefik/reverse proxy)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

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

var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
if (string.IsNullOrWhiteSpace(dbPassword))
{
    if (builder.Environment.IsProduction())
    {
        throw new InvalidOperationException("DB_PASSWORD environment variable is required in production.");
    }
    dbPassword = "12345";
}

var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost"};" +
                       $"Port={Environment.GetEnvironmentVariable("DB_PORT") ?? "5432"};" +
                       $"Database={Environment.GetEnvironmentVariable("DB_NAME") ?? "smallerdb"};" +
                       $"Username={Environment.GetEnvironmentVariable("DB_USER") ?? "postgres"};" +
                       $"Password={dbPassword}";

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
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? builder.Configuration["JWT_SECRET"];

if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
{
    if (builder.Environment.IsDevelopment())
    {
        jwtSecret = "DevSecretKeySmallerSaaS_MustBeAtLeast32BytesLong!";
    }
    else
    {
        throw new InvalidOperationException("JWT_SECRET environment variable is required and must be at least 32 bytes (256 bits) long in production.");
    }
}

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

// Rate Limiting Policy: Particionado por IP para evitar DoS global
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("shorten-policy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 15,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 2
            }));

    options.AddPolicy("auth-policy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.AddPolicy("redirect-policy", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5
            }));
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
                throw new InvalidOperationException($"Ocorreu um erro definitivo ao aplicar as migrações após {maxRetries} tentativas.", ex);
            }
            else
            {
                logger.LogWarning("Tentativa {Retry}/{MaxRetries} de conexão com o banco de dados falhou. Tentando novamente em {Delay}s...", retry, maxRetries, delay.TotalSeconds);
                System.Threading.Thread.Sleep(delay);
            }
        }
    }
}

app.UseForwardedHeaders();

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

var enableSwagger = app.Environment.IsDevelopment() || 
    string.Equals(Environment.GetEnvironmentVariable("ENABLE_SWAGGER"), "true", StringComparison.OrdinalIgnoreCase);

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/healthz");
app.MapControllers();

app.Run();
