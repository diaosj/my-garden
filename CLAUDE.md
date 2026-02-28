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
