# Smaller — High-Performance URL Shortener & Analytics

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Traefik](https://img.shields.io/badge/Traefik-v3-24A1C1?logo=traefik)](https://traefik.io/)

**Smaller** é uma plataforma moderna e completa para encurtamento de URLs, geração dinâmica de QR Codes, gerenciamento de chaves de API e coleta analítica de acessos em tempo real com sub-millisecond redirect latency.

O repositório é estruturado em arquitetura **Monorepo**, dividindo formalmente a API de alta performance e a interface web reativa.

---

## 🏛️ Arquitetura do Monorepo

```text
smaller/ (Raiz do Monorepo)
├── .agents/                    # Hub global de Skills para Antigravity IDE / Cursor / Claude
├── backend/                    # API RESTful, Regras de Domínio e Persistência (.NET 8)
│   ├── Controllers/            # Camada de endpoints REST (Shorten, Links, Auth, ApiKeys)
│   ├── Services/               # Lógica de negócio (Base62, Caching L1+L2, AccessLogQueue)
│   ├── Data/                   # DbContext do EF Core e mapeamentos Fluent API
│   ├── Models/                 # Entidades de banco (ShortenedUrl, AccessLog, User, ApiKey)
│   ├── Http/                   # Data Transfer Objects (Requests e Responses)
│   ├── smaller.Tests/          # 17 testes unitários automatizados (xUnit + Moq)
│   ├── AGENTS.md               # Regras estritas de arquitetura do backend
│   └── Dockerfile              # Imagem de produção ASP.NET Core
│
├── frontend/                   # Aplicação Web SPA (React 19 + TypeScript + Tailwind v4)
│   ├── src/                    # Componentes, páginas (Home, Dashboard, Profile), hooks e contextos
│   ├── public/                 # Favicons de alta resolução (vetorial S-Link) e assets
│   ├── AGENTS.md               # Regras de design system, tipagem e limites de componentes
│   └── Dockerfile              # Imagem multi-stage Node.js + NGINX
│
├── docker-compose.yml          # Orquestrador com Traefik v3, Postgres 15, Redis 7, API e Web
├── .env.example                # Variáveis de ambiente compartilhadas
└── .gitignore                  # Regras globais de exclusão Git
```

---

## 🚀 Como Iniciar com Docker Compose

Suba a stack completa (Banco, Cache, API, Frontend e Proxy Reverso) com um único comando:

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Iniciar todos os serviços
docker compose up -d --build
```

A aplicação estará disponível em:
* **Aplicação Web:** `http://localhost` (ou no domínio configurado em `DOMAIN_NAME`)
* **API REST:** `http://localhost/api`
* **Health Check:** `http://localhost/healthz`
* **Dashboard Traefik:** `http://localhost:8080/dashboard/` (quando habilitado)

---

## 💻 Desenvolvimento Local

Para desenvolver com recarregamento rápido (Hot Reload / HMR), você pode rodar os módulos individualmente:

### 1. Backend (.NET 8)
```bash
cd backend
dotnet restore
dotnet run
# API disponível em http://localhost:5000 (Swagger em http://localhost:5000/swagger)
```

### 2. Frontend (React 19)
```bash
cd frontend
npm install
npm run dev
# Interface disponível em http://localhost:5173
```

---

## 🧪 Testes Automatizados

Garantir que a suíte de testes do backend passe 100% verde:

```bash
cd backend
dotnet test
```

Validar a integridade estática e compilação do frontend:

```bash
cd frontend
npm run lint
npm run build
```

---

## 📋 Governança e Regras de Desenvolvimento

Consulte os guias específicos em cada diretório para regras detalhadas:
* **Global:** [AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/AGENTS.md)
* **Backend:** [backend/AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/backend/AGENTS.md)
* **Frontend:** [frontend/AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/frontend/AGENTS.md)

---

## 📄 Licença
Distribuído sob licença MIT. Consulte `LICENSE` para mais informações.
