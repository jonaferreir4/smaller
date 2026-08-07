# Leave It Small - API Backend

Este repositório contém a implementação do backend do sistema **Leave It Small**, uma API RESTful de alta performance projetada para o encurtamento de URLs, redirecionamento dinâmico e rastreamento analítico de acessos.

A aplicação foi desenvolvida utilizando a plataforma **.NET 8 (ASP.NET Core)**, com persistência relacional em **PostgreSQL** por meio do **Entity Framework Core**, e arquitetura de infraestrutura containerizada com **Docker Compose** e proxy reverso **Traefik v3.5**.

---

## 1. Arquitetura do Sistema

A aplicação adota uma arquitetura em camadas estruturada em torno da separação de responsabilidades (Separation of Concerns), garantindo desacoplamento entre apresentação, regras de negócio e camada de acesso a dados.

### Estrutura de Diretórios

*   `Controllers/`: Camada de entrada HTTP. Gerencia o roteamento de requisições, validação de entradas de rede e retornos das respostas HTTP.
*   `Services/`: Camada de domínio e regras de negócio. Contém a lógica de geração de códigos únicos, cálculo estatístico de cliques e processamento de logs de acesso.
*   `Data/`: Camada de persistência. Contém o contexto do Entity Framework Core (`ApplicationDbContext`), mapeamento de tabelas, índices e migrações.
*   `Models/`: Entidades de domínio persistidas no banco de dados (`ShortenedUrl`, `AccessLog`).
*   `Http/`: Objeto de Transferência de Dados (DTOs) segregados em `Requests/` e `Responses/` para isolar os contratos de API das entidades de banco de dados.
*   `utils/`: Utilitários estáticos e configurações globais do sistema, como alfabeto e tamanho do código encurtado.
*   `Migrations/`: Histórico de migrações gerenciado pelo Entity Framework Core CLI.

---

## 2. Modelo de Dados

O esquema relacional é composto por duas tabelas principais configuradas via Fluent API no `ApplicationDbContext`:

```
+------------------+         1 : N         +-------------------+
|  ShortenedUrl    | --------------------> |     AccessLog     |
+------------------+                       +-------------------+
| Id (PK, Guid)    |                       | Id (PK, Guid)     |
| LongUrl (string) |                       | ShortenedUrlId(FK)|
| ShortUrl (string)|                       | IpAdress (string) |
| Code (string, UQ)|                       | UserAgent (string)|
| Click (int)      |                       | AccessDate (dt)   |
| CreatedOnUtc(dt) |                       +-------------------+
+------------------+
```

### Regras de Integridade e Restrições
*   `ShortenedUrl.Code`: Possui tamanho fixo de 7 caracteres (`ShortLinkSettings.Length`) e índice único (`IsUnique()`) no banco de dados para garantir buscas em tempo constante O(1).
*   `AccessLog.IpAdress`: Campo obrigatório com tamanho máximo de 45 caracteres, assegurando compatibilidade com endereços IPv4 e IPv6 nativos.
*   `AccessLog.UserAgent`: Armazena a string de identificação do cliente com limite de 512 caracteres.
*   `OnDelete(DeleteBehavior.Cascade)`: A remoção de uma URL encurtada resulta na exclusão automática de todos os logs de acesso vinculados no banco de dados.

---

## 3. Regras de Negócio e Algoritmos

### 3.1. Geração de Códigos Únicos (Base62)
O serviço utiliza um alfabeto alfanumérico estrito contendo 62 caracteres (`A-Z`, `a-z`, `0-9`). Para cada nova URL:
1. É gerada uma combinação aleatória de 7 caracteres a partir do conjunto de caracteres configurado.
2. A quantidade potencial de combinações únicas é de 62^7 = 3.521.614.606.208 (aproximadamente 3,52 trilhões de códigos).
3. Antes da inserção, a aplicação verifica a existência prévia do código no banco via `AnyAsync()`, repetindo o ciclo caso ocorra colisão (garantia de unicidade determinística).

### 3.2. Prevenção de Loops de Redirecionamento
Para evitar ataques de negação de serviço ou encadeamento infinito de requisições, o método `CreateShortenedUrlAsync` valida o domínio da URL original recebida contra a variável de ambiente `DOMAIN_NAME`. Caso a URL informada já pertença ao domínio do próprio encurtador, a requisição é rejeitada com status HTTP 400 Bad Request.

### 3.3. Rastreamento e Redirecionamento
No momento em que o endpoint `GET /{code}` é acionado:
1. A entidade correspondente ao código é localizada.
2. O contador interno de acessos `Click` é incrementado em +1.
3. Um registro na tabela `AccessLog` é criado contendo o endereço IP remoto da conexão (`RemoteIpAddress`), o cabeçalho `User-Agent` e o timestamp UTC atual.
4. É retornado um redirecionamento HTTP 302 (Found) apontando para a URL de destino (`LongUrl`).

---

## 4. Endpoints da API

### Health Check e Diagnóstico

*   **GET `/api`**
    *   Descrição: Verifica o estado de operação da API.
    *   Resposta (200 OK):
        ```json
        {
          "message": "API is running"
        }
        ```

### Gestão de URLs Encurtadas

*   **POST `/api/shorten`**
    *   Descrição: Registra uma nova URL original e retorna os dados da URL encurtada.
    *   Corpo da Requisição (`application/json`):
        ```json
        {
          "url": "https://exemplo.com.br/artigo/tecnologia-aspnet-core"
        }
        ```
    *   Resposta (200 OK):
        ```json
        {
          "shortUrl": "http://short.local/aB3x9Z1",
          "originalUrl": "https://exemplo.com.br/artigo/tecnologia-aspnet-core",
          "clicks": 0,
          "createdOnUtc": "2026-08-07"
        }
        ```
    *   Erros possíveis: 400 Bad Request (URL malformada ou tentativa de encurtar o próprio domínio).

*   **GET `/api/links`**
    *   Descrição: Retorna a lista de todas as URLs encurtadas cadastradas no sistema.
    *   Resposta (200 OK): Array de objetos `ShortenedUrlResponse`.

*   **GET `/api/links/{code}`**
    *   Descrição: Obtém os detalhes e estatísticas de uma URL encurtada a partir do seu código de 7 caracteres.
    *   Resposta (200 OK): Objeto `ShortenedUrlResponse`.

*   **DELETE `/api/links/{code}`**
    *   Descrição: Remove permanentemente uma URL encurtada e seus logs de acesso associados.
    *   Resposta (200 OK): Objeto contendo os dados da entidade removida.

### Redirecionamento de Tráfego

*   **GET `/{code}`**
    *   Descrição: Redireciona o cliente HTTP para a URL de destino original correspondente ao código.
    *   Respostas:
        *   302 Found (Redirecionamento com cabeçalho `Location`).
        *   404 Not Found (Código inexistente).

---

## 5. Variáveis de Ambiente

O sistema utiliza um arquivo `.env` localizado na raiz do projeto para definir as credenciais e configurações de infraestrutura.

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DB_HOST` | Endereço do servidor do banco de dados PostgreSQL | `db` (em container) / `localhost` |
| `DB_PORT` | Porta de conexão do banco de dados | `5432` |
| `DB_NAME` | Nome do banco de dados relacional | `leaveitdb` |
| `DB_USER` | Usuário do banco de dados | `postgres` |
| `DB_PASSWORD` | Senha do usuário do banco de dados | `12345` |
| `DOMAIN_NAME` | FQDN configurado para a API e links encurtados | `short.local` |
| `DOMAIN_NAME_FRONT` | FQDN para roteamento da aplicação Frontend no Traefik | `short.local.front` |
| `LE_EMAIL` | E-mail para emissão automática de certificados Let's Encrypt | `admin@dominio.com` |
| `TRAEFIK_DASHBOARD_AUTH` | Hashing htpasswd de autenticação do painel Traefik | `admin:$2y$...` |

---

## 6. Configuração e Execução

### Pré-requisitos
*   .NET 8.0 SDK (para desenvolvimento e execução nativa)
*   Docker Engine v20+ e Docker Compose v2+ (para execução em containers)

### Execução em Ambiente Nativo (Local)

1. Restaure as dependências do projeto .NET:
   ```bash
   dotnet restore
   ```

2. Certifique-se de que uma instância do PostgreSQL esteja em execução com as credenciais especificadas no arquivo `.env`.

3. Execute as migrações do banco de dados (o projeto executa `Database.Migrate()` automaticamente na inicialização, mas pode ser acionado manualmente):
   ```bash
   dotnet ef database update
   ```

4. Inicie o servidor web:
   ```bash
   dotnet run
   ```
   A aplicação estará acessível por padrão na porta configurada em `launchSettings.json` ou variáveis de ambiente.

### Execução via Docker Compose (Infraestrutura Completa)

A infraestrutura orquestrada via Docker Compose levanta o banco de dados PostgreSQL, a API em ASP.NET Core, a aplicação frontend e o proxy reverso Traefik.

1. Construa as imagens dos containers e inicie os serviços em modo desacoplado:
   ```bash
   docker-compose up --build -d
   ```

2. Verifique os status dos containers:
   ```bash
   docker-compose ps
   ```

3. O Traefik gerenciará as requisições na porta 80 e encaminhará o tráfego com base nos rótulos (`labels`) definidos:
   *   Rotas que iniciam com `/api` ou redirecionamentos de rota raiz serão direcionados ao container `leaveit-app`.
   *   Tráfego destinado ao domínio frontend será encaminhado ao container `leaveit-frontend`.

---

## 7. Documentação Interativa da API (Swagger)

Em ambiente de desenvolvimento ou quando configurado no pipeline de inicialização, a documentação interativa Swagger UI estará disponível em:

*   Endpoint Swagger: `http://localhost:<porta>/swagger`

Esta interface permite a inspeção dos schemas OpenAPI e o teste dos endpoints diretamente pelo navegador.
