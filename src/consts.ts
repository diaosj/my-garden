import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Adrian's Garden",
  DESCRIPTION: "Backend Architect. Exploring systems, code, and life.",
  EMAIL: "shoujun.diao@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 5,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "My Garden.",
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
  DESCRIPTION: "Learn more about Shoujun (Adrian) Diao.",
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
