# CLAUDE.md — Guia do Monorepo (`smaller`)

Referência rápida para desenvolvedores e agentes de IA sobre comandos, fluxos de execução e convenções do Monorepo **Smaller**.

---

## 🚀 Comandos Rápidos de Orquestração (Raiz)

| Ação | Comando | Descrição |
|---|---|---|
| **Subir Stack Completa** | `docker compose up -d --build` | Inicia Traefik, Backend, Frontend, Postgres e Redis |
| **Parar Stack** | `docker compose down` | Encerra os contêineres preservando volumes |
| **Logs em Tempo Real** | `docker compose logs -f [serviço]` | Acompanha logs (`app`, `frontend`, `db`, `redis`, `traefik`) |
| **Validar Config Compose** | `docker compose config --quiet` | Valida sintaxe e contextos de build do compose |

---

## 🛠️ Comandos do Módulo Backend (`backend/`)

> Para diretrizes detalhadas de arquitetura, consulte [backend/AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/backend/AGENTS.md).

```bash
cd backend

# Restaurar e compilar
dotnet build

# Executar suíte de testes unitários xUnit
dotnet test

# Executar a API localmente (porta 5000)
dotnet run

# Gerar nova migração do Entity Framework Core
dotnet ef migrations add <NomeDaMigracao>

# Aplicar migrações no banco local
dotnet ef database update
```

---

## ⚡ Comandos do Módulo Frontend (`frontend/`)

> Para diretrizes detalhadas de UI e componentes, consulte [frontend/AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/frontend/AGENTS.md).

```bash
cd frontend

# Iniciar servidor de desenvolvimento do Vite (HMR na porta 5173)
npm run dev

# Validar TypeScript e compilar bundle de produção
npm run build

# Executar linter estático ESLint 9
npm run lint

# Visualizar build localmente
npm run preview
```

---

## 🗺️ Mapa de Diretórios do Monorepo

```text
smaller/
├── .agents/          # Hub global de skills para Antigravity IDE
├── backend/          # API REST .NET 8 (C#, EF Core 9, Postgres, Redis)
├── frontend/         # SPA React 19 (Vite, TypeScript, Tailwind v4, DaisyUI 5)
├── docker-compose.yml# Orquestração local e de produção
├── .env.example      # Variáveis de ambiente compartilhadas
└── .gitignore        # Regras unificadas de exclusão Git
```
