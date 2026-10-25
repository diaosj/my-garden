// Home-page and Life-page copy. Edit words here, not in the page templates.
// Draft by Claude, 2026-10-25 — Adrian to edit before merge.

export const HERO_LINE =
  "I build the inference infrastructure behind generative-AI products.";

export const NOW = [
  "At Lovart I am the backend architect for an AI-agent product: the service topology, the gateways, the model and tool access layers, and the cost of inference across GPUs and vendor APIs. Recent work: moving core services from Python to Go, a 30% TTFT cut that let a 14-node H200 cluster run on 6, and routing with fallback across 10+ model vendors.",
  "Before that, seven years at Tencent: edge computing and AI cameras at YouTu Lab, then tech lead for the gateway, AutoML and data-processing modules of Tencent Cloud's TI platform, which we built from zero to commercialization. Its AI gateway took a 100× traffic surge during the DeepSeek boom without an incident.",
  "I think about inference the way I once thought about Go: position first, then tempo. Most of what I write here is about that.",
]

export const WRITING_IN_PROGRESS: { title: string; summary: string }[] = [
  {
    title: "A model gateway is a routing problem, not a proxy",
    summary: "How we route one API across four vendors by cost, quota and health, and what broke.",
  },
  {
    title: "Burn-down: a cost model for inference",
    summary: "Turning GPU hours, token prices and failure rates into one number a team can argue with.",
  },
  {
    title: "Leaving one cloud: notes from a multi-cloud migration",
    summary: "What to move first, what never to move, and the DNS mistake I'd avoid next time.",
  },
];

export const BEYOND_LEAD = "The rest of me: I talk, translate, organise, and play Go — badly at first, then not.";

export const BEYOND: { title: string; meta: string }[] = [
  { title: "Speaker, Apache APISIX community", meta: "High-performance gateways" },
  { title: "Co-translator, Problem Solving with Algorithms and Data Structures Using Python", meta: "Posts & Telecom Press · 2019" },
  { title: "Translator, Practical Data Analysis", meta: "China Machine Press · 2018" },
  { title: "President, Tencent East-China Football Association", meta: "Weekly turnout from under 5 to 40–50" },
  { title: "President, Fudan University Go Club", meta: "Self-taught to amateur 5-dan" },
  { title: "Volunteer Go (weiqi) instructor", meta: "Children of migrant workers, Shanghai" },
]

export const LIFE_LEAD =
  "Somewhere in 2026 I started travelling on purpose instead of by accident. This is where I keep the plans and the map.";

export const LIFE_NEXT = ["Spain (2027)", "Nagaoka fireworks, Japan (2027)", "USA West Coast (2028)"];

export const LIFE_STATS: { label: string; value: string }[] = [
  { label: "Japan", value: "28 / 47 prefectures" },
];
