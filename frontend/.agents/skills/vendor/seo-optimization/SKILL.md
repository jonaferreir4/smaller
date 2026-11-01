---
name: seo-optimization
description: Diretrizes de SEO (Search Engine Optimization) e acessibilidade para aplicações web modernas (React/Vite).
---

# SEO Optimization & Web Standards Skill

Esta skill padroniza as melhores práticas de SEO técnico e semântico no repositório `smaller-front`.

---

## 1. Meta Tags e Estrutura de Documento
- **Título da Página (`<title>`)**: Deve ser descritivo, único e incluir a marca (ex: `Smaller - Encurtador de URLs`).
- **Meta Description**: Adicionar meta descrições concisas e focadas (150-160 caracteres) resumindo o valor da página.
- **OpenGraph & Social Sharing**: Incluir meta tags `og:title`, `og:description`, `og:image` e `og:url` para compartilhamento rico em redes sociais.

---

## 2. HTML Semântico & Acessibilidade
- Utilize tags semânticas do HTML5: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`.
- **Single `<h1>`**: Cada página deve possuir apenas um título de nível principal `<h1>`.
- **Unique IDs**: Atribua IDs únicos e descritivos a elementos interativos (ex: `id="shorten-url-input"`, `id="shorten-submit-btn"`) para automação e acessibilidade.

---

## 3. SEO Dinâmico em Componentes React
- Atualize o `document.title` dinamicamente conforme a rota navegada:
  ```typescript
  useEffect(() => {
    document.title = "Dashboard & Insights - Smaller";
  }, []);
  ```
