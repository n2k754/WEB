import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/Button";
import { getFaq } from "@/content/faq";
import { ACCESS_DAYS } from "@/config/site";

export function FaqSection({ limit, showLink = true, heading = true }: { limit?: number; showLink?: boolean; heading?: boolean }) {
  const faq = getFaq(ACCESS_DAYS);
  const items = (limit ? faq.slice(0, limit) : faq).map((f) => ({ q: f.q, a: f.a }));
  return (
    <section id="faq" className="scroll-mt-20 py-24">
      <Container className="max-w-3xl">
        {heading && <SectionHeading eyebrow="FAQ" title="Questions, answered honestly" />}
        <div className={heading ? "mt-12" : ""}><Accordion items={items} /></div>
        {showLink && (
          <div className="mt-8 text-center"><ButtonLink href="/faq" variant="secondary">Read all questions</ButtonLink></div>
        )}
      </Container>
    </section>
  );
}
