import { Sparkles, Zap, BookOpen, LayoutTemplate } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { TRUST_ITEMS } from "@/content/product";

const icons = { Sparkles, Zap, BookOpen, LayoutTemplate };

export function TrustBar() {
  return (
    <section aria-label="Why Creator Starter Kit" className="relative -mt-2">
      <Container>
        <Reveal>
          <ul className="glass grid gap-px overflow-hidden !rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_ITEMS.map((t) => {
              const Icon = icons[t.icon];
              return (
                <li key={t.title} className="flex gap-4 bg-ink-50/90 p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <h3 className="text-sm font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">{t.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
