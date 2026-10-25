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
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION:
    "A collection of my projects with links to repositories and live demos.",
};

export const ABOUT: Metadata = {
  TITLE: "About",
  DESCRIPTION: "Shoujun (Adrian) Diao 刁寿钧: AI infrastructure architect, ex-Tencent, amateur 5-dan Go player, technical book translator. Experience and contact.",
};

export const VOYAGES: Metadata = {
  TITLE: "Voyages",
  DESCRIPTION: "Adventures beyond the code.",
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
