"use client";
import { useState } from "react";
import { Check, Star } from "lucide-react";
import { TIERS, formatPrice, type Tier } from "@/config/pricing";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CheckoutDialog } from "./CheckoutDialog";
import { cn } from "@/lib/cn";

export function PricingCards() {
  const [selected, setSelected] = useState<Tier | null>(null);
  return (
    <>
      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        {TIERS.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.08} className="h-full">
            <article className={cn("relative flex h-full flex-col rounded-3xl border p-7 sm:p-8", t.recommended ? "border-violet-400/60 bg-gradient-to-b from-violet-500/15 to-white/[0.03] shadow-glow lg:-my-3 lg:py-11" : "glass")} aria-labelledby={`tier-${t.id}`}>
              {t.recommended && (
                <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-1 text-[11px] font-bold uppercase tracking-widest shadow-glow"><Star className="h-3 w-3 fill-current" aria-hidden /> Recommended</span>
              )}
              <h3 id={`tier-${t.id}`} className="text-sm font-bold uppercase tracking-[0.18em] text-violet-200">{t.name}</h3>
              <p className="mt-4 flex items-baseline gap-2"><span className="text-5xl font-bold tracking-tight">{formatPrice(t.priceCents, t.currency)}</span><span className="text-sm text-zinc-500">one-time</span></p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{t.blurb}</p>
              <ul className="mt-7 flex-1 space-y-3.5">
                {t.features.map((f, idx) => (
                  <li key={f} className={cn("flex gap-3 text-sm", idx === 0 && t.id !== "starter" ? "font-semibold text-white" : "text-zinc-300")}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />{f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => setSelected(t)} variant={t.recommended ? "primary" : "secondary"} size="lg" className="mt-9 w-full" arrow aria-label={`Get ${t.name} for ${formatPrice(t.priceCents, t.currency)}`}>
                Get {t.name}
              </Button>
            </article>
          </Reveal>
        ))}
      </div>
      <CheckoutDialog tier={selected} onClose={() => setSelected(null)} />
    </>
  );
}
