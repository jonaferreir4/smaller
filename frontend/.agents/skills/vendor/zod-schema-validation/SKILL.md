---
name: zod-schema-validation
description: Padrões de validação declarativa de formulários e schemas TypeScript usando Zod no frontend.
---

# Zod Schema Validation Best Practices

Esta skill orienta a criação de schemas de validação para formulários e entradas de dados na aplicação.

---

## 1. Schema de Validação de URL
```typescript
import { z } from 'zod';

export const shortenUrlSchema = z.object({
  url: z
    .string()
    .min(1, 'A URL é obrigatória')
    .url('Informe uma URL válida (ex: https://exemplo.com)')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'Apenas protocolos http:// e https:// são permitidos'
    ),
});

export type ShortenUrlFormData = z.infer<typeof shortenUrlSchema>;
```

---

## 2. Tratamento Declarativo de Erros
- Valide os dados antes de disparar chamadas de API:
```typescript
const result = shortenUrlSchema.safeParse({ url });
if (!result.success) {
  const errorMessage = result.error.errors[0]?.message;
  setError(errorMessage);
  return;
}
```
