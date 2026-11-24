import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { ProductCard } from "@/components/sections/ProductCards";
import { PricingSection } from "@/components/sections/PricingSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { COMPONENTS, ULTIMATE_EXTRAS } from "@/content/product";
import { TEMPLATE_CATEGORIES } from "@/content/templates";

export const metadata: Metadata = {
  title: "What's included",
  description: "The exact contents of each Creator Starter Kit package: templates, TikTok ideas, Notion dashboard, business guide, AI prompts and bonuses.",
  alternates: { canonical: "/included" },
};

export default function IncludedPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-12 pt-14">
        <AnimatedBackground />
        <Container><SectionHeading as="h1" eyebrow="What's included" title="Exactly what you get in each package" description="No vague promises: every file, quantity and format is listed here and matches the real contents of the kit." /></Container>
      </section>

      <section className="py-10">
        <Container>
          <h2 className="mb-6 text-2xl font-semibold">Package comparison</h2>
          <ComparisonTable />
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <h2 className="mb-8 text-2xl font-semibold">The five core resources</h2>
          <div className="grid gap-5 md:grid-cols-2">{COMPONENTS.map((c) => <ProductCard key={c.id} c={c} detailed />)}</div>
        </Container>
      </section>

      <section className="py-10">
        <Container className="grid gap-8 lg:grid-cols-2">
          <div className="glass p-7">
            <h2 className="text-xl font-semibold">Template pack breakdown</h2>
            <ul className="mt-5 divide-y divide-white/10">
              {TEMPLATE_CATEGORIES.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3 text-sm"><span>{c.label}<span className="block text-xs text-zinc-500">{c.size}</span></span><span className="font-semibold text-violet-200">{c.count}</span></li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-zinc-400">Starter includes 10 of the 50 designs, picked across every category. Each design ships as an SVG with live text, a background-only SVG and a PNG preview.</p>
          </div>
          <div className="glass p-7">
            <h2 className="text-xl font-semibold">Ultimate extras</h2>
            <ul className="mt-5 space-y-5">
              {ULTIMATE_EXTRAS.map((x) => (
                <li key={x.title} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-violet-300" aria-hidden /><div><h3 className="font-semibold">{x.title}</h3><p className="mt-1 text-sm leading-6 text-zinc-400">{x.text}</p><p className="mt-1 text-xs text-zinc-500">{x.formats}</p></div></li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="glass p-7 text-sm leading-7 text-zinc-400">
            <h2 className="text-xl font-semibold text-white">Good to know</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Templates are original SVG and PNG files, <strong className="text-zinc-200">not</strong> Canva share links. A catalogue and how-to explain how to use them in Canva or any vector editor.</li>
              <li>The Notion dashboard is a set of CSV import files plus a setup guide; you build the workspace in about 20 minutes with a free Notion account.</li>
              <li>The kit is educational and organisational. It does not guarantee income, followers or sales.</li>
              <li>Every package includes a licence file with the usage rights.</li>
            </ul>
          </div>
        </Container>
      </section>
      <PricingSection compact />
      <CtaSection />
    </>
  );
}
