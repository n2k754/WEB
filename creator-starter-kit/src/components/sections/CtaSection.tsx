import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaSection({ title = "Ready to start building?", text = "Pick the package that fits where you are today. You can start with the essentials and download everything instantly after payment.", primary = { href: "/#pricing", label: "Get the Creator Kit" }, secondary = { href: "/included", label: "See what's included" } }: { title?: string; text?: string; primary?: { href: string; label: string }; secondary?: { href: string; label: string } }) {
  return (
    <section className="py-16">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-600/30 via-ink-100 to-indigo-600/25 px-6 py-16 text-center sm:px-12">
            <div aria-hidden className="absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-violet-500/30 blur-[90px]" />
            <h2 className="relative text-3xl font-semibold sm:text-4xl">{title}</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-zinc-300">{text}</p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={primary.href} size="lg" arrow>{primary.label}</ButtonLink>
              <ButtonLink href={secondary.href} variant="secondary" size="lg">{secondary.label}</ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
