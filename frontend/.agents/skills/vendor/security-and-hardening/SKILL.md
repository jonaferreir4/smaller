---
name: security-and-hardening
description: Práticas de segurança no desenvolvimento frontend: sanitização de entrada, prevenção de XSS, proteção contra open redirects e manuseio seguro de URLs.
---

# Frontend Security & Hardening Best Practices

Esta skill orienta práticas de segurança essenciais no desenvolvimento de aplicações frontend que lidam com URLs e dados providos pelo usuário.

---

## 1. Sanitização e Validação de URLs
- Toda URL fornecida pelo usuário deve ser validada contra esquemas de protocolo permitidos (`http:` e `https:`).
- **Proibição de Esquemas Inseguros**: Rejeite ou remova URLs que comecem com `javascript:`, `data:` ou `vbscript:` para evitar ataques XSS por injeção de script.

```typescript
export function isValidHttpUrl(stringUrl: string): boolean {
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
```

---

## 2. Proteção Contra Cross-Site Scripting (XSS)
- Nunca use `dangerouslySetInnerHTML` com strings que contenham dados fornecidos por usuários sem sanitização rigorosa prévia.
- Ao renderizar links de terceiros ou URLs externas, utilize os atributos:
  ```tsx
  <a href={safeUrl} target="_blank" rel="noopener noreferrer">
    {safeUrl}
  </a>
  ```

---

## 3. Mitigação de Open Redirects
- Quando a aplicação realiza redirecionamentos automáticos ou exibe links encurtados, certifique-se de que o usuário visualize o domínio final ou receba confirmação se necessário.
