import { getTemplates, type TemplateCategoryId } from "./templates";
import prompts from "../../content-src/prompts.json";

/** 12 sample templates (2 per category) for the interactive preview. */
export function getSampleTemplates() {
  const picks: Record<TemplateCategoryId, number> = { "ig-posts": 2, "ig-stories": 2, promo: 2, launch: 2, quotes: 2, announcements: 2 };
  const out: ReturnType<typeof getTemplates> = [];
  const seen: Record<string, number> = {};
  for (const t of getTemplates()) {
    seen[t.category] = (seen[t.category] ?? 0) + 1;
    // take the 1st and 3rd of each category so layouts and palettes differ
    if ([1, 3].includes(seen[t.category]) && (picks[t.category] -= 1) >= 0) out.push(t);
  }
  return out.map((t) => ({ id: t.id, name: t.name, category: t.category, categoryLabel: t.categoryLabel, width: t.width, height: t.height, svg: t.svg }));
}

export function getHeroTemplates() {
  const all = getTemplates();
  return ["csk-01", "csk-31", "csk-11"].map((id) => all.find((t) => t.id === id)!).map((t) => ({ id: t.id, name: t.name, width: t.width, height: t.height, svg: t.svg }));
}

/** Sample prompts: only 4 of the 20 are shown publicly. */
export const SAMPLE_PROMPTS = [1, 7, 12, 15].map((id) => (prompts as any[]).find((p) => p.id === id)) as {
  id: number; category: string; title: string; useWhen: string; prompt: string; tip: string;
}[];

export const GUIDE_SAMPLE_PAGES = [
  {
    chapter: "Chapter 1 · Finding a digital product idea",
    title: "Start with problems, not products",
    body: [
      "Most beginners start by asking “What should I sell?”. A better question is “Whose problem can I help solve?”. People pay for relief, speed, clarity or confidence. Look for situations where someone is stuck, confused or wasting time.",
      "Three sources of ideas: your own experience (what did you learn the hard way?), your skills (what feels ordinary to you but is valuable to a beginner?) and public conversations (the questions people repeat in comment sections and forums).",
    ],
    callout: "Exercise: set a 10-minute timer and write every idea you can think of. Then score your top five with the idea filter on the next page.",
    page: 1,
  },
  {
    chapter: "Chapter 3 · Researching competitors",
    title: "Read reviews like a researcher",
    body: [
      "Reviews are free market research. Read the 5-star reviews to learn what customers love and the 3-star reviews to learn what is missing. Highlight repeated phrases. If several reviews say “too long” or “not beginner-friendly”, you have found an opportunity.",
      "Record each competitor in a simple table: product and format, price, promise, strengths and weaknesses. Then look for the gap: a different audience, a simpler format, a clearer promise or a more approachable price.",
    ],
    callout: "Stay ethical: study, don't copy. Never reuse someone else's text, designs or paid content.",
    page: 7,
  },
  {
    chapter: "Chapter 8 · Understanding basic business finances",
    title: "Revenue is not profit",
    body: [
      "Revenue is the total money customers pay you. Profit is what remains after costs: payment fees, tools, software and advertising. A customer who pays €19.99 doesn't leave you with €19.99, which is why simple tracking matters.",
      "Create a spreadsheet or Notion database with date, description, category, amount and type. Update it weekly and set aside money for taxes. This chapter is general information, not tax advice: ask a qualified professional where you live.",
    ],
    callout: "Monthly money routine (20 minutes): record income and expenses, compare to last month, cancel unused tools, note one lesson.",
    page: 16,
  },
];

export const NOTION_SAMPLE = {
  columns: ["Idea", "Drafting", "Ready", "Published"],
  cards: [
    { status: "Idea", title: "Hook styles that earn attention", platform: "TikTok", pillar: "Educate", date: "Dec 1" },
    { status: "Idea", title: "Answer: how do I choose a price?", platform: "Instagram", pillar: "Educate", date: "Dec 4" },
    { status: "Drafting", title: "My weekly planning routine", platform: "Instagram", pillar: "Relate", date: "Dec 2" },
    { status: "Ready", title: "Launch week announcement", platform: "Instagram", pillar: "Offer", date: "Dec 3" },
    { status: "Published", title: "Customer question of the week", platform: "TikTok", pillar: "Prove", date: "Nov 24" },
  ],
  weekly: [
    { label: "Goal", value: "Build trust" },
    { label: "Posts planned", value: "3" },
    { label: "Batching day", value: "Sunday" },
    { label: "Next focus", value: "Introduce the offer" },
  ],
  databases: ["Content Calendar", "Idea Database", "Published Content", "Weekly Planning", "Performance"],
};
