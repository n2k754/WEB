import { POLICY } from "@/config/business";
import { EXTERNAL_CHECKOUT } from "@/config/pricing";

export interface FaqEntry { q: string; a: string }

/** Answers are plain text so they can be reused in structured data. Keep in sync with /legal. */
export function getFaq(accessDays: number): FaqEntry[] {
  const faq: FaqEntry[] = [
    {
      q: "What is Creator Starter Kit?",
      a: "Creator Starter Kit is a digital toolkit for beginners and aspiring entrepreneurs. It combines social media templates, 30 TikTok content ideas, a Notion content dashboard, an 8-chapter digital business guide and 20 AI prompts. It is available in three packages (Starter, Creator Pro and Ultimate) and everything is delivered digitally.",
    },
    {
      q: "Is it suitable for beginners?",
      a: "Yes. It was written for people who are just starting out. Explanations use plain language, each chapter ends with an exercise and a checklist, and no previous experience with design, Notion or business is required.",
    },
    {
      q: "What do I receive after purchasing?",
      a: "Right after your payment is confirmed you are taken to your personal purchase page, where you can download the files included in your package: PDF guides, SVG and PNG template files, CSV files for Notion and a plain-text prompt file. You can download items one by one or as a ZIP. The exact contents of each package are listed on the pricing cards and on the “What's included” page. No physical item is shipped.",
    },
    {
      q: "Do I need Canva Pro?",
      a: "No. The templates are provided as original SVG and PNG files, not as Canva share links, so you don't need a paid plan to use them. Edit the SVG in a vector editor, or upload the background layer to Canva and add text using the specs in the catalogue; both work with a free Canva account. Features such as Brand Kit or Magic Resize are optional extras of paid Canva plans.",
    },
    {
      q: "Can I use the templates commercially?",
      a: "Yes, within the licence included in every package. You may use the files for your own business content, including posts that promote your products or services, and for client work provided clients only receive finished designs. You may not resell, share or redistribute the files themselves, in original or modified form.",
    },
    {
      q: "Is the product refundable?",
      a: `Because the files are digital content delivered immediately, you are asked at checkout to request immediate access and to acknowledge that your right of withdrawal ends once access begins, so we do not offer change-of-mind refunds after that point. If a file is missing, corrupted or does not match its description, or if you were charged twice, contact us within ${POLICY.faultClaimDays} days and we will fix it or refund you. This does not affect any mandatory consumer rights you may have where you live. Full details are in the refund policy.`,
    },
    {
      q: "How do I access my files?",
      a: `After payment you are redirected to your purchase page. Bookmark it: its address is your personal access link and stays valid for ${accessDays} days. Download links on that page are generated for you and expire after 15 minutes for security; simply reload the page to get fresh ones. Do not share the page address, because anyone who has it can download your files.`,
    },
    {
      q: "Will I earn money with this?",
      a: "We can't promise that. The kit gives you structure, ideas and templates, but results depend on your effort, audience, niche and many other factors. Nothing in the kit is a guarantee of income, followers or sales.",
    },
  ];
  if (!EXTERNAL_CHECKOUT) return faq;
  // Sold through Gumroad: Gumroad processes payment and delivers the files.
  const override: Record<string, string> = {
    "What do I receive after purchasing?": "Right after payment, Gumroad gives you access to the files of your package (PDF guides, SVG and PNG template files, CSV files for Notion and a plain-text prompt file) and emails you a download link. The exact contents of each package are listed on the pricing cards and on the “What's included” page. No physical item is shipped.",
    "Is the product refundable?": `Purchases are processed by Gumroad and refunds follow Gumroad's refund rules shown at checkout, together with our refund policy. Because the files are digital content available immediately, we do not offer change-of-mind refunds once you have access. If a file is missing, corrupted or does not match its description, or if you were charged twice, contact us within ${POLICY.faultClaimDays} days and we will fix it or arrange a refund. This does not affect any mandatory consumer rights you may have where you live.`,
    "How do I access my files?": "After payment, Gumroad shows a download page and sends a receipt email with a link to your files. You can reopen that link any time from the email; use the same email address if you ever need to look up your purchase on Gumroad. If you can't find it, contact us with the email used at checkout.",
  };
  return faq.map((f) => (override[f.q] ? { ...f, a: override[f.q] } : f));
}
