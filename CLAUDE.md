# CLAUDE.md — Guia Rápido do Desenvolvedor & IA (Smaller)

> Guia rápido com comandos essenciais, visão geral da arquitetura e diretrizes para desenvolvimento na API **Smaller (`smaller`)**.

---

## 🚀 Comandos Rápidos

```bash
# Executar a aplicação localmente
dotnet run

# Compilar o projeto sem executar
dotnet build

# Executar a suíte de testes
dotnet test

# Criar nova migração do Entity Framework Core
dotnet ef migrations add <NomeDaMigracao>

# Aplicar migrações no banco de dados local
dotnet ef database update

# Subir infraestrutura completa via Docker Compose (PostgreSQL + Traefik)
docker compose up -d

# Visualizar logs dos containers Docker
docker compose logs -f
```

---

## 🏗 Arquitetura do Sistema

O projeto adota uma arquitetura em camadas com separação clara de responsabilidades:

1. **`Controllers/`**: Endpoints HTTP (`UrlShortenerController`, `DiagnosticsController`). Responsáveis por validar entradas de rede e retornar respostas HTTP.
2. **`Services/`**: Regras de negócio puras (`UrlShorteningService`). Geração de código Base62, controle de cliques e registro de logs.
3. **`Data/`**: Contexto do Entity Framework Core (`ApplicationDbContext`). Mapeamento via Fluent API e migrações.
4. **`Models/`**: Entidades de domínio relacionais (`ShortenedUrl`, `AccessLog`).
5. **`Http/`**: Objeto de Transferência de Dados (DTOs) segregados em `Requests/` (ex: `ShortenUrlRequest.cs`) e `Responses/` (ex: `ShortenedUrlResponse.cs`).
6. **`utils/`**: Utilitários e configurações estáticas (`ShortLinkSettings.cs`).

---

## 📊 Resumo do Modelo de Dados & Algoritmo

- **Base62 Encoding:** Alfabeto de 62 caracteres (`A-Z`, `a-z`, `0-9`). Tamanho fixo de 7 caracteres (3,52 trilhões de combinações).
- **Entidade `ShortenedUrl`:** `Id` (Guid), `LongUrl`, `ShortUrl`, `Code` (Único, Índice O(1)), `Click`, `CreatedOnUtc`.
- **Entidade `AccessLog`:** `Id` (Guid), `ShortenedUrlId` (FK), `IpAdress` (max 45 chars), `UserAgent` (max 512 chars), `AccessDate`.
- **Exclusão em Cascata:** Deletar uma URL encurtada exclui automaticamente seus logs de acesso.

---

## ⚠️ Regras Invioláveis (Resumo)

- **Nunca** colocar regras de negócio diretamente dentro de `Controllers/`.
- **Nunca** alterar o algoritmo de encurtamento de 7 caracteres sem alinhamento prévio.
- **Sempre** utilizar chamadas assíncronas com EF Core (`ToListAsync`, `FirstOrDefaultAsync`, etc.).
- **Sempre** usar `.AsNoTracking()` para consultas de leitura.
- Para a lista completa de diretivas, consulte o arquivo [AGENTS.md](file:///home/jona/Área%20de%20trabalho/smaller/AGENTS.md).
