# diaosj.info

Source of [diaosj.info](https://diaosj.info), the personal site of Shoujun Diao (刁寿钧): writing on inference infrastructure and AI gateways, an archive of everything I have published since 2008, and the maps and plans of where I travel.

Built with [Astro 5](https://astro.build), deployed on Vercel from `main`.

## What is here

| Path | What it is |
| --- | --- |
| `src/pages/` | Routes: home, about, blog, projects, voyages, life, `llms.txt`, RSS, sitemap |
| `src/content/blog/` | 170+ posts, 2008 to now. Chinese posts carry `lang: zh-CN`, English ones `en` |
| `src/data/home.ts` | All home-page and Life-page copy. Edit words here, not in templates |
| `src/data/*.json` | Trip itineraries for the Voyages pages (same schema as my travel planner; copied by hand) |
| `src/lib/seo.ts` | Person / WebSite / BlogPosting JSON-LD and language detection |
| `src/lib/archive.ts` | The six groups the old posts are sorted into |
| `vercel.json` | 1,100+ permanent redirects from the 2008–2016 URLs (Hexo paths, Chinese slugs, `/archives`) |
| `docs/superpowers/specs/` | Design spec of the 2026 redesign |

Comments are [Giscus](https://giscus.app) on this repo's Discussions. Math is KaTeX. `/llms.txt` is generated from the content collection so language models can read the site without scraping it.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + build
npm run check      # redirect / canonical / JSON-LD assertions against dist/
```

## Design notes

- One site, English as the primary language; each post declares its own language. No per-language subsites.
- Light theme by default; dark is a toggle, not a system follow.
- Visual system: "engineer's manuscript", with a Go (weiqi) motif kept to three places: favicon and OG image, home-section markers, archive-group markers.
- Old URLs never 404. Every slug I have ever published either resolves or redirects.

## Credits

Started from [Astro Micro](https://github.com/trevortylerlee/astro-micro) by Trevor Tyler Lee, itself a fork of [Astro Nano](https://github.com/markhorn-dev/astro-nano). Both MIT; this repo keeps the licence.
