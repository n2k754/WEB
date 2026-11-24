import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about Creator Starter Kit: contents, beginners, Canva, commercial use, refunds and how to access your files.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pt-14">
        <AnimatedBackground />
        <Container><SectionHeading as="h1" eyebrow="FAQ" title="Frequently asked questions" description="Clear answers about the product, delivery, usage rights and refunds." /></Container>
      </section>
      <FaqSection heading={false} showLink={false} />
      <CtaSection title="Still have a question?" text="Send us a message and we'll get back to you." primary={{ href: "/contact", label: "Contact us" }} secondary={{ href: "/#pricing", label: "See pricing" }} />
      <JsonLd data={faqJsonLd()} />
    </>
  );
}
