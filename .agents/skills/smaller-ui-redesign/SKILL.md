---
name: smaller-ui-redesign
description: Diretrizes de design e padrões visuais modernos para a reformulação da interface do Smaller (React 19, Tailwind CSS v4, DaisyUI 5, Glassmorphism, Dark Mode).
---

# Design System Skill: Smaller UI Redesign

Esta skill orienta a criação e reformulação de interfaces no `smaller-front` com estéticas modernas, vibrantes e de alto apelo visual (WOW factor).

---

## 1. Princípios de Design Visual

### 1.1 Estética Modern/Glassmorphism
- **Backgrounds e Gradients**: Utilizar fundos com gradientes suaves e profundos (ex: `bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900`).
- **Cards e Painéis**: Usar cartões semi-transparentes com desfoque de fundo (`backdrop-blur-md bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800/50 shadow-2xl`).
- **Modo Escuro Native First**: A aplicação deve nascer perfeita no escuro com alternância fluida para modo claro.

### 1.2 Tipografia e Hierarquia
- Usar fontes modernas e limpas como **Inter**, **Outfit** ou **Plus Jakarta Sans**.
- Títulos vibrantes utilizando texto com gradiente (`bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400`).
- Tamanhos bem escalados: `h1` em `text-4xl md:text-6xl font-extrabold tracking-tight`.

### 1.3 Micro-animações e Interatividade
- Adicionar transições suaves em botões e entradas (`transition-all duration-200 ease-in-out`).
- Efeitos de elevação no hover (`hover:-translate-y-0.5 hover:shadow-indigo-500/25`).
- Feedback imediato em ações de clique (efeito de ondulação ou estado ativo `active:scale-95`).

---

## 2. Componentes de Referência

### 2.1 Hero Section Encurtador
```tsx
export function HeroShortenerSection() {
  return (
    <section className="relative overflow-hidden py-20 px-4 flex flex-col items-center justify-center text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent blur-3xl pointer-events-none" />
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 mb-4">
        Encurte suas URLs em Segundos
      </h1>
      <p className="text-slate-400 max-w-xl text-lg mb-8">
        Transforme links longos em URLs curtas, elegantes e rastreáveis com métricas em tempo real.
      </p>
    </section>
  );
}
```

### 2.2 Input Flutuante com Glassmorphism
```tsx
<div className="relative flex items-center w-full max-w-2xl p-2 rounded-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl transition-all focus-within:border-indigo-500/50">
  <input
    type="url"
    placeholder="Cole sua URL longa aqui..."
    className="w-full bg-transparent px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none"
  />
  <button className="btn btn-primary bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium border-0 rounded-xl px-6">
    Encurtar
  </button>
</div>
```
