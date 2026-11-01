# AGENTS.md — Regras Globais do Monorepo (Smaller)

Este arquivo define **as regras de governança e diretrizes globais de desenvolvimento** para qualquer agente de IA (Google Antigravity, Claude, Cursor, Copilot, ChatGPT etc.) que opere sobre este repositório monorepo (`smaller`).

---

## 0. Estrutura do Monorepo e Delegação de Regras

O projeto é organizado formalmente em dois subprojetos independentes orquestrados na raiz:

```text
smaller/ (Raiz do Monorepo)
├── backend/    → API RESTful, Encurtamento Base62, Analytics (.NET 8, PostgreSQL, Redis)
└── frontend/   → Interface Web SPA (React 19, Vite 7, Tailwind CSS v4, DaisyUI 5)
```

### 0.1 Roteamento Obrigatório de Regras

* Ao modificar arquivos em **`backend/`**:
  * É **obrigatório** ler e seguir estritamente as regras de [backend/AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/backend/AGENTS.md) (algoritmo Base62 de 7 chars, limites de slug customizado até 30 chars, EF Core Fluent API, DI por construtor, prevenção de loops e redirects 302).
* Ao modificar arquivos em **`frontend/`**:
  * É **obrigatório** ler e seguir estritamente as regras de [frontend/AGENTS.md](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/frontend/AGENTS.md) (Single Responsibility Principle, proibição estrita de `: any`, limite de 200 linhas por componente, tipagem forte com TypeScript).

---

## 1. Regras Transversais de Monorepo (Cross-Cutting)

### 1.1 Sincronização Estrita de Contratos de API
* Toda alteração de contrato em `backend/Http/Requests/` ou `backend/Http/Responses/` **DEVE** ser sincronizada no mesmo ciclo de desenvolvimento com os tipos correspondentes em `frontend/src/types/api.ts`.
* Nunca alterar uma rota HTTP ou nome de campo no backend sem atualizar o endpoint e o payload consumido pelo frontend em `frontend/src/services/` e nos hooks correspondentes.

### 1.2 Isolamento de Dependências
* **NUNCA** adicionar ferramentas do ecossistema Node.js (ex: `package.json`, `npm`) na pasta `backend/`.
* **NUNCA** referenciar assemblies .NET ou arquivos C# dentro de `frontend/`.
* A comunicação entre backend e frontend ocorre **exclusivamente via HTTP REST** através do prefixo `/api` e dos slugs de redirecionamento.

### 1.3 Orquestração e Docker Compose
* Configurações globais de contêineres, portas e proxy reverso devem ficar centralizadas no arquivo raiz [docker-compose.yml](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/docker-compose.yml).
* Os serviços utilizam contextos locais relativos:
  * Backend: `context: ./backend`
  * Frontend: `context: ./frontend`
* Variáveis de ambiente compartilhadas entre serviços devem ser documentadas no arquivo [.env.example](file:///home/jona/%C3%81rea%20de%20trabalho/smaller/.env.example) da raiz.

---

## 2. Padrão de Commits e Validação de Qualidade

### 2.1 Conventional Commits com Escopo Obrigatório
Todos os commits devem seguir a convenção de commits com o escopo indicando a área afetada:

* `feat(api): ...` ou `fix(api): ...` para mudanças em `backend/`
* `feat(web): ...` ou `fix(web): ...` para mudanças em `frontend/`
* `ci(monorepo): ...` ou `chore(infra): ...` para orquestração, docker ou arquivos da raiz
* `test(api): ...` ou `test(web): ...` para testes unitários ou e2e

### 2.2 Verificação Obrigatória Pré-Commit
**NUNCA** realizar commits que quebrem a suíte de testes ou o build de qualquer um dos módulos:
* `cd backend && dotnet test` → Deve rodar 100% verde (sem falhas).
* `cd frontend && npm run build` → Deve compilar sem erros de TypeScript e sem alertas bloqueantes.
