import { TIERS } from "@/config/pricing";
import { SITE } from "@/config/site";
import { getFaq } from "@/content/faq";
import { ACCESS_DAYS } from "@/config/site";

export function productJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    category: "Digital product",
    offers: TIERS.map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: (t.priceCents / 100).toFixed(2),
      priceCurrency: t.currency.toUpperCase(),
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/#pricing`,
    })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: getFaq(ACCESS_DAYS).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
