import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/sections/ProductCards";
import { PreviewSection } from "@/components/sections/PreviewSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { COMPONENTS } from "@/content/product";

export const metadata: Metadata = {
  title: "The product",
  description: "Discover Creator Starter Kit: social media templates, TikTok ideas, a Notion dashboard, a digital business guide and AI prompts for beginners.",
  alternates: { canonical: "/product" },
};

const audience = [
  ["Aspiring creators", "You want to post consistently and need ideas, templates and a plan."],
  ["First-time sellers", "You'd like to turn what you know into a simple digital product."],
  ["Small business owners", "You need professional-looking posts without hiring a designer."],
];

export default function ProductPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-14">
        <AnimatedBackground />
        <Container>
          <SectionHeading as="h1" eyebrow="The product" title={<>A complete toolkit to <span className="gradient-text">start your creator business</span></>} description="Creator Starter Kit brings together everything a beginner needs to plan content, look professional and launch a first digital product. All resources are original and delivered digitally." />
        </Container>
      </section>
      <section className="py-12">
        <Container>
          <h2 className="sr-only">Who it&apos;s for</h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {audience.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.06}><li className="glass h-full p-6"><h3 className="font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{d}</p></li></Reveal>
            ))}
          </ul>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          <SectionHeading eyebrow="Inside the kit" title="Five resources, each with a clear job" />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {COMPONENTS.map((c) => <ProductCard key={c.id} c={c} detailed />)}
          </div>
        </Container>
      </section>
      <PreviewSection />
      <PricingSection />
      <CtaSection />
    </>
  );
}
