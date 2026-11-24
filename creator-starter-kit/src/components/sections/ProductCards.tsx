import { LayoutTemplate, Clapperboard, Database, BookOpen, WandSparkles, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { COMPONENTS, type ProductComponent } from "@/content/product";

const icons = { LayoutTemplate, Clapperboard, Database, BookOpen, WandSparkles };

export function ProductCard({ c, detailed = false }: { c: ProductComponent; detailed?: boolean }) {
  const Icon = icons[c.icon];
  return (
    <article className="glass glass-hover flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-violet-200 ring-1 ring-white/10"><Icon className="h-6 w-6" aria-hidden /></span>
        <span className="font-mono text-xs text-zinc-600">{c.number}</span>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-violet-300">{c.stat}</p>
      <h3 className="mt-2 text-xl font-semibold">{c.title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{c.summary}</p>
      {detailed && (
        <ul className="mt-5 space-y-2.5">
          {c.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 text-sm text-zinc-300"><Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />{h}</li>
          ))}
        </ul>
      )}
      <p className="mt-auto pt-6 text-xs text-zinc-500"><span className="text-zinc-400">Format:</span> {c.formats}</p>
    </article>
  );
}

export function ProductCards() {
  return (
    <section id="inside" className="scroll-mt-20 py-24">
      <Container>
        <SectionHeading eyebrow="What's inside" title="Five resources. One complete creator toolkit." description="Every resource is actually in the package: you can see the real contents in the preview below and the full list on the “What's included” page." />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {COMPONENTS.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}>
              <ProductCard c={c} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
