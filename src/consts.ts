import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Shoujun Diao",
  DESCRIPTION: "Shoujun (Adrian) Diao 刁寿钧 — AI infrastructure architect. Notes on inference systems, gateways, Go, Kubernetes, and life beyond code.",
  EMAIL: "shoujun.diao@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Personal site of Shoujun (Adrian) Diao 刁寿钧, AI infrastructure architect at Lovart, formerly Tencent Cloud AI platform architect.",
};

export const BLOG: Metadata = {
  TITLE: "Writing",
  DESCRIPTION: "Notes on infrastructure, and an archive of a younger me — code, roads, books and football, 2008–2016.",
};

export const PROJECTS: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Demos and tools I built, mostly to explain something.",
};

export const ABOUT: Metadata = {
  TITLE: "About",
  DESCRIPTION: "Shoujun (Adrian) Diao 刁寿钧: AI infrastructure architect, ex-Tencent, amateur 5-dan Go player, technical book translator. Experience and contact.",
};

export const VOYAGES: Metadata = {
  TITLE: "Voyages",
  DESCRIPTION: "Itineraries, written before leaving.",
};

export const LIFE: Metadata = {
  TITLE: "Life",
  DESCRIPTION: "Voyages, a map of footprints, and what's next.",
};

export const SOCIALS: Socials = [
  {
    NAME: "X (formerly Twitter)",
    HREF: "https://x.com/diaosj",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/diaosj",
  },
];
