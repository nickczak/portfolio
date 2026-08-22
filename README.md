<div align="center">
  <img src="public/readme-mark.png" alt="Quotex N monogram" width="128" />
</div>

<p align="center">
  <em>A developer portfolio built with Astro, TypeScript, and Tailwind CSS.</em>
</p>

---

## Overview

Static pages created with [Astro](https://astro.build) and styled with [Tailwind CSS v4](https://tailwindcss.com). The site is fully static, with zero client-side JavaScript, and is hosted on GitHub Pages.

**Pages**

- `/` — Hero, professional experience (ZipTip), tech stack
- `/projects` — Featured case studies: [quickquill.ink](https://github.com/nickczak/QuickQuill-Dictionary-SpellChecker) and [On The Money](https://github.com/nickczak/OnTheMoney-Finance-Tracker)
- `/resume` — Full résumé rendered in the site theme + PDF download

## Tech Stack

- **[Astro](https://astro.build)** — static site generation, zero client JS
- **TypeScript** — strict mode throughout
- **[Tailwind CSS v4](https://tailwindcss.com)** — theme tokens via `@theme`, Vite plugin
- **Fontsource** — self-hosted Cinzel Variable, Cormorant Variable, JetBrains Mono Variable, and Quotex
- **GitHub REST API** — build-time streaming of public repos, commits, stars, and followers
- **ImageMagick** — generated favicon/apple-touch icon from the Quotex typeface

## Project Structure

```text
/
├── public/
│   ├── fonts/
│   │   └── Quotex.otf          # Display face for the "N" monogram
│   ├── footer-rule.png         # Ornament used as the footer separator
│   ├── heist-logo.jpg          # Hero crest
│   ├── ziptip-logo.png         # ZipTip mark (experience section)
│   ├── favicon.png             # Quotex "N" on black
│   └── apple-touch-icon.png    # iOS bookmark icon
├── src/
│   ├── components/
│   │   ├── graphics/
│   │   │   └── GothicArch.astro # Lancet-window ornament (hero watermark)
│   │   ├── Divider.astro        # ✦ hairline ornament
│   │   ├── FeaturedProducts.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── NavBar.astro
│   │   └── ProductCard.astro
│   ├── layouts/
│   │   └── Layout.astro         # Head, fonts, meta, grain overlay
│   ├── pages/
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   └── resume.astro
│   └── styles/
│       └── global.css           # @theme tokens, base styles, film grain
├── astro.config.mjs
└── package.json
```

## License

© 2026 Nicholas Sobchak. All rights reserved.
