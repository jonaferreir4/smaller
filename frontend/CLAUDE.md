# CLAUDE.md — Guia de Desenvolvimento do Projeto (`smaller-front`)

Este arquivo fornece uma referência rápida para desenvolvedores e assistentes de IA (Claude, Gemini, Cursor, AGY) sobre a estrutura, comandos e convenções do repositório `smaller-front`.

---

## 🛠️ Comandos de Desenvolvimento e Build

| Ação | Comando | Descrição |
|---|---|---|
| **Servidor Dev** | `npm run dev` | Inicia o servidor local do Vite com HMR |
| **Build de Produção** | `npm run build` | Valida TypeScript (`tsc -b`) e gera o bundle em `dist/` |
| **Linter** | `npm run lint` | Executa o ESLint 9 para checagem estática de código |
| **Preview Local** | `npm run preview` | Servidor de preview da build de produção |
| **Container Docker** | `docker build -t smaller-front .` | Compila imagem multi-stage (Node + NGINX) |
| **Rodar Container** | `docker run -p 80:80 smaller-front` | Executa a aplicação servida via NGINX na porta 80 |

---

## 🧱 Visão Geral da Arquitetura e Stack

- **Framework**: React 19 + Vite 7
- **Linguagem**: TypeScript 5 (modo estrito)
- **Roteamento**: React Router DOM v7
- **Estilização**: Tailwind CSS v4 + DaisyUI 5
- **HTTP Client**: Axios 1.11 (prefixo base `/api`)
- **Containerização**: NGINX 1.27 Alpine com Proxy Reverso para `/api`

### 🗺️ Estrutura de Diretórios

```text
smaller-front/
├── .agents/                    # Ecossistema de Skills de IA
│   ├── skills.json             # Registro de busca de skills
│   ├── skills/                 # Skills customizadas do projeto
│   └── skills/vendor/          # Skills de comunidade/vendor (Vercel, Meta, ThoughtWorks, OWASP)
├── public/                     # Assets estáticos servidos diretamente
├── src/
│   ├── assets/                 # Recursos visuais (vetores, imagens)
│   ├── components/             # Componentes genéricos de UI (button, search-input, header, footer)
│   ├── hooks/                  # Custom hooks para estado e lógica
│   ├── pages/                  # Composição de páginas (Home, Dashboard)
│   ├── services/               # Clientes HTTP puros (axios.ts)
│   ├── types/                  # Definições de tipos TypeScript da API
│   ├── App.css                 # Estilos específicos de componentes/animações
│   ├── App.tsx                 # Rotas da aplicação
│   ├── main.css                # Importação do Tailwind CSS v4
│   └── main.tsx                # Ponto de entrada React 19
├── AGENTS.md                   # Regras invioláveis para agentes de IA
├── CLAUDE.md                   # Este arquivo (Guia executivo de IA e dev)
└── README.md                   # Documentação oficial do projeto
```

---

## 📡 Contratos de API (Endpoints Consumidos)

As chamadas HTTP são enviadas para a instância configurada do Axios (`src/services/axios.ts`) no endpoint base `/api`:

1. **POST `/api/shorten`**
   - **Request**: `{ "url": "https://exemplo.com/link-muito-longo" }`
   - **Response**: `{ "shortUrl": "http://localhost/abc123" }`

2. **GET `/api/insights/:code`** (ou `/api/stats`)
   - **Response**: Lista ou estatísticas da URL (total de cliques, link original, data de criação em UTC).

---

## 📐 Regras Rápidas de Estilo e Código

1. **Imports**: Ordene os imports em: (1) Bibliotecas externas (`react`, `react-router-dom`), (2) Componentes de UI, (3) Hooks/Services, (4) Tipos e estilos.
2. **Componentes**: Mantenha-os focados, acessíveis (WAI-ARIA) e estilizados com classes utilitárias do Tailwind v4 (`cn(...)`).
3. **Erros**: Sempre trate retornos de erro da API de forma clara ao usuário com feedback visual limpo.
4. **Verificação**: Antes de responder ao usuário após alterações de código, execute `npm run build` e `npm run lint`.
