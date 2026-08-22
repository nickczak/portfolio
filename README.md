<div align="center">
  <img src="public/apple-touch-icon.png" alt="Quotex N monogram" width="128" />
</div>

<h1 align="center">Nicholas Sobchak — Portfolio</h1>

<p align="center">
  <em>A dark-academia developer portfolio built with Astro, TypeScript, and Tailwind CSS.</em>
</p>

---

## Overview

A single-theme, multi-page portfolio featuring a gothic-minimal design system: pitch-black canvas, parchment typography, oxblood accents, and generative ornamental rules. GitHub statistics are streamed at build time, and the resume is rendered in-theme from live data.

**Pages**

| Route       | Contents                                                        |
| :---------- | :-------------------------------------------------------------- |
| `/`         | Hero, professional experience (ZipTip), tech stack              |
| `/projects` | Featured case studies — [quickquill.ink](https://github.com/nickczak/QuickQuill-Dictionary-SpellChecker), [On The Money](https://github.com/nickczak/OnTheMoney-Finance-Tracker) |
| `/resume`   | Full résumé rendered in the site theme + PDF download           |

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

## Design System

| Token      | Value     | Role                          |
| :--------- | :-------- | :---------------------------- |
| `ink-black`| `#000000` | Canvas                        |
| `bone`     | `#ffffff` | Headings                      |
| `parchment`| `#e8e4dc` | Body copy                     |
| `faded`    | `#a3a3a3` | Muted labels                  |
| `gold`     | `#c9a86a` | Ornaments, hover accents      |
| `oxblood`  | `#4a0404` | Selections, active borders    |
| `charcoal` | `#242424` | Hairline borders              |

Hard 90° corners only; all interactive accents transition over 200ms.

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start dev server at `localhost:4321`         |
| `npm run build`   | Production build to `./dist/`                |
| `npm run preview` | Preview the production build                 |
| `npm run astro …` | Run Astro CLI commands                       |

## License

© 2026 Nicholas Sobchak. All rights reserved.
