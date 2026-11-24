import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { BUSINESS, BUSINESS_FIELDS, POLICY } from "@/config/business";
import { EXTERNAL_CHECKOUT, TIERS, formatPrice } from "@/config/pricing";
import { ACCESS_DAYS, SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Legal information",
  description: "Terms and conditions, privacy policy, digital delivery information, refund policy and legal notice.",
  alternates: { canonical: "/legal" },
};

const TOC = [
  ["terms", "Terms & conditions"],
  ["privacy", "Privacy policy"],
  ["delivery", "Digital product delivery"],
  ["refunds", "Refund policy"],
  ["notice", "Legal notice"],
];

/** A business detail, or a clearly highlighted "to complete" marker. Nothing is ever invented. */
function Detail({ k }: { k: keyof typeof BUSINESS }) {
  const field = BUSINESS_FIELDS.find((f) => f.key === k)!;
  const v = BUSINESS[k];
  if (v) return <>{v}</>;
  return <mark className="rounded bg-amber-400/20 px-1.5 py-0.5 text-amber-200" title={`Set ${field.env}`}>[To complete: {field.label}]</mark>;
}

export default function LegalPage() {
  const missing = BUSINESS_FIELDS.filter((f) => !BUSINESS[f.key]);
  const prices = TIERS.map((t) => `${t.name} ${formatPrice(t.priceCents, t.currency)}`).join(", ");
  return (
    <>
      <section className="relative isolate overflow-hidden pb-8 pt-14">
        <AnimatedBackground />
        <Container><SectionHeading as="h1" eyebrow="Legal" title="Legal information" description={`Last updated: ${POLICY.lastUpdated}`} /></Container>
      </section>
      <Container className="grid gap-10 pb-12 pt-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Legal sections" className="lg:sticky lg:top-24 lg:h-fit">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {TOC.map(([id, label]) => <li key={id}><a href={`#${id}`} className="block rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 lg:rounded-xl lg:border-transparent">{label}</a></li>)}
          </ul>
        </nav>
        <div className="prose-legal max-w-3xl space-y-16">
          {missing.length > 0 && (
            <div role="note" className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-6 text-amber-100">
              <strong>Site owner:</strong> {missing.length} business detail{missing.length > 1 ? "s are" : " is"} not configured yet and shown as highlighted markers below. Set the matching environment variables (see <code>.env.example</code>) with your real, registered details before going live. Have these texts reviewed by a legal professional for your country.
            </div>
          )}

          <section id="terms" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-white">Terms &amp; conditions</h2>
            <h3>1. Seller</h3>
            <p>These terms apply to purchases of digital products on {SITE.url} from <Detail k="name" /> ({<Detail k="legalForm" />}), <Detail k="address" />, <Detail k="country" />. Registration: <Detail k="registration" />. VAT: <Detail k="vat" />. Contact: <Detail k="email" />.</p>
            <h3>2. Products and prices</h3>
            <p>We sell {SITE.name}, a digital toolkit available in three packages: {prices}. Prices are in euros and are shown before you pay. Applicable taxes, where due, are shown or included according to the checkout. The exact contents of each package are listed on the pricing cards and on the “What&apos;s included” page.</p>
            <h3>3. Ordering and payment</h3>
            {EXTERNAL_CHECKOUT && <p><strong>Orders are placed and paid on Gumroad.</strong> Gumroad processes the payment and delivers the files, and its terms, privacy policy and refund rules also apply to your order. Where Gumroad acts as merchant of record, it is the seller of record for tax purposes.</p>}
            <p>You order by selecting a package and paying through our third-party payment provider. The contract is formed when payment is confirmed. We do not see or store your card details. Access is granted only after payment has been confirmed by the payment provider.</p>
            <h3>4. Licence</h3>
            <p>On purchase you receive a non-exclusive, non-transferable licence to use the files for your own personal or business purposes, including commercial use for your own content and for client work where clients only receive finished designs. You may not resell, share, redistribute or sublicense the files, in original or modified form, or share your private access link. The full licence text is included in every package.</p>
            <h3>5. No guarantee of results</h3>
            <p>The products are educational and organisational tools. We make no promise regarding income, audience growth or sales. Content on finance, tax, law or marketing is general information and not professional advice.</p>
            <h3>6. Third-party services</h3>
            <p>Canva, Notion, TikTok, Instagram and AI assistants are services of third parties, are not affiliated with us, and are governed by their own terms. You are responsible for your own accounts with them.</p>
            <h3>7. Updates</h3>
            <p>Where your package mentions future updates, we may publish updated or additional files to your purchase page at our discretion. We do not guarantee any particular update or timing.</p>
            <h3>8. Liability</h3>
            <p>Nothing in these terms limits liability that cannot be limited by law, including your mandatory consumer rights. Subject to that, we are not liable for indirect losses or for results you obtain or fail to obtain from using the products.</p>
            <h3>9. Governing law and disputes</h3>
            <p>These terms are governed by the law of <Detail k="country" />, without depriving consumers of the protection of mandatory rules of their country of residence. Consumers in the EU may also use the European Commission&apos;s online dispute resolution resources where applicable.</p>
          </section>

          <section id="privacy" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-white">Privacy policy</h2>
            <h3>Who is responsible</h3>
            <p>The data controller is <Detail k="name" />, <Detail k="address" />. Contact: <Detail k="email" />.</p>
            <h3>What we process and why</h3>
            <ul>
              <li><strong>Purchase data</strong> (email address, selected package, payment status and references): to provide the product, give you access and handle support. Legal basis: performance of the contract and legal obligations such as accounting.</li>
              <li><strong>Contact messages</strong> (name, email, subject, message): to answer you. Legal basis: our legitimate interest in handling your request, or pre-contractual steps.</li>
              <li><strong>Technical data</strong> (such as IP address in server logs): to secure the site and prevent abuse. Legal basis: legitimate interest.</li>
            </ul>
            <h3>Processors and recipients</h3>
            <p>Payments are processed by our payment provider ({EXTERNAL_CHECKOUT ? "Gumroad" : "Stripe"}), which is responsible for card data and has its own privacy policy. Contact and order emails may be sent through an email provider (Resend). The site is hosted by <Detail k="hosting" />. These providers may process data outside your country; where required, appropriate safeguards apply.</p>
            <h3>Cookies</h3>
            <p>This site does not use advertising or analytics cookies. If that changes, we will ask for your consent first.</p>
            <h3>Retention</h3>
            <p>Order records are kept as long as needed to provide access and to meet legal retention duties. Contact messages are kept as long as needed to handle your request.</p>
            <h3>Your rights</h3>
            <p>Depending on where you live you may have the right to access, correct, delete, restrict or port your data, to object to processing, and to complain to your data protection authority. Contact us at <Detail k="email" /> to exercise your rights.</p>
          </section>

          <section id="delivery" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-white">Digital product delivery</h2>
            <ul>
              <li>Delivery is digital only. Nothing is shipped.</li>
              {EXTERNAL_CHECKOUT && <li>Files are delivered by Gumroad: right after payment you get a download page and an email with your link. Keep that email.</li>}
              <li>After your payment is confirmed you are redirected to your personal purchase page, where the files of your package become available. Access is never granted on the basis of a message shown in your browser: it is granted only when the payment provider confirms the payment.</li>
              <li>Bank-transfer or delayed payment methods, if offered, unlock your files once the payment has actually succeeded.</li>
              <li>Download links on the page are personal and expire after a short time (15 minutes by default). Reload the page to generate new ones.</li>
              <li>Your purchase page address is your access link. Bookmark it and keep it private. It stays valid for {ACCESS_DAYS} days after purchase; contact us if you need it renewed.</li>
              <li>Formats: PDF, SVG, PNG, CSV and TXT files, and ZIP archives of the files in your package. You need software to open them, such as a PDF reader and, for the template and dashboard files, a vector editor or Canva and Notion accounts.</li>
              <li>If you can&apos;t access your files, contact us and include the email used at checkout.</li>
            </ul>
          </section>

          <section id="refunds" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-white">Refund policy</h2>
            <h3>Right of withdrawal and digital content</h3>
            <p>Consumers in the EU and UK normally have a 14-day right to withdraw from distance purchases. For digital content that is not supplied on a physical medium, this right ends once performance has begun with your prior express consent and your acknowledgement that you lose the right of withdrawal. At checkout, we ask you to request immediate access and to confirm this acknowledgement. Because the files are available immediately after payment, <strong>we do not offer change-of-mind refunds once you have access.</strong></p>
            <h3>When we will fix it or refund you</h3>
            <ul>
              <li>Files are missing, corrupted or cannot be opened, and we can&apos;t fix the problem.</li>
              <li>The content you receive does not match the description of your package.</li>
              <li>You were charged more than once for the same order.</li>
              <li>You were charged but did not receive access.</li>
            </ul>
            <p>Contact us within {POLICY.faultClaimDays} days of purchase using the contact page, with the email used at checkout and a short description. If we confirm the issue, we will correct it or refund the order to the original payment method.</p>
            <h3>Your legal rights</h3>
            <p>This policy does not affect any mandatory rights you have under the law of your country, such as rights relating to defective digital content.</p>
          </section>

          <section id="notice" className="scroll-mt-24">
            <h2 className="text-3xl font-semibold text-white">Legal notice</h2>
            <dl className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 text-[15px]">
              {BUSINESS_FIELDS.map((f) => (
                <div key={f.key} className="grid gap-1 px-5 py-3 sm:grid-cols-[220px_1fr]"><dt className="text-zinc-500">{f.label}</dt><dd className="text-zinc-200"><Detail k={f.key} /></dd></div>
              ))}
            </dl>
            <p className="mt-4">Website: {SITE.url}. Intellectual property: all texts, designs, templates and files are protected. Reproduction without permission is prohibited, except as allowed by the licence.</p>
          </section>
        </div>
      </Container>
    </>
  );
}
