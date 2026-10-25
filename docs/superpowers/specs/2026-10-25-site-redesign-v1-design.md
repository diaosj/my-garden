# diaosj.info redesign v1 — narrative IA + visual system

Date: 2026-10-25
Status: implemented on branch redesign-v1 (2026-10-25); copy in src/data/home.ts and about.astro is a draft for Adrian to edit

## Goal

Turn the site from "an archive of a 2008–2016 blog plus an English résumé" into a
narrative about Shoujun (Adrian) Diao as an AI-infrastructure architect, with a
visual system that reads as his own: engineer's manuscript (mono labels, grid,
rules) with a restrained Go (weiqi) motif.

Scope is structure, copy scaffolding and visual system. New long-form articles
are out of scope (see Non-goals).

## Decisions already made

| Topic | Decision |
|---|---|
| Site name | "Shoujun Diao" (not "Adrian's Garden") |
| Writing block before new posts exist | list 3 in-progress topics, labelled "in progress" |
| Archive grouping | six groups: Infra / Backend Notes 2011–2016 / 骑行 2010 / 读书与围棋 / 足球 / 随笔 |
| Default theme | light by default; dark kept as a switchable second theme |
| Implementation path | evolve the existing Astro Micro skeleton in place; keep Atlas, Voyages, Pagefind, Giscus, SEO work |

## §1 Identity

- Header wordmark: `Shoujun Diao` in Geist Mono. `SITE.TITLE` becomes `Shoujun Diao`; page `<title>` suffix follows.
- Favicon: inline SVG of a single Go stone — black stone on light, white stone on dark (`prefers-color-scheme` inside the SVG). Replaces the 🌱 emoji.
- `public/og-default.png` regenerated in the new visual language (paper background, mono name, one stone).
- Footer: `© 2026 · Shoujun Diao · 刁寿钧`.
- JSON-LD `WebSite.name` and `llms.txt` title follow `SITE.TITLE`.

## §2 Visual system

**Type**
- Mono (Geist Mono): wordmark, nav, section labels, dates, counts, badges, footer.
- Sans (Geist Sans): English body and titles.
- CJK: system stack `"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif`, appended to `--font-sans`.
- No italics and no serif anywhere. Remove every `font-serif italic` usage (ArrowCard, home, about, voyages).
- Font files: Geist Sans 400/500/600, Geist Mono 400/500. Remove the other 13 weight imports.

**Color tokens** (defined in `global.css` `@theme` / CSS variables; light is `:root`, dark is `html.dark`)

| Token | Light | Dark |
|---|---|---|
| `--paper` (bg) | `#f7f6f2` | `#141414` |
| `--ink` (text) | `#1a1a1a` | `#ececec` |
| `--muted` | `#6b6b66` | `#9a9a94` |
| `--rule` | `#e6e4dd` | `#2a2a2a` |
| `--stone` | `#1a1a1a` | `#ececec` |
| `--stone-contrast` | `#f7f6f2` | `#141414` |

No accent color. Links: ink with 1px underline in `--rule`, hover underline in `--ink`.

**Go motif — exactly three uses**
1. Favicon + OG image.
2. Section marker on the home page: a 10px stone before each section label (`● NOW`, `● WRITING` …).
3. Group marker in the blog index (one stone per group heading).
Plus one background: a faint 19×19 grid (`--rule` at 35% opacity, 24px cells) behind the home hero only.

**Manuscript cues**
- Section labels: mono, uppercase, letter-spaced, with an index `§ 01`.
- Dates and counts right-aligned in a mono column.
- 1px horizontal rules between entries; no cards, no radius, no shadows (Voyages trip list loses its rounded cards).
- Layout width unchanged (`max-w-screen-sm`, `md:max-w-4xl`).

**Components (new or rewritten in `src/components/`)**
- `SectionLabel.astro` — props `index`, `label`, optional `stone` (bool), optional right-slot (e.g. "See all").
- `Entry.astro` — one row: title, one-line description, mono meta on the right; replaces `ArrowCard` (ArrowCard is deleted).
- `Stone.astro` — the 10px stone, `size` prop.
- `ArchiveBadge.astro` — "Archive · written in 2011" line for pre-2020 posts.

## §3 Information architecture

**Navigation**: `Writing / Work / About / Life`. URLs unchanged: `/blog`, `/projects`, `/about`; new `/life`. `/voyages` and `/footprints` keep their URLs and are linked from `/life`. Search button stays.

**Home** (`src/pages/index.astro`), sections in order:
1. Hero — `Shoujun (Adrian) Diao`, `刁寿钧` beneath in mono, one line: "I build the inference infrastructure behind generative-AI products." Grid background.
2. `§ 01 NOW` — three sentences on current work (Lovart: inference serving, model gateways, multi-cloud GPU and cost). Copy drafted by Claude from memory, edited by Adrian.
3. `§ 02 WRITING` — three in-progress topics, each title + one line, badge `in progress`. When ≥1 post dated ≥ 2020 exists, this block shows the latest 3 such posts instead and the topics list is ignored.
4. `§ 03 WORK` — ordered: Token Console demo, Token Portal demo, Concurrency Arena, HTTPS Simulator. Token demos are added to `src/content/projects/` (title, description, date 2026-08-30, demoURL on this site).
5. `§ 04 ARCHIVE` — six rows: group name, count, one-line intro, link to `/blog#<group>`.
6. `§ 05 BEYOND` — one-sentence lead ("The rest of me: …") then the five existing items.

Home copy lives in `src/data/home.ts`: `NOW: string[]`, `WRITING_IN_PROGRESS: {title, summary}[]`, `BEYOND_LEAD: string`. Archive rows derive from `src/lib/archive.ts` at build time.

**Life** (`src/pages/life.astro`): heading, one line, two entries (Voyages → `/voyages`, Atlas → `/footprints`) using `Entry`.

## §4 Blog index (`/blog`, titled "Writing")

- `src/lib/archive.ts` exports `GROUPS` (ordered) and `groupOf(post)`:

| Group id | Label | Rule |
|---|---|---|
| `infra` | Infra | date ≥ 2020-01-01 |
| `backend` | Backend Notes 2011–2016 | has any tag in the tech set (AWS, Bottle, C, C++, CSS, Celery, CodeIgniter, Django, FastDFS, Flask, Gevent, Git, HTTP, Infobright, JavaScript, Laravel, Linux, Lua, MongoDB, MySQL, Nginx, NumPy, PHP, Perl, Python, Recommendation, Redis, SVN, TokuDB, Tornado, Twisted, Web.py, Yaf, Yii, Zend, jQuery, 数据结构, 算法, 数据挖掘, 社交网络, 数学) |
| `cycling` | 骑行 2010 | tag 单车 |
| `reading` | 读书与围棋 | tag 乱翻书 or 围棋 |
| `football` | 足球 | tag 足球 |
| `essays` | 随笔 | everything else (incl. English, 游戏) |

Precedence when a post matches several: infra > cycling > reading > football > backend > essays. (A 2010 cycling post tagged 围棋 goes to cycling.)
- Each group: stone + label + count on the left, one-line intro on the right (intros in `archive.ts`). Posts inside sorted by date desc; year in the mono right column. Group anchors `#infra` etc. for home links.
- `welcome.md` is moved to `draft: true` (it adds nothing once Now/Writing exist).
- Post page: `ArchiveBadge` shown when `date < 2020-01-01`.

## §5 About

Rewritten first-person, five parts: (1) opening scene — March 2016, AlphaGo vs Lee Sedol, seen by an amateur 5-dan; (2) what I do now; (3) the path — existing timeline, adjectives removed; (4) beyond the code; (5) connect. The Chinese one-line bio stays under the heading. English copy drafted by Claude, edited by Adrian before merge.

## §5b Travel data contract (Voyages / Atlas)

Voyages itineraries and Atlas footprints are authored in the separate
`~/Documents/travel/travel-poc` project and copied into this repo by hand
(there is no sync script; `travel-poc/src/data/<trip>.json` → `src/data/<trip>.json`
with identical filenames and schema). The redesign must not change that contract:

- `src/data/*.json` keep their filenames and schema; pages read them exactly as today.
- The `Footprint` array in `src/pages/footprints.astro` keeps its shape
  (`city, country, lat, lng, year, description`) and location; it is not moved
  to a data file in this iteration.
- Visual changes to `/voyages`, `/voyages/<trip>` and `/footprints` come only
  from global tokens and the removal of rounded cards; no template logic changes.
- As part of this work, refresh `src/data/sendai-2026.json` and
  `src/data/kyushu-2026.json` from travel-poc, which is newer (Haneda T3 fix,
  2026-08-03) than the copy in this repo (2026-07-13).

## §5c Travel content refresh (added 2026-10-25, approved)

Three 2026 trips are missing from Atlas and/or Voyages. Fill them as part of this work.

**Atlas footprints** — append to the `Footprint` array in `footprints.astro`, city level, `year: 2026`, one-line English description each, coordinates taken from the itinerary JSON stops:
- Kyushu (Mar 2026): Fukuoka, Karatsu, Hirado, Sasebo, Nagasaki, Dazaifu.
- Tohoku + Kanto (Aug 2026): Sendai, Yamadera/Yamagata, Hanamaki, Morioka, Yokohama.
- Bali (Oct 2026): Jimbaran, Nusa Dua, Ubud.

**Bali voyage** — author `bali-2026.json` in `travel-poc/src/data/` first (same schema as `sendai-2026.json`: `title, startDate, endDate, region, days[{date, dayIndex, weekday, title, theme, color, stops[], legs[]}]`), converted from `travel-poc/docs/bali2026/itinerary.md`, then copy to `src/data/bali-2026.json` and add `src/pages/voyages/bali-2026.astro` (clone of the Sendai page; adjust the map's longitude filter to Indonesia ~114–116) and a third entry in `voyages/index.astro`. Day colours follow the existing palette.

**Sanitisation rules for anything published** (existing house rule, restated): no booking/confirmation numbers, no paid amounts, no private individuals' phone numbers or names (e.g. the badminton coach), no home addresses, no children's names. Public venues, their coordinates, public ticket prices and restaurant phone numbers may stay. Keep itinerary text in the language it was written (Chinese), trimmed to what a reader needs.

**Life page extras** (`/life`):
- One-line lead written in first person about the 2026 shift to travelling more deliberately (final wording drafted by Claude, edited by Adrian).
- A `Next` row listing destinations only, no dates beyond the year and no family detail: `Spain (2027) · Nagaoka fireworks, Japan (2027) · USA West Coast (2028)`.
- A small mono stat under Atlas: `Japan: 28 / 47 prefectures` (from `travel-poc/docs/wishlist/japan.md`, 2026-08-17 tally). Update by hand after each trip.

## §6 Non-goals

- No new articles (only Now sentences, topic titles, the Life lead and the Bali itinerary data).
- Atlas and Voyages templates get no layout changes beyond §5b/§5c (new data, new Bali page cloned from Sendai).
- No URL changes, no new redirects.
- No new dependencies.

## §7 Acceptance

- `npm run build` passes with 0 errors and 0 KaTeX warnings.
- Screenshots: home, blog, about, post, life at 1280 and 390 width, light and dark — no horizontal overflow (verified via same-origin iframe probe), no serif/italic text.
- `lang`, JSON-LD, sitemap, robots, llms.txt unchanged in behaviour; `WebSite.name` updated.
- All six archive groups non-empty except `infra` (expected empty until the first post).
- Lighthouse-style sanity: home transfers fewer font files than before (5 vs 18).
