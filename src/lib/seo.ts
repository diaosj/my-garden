import { SITE, SOCIALS } from "@consts";

export const SITE_URL = "https://diaosj.info";

/** Person entity reused across pages (home, about, posts). */
export const PERSON_JSONLD = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Shoujun Diao",
  alternateName: ["Adrian Diao", "diaosj", "刁寿钧"],
  url: SITE_URL,
  email: `mailto:${SITE.EMAIL}`,
  jobTitle: "Backend Architect",
  worksFor: { "@type": "Organization", name: "Lovart" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "Fudan University" },
  knowsAbout: [
    "AI infrastructure",
    "LLM inference serving",
    "Kubernetes",
    "Go",
    "Python",
    "API gateways",
    "Cloud cost optimization",
    "Go (board game)",
  ],
  sameAs: [
    ...SOCIALS.map((s) => s.HREF),
    "https://www.linkedin.com/in/shoujun-diao/",
  ],
};

export const WEBSITE_JSONLD = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE.TITLE,
  description: SITE.DESCRIPTION,
  inLanguage: ["en", "zh-CN"],
  author: { "@id": `${SITE_URL}/#person` },
  publisher: { "@id": `${SITE_URL}/#person` },
};

export function graph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Return "zh-CN" when the text is predominantly CJK, otherwise "en". */
export function detectLang(text: string | undefined): "zh-CN" | "en" {
  if (!text) return "en";
  // Judge the prose only: drop fenced/indented code and inline code first.
  const prose = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/^(?: {4}|\t).*$/gm, " ")
    .replace(/`[^`\n]*`/g, " ")
    .slice(0, 4000);
  const cjk = (prose.match(/[一-鿿]/g) ?? []).length;
  const letters = (prose.match(/[A-Za-z]/g) ?? []).length;
  // One CJK character carries roughly a whole word; weight it accordingly.
  return cjk >= 20 && cjk * 4 >= letters ? "zh-CN" : "en";
}

export function blogPostingJsonld(opts: {
  url: string;
  title: string;
  description: string;
  date: Date;
  tags?: string[];
  lang: string;
}) {
  return graph(PERSON_JSONLD, WEBSITE_JSONLD, {
    "@type": "BlogPosting",
    "@id": `${opts.url}#article`,
    mainEntityOfPage: opts.url,
    url: opts.url,
    headline: opts.title,
    description: opts.description,
    datePublished: opts.date.toISOString(),
    dateModified: opts.date.toISOString(),
    inLanguage: opts.lang,
    keywords: opts.tags?.join(", "),
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  });
}
