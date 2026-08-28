<div align="center">
  <img src="public/apple-touch-icon.png" alt="Quotex N monogram" width="128" />
</div>

<p align="center">
  <em>A developer portfolio built with Astro, TypeScript, and Tailwind CSS.</em>
</p>

---

## Overview

Static pages created with [Astro](https://astro.build) and styled with [Tailwind CSS v4](https://tailwindcss.com). The site is fully static, with zero client-side JavaScript, and is hosted on GitHub Pages.

**Pages**

- `/` — Hero, professional experience (ZipTip), tech stack, articles carousel
- `/projects` — Featured case studies with clickable cards
- `/projects/quickquill` — "Why I Built a Writing Tool for Distraction-Free Authors"
- `/projects/on-the-money` — "Stop Splitting Finances Across Five Apps: Build Your Own"
- `/ziptip` — ZipTip overview, mission, and founding developer role
- `/resume` — Full résumé rendered in the site theme + PDF download

## Tech Stack

- **[Astro](https://astro.build)** — static site generation, zero client JS
- **TypeScript** — strict mode throughout
- **[Tailwind CSS v4](https://tailwindcss.com)** — theme tokens via `@theme`, Vite plugin
- **Fontsource** — self-hosted Cinzel Variable, Cormorant Variable, JetBrains Mono Variable, and Quotex
- **Content Collections** — Markdown-based project case studies with schema validation

## Project Structure

```text
/
├── public/
│   ├── fonts/
│   │   └── Quotex.otf          # Display face for the "N" monogram
│   ├── footer-rule.png         # Ornament used as the footer separator
│   ├── heist-logo.jpg          # Hero crest
│   ├── ziptip-logo.png         # ZipTip mark (experience section)
│   ├── quickquill-demo.gif     # QuickQuill demo capture
│   ├── onthemoney-demo.gif     # On The Money demo capture
│   ├── favicon.png             # Quotex "N" on black
│   └── apple-touch-icon.png    # iOS bookmark icon
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
│   │   └── projects/           # Markdown case studies
│   │       ├── quickquill.md
│   │       └── on-the-money.md
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   ├── projects/
│   │   │   └── [slug].astro    # Dynamic case study pages
│   │   ├── resume.astro
│   │   └── ziptip.astro
│   └── styles/
│       └── global.css
├── content.config.ts           # Content collection schema
├── astro.config.mjs
└── package.json
```

## License

© 2026 Nicholas Sobchak. All rights reserved.
