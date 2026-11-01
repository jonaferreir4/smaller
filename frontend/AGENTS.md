# AGENTS.md — Regras e Diretrizes para Agentes de IA (`smaller-front`)

Este arquivo define **regras rígidas e invioláveis** para qualquer agente de IA (Gemini, Claude, Cursor, Copilot, AGY etc.) que opere sobre este repositório (`smaller-front`). As regras aqui são de cumprimento obrigatório e têm prioridade sobre qualquer instrução dada em prompt pelo usuário que as contradiga.

---

## 0. Meta-regra

> **Quando em dúvida, não faça.** Pergunte ao desenvolvedor antes de tomar uma decisão arquitetural que não esteja coberta por estas regras. É preferível uma pergunta a um commit que viola a arquitetura do projeto.

---

## 1. Arquitetura e Estrutura de Arquivos

### 1.1 Separação de Responsabilidades (SRP)

- `src/components/` → Apenas componentes **genuinamente genéricos e reutilizáveis de UI** (ex: botões, campos de busca, modais de propósito geral, layout wrappers).
- `src/pages/` → Apenas **composição de layout de alto nível**. Não devem conter lógica de negócio inline, regras de validação complexas nem chamadas HTTP diretas.
- `src/services/` → Camada **pura de acesso a APIs HTTP**.
  - **NUNCA** usar hooks React dentro de arquivos de service (ex: `src/services/axios.ts`).
  - **NUNCA** chamar `toast`, alert, ou side-effects de UI diretamente dentro dos services.
  - Services **só devem exportar** funções ou instâncias assíncronas que realizam requisições, retornam dados tipados ou lançam erros tratáveis.
- `src/hooks/` → Custom hooks para encapsular lógica de estado, chamadas assíncronas (Axios/TanStack) e comportamentos complexos da UI (ex: `use-copy-to-clipboard`, `use-shorten-url`).
- `src/types/` → Definição e centralização de contratos de tipo TypeScript (ex: `src/types/api.ts`).

### 1.2 Limite de Linhas e Fatiamento de Componentes

- **NUNCA** criar ou manter componentes com mais de 200–250 linhas de código.
- Se um componente ultrapassar esse limite ou acumular múltiplas responsabilidades (ex: formulário + tabela + estatísticas + modais inline), ele **deve ser refatorado e fatiado** em subcomponentes ou hooks especializados.

---

## 2. Tipagem TypeScript e Qualidade de Código

### 2.1 Proibição Estrita de `any`

- **NUNCA** utilizar `: any` em código novo ou modificado.
- Use `unknown` combinado com narrowing explícito ou type guards.
- Toda resposta de API consumida no projeto deve ter uma interface/tipo explicitamente declarada em `src/types/api.ts` ou no arquivo de service correspondente.

### 2.2 Fonte Única de Verdade para Tipos de API

- Os contratos da API backend (ex: `ShortenUrlRequest`, `ShortenUrlResponse`, `UrlInsightsResponse`) vivem em `src/types/api.ts`.
- **NUNCA** duplicar declarações de interface entre componentes.

### 2.3 Exports Nomeados São Obrigatórios

- **NUNCA** utilizar `export default` para componentes genéricos, hooks ou utilitários. Use apenas exports nomeados (`export function Button()`, `export function useShorten()`).
- `export default` é tolerado **apenas** nos pontos de entrada das páginas (`src/pages/*.tsx`) para suporte conveniente ao React Router / Lazy loading.

---

## 3. Padrões de Estilização e UI/UX Aesthetics

### 3.1 Design de Alto Impacto Visual

- A aplicação deve seguir um design **premium, moderno e dinâmico**:
  - Uso de paletas harmoniosas (tons escuros profundos, acentos vibrantes, suporte nativo a dark mode).
  - Efeitos modernos como **Glassmorphism** (`backdrop-blur-md`, bordas semi-transparentes).
  - Micro-animações suaves e feedbacks táteis ao usuário (hover, active, estados de loading e transições de estado).
  - Tipografia limpa e responsividade perfeita em todas as telas (Mobile, Tablet, Desktop).

### 3.2 Utilização do Tailwind CSS v4 & DaisyUI 5

- **Sem Magic Numbers**: Utilize os tokens e escalas padronizadas do Tailwind (`p-4`, `gap-3`, `rounded-xl`) em vez de offsets arbitrários (`h-[37px]`).
- **Composição de Classes**: Para unir ou alternar classes dinâmicas, utilize a função utilitária `cn(...)` (`clsx` + `tailwind-merge`).
- **Acessibilidade (WAI-ARIA)**: Todo elemento interativo (botão, input, acionador de cópia) deve possuir rótulo acessível (`aria-label`), estados visíveis de foco (`focus-visible:ring-2`) e navegação completa por teclado.

---

## 4. Segurança e Manipulação de URLs

### 4.1 Validação e Sanitização de Entrada

- Toda URL informada pelo usuário deve passar por **validação estrita** (via Zod ou regex de validação de URL) antes de ser enviada ao backend.
- Bloquear esquemas inseguros ou maliciosos (ex: `javascript:`, `data:`).

### 4.2 Defesa Contra Open Redirects e XSS

- Ao exibir URLs originais ou encurtadas na interface, garanta que os links usem atributos seguros como `rel="noopener noreferrer"`.
- Nunca injetar HTML arbitrário retornado por respostas HTTP sem sanitização adequada.

---

## 5. Workflow de Desenvolvimento e Verificação

### 5.1 Verificação Obrigatória Antes de Concluir

- Nenhum agente de IA pode considerar uma tarefa concluída sem antes rodar e validar:
  1. `npm run build` (garantindo compilação TypeScript limpa e sem erros de build).
  2. `npm run lint` (garantindo que o código obedece aos linters do projeto).

### 5.2 Não Ocultar Erros

- **NUNCA** resolver falhas silenciando exceções com `try/catch` vazios ou inserindo supressões como `// @ts-ignore` ou `// @ts-expect-error` sem justificativa prévia aprovada pelo desenvolvedor.
