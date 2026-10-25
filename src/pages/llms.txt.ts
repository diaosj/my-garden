import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@consts";
import { SITE_URL } from "@lib/seo";

/**
 * llms.txt — a plain-text map of this site for LLM crawlers and agents.
 * Spec: https://llmstxt.org
 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const projects = (await getCollection("projects")).filter((p) => !p.data.draft);

  const line = (title: string, url: string, desc?: string) =>
    `- [${title}](${SITE_URL}${url})${desc ? `: ${desc}` : ""}`;

  const recent = posts.filter((p) => p.data.date.getFullYear() >= 2020);
  const archive = posts.filter((p) => p.data.date.getFullYear() < 2020);

  const body = [
    `# ${SITE.TITLE}`,
    "",
    `> Personal site of Shoujun (Adrian) Diao (刁寿钧), AI infrastructure architect. ${SITE.DESCRIPTION}`,
    "",
    "Shoujun Diao builds and operates inference infrastructure for generative AI products: model gateways, multi-cloud GPU scheduling, cost control and reliability for LLM and image/video generation APIs. Previously Staff Engineer and AI Platform Architect at Tencent (Tencent Cloud unified AI platform, high-performance gateways), now Architect at Lovart. Amateur 5-dan Go (weiqi) player; translator of technical books into Chinese.",
    "",
    "Content is written in English and Chinese (zh-CN). Posts dated before 2017 are an archive of an earlier blog (2008-2016) covering backend engineering notes, cycling, Go and reading.",
    "",
    "## Pages",
    "",
    line("About", "/about/", "Professional background, experience and contact links"),
    line("Projects", "/projects/", "Interactive demos and tools"),
    line("Blog", "/blog/", "All posts, grouped by year"),
    line("Voyages", "/voyages/", "Travel itineraries"),
    line("Atlas", "/footprints/", "Map of places visited"),
    line("RSS feed", "/rss.xml"),
    "",
    "## Projects",
    "",
    ...projects.map((p) => line(p.data.title, `/projects/${p.id}/`, p.data.description)),
    "",
    "## Recent posts",
    "",
    ...(recent.length
      ? recent.map((p) => line(p.data.title, `/blog/${p.id}/`, p.data.description))
      : ["- (none yet)"]),
    "",
    "## Archive (2008-2016)",
    "",
    ...archive.map((p) =>
      line(`${p.data.date.toISOString().slice(0, 10)} ${p.data.title}`, `/blog/${p.id}/`),
    ),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
