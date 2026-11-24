import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface Testimonial { quote: string; name: string; role?: string }

/**
 * Renders ONLY real testimonials passed in by the owner (see src/config/testimonials.ts).
 * With none, it renders nothing, so no placeholder or invented review is ever shown.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="py-24">
      <Container>
        <SectionHeading eyebrow="Customer feedback" title="What customers say" />
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <li key={t.name + t.quote.slice(0, 12)} className="glass p-6">
              <Quote className="h-5 w-5 text-violet-300" aria-hidden />
              <blockquote className="mt-4 text-[15px] leading-7 text-zinc-300">“{t.quote}”</blockquote>
              <p className="mt-5 text-sm font-semibold">{t.name}</p>
              {t.role && <p className="text-xs text-zinc-500">{t.role}</p>}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
