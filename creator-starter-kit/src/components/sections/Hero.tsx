import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Reveal } from "@/components/ui/Reveal";
import { HeroMockup } from "./HeroMockup";
import { getHeroTemplates } from "@/content/preview";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-10 sm:pt-16 lg:pb-28">
      <AnimatedBackground />
      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden /> The ultimate creator toolkit
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-bold uppercase leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
              Build your digital business. <span className="gradient-text">Start creating today.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
              Everything you need to organize your content, grow your online presence and launch your first digital product.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#pricing" size="lg" arrow>GET THE CREATOR KIT</ButtonLink>
            <ButtonLink href="/included" variant="secondary" size="lg">EXPLORE WHAT&apos;S INSIDE</ButtonLink>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <ArrowRight className="h-4 w-4 text-violet-300" aria-hidden /> Instant access after payment · One-time price, no subscription
            </p>
          </Reveal>
        </div>
        <HeroMockup templates={getHeroTemplates()} />
      </Container>
    </section>
  );
}
