# Site Redesign v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild diaosj.info's information architecture and visual system per `docs/superpowers/specs/2026-10-25-site-redesign-v1-design.md` (narrative home, themed archive, "engineer's manuscript + Go stone" look, Life page, refreshed travel data).

**Architecture:** Astro 5 static site, Tailwind v4 (CSS-first `@theme` tokens), content collections for blog/projects, JSON data for voyages. We change tokens in `global.css`, add four small components, add two pure-TS modules (`archive.ts` grouping, `home.ts` copy), rewrite three pages, add `/life` and `/voyages/bali-2026`. URLs never change.

**Tech Stack:** Astro 5.13, Tailwind 4.1 (+typography), Geist fonts via `@fontsource`, d3-geo/topojson (existing), Node 26. No new dependencies.

## Global Constraints

- `site` stays `https://diaosj.info`; no URL changes; no new redirects.
- No italics, no serif anywhere; CJK font stack `"PingFang SC", "Hiragino Sans GB", "Noto Sans SC"`.
- Fonts loaded: Geist Sans 400/500/600, Geist Mono 400/500 — nothing else.
- Color tokens (light / dark): `--paper #f7f6f2 / #141414`, `--ink #1a1a1a / #ececec`, `--muted #6b6b66 / #9a9a94`, `--rule #e6e4dd / #2a2a2a`, `--stone #1a1a1a / #ececec`, `--stone-contrast #f7f6f2 / #141414`. No accent color.
- Go motif in exactly three places: favicon/OG, home section labels, blog group headings. Faint 19×19 grid behind home hero only.
- No cards with radius/shadow; 1px rules; mono labels `§ 01`.
- `SITE.TITLE = "Shoujun Diao"`. Footer `© {year} · Shoujun Diao · 刁寿钧`.
- Published travel content: no booking numbers, paid amounts, private phone numbers/names, home addresses, children's names.
- `src/data/*.json` filenames/schema unchanged; `Footprint` array stays inline in `footprints.astro`.
- Build must pass with 0 errors and 0 KaTeX warnings; verify with `bash scripts/check.sh`.
- Commit after every task on branch `redesign-v1`; never push without Adrian.

---

### Task 1: Verification harness

**Files:**
- Create: `scripts/check.sh`
- Modify: `package.json` (add `"check": "bash scripts/check.sh"` to `scripts`)

**Interfaces:**
- Produces: `npm run check` — builds, then asserts on `dist/`. Later tasks append assertions to this file.

- [ ] **Step 1: Write the script**

```bash
#!/usr/bin/env bash
# Build the site and assert on the output. Usage: npm run check
set -euo pipefail
cd "$(dirname "$0")/.."
LOG=$(mktemp)
npm run build > "$LOG" 2>&1 || { tail -40 "$LOG"; echo "BUILD FAILED"; exit 1; }
fail=0
check() { # check <description> <command...>
  local desc=$1; shift
  if "$@" >/dev/null 2>&1; then echo "ok   $desc"; else echo "FAIL $desc"; fail=1; fi
}
check "no KaTeX warnings"        bash -c "! grep -q 'LaTeX-incompatible' '$LOG'"
check "home canonical"           grep -q 'rel="canonical" href="https://diaosj.info/"' dist/index.html
check "sitemap present"          test -s dist/sitemap-0.xml
check "llms.txt present"         test -s dist/llms.txt
check "robots present"           test -s dist/robots.txt
check "blog posts built (>170)"  bash -c "[ \$(ls dist/blog | wc -l) -gt 170 ]"
check "zh-CN posts tagged"       grep -q '<html lang="zh-CN"' dist/blog/sorting-algorithms-summary/index.html
check "JSON-LD on home"          grep -q 'application/ld+json' dist/index.html
# --- redesign assertions are appended below by later tasks ---
exit $fail
```

- [ ] **Step 2: Register and run it**

```bash
cd /Users/diaosj/Documents/github/my-garden
python3 - <<'EOF'
import json,pathlib
p=pathlib.Path('package.json'); d=json.loads(p.read_text())
d['scripts']['check']='bash scripts/check.sh'
p.write_text(json.dumps(d,indent=2)+'\n')
EOF
chmod +x scripts/check.sh && npm run check
```
Expected: every line `ok`, exit 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/check.sh package.json && git commit -m "chore: build verification script (npm run check)"
```

---

### Task 2: Design tokens, fonts, identity

**Files:**
- Modify: `src/styles/global.css` (theme + base layers)
- Modify: `src/components/Head.astro:1-22` (font imports), favicon `<link rel="icon">`
- Modify: `src/consts.ts` (`SITE.TITLE`)
- Modify: `src/components/Footer.astro` (copyright line)
- Modify: `src/components/Header.astro` (wordmark class)
- Modify: `src/lib/seo.ts` (nothing to change — `WEBSITE_JSONLD.name` reads `SITE.TITLE`; verify)
- Modify: `scripts/check.sh` (append assertions)

**Interfaces:**
- Produces CSS utilities used by later tasks: `.t-mono` (mono, 12px, uppercase, tracking), `.t-muted` (color `--muted`), `.rule` (1px top border `--rule`), `.grid-bg` (hero grid). Colors available as Tailwind utilities `bg-paper`, `text-ink`, `text-muted`, `border-rule`, `bg-stone`, `text-stone-contrast` via `@theme`.

- [ ] **Step 1: Add failing assertions to `scripts/check.sh`** (insert above `exit $fail`)

```bash
check "title is Shoujun Diao"      grep -q '<title>Home | Shoujun Diao' dist/index.html
check "no italic utility"          bash -c "! grep -rl 'font-serif\|italic' dist --include=index.html | grep -q ."
check "only 5 font files"          bash -c "[ \$(ls dist/_astro | grep -c -E 'geist-(sans|mono).*\\.woff2') -le 10 ]"
check "favicon is svg stone"       grep -q 'rel="icon" href="/favicon.svg"' dist/index.html
check "footer has Chinese name"    grep -q '刁寿钧' dist/index.html
```
Run `npm run check` → these five FAIL.

- [ ] **Step 2: Replace the `@theme` block and base layers in `src/styles/global.css`**

Replace from `@theme {` through the end of the first `@layer utilities { … }` block (the one that ends after `article { … }`) with:

```css
@theme {
  --font-sans: "Geist Sans", ui-sans-serif, system-ui, "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Noto Sans SC", monospace;

  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-rule: var(--rule);
  --color-stone: var(--stone);
  --color-stone-contrast: var(--stone-contrast);
}

:root {
  --paper: #f7f6f2;
  --ink: #1a1a1a;
  --muted: #6b6b66;
  --rule: #e6e4dd;
  --stone: #1a1a1a;
  --stone-contrast: #f7f6f2;
}
html.dark {
  --paper: #141414;
  --ink: #ececec;
  --muted: #9a9a94;
  --rule: #2a2a2a;
  --stone: #ececec;
  --stone-contrast: #141414;
}

@layer base {
  *, ::after, ::before, ::backdrop, ::file-selector-button { border-color: var(--rule); }
  em, i { font-style: normal; }
}

@layer utilities {
  html { overflow-y: auto; color-scheme: light; scroll-padding-top: 100px; }
  html.dark { color-scheme: dark; }
  html, body { @apply size-full; }
  body { @apply font-sans antialiased flex flex-col; background: var(--paper); color: var(--ink); }
  header { @apply fixed left-0 right-0 top-0 z-50 py-6 backdrop-blur-xs; background: color-mix(in srgb, var(--paper) 80%, transparent); }
  main { @apply flex-1 py-32; }
  footer { @apply py-6 text-sm; color: var(--muted); }
  article {
    @apply prose prose-neutral max-w-full dark:prose-invert prose-img:mx-auto prose-img:my-auto;
    @apply prose-headings:font-semibold;
    color: var(--ink);
  }
  article :is(h1,h2,h3,h4) { color: var(--ink); }
  article a { @apply underline underline-offset-[3px]; color: var(--ink); text-decoration-color: var(--rule); }
  article a:hover { text-decoration-color: var(--ink); }

  /* manuscript utilities */
  .t-mono { @apply font-mono text-xs uppercase tracking-[0.18em]; }
  .t-muted { color: var(--muted); }
  .rule { border-top: 1px solid var(--rule); }
  .grid-bg {
    background-image:
      linear-gradient(to right, color-mix(in srgb, var(--rule) 55%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--rule) 55%, transparent) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }
}
```

Then in the remaining file: replace `pre { @apply border border-black/15 py-5 dark:border-white/20; }` with `pre { border: 1px solid var(--rule); padding-block: 1.25rem; border-radius: 0; }` and in `.copy-code` replace `rounded-sm border border-black/15 bg-neutral-100 … dark:border-white/20 dark:bg-neutral-900` with `border border-rule bg-paper`.

- [ ] **Step 3: Trim font imports in `src/components/Head.astro`**

Replace the 18 `@fontsource` import lines with:

```ts
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
```

Replace the `<link rel="icon" href="data:image/svg+xml,…🌱…" />` line with `<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`.

- [ ] **Step 4: Create `public/favicon.svg`** (stone; flips with system theme)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>
    .s{fill:#1a1a1a;stroke:none}
    @media (prefers-color-scheme: dark){.s{fill:#ececec}}
  </style>
  <circle class="s" cx="32" cy="32" r="26"/>
</svg>
```

- [ ] **Step 5: Identity strings**

`src/consts.ts`: `TITLE: "Shoujun Diao"`.
`src/components/Header.astro`: wordmark `<div class="font-semibold">` → `<div class="font-mono font-medium tracking-tight">`.
`src/components/Footer.astro`: `<div>&copy; {new Date().getFullYear()} • {SITE.TITLE}</div>` → `<div class="font-mono text-xs">&copy; {new Date().getFullYear()} · {SITE.TITLE} · <span lang="zh-CN">刁寿钧</span></div>`.
Also in Footer replace each theme button's `rounded-sm border border-black/15 hover:bg-black/5 … dark:…` with `border border-rule hover:bg-rule`.
`src/components/Header.astro` search button: replace `rounded-sm border border-black/15 bg-neutral-100 … dark:…` with `border border-rule bg-paper hover:bg-rule font-mono`.
`src/components/BackToPrevious.astro`: replace `rounded-sm border border-black/15 … dark:…` with `border border-rule hover:bg-rule font-mono text-xs`.
`src/pages/llms.txt.ts` first line already uses `SITE.TITLE`; `src/lib/seo.ts` `WEBSITE_JSONLD.name` already uses `SITE.TITLE` — no edit.

- [ ] **Step 6: Remove serif/italic from pages** (search `font-serif italic` → 13 hits: `ArrowCard.astro:20`, `about.astro:56,64,71,78,85`, `index.astro:29,32,88,92,96,100,104`)

Replace each `font-serif italic text-black/50 dark:text-white/50` with `font-mono text-xs t-muted`. In `index.astro:29` change `<span class="font-serif italic font-normal">(Adrian)</span>` to `<span class="font-normal t-muted">(Adrian)</span>`; in `index.astro:32` drop `font-serif italic` from the tagline `<p>`.

- [ ] **Step 7: Run check**

`npm run check` → all `ok`. Then `npm run dev` is not needed; visually confirm with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1280,1400 --screenshot=/tmp/t2.png dist/index.html >/dev/null 2>&1 || true
```
(Use `npx astro preview --port 4399 &` and `http://localhost:4399/` for a true render; kill it after.) Expect paper background, no italics.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(design): paper/ink tokens, 5 font files, stone favicon, site name Shoujun Diao"
```

---

### Task 3: Manuscript components (Stone, SectionLabel, Entry, ArchiveBadge)

**Files:**
- Create: `src/components/Stone.astro`, `src/components/SectionLabel.astro`, `src/components/Entry.astro`, `src/components/ArchiveBadge.astro`
- Modify: `src/pages/projects/index.astro:24`, `src/pages/tags/[...id].astro:40`, `src/pages/blog/index.astro:43` (swap `ArrowCard` → `Entry`)
- Delete: `src/components/ArrowCard.astro`

**Interfaces:**
- `Stone.astro` props: `size?: number` (px, default 10), `class?: string`. Renders `<span class="inline-block rounded-full bg-stone" style="width:Npx;height:Npx">`.
- `SectionLabel.astro` props: `index: string` (e.g. `"01"`), `label: string`, `stone?: boolean` (default false). Slot `right` for a trailing link. Renders a flex row with bottom rule.
- `Entry.astro` props: `href: string`, `title: string`, `description?: string`, `meta?: string` (mono right column), `lang?: string`, `external?: boolean`.
- `ArchiveBadge.astro` props: `year: number`. Renders `ARCHIVE · WRITTEN IN {year}` in `.t-mono .t-muted`.

- [ ] **Step 1: Append assertions**

```bash
check "ArrowCard removed"          bash -c "! test -f src/components/ArrowCard.astro"
check "Entry used on projects"     grep -q 'data-entry' dist/projects/index.html
```
Run `npm run check` → both FAIL.

- [ ] **Step 2: Write the components**

`src/components/Stone.astro`
```astro
---
type Props = { size?: number; class?: string };
const { size = 10, class: cls = "" } = Astro.props;
---
<span aria-hidden="true" class={`inline-block shrink-0 rounded-full bg-stone ${cls}`} style={`width:${size}px;height:${size}px`}></span>
```

`src/components/SectionLabel.astro`
```astro
---
import Stone from "@components/Stone.astro";
type Props = { index: string; label: string; stone?: boolean };
const { index, label, stone = false } = Astro.props;
---
<div class="flex items-end justify-between border-b border-rule pb-3">
  <h2 class="t-mono text-ink flex items-center gap-2">
    {stone && <Stone size={8} />}
    <span class="t-muted">§ {index}</span>
    <span>{label}</span>
  </h2>
  <div class="t-mono t-muted"><slot name="right" /></div>
</div>
```

`src/components/Entry.astro`
```astro
---
type Props = { href: string; title: string; description?: string; meta?: string; lang?: string; external?: boolean };
const { href, title, description, meta, lang, external = false } = Astro.props;
---
<a
  href={href}
  target={external ? "_blank" : undefined}
  rel={external ? "noopener" : undefined}
  data-entry
  class="group grid gap-x-8 gap-y-1 py-5 border-b border-rule sm:grid-cols-[1fr_auto] items-baseline"
>
  <div lang={lang}>
    <div class="text-ink font-medium group-hover:underline underline-offset-4 decoration-rule">{title}</div>
    {description && <div class="t-muted text-sm mt-1 leading-relaxed">{description}</div>}
  </div>
  {meta && <div class="font-mono text-xs t-muted sm:text-right whitespace-nowrap">{meta}</div>}
</a>
```

`src/components/ArchiveBadge.astro`
```astro
---
type Props = { year: number };
const { year } = Astro.props;
---
<div class="t-mono t-muted">Archive · written in {year}</div>
```

- [ ] **Step 3: Swap usages**

`src/pages/projects/index.astro`: import `Entry` instead of `ArrowCard`; render
```astro
<Entry href={`/projects/${project.id}`} title={project.data.title} description={project.data.description} meta={project.data.date.getFullYear().toString()} />
```
`src/pages/tags/[...id].astro:40`: same pattern with `href={`/blog/${post.id}`}` and `meta={post.data.date.getFullYear().toString()}`.
`src/pages/blog/index.astro:43`: same (this page is rewritten in Task 4; the swap keeps the build green now).
`git rm src/components/ArrowCard.astro`.

- [ ] **Step 4: Run check** → all `ok`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(components): Stone, SectionLabel, Entry, ArchiveBadge; drop ArrowCard"
```

---

### Task 4: Archive grouping + blog index + post badge

**Files:**
- Create: `src/lib/archive.ts`
- Rewrite: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[...id].astro` (badge under date), `src/consts.ts` (`BLOG.TITLE = "Writing"`)
- Modify: `src/content/blog/welcome.md` (`draft: true`)

**Interfaces:**
- `archive.ts` exports:
  ```ts
  export type GroupId = "infra" | "backend" | "cycling" | "reading" | "football" | "essays";
  export type Group = { id: GroupId; label: string; intro: string };
  export const GROUPS: Group[];                         // ordered as the spec
  export const ARCHIVE_CUTOFF: Date;                    // 2020-01-01
  export function groupOf(post: { data: { date: Date; tags?: string[] } }): GroupId;
  export function groupPosts<T extends { data: { date: Date; tags?: string[] } }>(posts: T[]): Map<GroupId, T[]>; // every GroupId present, posts sorted date desc
  export function isArchive(date: Date): boolean;
  ```

- [ ] **Step 1: Append assertions**

```bash
check "blog grouped: cycling anchor"   grep -q 'id="cycling"' dist/blog/index.html
check "blog grouped: 6 groups"         bash -c "[ \$(grep -o 'data-group=' dist/blog/index.html | wc -l) -eq 6 ]"
check "archive badge on 2014 post"     grep -q 'written in 2014' dist/blog/sorting-algorithms-summary/index.html
check "welcome post not built"         bash -c "! test -d dist/blog/welcome"
check "blog title Writing"             grep -q '<title>Writing | Shoujun Diao' dist/blog/index.html
```
Run → FAIL.

- [ ] **Step 2: Write `src/lib/archive.ts`**

```ts
export type GroupId = "infra" | "backend" | "cycling" | "reading" | "football" | "essays";
export type Group = { id: GroupId; label: string; intro: string };

export const ARCHIVE_CUTOFF = new Date("2020-01-01T00:00:00Z");
export const isArchive = (date: Date) => date < ARCHIVE_CUTOFF;

export const GROUPS: Group[] = [
  { id: "infra",    label: "Infra",                    intro: "Inference serving, gateways, GPUs and cost — what I work on now." },
  { id: "backend",  label: "Backend Notes 2011–2016",  intro: "Source-code reading, MySQL, PHP/Lua/JS notes from my first decade as an engineer." },
  { id: "cycling",  label: "骑行 2010",                 intro: "Twenty days on a bicycle from Shanghai to Xi'an, written on the road." },
  { id: "reading",  label: "读书与围棋",                intro: "Books, and the game I have played since I was a kid." },
  { id: "football", label: "足球",                      intro: "Inter, derbies, and the long habit of staying up for Serie A." },
  { id: "essays",   label: "随笔",                      intro: "Everything else from my twenties: food, cities, people." },
];

const TECH_TAGS = new Set(["AWS","Bottle","C","C++","CSS","Celery","CodeIgniter","Django","FastDFS","Flask","Gevent","Git","HTTP","Infobright","JavaScript","Laravel","Linux","Lua","MongoDB","MySQL","Nginx","NumPy","PHP","Perl","Python","Recommendation","Redis","SVN","TokuDB","Tornado","Twisted","Web.py","Yaf","Yii","Zend","jQuery","数据结构","算法","数据挖掘","社交网络","数学"]);

type PostLike = { data: { date: Date; tags?: string[] } };

export function groupOf(post: PostLike): GroupId {
  const tags = new Set(post.data.tags ?? []);
  if (!isArchive(post.data.date)) return "infra";
  if (tags.has("单车")) return "cycling";
  if (tags.has("乱翻书") || tags.has("围棋")) return "reading";
  if (tags.has("足球")) return "football";
  for (const t of tags) if (TECH_TAGS.has(t)) return "backend";
  return "essays";
}

export function groupPosts<T extends PostLike>(posts: T[]): Map<GroupId, T[]> {
  const m = new Map<GroupId, T[]>(GROUPS.map((g) => [g.id, [] as T[]]));
  for (const p of posts) m.get(groupOf(p))!.push(p);
  for (const list of m.values()) list.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return m;
}
```

- [ ] **Step 3: Rewrite `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import Layout from "@layouts/Layout.astro";
import Container from "@components/Container.astro";
import Entry from "@components/Entry.astro";
import Stone from "@components/Stone.astro";
import { BLOG } from "@consts";
import { GROUPS, groupPosts } from "@lib/archive";
import { detectLang } from "@lib/seo";

const posts = (await getCollection("blog")).filter((p) => !p.data.draft);
const grouped = groupPosts(posts);
---

<Layout title={BLOG.TITLE} description={BLOG.DESCRIPTION}>
  <Container>
    <h1 class="animate font-mono font-medium text-ink text-xl">Writing</h1>
    <p class="animate t-muted mt-2 max-w-prose">{BLOG.DESCRIPTION}</p>
    <div class="mt-12 space-y-16">
      {GROUPS.map((g, i) => {
        const list = grouped.get(g.id) ?? [];
        return (
          <section id={g.id} data-group={g.id} class="animate scroll-mt-28">
            <div class="grid gap-x-8 gap-y-2 border-b border-rule pb-3 sm:grid-cols-[1fr_auto] items-end">
              <h2 class="flex items-center gap-2 text-ink font-medium">
                <Stone size={8} />
                <span>{g.label}</span>
                <span class="font-mono text-xs t-muted">{String(i + 1).padStart(2, "0")} · {list.length}</span>
              </h2>
              <p class="t-muted text-sm sm:text-right">{g.intro}</p>
            </div>
            {list.length === 0 ? (
              <p class="t-mono t-muted py-5">in progress</p>
            ) : (
              list.map((post) => (
                <Entry
                  href={`/blog/${post.id}/`}
                  title={post.data.title}
                  description={post.data.description}
                  meta={post.data.date.getFullYear().toString()}
                  lang={post.data.lang ?? detectLang(post.data.title)}
                />
              ))
            )}
          </section>
        );
      })}
    </div>
  </Container>
</Layout>
```

`src/consts.ts`: `BLOG = { TITLE: "Writing", DESCRIPTION: "Notes on infrastructure, and an archive of a younger me — code, roads, books and football, 2008–2016." }`.

- [ ] **Step 4: Badge on posts, welcome → draft**

`src/pages/blog/[...id].astro`: add `import ArchiveBadge from "@components/ArchiveBadge.astro"; import { isArchive } from "@lib/archive";` and directly after the `<h1 …>{post.data.title}</h1>` insert
```astro
{isArchive(post.data.date) && <div class="animate pt-1"><ArchiveBadge year={post.data.date.getFullYear()} /></div>}
```
Also change the `BackToPrevious` text to `Writing`.
`src/content/blog/welcome.md`: add `draft: true` to frontmatter.

- [ ] **Step 5: Run check** → all `ok`. Spot check: `grep -c 'data-entry' dist/blog/index.html` ≥ 170.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(writing): archive grouped by theme, archive badge on old posts, welcome post retired"
```

---

### Task 5: Home page rebuild + home copy data + Token demos as projects

**Files:**
- Create: `src/data/home.ts`
- Create: `src/content/projects/token-console-demo.md`, `src/content/projects/token-portal-demo.md`
- Rewrite: `src/pages/index.astro`
- Modify: `src/consts.ts` (`HOME.DESCRIPTION` unchanged; `PROJECTS.TITLE = "Work"`)

**Interfaces:**
- `home.ts` exports `HERO_LINE: string`, `NOW: string[]`, `WRITING_IN_PROGRESS: { title: string; summary: string }[]`, `BEYOND_LEAD: string`, `BEYOND: { title: string; meta: string }[]`.
- Consumes `GROUPS`, `groupPosts`, `isArchive` from `@lib/archive`; `SectionLabel`, `Entry`, `Stone`.

- [ ] **Step 1: Append assertions**

```bash
check "home has 5 sections"        bash -c "[ \$(grep -o '§ 0[1-5]' dist/index.html | sort -u | wc -l) -eq 5 ]"
check "home writing in progress"   grep -q 'in progress' dist/index.html
check "home work lists token demo" grep -q 'token-console-demo' dist/index.html
check "home archive links"         grep -q 'href="/blog#cycling"' dist/index.html
check "hero grid present"          grep -q 'grid-bg' dist/index.html
```
Run → FAIL.

- [ ] **Step 2: Write `src/data/home.ts`** (Adrian edits wording later; keep these as the draft)

```ts
export const HERO_LINE = "I build the inference infrastructure behind generative-AI products.";

export const NOW = [
  "At Lovart I own the serving layer for image, video and LLM generation: model gateways, multi-vendor routing, and the cost and reliability work that keeps a global product up when a model provider isn't.",
  "Before that I spent seven years at Tencent, where I architected Tencent Cloud's unified AI platform from zero and scaled its gateways through the first LLM traffic surge.",
  "I think about inference the way I once thought about Go: position first, then tempo. Most of what I write here is about that.",
];

export const WRITING_IN_PROGRESS = [
  { title: "A model gateway is a routing problem, not a proxy", summary: "How we route one API across four vendors by cost, quota and health, and what broke." },
  { title: "Burn-down: a cost model for inference", summary: "Turning GPU hours, token prices and failure rates into one number a team can argue with." },
  { title: "Leaving one cloud: notes from a multi-cloud migration", summary: "What to move first, what never to move, and the DNS mistake I'd avoid next time." },
];

export const BEYOND_LEAD = "The rest of me: I talk, translate, organise, and play Go.";

export const BEYOND = [
  { title: "Speaker, Apache APISIX Meetup", meta: "High-performance gateways" },
  { title: "Co-translator, Problem Solving with Algorithms and Data Structures Using Python", meta: "Posts & Telecom Press · 2019" },
  { title: "Translator, Practical Data Analysis", meta: "China Machine Press · 2018" },
  { title: "Led the Tencent Football Association", meta: "200+ members" },
  { title: "Volunteer Go (weiqi) instructor", meta: "Children of migrant workers, Shanghai" },
];
```

- [ ] **Step 3: Add the two Token demo projects**

`src/content/projects/token-console-demo.md`
```md
---
title: "Token Ops Console (demo)"
description: "Operator's view of an LLM token-reselling platform: margins, channel health, reconciliation, to-dos."
date: "2026-08-30"
demoURL: "https://diaosj.info/token-console-demo/"
---

Built as a technical advisor for a friend's token-platform startup. Dark-themed operator console: gross margin by channel, a health wall for upstream vendors, reconciliation views and an ops to-do list. Static demo, no backend.
```
`src/content/projects/token-portal-demo.md`
```md
---
title: "Tenant Portal (demo)"
description: "Customer-facing console modelled on OpenRouter: activity, model catalogue, keys, billing, routing preferences, guardrails."
date: "2026-08-29"
demoURL: "https://diaosj.info/token-portal-demo/"
---

The tenant side of the same platform: activity and spend, model catalogue with blended ¥/M pricing, API keys with policies and expiry, routing preferences, guardrails and observability pages. Static demo, no backend.
```
`src/consts.ts`: `PROJECTS.TITLE = "Work"`, `PROJECTS.DESCRIPTION = "Demos and tools I built, mostly to explain something."`

- [ ] **Step 4: Rewrite `src/pages/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import Container from "@components/Container.astro";
import PageLayout from "@layouts/Layout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Entry from "@components/Entry.astro";
import Link from "@components/Link.astro";
import { HOME } from "@consts";
import { graph, PERSON_JSONLD, WEBSITE_JSONLD } from "@lib/seo";
import { GROUPS, groupPosts } from "@lib/archive";
import { HERO_LINE, NOW, WRITING_IN_PROGRESS, BEYOND_LEAD, BEYOND } from "@data/home";

const jsonld = graph(PERSON_JSONLD, WEBSITE_JSONLD);

const posts = (await getCollection("blog")).filter((p) => !p.data.draft);
const grouped = groupPosts(posts);
const recent = (grouped.get("infra") ?? []).slice(0, 3);

const projects = (await getCollection("projects"))
  .filter((p) => !p.data.draft)
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 4);
---

<PageLayout title={HOME.TITLE} description={HOME.DESCRIPTION} jsonld={jsonld}>
  <Container>
    <div class="space-y-24">
      <section class="animate relative flex flex-col items-start py-16 sm:py-24">
        <div class="grid-bg absolute inset-0 -z-10" aria-hidden="true"></div>
        <h1 class="font-semibold text-ink text-4xl sm:text-5xl tracking-tight">
          Shoujun <span class="font-normal t-muted">(Adrian)</span> Diao
        </h1>
        <p class="mt-3 font-mono text-sm tracking-[0.3em] t-muted" lang="zh-CN">刁寿钧</p>
        <p class="mt-8 max-w-xl text-lg leading-relaxed text-ink">{HERO_LINE}</p>
        <div class="mt-6 font-mono text-xs"><Link href="/about">About, and how to reach me ↗</Link></div>
      </section>

      <section class="animate space-y-6">
        <SectionLabel index="01" label="Now" stone />
        <div class="space-y-4 max-w-prose text-ink leading-relaxed">
          {NOW.map((p) => <p>{p}</p>)}
        </div>
      </section>

      <section class="animate space-y-2">
        <SectionLabel index="02" label="Writing" stone>
          <Link slot="right" href="/blog">All writing</Link>
        </SectionLabel>
        {recent.length > 0
          ? recent.map((post) => (
              <Entry href={`/blog/${post.id}/`} title={post.data.title} description={post.data.description} meta={post.data.date.toISOString().slice(0, 10)} />
            ))
          : WRITING_IN_PROGRESS.map((t) => (
              <div class="grid gap-x-8 gap-y-1 py-5 border-b border-rule sm:grid-cols-[1fr_auto] items-baseline">
                <div>
                  <div class="text-ink font-medium">{t.title}</div>
                  <div class="t-muted text-sm mt-1">{t.summary}</div>
                </div>
                <div class="font-mono text-xs t-muted sm:text-right">in progress</div>
              </div>
            ))}
      </section>

      <section class="animate space-y-2">
        <SectionLabel index="03" label="Work" stone>
          <Link slot="right" href="/projects">All work</Link>
        </SectionLabel>
        {projects.map((p) => (
          <Entry href={p.data.demoURL ?? `/projects/${p.id}/`} external={!!p.data.demoURL} title={p.data.title} description={p.data.description} meta={p.data.date.getFullYear().toString()} />
        ))}
      </section>

      <section class="animate space-y-2">
        <SectionLabel index="04" label="Archive" stone>
          <span slot="right">2008 – 2016</span>
        </SectionLabel>
        {GROUPS.filter((g) => g.id !== "infra").map((g) => (
          <Entry href={`/blog#${g.id}`} title={g.label} description={g.intro} meta={`${(grouped.get(g.id) ?? []).length} posts`} />
        ))}
      </section>

      <section class="animate space-y-2">
        <SectionLabel index="05" label="Beyond" stone />
        <p class="t-muted py-4 max-w-prose">{BEYOND_LEAD}</p>
        {BEYOND.map((b) => (
          <div class="grid gap-x-8 gap-y-1 py-4 border-b border-rule sm:grid-cols-[1fr_auto] items-baseline">
            <div class="text-ink">{b.title}</div>
            <div class="font-mono text-xs t-muted sm:text-right">{b.meta}</div>
          </div>
        ))}
      </section>
    </div>
  </Container>
</PageLayout>
```

Note `Link.astro` must accept a `slot` attribute — Astro passes `slot` through on components, no change needed. If `Link` renders `external` arrows, keep defaults.

- [ ] **Step 5: Run check** → all `ok`. Preview the home page in headless Chrome at 1280 and confirm: grid only behind hero, five labelled sections, no italics.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(home): narrative home — now / writing / work / archive / beyond; token demos as projects"
```

---

### Task 6: Navigation, Life page, voyages reskin

**Files:**
- Modify: `src/components/Header.astro` (nav items)
- Create: `src/pages/life.astro`
- Modify: `src/pages/voyages/index.astro` (remove rounded cards → `Entry`), `src/consts.ts` (add `LIFE`), `src/types.ts` (none)
- Modify: `src/pages/footprints.astro` (heading copy only), `scripts/check.sh`

**Interfaces:**
- `consts.ts` adds `export const LIFE: Metadata = { TITLE: "Life", DESCRIPTION: "…" }`.
- `/life` links to `/voyages` and `/footprints`; shows `NEXT` row and the Japan prefecture stat (both hard-coded strings in `src/data/home.ts` as `LIFE_LEAD`, `LIFE_NEXT: string[]`, `LIFE_STATS: { label: string; value: string }[]`).

- [ ] **Step 1: Append assertions**

```bash
check "nav has four items"         bash -c "grep -o 'href=\"/\(blog\|projects\|about\|life\)\"' dist/index.html | sort -u | wc -l | grep -q 4"
check "life page built"            test -s dist/life/index.html
check "life has Next row"          grep -q 'Nagaoka' dist/life/index.html
check "voyages no rounded cards"   bash -c "! grep -q 'rounded-lg' dist/voyages/index.html"
```
Run → FAIL.

- [ ] **Step 2: Nav**

In `src/components/Header.astro` replace the five `<Link>`+`/` separators with:
```astro
<Link href="/blog">Writing</Link><span>/</span>
<Link href="/projects">Work</Link><span>/</span>
<Link href="/about">About</Link><span>/</span>
<Link href="/life">Life</Link><span>/</span>
```
and add `font-mono text-xs` to the `<nav>` class list.

- [ ] **Step 3: Data + consts**

Append to `src/data/home.ts`:
```ts
export const LIFE_LEAD = "Somewhere in 2026 I started travelling on purpose instead of by accident. This is where I keep the plans and the map.";
export const LIFE_NEXT = ["Spain (2027)", "Nagaoka fireworks, Japan (2027)", "USA West Coast (2028)"];
export const LIFE_STATS = [{ label: "Japan", value: "28 / 47 prefectures" }];
```
`src/consts.ts`: add `export const LIFE: Metadata = { TITLE: "Life", DESCRIPTION: "Voyages, a map of footprints, and what's next." };` and change `VOYAGES.DESCRIPTION` to `"Itineraries, written before leaving."`.

- [ ] **Step 4: Create `src/pages/life.astro`**

```astro
---
import Container from "@components/Container.astro";
import PageLayout from "@layouts/Layout.astro";
import SectionLabel from "@components/SectionLabel.astro";
import Entry from "@components/Entry.astro";
import { LIFE } from "@consts";
import { LIFE_LEAD, LIFE_NEXT, LIFE_STATS } from "@data/home";
import kyushu from "@data/kyushu-2026.json";
import sendai from "@data/sendai-2026.json";
const tripCount = [kyushu, sendai].length;
---

<PageLayout title={LIFE.TITLE} description={LIFE.DESCRIPTION}>
  <Container>
    <h1 class="animate font-mono font-medium text-ink text-xl">Life</h1>
    <p class="animate t-muted mt-2 max-w-prose">{LIFE_LEAD}</p>

    <div class="mt-12 space-y-16">
      <section class="animate space-y-2">
        <SectionLabel index="01" label="Places" />
        <Entry href="/voyages" title="Voyages" description="Day-by-day itineraries with maps, written before each trip." meta={`${tripCount} trips`} />
        <Entry href="/footprints" title="Atlas" description="Every city I have slept in, on a globe." meta={LIFE_STATS.map((s) => `${s.label} ${s.value}`).join(" · ")} />
      </section>

      <section class="animate space-y-2">
        <SectionLabel index="02" label="Next" />
        <ul class="py-4 space-y-2 font-mono text-sm text-ink">
          {LIFE_NEXT.map((n) => <li class="flex items-center gap-3"><span class="t-muted">→</span>{n}</li>)}
        </ul>
      </section>
    </div>
  </Container>
</PageLayout>
```
(Task 8 bumps `tripCount` to include Bali by importing `bali-2026.json`.)

- [ ] **Step 5: Voyages index with `Entry`**

Replace the `trips.map(...)` block in `src/pages/voyages/index.astro` with:
```astro
<div class="animate mt-8">
  {trips.map((trip) => (
    <Entry href={`/voyages/${trip.slug}`} title={`${trip.emoji} ${trip.data.title}`} description={trip.data.region} meta={`${trip.data.startDate} → ${trip.data.endDate}`} />
  ))}
</div>
```
and import `Entry`. Change the `<h1>` class to `font-mono font-medium text-ink text-xl`.
`src/pages/footprints.astro`: replace the lead paragraph text `Coding locally, deploying globally. <br> A map of the cities and countries I've explored.` with `Every city I have slept in. Drag the globe; filter by year.` and the `<h1>` class to `font-mono font-medium text-ink text-xl`.

- [ ] **Step 6: Run check** → all `ok`. Open `/life`, `/voyages`, `/footprints` in preview; the globe must still render (WebGL untouched).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(life): Life page with Next row and stats; four-item nav; voyages list without cards"
```

---

### Task 7: About rewrite

**Files:**
- Rewrite: `src/pages/about.astro` (keep JSON-LD block, Chinese line, Connect section, timeline data)

**Interfaces:** consumes `SectionLabel`, `ABOUT`, `SITE`, `SOCIALS`, `graph/PERSON_JSONLD/WEBSITE_JSONLD`.

- [ ] **Step 1: Append assertions**

```bash
check "about opens with AlphaGo"   grep -q 'AlphaGo' dist/about/index.html
check "about has no adjectives"    bash -c "! grep -qiE 'flawlessly|spearheaded|massive-scale|explosive' dist/about/index.html"
```
Run → second FAILs (first may pass already).

- [ ] **Step 2: Replace the body of `about.astro`** (everything inside `<Container>`; keep the frontmatter from the current file)

```astro
<Container>
  <h1 class="animate font-mono font-medium text-ink text-xl mb-2">About</h1>
  <p class="animate mb-10 text-sm t-muted" lang="zh-CN">刁寿钧，AI 基础设施架构师，现任 Lovart 架构师，前腾讯云 AI 平台架构师；业余围棋五段，技术图书译者。</p>

  <div class="space-y-16">
    <section class="animate space-y-4 max-w-prose text-ink leading-relaxed">
      <p>In March 2016 I watched AlphaGo play Lee Sedol the way an amateur 5-dan watches anything: counting, and expecting to be able to follow. By game two I couldn't. Move 37 wasn't a move I would have rejected — it was one I would never have considered. I had been a backend engineer for eight years. That week I decided the thing that beat me was the thing I wanted to build.</p>
      <p>I taught myself deep reinforcement learning, gave a seminar on it to my team, and spent the next seven years at Tencent turning that interest into infrastructure: the unified AI platform of Tencent Cloud, built from nothing, and the gateways that carried it through the first wave of LLM traffic. Today I do the same job at Lovart for generative media: routing, serving and paying for models so a global product stays up.</p>
      <p>I like systems that are honest about their limits, people who explain things plainly, and games where the position tells you what to do next.</p>
    </section>

    <section class="animate space-y-2">
      <SectionLabel index="01" label="Path" />
      {[
        { role: "Architect", org: "Lovart", years: "2025 — now", note: "Inference serving, model gateways, multi-cloud GPU and cost for image, video and LLM generation." },
        { role: "Staff Engineer, AI Platform Architect", org: "Tencent", years: "2018 — 2025", note: "Tencent Cloud's unified AI platform from zero; cloud-native gateways that absorbed a 100× traffic rise during the LLM boom." },
        { role: "Senior Backend Engineer", org: "Tencent", years: "2016 — 2018", note: "Microservices refactor of the brand-advertising system." },
        { role: "Senior Engineer", org: "Bilibili", years: "2016", note: "Core backend for creators during the move to microservices." },
        { role: "Backend Developer", org: "Adways (Nint)", years: "2012 — 2015", note: "Early engineer on an e-commerce analytics product, built from scratch." },
      ].map((e) => (
        <div class="grid gap-x-8 gap-y-1 py-5 border-b border-rule sm:grid-cols-[1fr_auto] items-baseline">
          <div>
            <div class="text-ink"><span class="font-medium">{e.role}</span>, {e.org}</div>
            <div class="t-muted text-sm mt-1">{e.note}</div>
          </div>
          <div class="font-mono text-xs t-muted sm:text-right whitespace-nowrap">{e.years}</div>
        </div>
      ))}
    </section>

    <section class="animate space-y-2">
      <SectionLabel index="02" label="Beyond" />
      <p class="t-muted py-4 max-w-prose">I have spoken at the Apache APISIX Meetup on high-performance gateways, translated two technical books into Chinese, run a 200-person football association at Tencent, and taught Go to children of migrant workers in Shanghai. I am learning Japanese and Spanish, slowly and out loud.</p>
    </section>

    <section class="animate space-y-2">
      <SectionLabel index="03" label="Connect" />
      <div class="flex flex-wrap gap-x-6 gap-y-2 py-4 font-mono text-sm">
        <Link href="https://github.com/diaosj" external>github</Link>
        <Link href="https://www.linkedin.com/in/shoujun-diao/" external>linkedin</Link>
        <Link href="https://x.com/diaosj" external>x</Link>
        <Link href={`mailto:${SITE.EMAIL}`}>email</Link>
      </div>
    </section>
  </div>
</Container>
```
Add `import SectionLabel from "@components/SectionLabel.astro";` to the frontmatter. Leave a comment at the top of the first `<section>`: `<!-- Copy draft by Claude 2026-10-25; Adrian to edit before merge. -->`.

- [ ] **Step 3: Run check** → all `ok`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(about): first-person narrative, timeline without adjectives"
```

---

### Task 8: Travel data — refresh itineraries, add footprints, add Bali voyage

**Files:**
- Modify (copy): `src/data/sendai-2026.json`, `src/data/kyushu-2026.json` ← from `~/Documents/travel/travel-poc/src/data/`
- Create (in travel-poc first): `~/Documents/travel/travel-poc/src/data/bali-2026.json`; then copy to `src/data/bali-2026.json`
- Create: `src/pages/voyages/bali-2026.astro` (copy of `sendai-2026.astro`)
- Modify: `src/pages/voyages/index.astro` (third trip), `src/pages/life.astro` (`tripCount`), `src/pages/footprints.astro:88` (append footprints)

**Interfaces:** `bali-2026.json` schema identical to `sendai-2026.json`: `{ title, startDate, endDate, region, days: [{ date, dayIndex, weekday, title, theme, color, stops: [{ id, name, nameJa?, coordinate:{lng,lat}, time, description, type, icon }], legs: [{ from, to, transport, duration, note }] }] }`.

- [ ] **Step 1: Append assertions**

```bash
check "bali voyage built"          test -s dist/voyages/bali-2026/index.html
check "voyages lists 3 trips"      bash -c "[ \$(grep -o 'href=\"/voyages/[a-z]*-2026\"' dist/voyages/index.html | sort -u | wc -l) -eq 3 ]"
check "footprints: Nagasaki 2026"  grep -q 'Nagasaki' dist/footprints/index.html
check "footprints: Ubud 2026"      grep -q 'Ubud' dist/footprints/index.html
check "bali json sanitised"        bash -c "! grep -qE '1128150492952579|92064064|858 5211|Milky' src/data/bali-2026.json"
```
Run → FAIL.

- [ ] **Step 2: Refresh the two itineraries**

```bash
cp ~/Documents/travel/travel-poc/src/data/sendai-2026.json src/data/sendai-2026.json
cp ~/Documents/travel/travel-poc/src/data/kyushu-2026.json src/data/kyushu-2026.json
git diff --stat src/data
```

- [ ] **Step 3: Write `bali-2026.json` in travel-poc** (then copy). Coordinates: PVG T2 31.1443,121.8083 · DPS 8.7482S,115.1672 · AYANA Jimbaran 8.7867S,115.1431 · Rock Bar 8.7896S,115.1414 · Sumizen (AYANA) 8.7864S,115.1437 · GWK 8.8102S,115.1676 · The Laguna Nusa Dua 8.7993S,115.2317 · Mengiat Beach 8.8046S,115.2329 · Tegenungan 8.5903S,115.2886 · Tegalalang 8.4315S,115.2790 · Ubud Palace 8.5064S,115.2625 · Saraswati 8.5058S,115.2617. Day colours reuse `#22c55e #ef4444 #eab308 #3b82f6 #a855f7`.

```json
{
  "title": "巴厘岛 2026 国庆",
  "startDate": "2026-10-01",
  "endDate": "2026-10-05",
  "region": "Bali, Indonesia",
  "days": [
    { "date": "2026-10-01", "dayIndex": 1, "weekday": "周四", "title": "上海 → 登巴萨 → 金巴兰", "theme": "出征与安营", "color": "#22c55e",
      "stops": [
        { "id": "pvg", "name": "上海浦东T2", "coordinate": { "lng": 121.8083, "lat": 31.1443 }, "time": "09:30", "description": "吉祥航空 HO1355 起飞，6h20m", "type": "transport", "icon": "plane-departure" },
        { "id": "dps", "name": "登巴萨 Ngurah Rai 机场", "coordinate": { "lng": 115.1672, "lat": -8.7482 }, "time": "15:50", "description": "e-VOA + All Indonesia 入境卡 + Love Bali 旅游税，三码分开扫", "type": "transport", "icon": "plane-arrival" },
        { "id": "ayana", "name": "AYANA Resort 金巴兰", "coordinate": { "lng": 115.1431, "lat": -8.7867 }, "time": "17:00", "description": "酒店接机 20min；两晚", "type": "hotel", "icon": "hotel" },
        { "id": "rockbar1", "name": "Rock Bar", "coordinate": { "lng": 115.1414, "lat": -8.7896 }, "time": "19:30", "description": "崖边夜景场，听海", "type": "sight", "icon": "sunset" }
      ],
      "legs": [
        { "from": "pvg", "to": "dps", "transport": "HO1355", "duration": "6h20m", "note": "" },
        { "from": "dps", "to": "ayana", "transport": "酒店接机", "duration": "20min", "note": "" },
        { "from": "ayana", "to": "rockbar1", "transport": "园区内", "duration": "5min", "note": "" }
      ] },
    { "date": "2026-10-02", "dayIndex": 2, "weekday": "周五", "title": "羽毛球 + Rock Bar 日落", "theme": "各玩各的一天", "color": "#ef4444",
      "stops": [
        { "id": "jbc", "name": "Jimbaran Badminton Club", "coordinate": { "lng": 115.1660, "lat": -8.7955 }, "time": "09:00", "description": "两小时球课，当地教练", "type": "activity", "icon": "activity" },
        { "id": "sumizen", "name": "Sumizen（AYANA 园区日料）", "coordinate": { "lng": 115.1437, "lat": -8.7864 }, "time": "12:00", "description": "全家会合午饭", "type": "food", "icon": "restaurant" },
        { "id": "ocean", "name": "Ocean Adventure（园区海上活动）", "coordinate": { "lng": 115.1420, "lat": -8.7880 }, "time": "14:00", "description": "娃主场", "type": "activity", "icon": "activity" },
        { "id": "rockbar2", "name": "Rock Bar 日落场", "coordinate": { "lng": 115.1414, "lat": -8.7896 }, "time": "16:30", "description": "日落约 18:15", "type": "sight", "icon": "sunset" },
        { "id": "karang", "name": "Karang（园区餐厅）", "coordinate": { "lng": 115.1430, "lat": -8.7870 }, "time": "19:00", "description": "晚饭", "type": "food", "icon": "restaurant" }
      ],
      "legs": [
        { "from": "jbc", "to": "sumizen", "transport": "Grab", "duration": "15min", "note": "" }
      ] },
    { "date": "2026-10-03", "dayIndex": 3, "weekday": "周六", "title": "GWK + 搬家到努沙杜瓦", "theme": "全程唯一一次搬家", "color": "#eab308",
      "stops": [
        { "id": "gwk", "name": "GWK 神鹰广场", "coordinate": { "lng": 115.1676, "lat": -8.8102 }, "time": "09:00", "description": "121m 毗湿奴像，10:00 巴厘舞；门票约 IDR 125k", "type": "sight", "icon": "landmark" },
        { "id": "laguna", "name": "The Laguna 努沙杜瓦", "coordinate": { "lng": 115.2317, "lat": -8.7993 }, "time": "13:00", "description": "泻湖泳池房；两晚", "type": "hotel", "icon": "hotel" },
        { "id": "mengiat", "name": "Mengiat 公共海滩", "coordinate": { "lng": 115.2329, "lat": -8.8046 }, "time": "17:00", "description": "沿沙滩往南，碰沙滩足球", "type": "sight", "icon": "beach" }
      ],
      "legs": [
        { "from": "gwk", "to": "laguna", "transport": "酒店车 / Grab", "duration": "30min", "note": "" },
        { "from": "laguna", "to": "mengiat", "transport": "步行", "duration": "15min", "note": "" }
      ] },
    { "date": "2026-10-04", "dayIndex": 4, "weekday": "周日", "title": "乌布一日", "theme": "瀑布 · 梯田 · 王宫", "color": "#3b82f6",
      "stops": [
        { "id": "tegenungan", "name": "Tegenungan 瀑布", "coordinate": { "lng": 115.2886, "lat": -8.5903 }, "time": "09:15", "description": "台阶下到潭边，溯溪鞋", "type": "sight", "icon": "water" },
        { "id": "tegalalang", "name": "Tegalalang 梯田", "coordinate": { "lng": 115.2790, "lat": -8.4315 }, "time": "10:45", "description": "咖啡馆坐着看；秋千不上", "type": "sight", "icon": "landscape" },
        { "id": "ubud", "name": "Ubud Palace · 市集 · Saraswati 莲花池", "coordinate": { "lng": 115.2625, "lat": -8.5064 }, "time": "13:15", "description": "三处相邻步行 1.5h；猴林跳过", "type": "sight", "icon": "landmark" },
        { "id": "laguna2", "name": "The Laguna 努沙杜瓦", "coordinate": { "lng": 115.2317, "lat": -8.7993 }, "time": "17:00", "description": "泳池收尾", "type": "hotel", "icon": "hotel" }
      ],
      "legs": [
        { "from": "tegenungan", "to": "tegalalang", "transport": "包车", "duration": "30min", "note": "" },
        { "from": "tegalalang", "to": "ubud", "transport": "包车", "duration": "30min", "note": "" },
        { "from": "ubud", "to": "laguna2", "transport": "包车", "duration": "1h30m", "note": "周日下午回程堵，15:30 前上车" }
      ] },
    { "date": "2026-10-05", "dayIndex": 5, "weekday": "周一", "title": "收官回程", "theme": "最后一泡", "color": "#a855f7",
      "stops": [
        { "id": "dps2", "name": "登巴萨 Ngurah Rai 机场", "coordinate": { "lng": 115.1672, "lat": -8.7482 }, "time": "13:25", "description": "提前 3.5h 到", "type": "transport", "icon": "plane-departure" },
        { "id": "pvg2", "name": "上海浦东T2", "coordinate": { "lng": 121.8083, "lat": 31.1443 }, "time": "23:10", "description": "HO1356 落地", "type": "transport", "icon": "plane-arrival" }
      ],
      "legs": [
        { "from": "dps2", "to": "pvg2", "transport": "HO1356", "duration": "6h20m", "note": "" }
      ] }
  ]
}
```
Write it with `cat > ~/Documents/travel/travel-poc/src/data/bali-2026.json <<'EOF' … EOF`, validate `python3 -c "import json;json.load(open(...))"`, then `cp` into `src/data/`. Commit in travel-poc too (`git -C ~/Documents/travel/travel-poc add src/data/bali-2026.json && git -C ~/Documents/travel/travel-poc commit -m "data: bali-2026 itinerary json (site copy)"`), if that repo is git-tracked; otherwise skip.

- [ ] **Step 4: Bali page + index + life count**

```bash
cp src/pages/voyages/sendai-2026.astro src/pages/voyages/bali-2026.astro
```
In the new file: `import rawData from "@data/bali-2026.json";` and change the map filter comment+predicate to
```ts
// Filter to Bali only (exclude Shanghai at lng ~121)
const ks = stops.filter((s) => s.coordinate.lng >= 114 && s.coordinate.lng <= 116);
```
Any other `sendai`/`仙台` literal in the file: replace with the Bali equivalents (`grep -n -i 'sendai\|仙台' src/pages/voyages/bali-2026.astro` must return nothing).
`src/pages/voyages/index.astro`: `import bali from "@data/bali-2026.json";` and prepend `{ slug: "bali-2026", data: bali, emoji: "\u{1F334}" }` to `trips`.
`src/pages/life.astro`: `import bali from "@data/bali-2026.json";` and `const tripCount = [bali, kyushu, sendai].length;`.

- [ ] **Step 5: Footprints** — insert after `footprints.astro:88` (the Nagoya line):

```ts
    { city: "Fukuoka",   country: "Japan", lat: 33.5902, lng: 130.4017, year: 2026, description: "Gateway to Kyushu, again" },
    { city: "Karatsu",   country: "Japan", lat: 33.4470, lng: 129.9690, year: 2026, description: "Castle at night under cherry blossom" },
    { city: "Hirado",    country: "Japan", lat: 33.3680, lng: 129.5570, year: 2026, description: "Westernmost station, Dutch trading post" },
    { city: "Sasebo",    country: "Japan", lat: 33.1640, lng: 129.7260, year: 2026, description: "Harbour town, one night" },
    { city: "Nagasaki",  country: "Japan", lat: 32.7530, lng: 129.8690, year: 2026, description: "Peace museum, Sofukuji, Chinatown" },
    { city: "Dazaifu",   country: "Japan", lat: 33.5200, lng: 130.5340, year: 2026, description: "Tenmangu shrine on the way home" },
    { city: "Sendai",    country: "Japan", lat: 38.2600, lng: 140.8820, year: 2026, description: "Tanabata fireworks, four nights" },
    { city: "Yamagata",  country: "Japan", lat: 38.3150, lng: 140.4350, year: 2026, description: "Yamadera's thousand steps" },
    { city: "Hanamaki",  country: "Japan", lat: 39.3870, lng: 141.1200, year: 2026, description: "Kenji Miyazawa's fairy-tale village" },
    { city: "Morioka",   country: "Japan", lat: 39.7010, lng: 141.1370, year: 2026, description: "Wanko soba" },
    { city: "Yokohama",  country: "Japan", lat: 35.4660, lng: 139.6220, year: 2026, description: "Model railway museum before flying home" },
    // --- 印尼足迹 ---
    { city: "Jimbaran",  country: "Indonesia", lat: -8.7867, lng: 115.1431, year: 2026, description: "Cliff bar sunsets, badminton with locals" },
    { city: "Nusa Dua",  country: "Indonesia", lat: -8.7993, lng: 115.2317, year: 2026, description: "Lagoon pools, beach football" },
    { city: "Ubud",      country: "Indonesia", lat: -8.5064, lng: 115.2625, year: 2026, description: "Waterfall, rice terraces, palace" },
```

- [ ] **Step 6: Run check** → all `ok`. Preview `/voyages/bali-2026` (map should show Bali outline with the route) and `/footprints` (2026 filter shows 15 points).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(travel): Bali 2026 voyage, 2026 footprints for Kyushu/Tohoku/Bali, itineraries refreshed from travel-poc"
```

---

### Task 9: OG image, docs, final verification

**Files:**
- Regenerate: `public/og-default.png`
- Modify: `CLAUDE.md` (architecture notes), `scripts/check.sh` (overflow probe note)
- Modify: `docs/superpowers/specs/2026-10-25-site-redesign-v1-design.md` status line → `Status: implemented on branch redesign-v1`

- [ ] **Step 1: OG image** — write `/tmp/og.html` and render with headless Chrome at 1200×630:

```html
<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;background:#f7f6f2;color:#1a1a1a;font-family:"Geist Mono",Menlo,monospace}
.g{position:absolute;inset:0;background-image:linear-gradient(to right,rgba(26,26,26,.07) 1px,transparent 1px),linear-gradient(to bottom,rgba(26,26,26,.07) 1px,transparent 1px);background-size:24px 24px;mask-image:radial-gradient(ellipse at 30% 50%,black 20%,transparent 75%)}
.w{position:absolute;inset:0;padding:72px 84px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:14px;font-size:22px;letter-spacing:.18em;text-transform:uppercase;color:#6b6b66}
.stone{width:18px;height:18px;border-radius:50%;background:#1a1a1a}
h1{font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;font-size:88px;font-weight:700;letter-spacing:-.02em;margin:0;line-height:1.05}
.zh{font-size:28px;letter-spacing:.3em;color:#6b6b66;margin-top:18px}
.tag{font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;font-size:32px;color:#1a1a1a;margin-top:28px;max-width:900px;line-height:1.35}
.foot{display:flex;justify-content:space-between;font-size:22px;color:#6b6b66}
</style></head><body><div class="g"></div><div class="w">
<div class="top"><span class="stone"></span>diaosj.info</div>
<div><h1>Shoujun (Adrian) Diao</h1><div class="zh">刁寿钧</div><div class="tag">I build the inference infrastructure behind generative-AI products.</div></div>
<div class="foot"><span>§ AI INFRA · GO · KUBERNETES</span><span>WEIQI 5-DAN</span></div>
</div></body></html>
```
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot=public/og-default.png file:///tmp/og.html
sips -g pixelWidth -g pixelHeight public/og-default.png
```

- [ ] **Step 2: Full visual pass** — start `npx astro preview --port 4399 &`; for each of `/ /blog/ /about/ /life/ /voyages/ /voyages/bali-2026/ /footprints/ /blog/counting-pairs/` capture at `--window-size=1280,2000` and `390,1800`; then run the same-origin iframe overflow probe from the session (iframe widths 390/430/640 must report `scrollWidth === innerWidth`). Also toggle dark via `document.documentElement.classList.add('dark')` in one screenshot to confirm tokens flip. Kill the preview.

- [ ] **Step 3: Docs** — in `CLAUDE.md` under Architecture add:

```
**Design system (2026-10 redesign)** — tokens live in `src/styles/global.css` (`--paper/--ink/--muted/--rule/--stone`), exposed as Tailwind colors `paper/ink/muted/rule/stone`. Utilities `.t-mono .t-muted .rule .grid-bg`. Components: `SectionLabel`, `Entry`, `Stone`, `ArchiveBadge`. No italics/serif. Go-stone motif only in favicon/OG, home section labels, blog group headings.
**Home copy** — `src/data/home.ts` (NOW, WRITING_IN_PROGRESS, BEYOND, LIFE_*). **Archive grouping** — `src/lib/archive.ts` (`GROUPS`, `groupOf`, `isArchive`; cutoff 2020-01-01).
**Travel data** — `src/data/<trip>.json` are hand-copied from `~/Documents/travel/travel-poc/src/data/`; footprints array is inline in `src/pages/footprints.astro`. Keep schemas; sanitise before publishing.
**Verification** — `npm run check` builds and asserts on `dist/`.
```
Update the spec status line. Commit:

```bash
git add -A && git commit -m "chore: new OG image, CLAUDE.md design-system notes, spec status"
```

- [ ] **Step 4: Hand-off** — report to Adrian: branch `redesign-v1` ready for review; the copy in `src/data/home.ts` and `about.astro` is a draft for him to edit; merge to `main` only on his word.

---

## Self-review

- **Spec coverage:** §1 identity → Task 2; §2 visual system → Tasks 2–3; §3 IA (nav, home, life, home.ts) → Tasks 5–6; §4 blog index/archive/badge/welcome → Task 4; §5 about → Task 7; §5b/§5c travel contract, refresh, Bali, footprints, Next row, stat → Tasks 6, 8; §6 non-goals respected (no URL changes, no deps); §7 acceptance → Tasks 1, 9.
- **Placeholders:** none; all code and copy is written out (copy is explicitly marked as a draft for Adrian).
- **Type consistency:** `Entry` props (`href,title,description,meta,lang,external`) used identically in Tasks 3–8; `GROUPS/groupPosts/isArchive` names match between Task 4 and Tasks 5–6; `LIFE_*` exports defined in Task 6 before use; `tripCount` updated in Task 8.
