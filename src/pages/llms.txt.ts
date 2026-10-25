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
    `> Personal site of Shoujun (Adrian) Diao (刁寿钧), backend architect working on AI infrastructure: notes on inference systems, gateways, Go, Kubernetes, and life beyond code.`,
    "",
    "Shoujun Diao is the backend architect at Lovart (AI-agent product): service topology, gateways, model and tool access layers, inference cost across GPUs and vendor APIs. Previously T11 (Principal) engineer at Tencent, 2018-2025: edge computing and AI cameras at YouTu Lab, then tech lead for the gateway, AutoML and data-processing modules of Tencent Cloud's TI platform, built from zero to commercialization; its AI gateway handled a 100x traffic surge during the DeepSeek boom. Earlier: Tencent Ads, Bilibili, 2345, Adways/Nint (2012-2018). B.S. Information Security, Fudan University (2006-2010). Self-taught amateur 5-dan Go (weiqi) player; translator of two technical books into Chinese; Apache APISIX community speaker.",
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
