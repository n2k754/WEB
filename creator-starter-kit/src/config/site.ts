export const SITE = {
  name: "CREATOR STARTER KIT",
  shortName: "Creator Starter Kit",
  tagline: "Everything you need to build your digital creator business.",
  description:
    "A premium digital toolkit for beginners and aspiring entrepreneurs: social media templates, TikTok content ideas, a Notion content dashboard, a digital business guide and AI prompts.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_GB",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/included", label: "What's included" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

export const FOOTER_LINKS = {
  Product: [
    { href: "/product", label: "The product" },
    { href: "/included", label: "What's included" },
    { href: "/#preview", label: "Preview" },
    { href: "/#pricing", label: "Pricing" },
  ],
  Support: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/legal#terms", label: "Terms & conditions" },
    { href: "/legal#privacy", label: "Privacy policy" },
    { href: "/legal#delivery", label: "Digital delivery" },
    { href: "/legal#refunds", label: "Refund policy" },
    { href: "/legal#notice", label: "Legal notice" },
  ],
} as const;

/** How long a purchase page stays valid (server env, default 90 days). */
export const ACCESS_DAYS = Number(process.env.ACCESS_LINK_MAX_AGE_DAYS) || 90;
