---
name: tailwind-ui-design-system
description: Padrões de estilização avançada com Tailwind CSS v4 e DaisyUI 5, tokens de design, utilitário cn, animações e layouts responsivos.
---

# Tailwind CSS v4 & DaisyUI Design System

Esta skill padroniza o uso do Tailwind CSS v4 e componentes DaisyUI 5 no repositório.

---

## 1. Regras de Composição de Classes
- **Sem conflitos CSS**: Utilize a função utilitária `cn(...)` (`clsx` + `tailwind-merge`) para combinar e sobrescrever classes utilitárias dinamicamente.
- **Escala Padronizada**: Sempre prefira o uso de utilitários da escala nativa do Tailwind (`p-4`, `gap-3`, `max-w-xl`) a valores arbitrários (`p-[17px]`).
- **Dark Mode Primeira Classe**: Todo componente deve definir cores coerentes tanto para tema claro quanto escuro (`text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900`).

---

## 2. Função Utilitária `cn`
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. Padrão de Componentes com Variantes
```tsx
import { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variant === 'primary' && 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30',
        variant === 'secondary' && 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
        variant === 'ghost' && 'hover:bg-slate-800/50 text-slate-300',
        variant === 'outline' && 'border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10',
        className
      )}
      {...props}
    >
      {isLoading ? <span className="loading loading-spinner loading-sm mr-2" /> : null}
      {children}
    </button>
  );
}
```
