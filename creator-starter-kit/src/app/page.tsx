import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProductCards } from "@/components/sections/ProductCards";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PreviewSection } from "@/components/sections/PreviewSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { TESTIMONIALS } from "@/config/testimonials";
import { JsonLd } from "@/components/seo/JsonLd";
import { productJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProductCards />
      <HowItWorks />
      <PreviewSection />
      <PricingSection />
      <Testimonials items={TESTIMONIALS} />
      <FaqSection limit={5} />
      <CtaSection />
      <JsonLd data={productJsonLd()} />
    </>
  );
}
