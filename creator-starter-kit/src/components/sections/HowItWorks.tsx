import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { STEPS } from "@/content/product";

export function HowItWorks() {
  return (
    <section className="py-10">
      <Container>
        <SectionHeading eyebrow="How it works" title="From checkout to download in three steps" />
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <li className="glass relative h-full p-7">
                <span className="gradient-text text-5xl font-bold" aria-hidden>{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{s.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
