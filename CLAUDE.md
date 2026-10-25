# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio/digital garden site ("Adrian's Garden") built with Astro v5, TailwindCSS v4, and TypeScript. Based on the Astro Micro theme (fork of Astro Nano). Statically generated, zero frontend frameworks.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check with `astro check` then build static site
- `npm run preview` — Preview production build locally
- `npx prettier --write .` — Format all files (uses astro + tailwindcss plugins)

No test framework is configured.

## Architecture

**Astro file-based routing** — Pages live in `src/pages/`. Dynamic routes use `[...id].astro` pattern for blog posts, projects, and tags.

**Content Collections** — Blog posts (`src/content/blog/`) and projects (`src/content/projects/`) are Markdown/MDX files with Zod-validated frontmatter schemas defined in `src/content.config.ts`. Blog posts have `title`, `description`, `date`, optional `draft` and `tags`. Projects add optional `demoURL` and `repoURL`.

**Site configuration** — All site metadata, page titles, social links, and homepage display counts are centralized in `src/consts.ts`. Type definitions for these are in `src/types.ts`.

**Styling** — TailwindCSS v4 via Vite plugin (not PostCSS). Global styles in `src/styles/global.css`. Dark mode uses custom variant `&:is(.dark *)`. Theme switching (light/dark/system) is handled client-side with localStorage. Fonts are Geist Sans and Geist Mono.

**Key interactive pages:**
- `src/pages/footprints.astro` — Travel map with 3D COBE globe, 2D D3.js/TopoJSON vector map, and terminal-style log. Contains significant inline JS with proper cleanup on navigation.
- `src/pages/about.astro` — Professional experience and social links.

**Components** — `src/components/` contains Astro components only (no React/Vue/Svelte). `Head.astro` handles meta tags, font loading, theme initialization, page animations, and code block copy buttons. `Header.astro` is fixed with backdrop blur.

**Utilities** — `src/lib/utils.ts` provides `cn()` (clsx + tailwind-merge), `formatDate()`, and `readingTime()`.

**Design system (2026-10 redesign)** — tokens live in `src/styles/global.css` (`--paper/--ink/--muted/--rule/--stone`), exposed as Tailwind colors `paper/ink/muted/rule/stone`. Utilities `.t-mono .t-muted .rule .grid-bg`. Components: `SectionLabel`, `Entry`, `Stone`, `ArchiveBadge`. No italics/serif anywhere. Go-stone motif only in favicon/OG, home section labels, blog group headings. Light is the default theme; dark/system only when the visitor picks them.

**Home copy** — `src/data/home.ts` (HERO_LINE, NOW, WRITING_IN_PROGRESS, BEYOND, LIFE_*). **Archive grouping** — `src/lib/archive.ts` (`GROUPS`, `groupOf`, `groupPosts`, `isArchive`; cutoff 2020-01-01; precedence infra > cycling > reading > football > backend > essays).

**Travel data** — `src/data/<trip>.json` are hand-copied from `~/Documents/travel/travel-poc/src/data/` (same filenames/schema); the footprints array is inline in `src/pages/footprints.astro`. A new trip = JSON in travel-poc → copy here → clone a `voyages/<trip>.astro` page (pick the country feature id and longitude filter) → add to `voyages/index.astro` and `life.astro`. Sanitise before publishing (no booking numbers, paid amounts, private phone numbers, children's names).

**Verification** — `npm run check` builds and asserts on `dist/`; add an assertion whenever you add a page or a rule.

**Integrations** — Sitemap, MDX, Pagefind (client-side search), Giscus (GitHub Discussions comments). Markdown uses Shiki with `css-variables` theme.

## Path Aliases

`@*` resolves to `./src/*` (e.g., `@components/Header.astro`, `@consts`, `@types`).

## Content Frontmatter

Blog post:
```yaml
title: "Title"
description: "Description"
date: "YYYY-MM-DD"
draft: false        # optional
tags: ["tag1"]      # optional
lang: "ja"          # optional BCP-47; zh-CN/en auto-detected when omitted
```

Project:
```yaml
title: "Title"
description: "Description"
date: "YYYY-MM-DD"
draft: false        # optional
demoURL: "https://..." # optional
repoURL: "https://..." # optional
```

## SEO / GEO conventions (added 2026-10-25)

- `site` in `astro.config.mjs` must stay `https://diaosj.info` — canonical, sitemap, og:url and JSON-LD all derive from it.
- `src/lib/seo.ts` holds the Person/WebSite JSON-LD, `blogPostingJsonld()` and `detectLang()`. `Layout.astro` accepts `lang`, `jsonld`, `ogType`, `image`; blog posts set `lang` automatically (zh-CN vs en) from their prose.
- `src/pages/llms.txt.ts` generates `/llms.txt` from the content collections; `public/robots.txt` allows AI crawlers and points at the sitemap.
- Blog slugs are English kebab-case filenames. Never reintroduce Chinese filenames. `vercel.json` carries 301s from the old Chinese slugs and the 2008–2016 Hexo permalinks (`/YYYY/MM/DD/<title>/`); add a redirect there whenever a slug changes.
- Markdown headings in posts start at `##` (the ToC component treats the shallowest level as top level). Math uses `$…$` / `$$…$$` via remark-math + KaTeX, so wrap literal dollar signs in prose in backticks or escape them as `\$`.
- Default social image is `public/og-default.png` (1200×630, rendered from a plain HTML mock with headless Chrome).
- `public/pagefind/` is a build artefact and is git-ignored; `astro-pagefind` regenerates it on `npm run build`.
