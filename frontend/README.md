# Smaller - Frontend

Interface web moderna para encurtamento, gerenciamento e análise estatística de URLs, desenvolvida com **React 19**, **TypeScript**, **Vite**, **Tailwind CSS 4** e **DaisyUI 5**.

O projeto conta com um **Ambiente de Desenvolvimento Orientado a IA** (AI-Driven Development Environment) integrado, padronizado com regras de arquitetura, guias operacionais e ecossistema de *Skills* para assistentes de IA (Gemini, Claude, Cursor, Copilot, AGY).

---

## 🚀 Funcionalidades Principais

- **Encurtamento Inteligente de URLs**: Interface rápida e intuitiva para envio de URLs de longo comprimento e geração de links curtos com cópia para área de transferência em 1 clique.
- **Feedback Visual & Interativo**: Estados claros de carregamento (loading), tratamento amigável de erros de API e feedback tátil/visual.
- **Dashboard de Insights**: Consulta de métricas detalhadas de URLs encurtadas (total de acessos/cliques registrados, URL original e data de criação em formato UTC).
- **Roteamento SPA de Alta Performance**: Navegação fluida sem recarregamento da aplicação através do React Router DOM v7.
- **Containerização Pronta para Produção**: Build multi-stage Docker otimizado com NGINX atuando como servidor estático e proxy reverso para a API backend.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework UI** | React 19 + Vite 7 |
| **Linguagem** | TypeScript 5 (Modo Estrito) |
| **Roteamento** | React Router DOM 7 |
| **Estilização** | Tailwind CSS v4 + DaisyUI 5 |
| **Cliente HTTP** | Axios 1.11 |
| **Containerização** | Docker + NGINX 1.27 Alpine |
| **Ambiente de IA** | Agents.md + Claude.md + Ecossistema de Skills (`.agents/`) |

---

## 🤖 Ambiente de Desenvolvimento Orientado a IA

Este repositório foi projetado para operar com suporte nativo a assistentes autônomos de IA. A governança do código e os padrões arquiteturais são assegurados através de:

- **[AGENTS.md](file:///home/jona/Área%20de%20trabalho/smaller-front/AGENTS.md)**: Define as regras rígidas e invioláveis de desenvolvimento, separação de responsabilidades (SRP), padrões de estilização, tipagem estrita e limites de linhas por componente.
- **[CLAUDE.md](file:///home/jona/Área%20de%20trabalho/smaller-front/CLAUDE.md)**: Guia executivo contendo comandos rápidos de build/lint, resumo da arquitetura, contratos de API e estilo de código para agentes.
- **Ecossistema de Skills (`.agents/`)**:
  - `skills/`: Skills customizadas do domínio da aplicação (`smaller-url-shortener`, `smaller-ui-redesign`).
  - `skills/vendor/`: Skills de comunidade e mercado com boas práticas mantidas por especialistas da Vercel, Meta, ThoughtWorks e OWASP (`senior-frontend`, `tailwind-ui-design-system`, `solid-clean-code`, `security-and-hardening`, `zod-schema-validation`).

---

## 📂 Estrutura do Projeto

```text
smaller-front/
├── .agents/                    # Ecossistema de Skills de IA (locais e vendor)
│   ├── skills.json             # Registro de busca de skills
│   ├── skills/                 # Skills customizadas do domínio
│   └── skills/vendor/          # Skills de comunidade/vendor
├── public/                     # Arquivos estáticos públicos
├── src/
│   ├── assets/                 # Recursos visuais (vetores, imagens)
│   ├── components/             # Componentes reutilizáveis da UI
│   ├── hooks/                  # Custom hooks encapsulando lógica de negócio
│   ├── pages/                  # Composição visual de páginas (Home, Dashboard)
│   ├── services/               # Clientes HTTP puros (axios.ts)
│   ├── types/                  # Definições de tipos TypeScript
│   ├── App.css                 # Estilos específicos da aplicação
│   ├── App.tsx                 # Roteamento principal da aplicação
│   ├── main.css                # Importação global do Tailwind CSS v4
│   └── main.tsx                # Ponto de entrada do React 19
├── AGENTS.md                   # Regras invioláveis para Agentes de IA
├── CLAUDE.md                   # Guia rápido para Agentes de IA
├── Dockerfile                  # Script de containerização multi-stage
├── nginx.conf                  # Configuração do NGINX (SPA Fallback + Proxy Reverso)
└── package.json                # Manifesto de dependências e scripts do projeto
```

---

## 💻 Como Rodar o Projeto

### Pré-requisitos
- Node.js >= 20.0.0
- npm >= 10.0.0

### Desenvolvimento Local

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Executar checagem de linter e compilação TypeScript
npm run lint
npm run build
```

### Execução via Docker

```bash
# Construir a imagem Docker
docker build -t smaller-front .

# Iniciar o container na porta 80
docker run -p 80:80 smaller-front
```

---

## 🌐 Endpoints da API Consumidos

A aplicação consome a API backend através da instância do Axios (`src/services/axios.ts`) no prefixo `/api`:

1. **Encurtar URL**
   - **Método**: `POST`
   - **Rota**: `/api/shorten`
   - **Body**: `{ "url": "https://link-longo.com/exemplo" }`
   - **Response**: `{ "shortUrl": "http://localhost/abc123" }`

2. **Obter Insights da URL**
   - **Método**: `GET`
   - **Rota**: `/api/insights/:code`
   - **Response**: Detalhes de acessos, URL original e estatísticas.
