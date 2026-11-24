import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PricingCards } from "./PricingCards";
import { CheckoutStatusBanner } from "./CheckoutStatusBanner";

export function PricingSection({ compact = false }: { compact?: boolean }) {
  return (
    <section id="pricing" className="scroll-mt-20 py-24">
      <Container>
        <SectionHeading eyebrow="Pricing" title="Choose the package that fits where you are" description="One-time payment. No subscription. Every package is delivered digitally right after payment is confirmed." />
        <div className="mt-14"><CheckoutStatusBanner /><PricingCards /></div>
        {!compact && (
          <p className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-2 text-center text-sm text-zinc-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
            Prices are in euros. Payment is processed by a secure third-party provider. Digital content: access begins immediately, see our refund policy for details.
          </p>
        )}
      </Container>
    </section>
  );
}
