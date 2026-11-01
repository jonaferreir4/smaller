---
name: smaller-create-endpoint
description: Guia e automação para criar novos endpoints RESTful no repositório smaller (ASP.NET Core .NET 8) respeitando a separação em camadas (Controllers, Services, DTOs, EF Core) e cobertura de testes.
---

# Criar Novo Endpoint no `smaller`

Esta skill define os padrões e a estrutura obrigatória para criar ou expandir endpoints RESTful no projeto **smaller**.

---

## 1. Fluxo de Criação por Camada

Para criar um novo endpoint, siga a sequência estrita abaixo:

```text
1. Http/Requests/      -> Criar DTO de entrada (record ou class com validações)
2. Http/Responses/     -> Criar DTO de saída
3. Services/           -> Adicionar método no service de domínio (ou novo Service)
4. Program.cs          -> Registrar no container de DI se for um novo Service
5. Controllers/        -> Adicionar action na Controller com atributos Swagger/HTTP
6. Tests/              -> Criar teste unitário cobrindo o método do service
```

---

## 2. Padrões de Código por Camada

### 2.1 Request & Response DTOs (`Http/Requests/` e `Http/Responses/`)

Usar `records` ou classes com propriedades imutáveis para tipagem estrita da API.

```csharp
namespace smaller.Http.Requests;

public record CreateCustomLinkRequest(
    string Url,
    string? CustomCode
);
```

```csharp
namespace smaller.Http.Responses;

public record ShortenedUrlResponse(
    string ShortUrl,
    string OriginalUrl,
    int Clicks,
    string CreatedOnUtc
);
```

---

## 2.2 Service Layer (`Services/`)

- Regras de negócio puras.
- Utilizar métodos assíncronos do EF Core.
- **NUNCA** acessar `HttpContext` diretamente dentro do Service se não for estritamente necessário (passar apenas os dados extraídos pelo Controller, ex: IP e User-Agent).

```csharp
namespace smaller.Services;

public class CustomLinkService
{
    private readonly ApplicationDbContext _context;

    public CustomLinkService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ShortenedUrl?> GetByCodeAsync(string code)
    {
        return await _context.ShortenedUrls
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Code == code);
    }
}
```

---

## 2.3 Controller Layer (`Controllers/`)

- Injeção do service no construtor.
- Annotations de rotas e Swagger (`[HttpGet]`, `[HttpPost]`, `[ProducesResponseType]`).
- Extração de IP e User-Agent para passar aos services quando necessário.

```csharp
[ApiController]
[Route("api/[controller]")]
public class CustomLinkController : ControllerBase
{
    private readonly CustomLinkService _service;

    public CustomLinkController(CustomLinkService service)
    {
        _service = service;
    }

    [HttpGet("{code}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string code)
    {
        var result = await _service.GetByCodeAsync(code);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
```

---

## 3. Registro no Container de DI (`Program.cs`)

Ao criar um novo Service:

```csharp
builder.Services.AddScoped<CustomLinkService>();
```

---

## 4. Testes Unitários

Criar teste unitário validando os cenários de sucesso, erro de validação e item não encontrado.
