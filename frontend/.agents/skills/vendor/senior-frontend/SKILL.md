---
name: senior-frontend
description: Diretrizes avançadas de engenharia de frontend, arquitetura UI, boas práticas de componentes React 19, acessibilidade WAI-ARIA e separação de responsabilidades.
---

# Senior Frontend Engineering (React 19 + TypeScript)

Esta skill fornece orientações de excelência no desenvolvimento de interfaces React responsivas, acessíveis e altamente manuteníveis.

---

## 1. Princípios de Componentização
- **Single Responsibility (SRP)**: Cada componente deve ter uma única razão para mudar. Se ultrapassar 200–250 linhas, extraia subcomponentes ou hooks especializados.
- **Componentes Puros**: Evite efeitos colaterais durante a renderização. Props devem ser imutáveis.
- **Acessibilidade First (WAI-ARIA)**: Todo elemento interativo deve ter suporte a navegação via teclado (`onKeyDown`), rótulo acessível (`aria-label`) e indicação clara de foco (`focus-visible:ring-2`).

---

## 2. Gestão de Estado Local vs. Global
- Mantenha estados puramente visuais e locais (ex: estado de input, modal aberto/fechado) dentro do componente com `useState` ou custom hooks.
- Evite criar stores globais desnecessárias para dados temporários de formulário.
- Para requisições assíncronas, isole o transporte HTTP na camada de `services/` e consuma através de custom hooks.

---

## 3. Padrão de Custom Hooks
```tsx
import { useState, useCallback } from 'react';

export function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) return false;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
      return true;
    } catch {
      setIsCopied(false);
      return false;
    }
  }, [timeout]);

  return { isCopied, copy };
}
```
