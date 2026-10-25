export type GroupId = "infra" | "backend" | "cycling" | "reading" | "football" | "essays";
export type Group = { id: GroupId; label: string; intro: string };

export const ARCHIVE_CUTOFF = new Date("2020-01-01T00:00:00Z");
export const isArchive = (date: Date) => date < ARCHIVE_CUTOFF;

export const GROUPS: Group[] = [
  { id: "infra",    label: "Infra",                   intro: "Inference serving, gateways, GPUs and cost — what I work on now." },
  { id: "backend",  label: "Backend Notes 2011–2017", intro: "Source-code reading, MySQL, PHP/Lua/JS notes from my first decade as an engineer." },
  { id: "cycling",  label: "骑行 2010",                intro: "From Shanghai to Qinghai Lake by bicycle, written on the road." },
  { id: "reading",  label: "读书与围棋",               intro: "Books, and the game I taught myself up to amateur 5-dan." },
  { id: "football", label: "足球",                     intro: "Inter, derbies, and the long habit of staying up for Serie A." },
  { id: "essays",   label: "随笔",                     intro: "Everything else from my twenties: food, cities, people." },
];

const TECH_TAGS = new Set([
  "AWS", "Bottle", "C", "C++", "CSS", "Celery", "CodeIgniter", "Django", "FastDFS", "Flask", "Gevent", "Git",
  "HTTP", "Infobright", "JavaScript", "Laravel", "Linux", "Lua", "MongoDB", "MySQL", "Nginx", "NumPy", "PHP",
  "Perl", "Python", "Recommendation", "Redis", "SVN", "TokuDB", "Tornado", "Twisted", "Web.py", "Yaf", "Yii",
  "Zend", "jQuery", "数据结构", "算法", "数据挖掘", "社交网络", "数学",
]);

type PostLike = { data: { date: Date; tags?: string[] } };

/** Precedence: infra > cycling > reading > football > backend > essays. */
export function groupOf(post: PostLike): GroupId {
  const tags = new Set(post.data.tags ?? []);
  if (!isArchive(post.data.date)) return "infra";
  if (tags.has("单车")) return "cycling";
  if (tags.has("乱翻书") || tags.has("围棋")) return "reading";
  if (tags.has("足球")) return "football";
  for (const t of tags) if (TECH_TAGS.has(t)) return "backend";
  return "essays";
}

/** Every GroupId is present as a key; posts sorted newest first. */
export function groupPosts<T extends PostLike>(posts: T[]): Map<GroupId, T[]> {
  const m = new Map<GroupId, T[]>(GROUPS.map((g) => [g.id, [] as T[]]));
  for (const p of posts) m.get(groupOf(p))!.push(p);
  for (const list of m.values()) list.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return m;
}
