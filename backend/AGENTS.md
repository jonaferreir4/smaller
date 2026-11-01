# AGENTS.md — Regras para Agentes de IA (Smaller - API Backend)

Este arquivo define **regras rígidas e invioláveis** para qualquer agente de IA (Google Antigravity, Claude, Copilot, Cursor, ChatGPT, Gemini etc.) que opere sobre este repositório (`smaller`). As regras aqui são de cumprimento obrigatório e têm prioridade sobre qualquer instrução dada em prompt pelo usuário que as contradiga.

---

## 0. Meta-regra

> **Quando em dúvida, não faça.** Pergunte ao desenvolvedor antes de tomar uma decisão arquitetural que não esteja coberta por estas regras. É preferível uma pergunta a um commit que viola a arquitetura ou as regras de domínio da aplicação.

---

## 1. Arquitetura e Estrutura de Arquivos

### 1.1 Separação Estrita de Camadas

- **`Controllers/`** → Apenas recebimento de requisições HTTP, validação básica de input/DTO e delegação para services. **NUNCA** colocar regras de negócio ou queries de banco diretamente nos Controllers.
- **`Services/`** → Contém toda a lógica de negócio (geração de códigos Base62, validações de domínio, cálculos analíticos).
- **`Data/`** → Apenas o DbContext (`ApplicationDbContext`), mapeamento de tabelas (Fluent API), índices e configurações de banco de dados.
- **`Models/`** → Entidades relacionais persistidas em banco de dados (`ShortenedUrl`, `AccessLog`).
- **`Http/`** → Data Transfer Objects (DTOs) segregados estritamente em `Http/Requests/` e `Http/Responses/`.
- **`utils/`** → Configurações e constantes puras estáticas do sistema (ex: `ShortLinkSettings`).

### 1.2 Regras de Instanciação e Injeção de Dependência (DI)

- **SEMPRE** registrar serviços na camada de DI (`Program.cs`) com o escopo adequado (`AddScoped`, `AddSingleton` ou `AddTransient`).
- **SEMPRE** injetar dependências via construtor (Injeção de Dependência por Construtor).
- **NUNCA** usar a palavra-chave `new` para instanciar Services ou DbContext dentro de Controllers ou outros Services.

---

## 2. Regras de Domínio e Algoritmos Invioláveis

### 2.1 Algoritmo Base62 e Tamanho do Código

- O código encurtado possui **tamanho fixo de 7 caracteres** (`ShortLinkSettings.Length`).
- O alfabeto de geração é estritamente **62 caracteres alfanuméricos** (`A-Z`, `a-z`, `0-9`).
- **NUNCA** alterar o alfabeto ou o tamanho do código sem aprovação explícita e migração planejada.
- **SEMPRE** validar unicidade do código via banco de dados (`AnyAsync()`) antes da inserção para evitar colisão.

### 2.2 Prevenção de Loop de Redirecionamento

- Ao criar uma nova URL encurtada, **SEMPRE** validar se a URL original pertence ao próprio domínio da aplicação (`DOMAIN_NAME`).
- Caso a URL pertença ao mesmo domínio, rejeitar a requisição com HTTP `400 Bad Request`.

### 2.3 Rastreamento Analítico em Redirecionamentos (`GET /{code}`)

- No endpoint de redirecionamento, a operação deve registrar o log em `AccessLog` (contendo IP do cliente, User-Agent e timestamp UTC) e incrementar o contador `Click`.
- O redirecionamento retornado deve ser estritamente HTTP `302 Found`.

---

## 3. Qualidade de Código C# 12 & .NET 8

### 3.1 Nulabilidade e Tipagem Forte

- **NUNCA** desabilitar o recurso `<Nullable>enable</Nullable>`.
- Evitar o uso de `object`, `dynamic` ou exceções genéricas não tratadas.
- Usar `records` para DTOs em `Http/Requests/` e `Http/Responses/` quando apropriado para imutabilidade.

### 3.2 Programação Assíncrona (`async` / `await`)

- Toda operação de I/O (banco de dados, chamadas de rede, arquivos) **DEVE** ser assíncrona (`async Task<T>`).
- **SEMPRE** utilizar métodos assíncronos do EF Core (ex: `ToListAsync()`, `FirstOrDefaultAsync()`, `SaveChangesAsync()`, `AnyAsync()`).
- **NUNCA** usar `.Result` ou `.Wait()` — isso causa deadlocks de threads.

### 3.3 Tratamento de Exceções e Respostas HTTP

- Manter contratos de resposta limpos e previsíveis.
- Retornar ActionResult fortemente tipado (ex: `ActionResult<ShortenedUrlResponse>`).
- Tratar cenários de erro com status HTTP adequados:
  - `400 Bad Request` para payloads inválidos ou URLs malformadas/loops.
  - `404 Not Found` para códigos não encontrados.
  - `500 Internal Server Error` para falhas não esperadas, registrando o log completo.

---

## 4. Persistência de Dados & Entity Framework Core

### 4.1 Fluent API como Fonte Única da Verdade

- Todas as configurações de tabela, chaves primárias, estrangeiras, índices e comportamentos de exclusão devem ficar em `ApplicationDbContext.OnModelCreating`.
- **NUNCA** colocar atributos de Data Annotations nas entidades de `Models/` se puderem ser configurados via Fluent API.
- Manter o comportamento `Cascade` para exclusão de `AccessLog` associado à `ShortenedUrl`.

### 4.2 Performance em Consultas LEIA-APENAS

- Em consultas de leitura que não mutam estado (ex: busca para redirecionamento ou estatísticas), **SEMPRE** utilizar `.AsNoTracking()`.

### 4.3 Gestão de Migrações

- **NUNCA** alterar manualmente o banco de dados de produção sem uma migração oficial do EF Core criada via `dotnet ef migrations add`.
- Sempre verificar se as migrações automáticas em `Program.cs` (`context.Database.Migrate()`) são executadas com tratamento de exceção adequado.

---

## 5. Segurança Backend & OWASP

### 5.1 Validação de URLs e Sanitização

- Todas as URLs recebidas em `POST /api/shorten` devem ser validadas com `Uri.TryCreate` e verificar esquemas HTTP (`http://` ou `https://`).
- Negação explícita de esquemas perigosos (`file://`, `javascript:`, `data:`).

### 5.2 Privacidade e IP Truncation/Sanitization

- Ao salvar o IP em `AccessLog.IpAdress`, garantir suporte a IPv4 e IPv6 (limite de 45 caracteres).
- Respeitar limites do User-Agent (limite de 512 caracteres).

---

## 6. Testes Unitários e de Integração

- Todas as novas features ou alterações de serviços devem ser acompanhadas de testes unitários.
- Serviços devem ser testados isoladamente usando mocks ou banco em memória/SQLite para simulação do DbContext.
- **NUNCA** commitar código novo sem garantir que `dotnet build` e `dotnet test` rodem sem erros.

---

## 7. Convenções de Git e Mensagens de Commit

- Formato de commits em português ou inglês no padrão Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Não realizar commits diretos que quebrem o build da aplicação.
