import { EXTERNAL_CHECKOUT, type TierId } from "@/config/pricing";

export interface ProductComponent {
  id: "templates" | "tiktok" | "notion" | "guide" | "prompts";
  number: string;
  title: string;
  icon: "LayoutTemplate" | "Clapperboard" | "Database" | "BookOpen" | "WandSparkles";
  summary: string;
  highlights: string[];
  formats: string;
  stat: string;
  availability: Record<TierId, string>;
}

export const COMPONENTS: ProductComponent[] = [
  {
    id: "templates",
    number: "01",
    title: "Social media template pack",
    icon: "LayoutTemplate",
    summary: "50 original layouts for Instagram and beyond: posts, stories, promotions, launches, quotes and announcements.",
    highlights: ["10 Instagram posts, 10 stories, 8 promo posts", "8 product launch designs, 8 quote cards, 6 announcements", "Catalogue with exact sizes, colours, fonts and text specs", "Step-by-step guide for Canva and vector editors"],
    formats: "SVG (live text) · background-only SVG · PNG previews · PDF catalogue",
    stat: "50 designs",
    availability: { starter: "10 designs", pro: "All 50", ultimate: "All 50" },
  },
  {
    id: "tiktok",
    number: "02",
    title: "TikTok content ideas",
    icon: "Clapperboard",
    summary: "30 original short-form video ideas, each with a concept, opening hook, structure, call to action and target audience.",
    highlights: ["Ideas grouped by theme: ideas, audience, research, creating, branding, sales, marketing, finances, planning", "A ready-made hook for every video", "Beat-by-beat structure so you know what to film", "A usage guide for adapting ideas to your voice"],
    formats: "PDF",
    stat: "30 ideas",
    availability: { starter: "Included", pro: "Included", ultimate: "Included" },
  },
  {
    id: "notion",
    number: "03",
    title: "Notion content dashboard",
    icon: "Database",
    summary: "A Notion-compatible planning system: content calendar, idea database, published tracker, weekly planning and performance tracking.",
    highlights: ["Five databases ready to import as CSV", "Status management: Idea → Drafting → Ready → Published", "Weekly planning and a 20-minute review routine", "Illustrated setup guide with views and an optional formula"],
    formats: "CSV import files · PDF setup guide",
    stat: "5 databases",
    availability: { starter: "—", pro: "Included", ultimate: "Included" },
  },
  {
    id: "guide",
    number: "04",
    title: "Digital business guide",
    icon: "BookOpen",
    summary: "An 8-chapter guide that takes you from a first idea to a first digital product, with exercises and checklists in every chapter.",
    highlights: ["Finding an idea and validating it", "Audience, competitors and brand", "Sales page, TikTok and Instagram marketing", "Basic finances, with no unrealistic income promises"],
    formats: "PDF · 18 pages",
    stat: "8 chapters",
    availability: { starter: "Included", pro: "Included", ultimate: "Included" },
  },
  {
    id: "prompts",
    number: "05",
    title: "AI prompt collection",
    icon: "WandSparkles",
    summary: "20 original prompts across business ideas, branding, social media, product creation, marketing and customer support.",
    highlights: ["Fill-in-the-blank [PLACEHOLDERS] so you can paste and go", "A practical tip for every prompt", "Works with most general-purpose AI assistants", "Delivered as PDF and plain text for easy copying"],
    formats: "PDF · TXT",
    stat: "20 prompts",
    availability: { starter: "—", pro: "Included", ultimate: "Included" },
  },
];

export const ULTIMATE_EXTRAS = [
  { title: "Brand planning workbook", text: "A seven-part workbook covering foundation, positioning, voice, visual identity, naming, customer journey and a 90-day plan.", formats: "PDF" },
  { title: "Bonus content planning guide", text: "A practical guide to pillars, batching, a four-week plan, repurposing and a weekly review.", formats: "PDF" },
  { title: "Future updates where available", text: "When we update the resources, your purchase page always serves the latest files for your package. Updates are provided at our discretion and are not guaranteed.", formats: "Same access link" },
];

export const TRUST_ITEMS = [
  { icon: "Sparkles", title: "Designed for beginners", text: "Plain language, no jargon, no prior experience needed." },
  { icon: "Zap", title: "Instant digital access", text: "Files unlock right after your payment is confirmed." },
  { icon: "BookOpen", title: "Practical resources", text: "Checklists, worksheets and ideas you can use today." },
  { icon: "LayoutTemplate", title: "Easy-to-use templates", text: "Clear specs and a how-to guide for every design." },
] as const;

export const STEPS = [
  { title: "Choose your package", text: "Compare Starter, Creator Pro and Ultimate. Prices are shown in euros." },
  { title: "Pay securely", text: EXTERNAL_CHECKOUT ? "You're taken to a secure Gumroad checkout. We never see your card details." : "You're redirected to our payment provider's secure checkout. We never see your card details." },
  { title: "Download your files", text: EXTERNAL_CHECKOUT ? "Right after payment, Gumroad gives you access to your files and emails you a download link." : "Once payment is confirmed server-side, your personal page unlocks with expiring download links." },
];
