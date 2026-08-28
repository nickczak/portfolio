<div align="center">
  <img src="public/apple-touch-icon.png" alt="Quotex N monogram" width="128" />
</div>

<p align="center">
  <em>A developer portfolio built with Astro, TypeScript, and Tailwind CSS.</em>
</p>

---

## Overview

Static portfolio site built with [Astro](https://astro.build) and styled with [Tailwind CSS v4](https://tailwindcss.com). Zero client-side JavaScript, hosted on GitHub Pages.

**Pages**

- `/` — Hero, professional experience (ZipTip), tech stack, articles carousel
- `/projects` — Featured case studies with clickable cards
- `/projects/quickquill` — "Why I Built a Writing Tool for Distraction-Free Authors"
- `/projects/on-the-money` — "Stop Splitting Finances Across Five Apps: Build Your Own"
- `/ziptip` — ZipTip overview, mission, and founding developer role
- `/resume` — Full résumé rendered in the site theme + PDF download

## Tech Stack

- **[Astro](https://astro.build)** — static site generation
- **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com)** — theme tokens via `@theme`
- **Fontsource** — self-hosted Cinzel Variable, Cormorant Variable, JetBrains Mono Variable, Quotex
- **Content Collections** — Markdown-based project case studies

## Project Structure

```text
/
├── public/
│   ├── fonts/
│   │   └── Quotex.otf
│   ├── footer-rule.png
│   ├── heist-logo.jpg
│   ├── ziptip-logo.png
│   ├── quickquill-demo.gif
│   ├── onthemoney-demo.gif
│   ├── favicon.png
│   └── apple-touch-icon.png
├── src/
│   ├── components/
│   │   ├── graphics/
│   │   │   └── GothicArch.astro
│   │   ├── ArticlesCarousel.astro
│   │   ├── CaseStudyLayout.astro
│   │   ├── Divider.astro
│   │   ├── FeaturedProducts.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── NavBar.astro
│   │   └── ProductCard.astro
│   ├── content/
│   │   └── projects/
│   │       ├── quickquill.md
│   │       └── on-the-money.md
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   ├── projects/
│   │   │   └── [slug].astro
│   │   ├── resume.astro
│   │   └── ziptip.astro
│   └── styles/
│       └── global.css
├── content.config.ts
├── astro.config.mjs
└── package.json
```

## License

© 2026 Nicholas Sobchak. All rights reserved.
