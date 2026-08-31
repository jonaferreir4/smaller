---
name: smaller-architecture-guardrails
description: Proteção arquitetural e validação das regras de negócio centrais do encurtador de URLs Leave It Small (algoritmo Base62, limites de código, prevenção de loops e rastreamento de acessos).
---

# Guardrails Arquiteturais do `smaller`

Esta skill garante a preservação e integridade dos algoritmos críticos da aplicação.

---

## 1. Algoritmo de Encurtamento Base62

- **Alfabeto Estrito:** `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`
- **Tamanho Fixo:** 7 Caracteres (`ShortLinkSettings.Length`).
- **Geração Determinística com Unicidade:**
  - Gerar código aleatório de 7 caracteres.
  - Verificar existência via `await _context.ShortenedUrls.AnyAsync(x => x.Code == code)`.
  - Repetir até encontrar um código virgem.

---

## 2. Prevenção de Loops de Redirecionamento

- Ao receber a URL de destino em `POST /api/shorten`:
  ```csharp
  var domainName = Environment.GetEnvironmentVariable("DOMAIN_NAME");
  if (!string.IsNullOrEmpty(domainName) && originalUrl.Contains(domainName))
  {
      // Rejeitar requisição (HTTP 400)
  }
  ```

---

## 3. Registro Analítico de Acesso (`AccessLog`)

- Para todo acionamento do endpoint `GET /{code}`:
  - Incrementar `Click` da entidade `ShortenedUrl`.
  - Inserir um novo registro em `AccessLog` com:
    - `ShortenedUrlId`: FK da URL correspondente
    - `IpAdress`: IP remoto do cliente (limitado a 45 caracteres)
    - `UserAgent`: Header User-Agent (limitado a 512 caracteres)
    - `AccessDate`: `DateTime.UtcNow`
  - Retornar HTTP 302 Found com header `Location` apontando para `LongUrl`.
