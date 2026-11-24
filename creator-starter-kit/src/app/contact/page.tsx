import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ContactForm } from "@/components/sections/ContactForm";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Creator Starter Kit team for questions about your purchase, delivery or the product.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-6 pt-14">
        <AnimatedBackground />
        <Container><SectionHeading as="h1" eyebrow="Contact" title="Talk to us" description="Questions about the kit, a purchase or your files? Send a message and include the email you used at checkout if it's about an order." /></Container>
      </section>
      <section className="py-12">
        <Container className="grid max-w-5xl gap-8 lg:grid-cols-[1.6fr_1fr]">
          <ContactForm />
          <aside className="glass h-fit p-6 text-sm leading-6 text-zinc-400">
            <Mail className="h-5 w-5 text-violet-300" aria-hidden />
            <h2 className="mt-3 font-semibold text-white">Before you write</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Download problems: reload your purchase page to get fresh links.</li>
              <li>Refund and delivery rules are on the <a className="text-violet-300 underline" href="/legal#refunds">legal page</a>.</li>
              <li>Many answers are in the <a className="text-violet-300 underline" href="/faq">FAQ</a>.</li>
            </ul>
            {SITE.supportEmail && <p className="mt-4">Email: <a className="text-violet-300 underline" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></p>}
          </aside>
        </Container>
      </section>
    </>
  );
}
