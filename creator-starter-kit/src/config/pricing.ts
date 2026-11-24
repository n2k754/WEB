/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SINGLE SOURCE OF TRUTH FOR PRICES AND PACKAGE CONTENTS
 *  Change a price here and it updates the pricing cards, the comparison
 *  table, the checkout session sent to the payment provider and the
 *  structured data (SEO). Amounts are in minor units (cents).
 * ─────────────────────────────────────────────────────────────────────────
 */
export type TierId = "starter" | "pro" | "ultimate";

export interface Tier {
  id: TierId;
  name: string;
  /** Price in minor units (999 = €9.99) */
  priceCents: number;
  currency: "eur";
  blurb: string;
  recommended?: boolean;
  /** Short, truthful list of what the package contains */
  features: string[];
  /** Rank used to decide which files a package unlocks */
  rank: number;
}

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "STARTER",
    priceCents: 999,
    currency: "eur",
    rank: 1,
    blurb: "The essentials to plan your first digital product and start posting.",
    features: [
      "Digital business guide (8 chapters, PDF)",
      "30 TikTok content ideas (PDF)",
      "10 social media templates",
      "Template catalogue & Canva how-to",
    ],
  },
  {
    id: "pro",
    name: "CREATOR PRO",
    priceCents: 1999,
    currency: "eur",
    rank: 2,
    recommended: true,
    blurb: "The complete creator system: templates, planning and prompts.",
    features: [
      "Everything in Starter",
      "All 50 social media templates",
      "Notion content dashboard (import files + setup guide)",
      "20 AI prompts, ready to copy",
    ],
  },
  {
    id: "ultimate",
    name: "ULTIMATE",
    priceCents: 2999,
    currency: "eur",
    rank: 3,
    blurb: "Everything in Creator Pro, plus brand and content planning workbooks.",
    features: [
      "Everything in Creator Pro",
      "Brand planning workbook (additional resources)",
      "Bonus content planning guide",
      "Future updates where available",
    ],
  },
];

export const CURRENCY_LOCALE = "en-IE";

export function getTier(id: string): Tier | undefined {
  return TIERS.find((t) => t.id === id);
}

export function formatPrice(cents: number, currency: string = "eur"): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
