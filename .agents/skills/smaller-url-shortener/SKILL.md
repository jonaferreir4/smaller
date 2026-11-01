---
name: smaller-url-shortener
description: Diretrizes de domínio para o fluxo de encurtamento de URLs, validação no cliente, feedback de cópia, geração de QR code e estatísticas de uso.
---

# Domain Skill: Smaller URL Shortener

Esta skill fornece diretrizes técnicas e operacionais para a implementação de recursos de encurtamento de URLs e visualização de estatísticas no repositório `smaller-front`.

---

## 1. Fluxo de Encurtamento de URL

### 1.1 Validação Prévia no Cliente
- Antes de submeter a URL ao endpoint `/api/shorten`, valide se o valor fornecido é uma URL válida com protocolo HTTP/HTTPS.
- Limpe espaços em branco no início e fim (`.trim()`).
- Exiba feedback visual amigável se a URL for inválida ou vazia antes de disparar a requisição.

### 1.2 Feedback Visual e Estados de Interface
- **Loading State**: O botão de envio deve entrar em estado desabilitado com indicador animado de progresso (`spinner` ou texto alterado para "Encurtando...").
- **Success State**:
  - Exibir a URL encurtada em um campo de leitura (`readOnly`) com destaque visual.
  - Oferecer um botão de cópia com 1 clique ("Copiar URL").
  - Alterar o texto/ícone do botão temporariamente para "Copiado!" por 2 segundos.
- **Error Handling State**:
  - Capturar erros de rede, timeout ou respostas 4xx/5xx do backend.
  - Exibir o erro em um componente de alerta com cor apropriada (ex: `alert-error` no DaisyUI).

---

## 2. Recursos Adicionais Recomendados

### 2.1 Cópia Segura para Clipboard
- Utilizar `navigator.clipboard.writeText(...)` com fallback gracioso caso a API de Clipboard não esteja disponível no contexto do navegador.

### 2.2 Gerador de QR Code
- Permitir ao usuário gerar e visualizar um QR Code apontando para a URL encurtada com opção de download da imagem em SVG/PNG.

### 2.3 Dashboard de Estatísticas e Insights
- Para cada URL encurtada ou listada no Dashboard:
  - Exibir o número total de cliques/acessos.
  - Exibir a URL original completa com truncamento CSS (`truncate`) para preservar o layout.
  - Exibir a data e hora de criação formatadas no fuso horário do usuário.
