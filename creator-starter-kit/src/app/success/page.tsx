import type { Metadata } from "next";
import { CheckCircle2, Clock, Download, FileArchive, FileText, ShieldAlert, Info } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getTier } from "@/config/pricing";
import { ACCESS_DAYS } from "@/config/site";
import { filesForTier, loadManifest, mintDownloadUrl, verifyPurchase } from "@/lib/delivery";
import { downloadTtlSeconds } from "@/lib/signing";
import { AutoRefresh } from "@/components/sections/AutoRefresh";

export const metadata: Metadata = { title: "Your purchase", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

function Notice({ icon: Icon, title, children, tone = "info" }: { icon: typeof Info; title: string; children: React.ReactNode; tone?: "info" | "warn" }) {
  return (
    <div role={tone === "warn" ? "alert" : "status"} className="glass mx-auto max-w-xl p-8 text-center">
      <Icon className={`mx-auto h-10 w-10 ${tone === "warn" ? "text-amber-300" : "text-violet-300"}`} aria-hidden />
      <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
      <div className="mt-3 text-sm leading-6 text-zinc-400">{children}</div>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href="/contact" variant="secondary">Contact support</ButtonLink><ButtonLink href="/">Back to home</ButtonLink></div>
    </div>
  );
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const result = await verifyPurchase(session_id);

  if (result.status !== "paid") {
    return (
      <Container className="py-24">
        {result.status === "pending" ? (
          <>
            <Notice icon={Clock} title="Payment pending">Your payment hasn&apos;t been confirmed yet (some payment methods take a little while). This page checks again automatically; your files appear here as soon as the payment succeeds.</Notice>
            <AutoRefresh seconds={8} />
          </>
        ) : result.status === "unconfigured" ? (
          <Notice icon={ShieldAlert} title="Delivery is not configured" tone="warn">Purchase verification is not active on this site yet (payment provider keys or the download signing secret are missing), so no files can be released.</Notice>
        ) : result.status === "refunded" ? (
          <Notice icon={Info} title="This order was refunded">Access to the files for this order has ended because the payment was refunded.</Notice>
        ) : result.status === "expired" ? (
          <Notice icon={Clock} title="This access link has expired">Purchase pages stay valid for {ACCESS_DAYS} days. Contact us with the email used at checkout and we&apos;ll help you.</Notice>
        ) : result.status === "error" ? (
          <Notice icon={ShieldAlert} title="We couldn't verify your payment" tone="warn">Something went wrong while checking your payment. Please reload this page in a minute. You have not lost access: if the problem continues, contact us.</Notice>
        ) : (
          <Notice icon={ShieldAlert} title="No confirmed purchase found" tone="warn">We couldn&apos;t find a confirmed payment for this link. If you just paid, wait a few seconds and reload. Otherwise, start from the pricing section.</Notice>
        )}
      </Container>
    );
  }

  const tier = getTier(result.tier)!;
  const manifest = await loadManifest();
  const files = await filesForTier(tier.id);
  const groups = manifest.groups.filter((g) => g.tiers.includes(tier.id));
  const ttlMin = Math.round(downloadTtlSeconds() / 60);

  return (
    <Container className="max-w-4xl py-16">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" aria-hidden />
        <p className="eyebrow mt-5">Payment confirmed</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Thank you! Your {tier.name} package is ready.</h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">Download your files below. Bookmark this page: its address is your personal access link (valid for {ACCESS_DAYS} days). Please don&apos;t share it.</p>
      </div>

      <div className="glass mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div><h2 className="font-semibold">Download everything</h2><p className="text-sm text-zinc-400">One ZIP with all the files in your package.</p></div>
        <ButtonLink plain href={mintDownloadUrl(result.sessionId, tier.id, "bundle", "all")} arrow><FileArchive className="h-4 w-4" aria-hidden /> Download .zip</ButtonLink>
      </div>

      <div className="mt-6 space-y-5">
        {groups.map((g) => {
          const gf = files.filter((f) => f.group === g.id);
          const listed = gf.filter((f) => f.listed);
          return (
            <section key={g.id} className="glass p-6" aria-labelledby={`g-${g.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 id={`g-${g.id}`} className="text-lg font-semibold">{g.label}</h2><p className="text-sm text-zinc-400">{g.description}</p></div>
                {gf.length > 1 && <ButtonLink plain href={mintDownloadUrl(result.sessionId, tier.id, "bundle", g.id)} variant="secondary" size="sm"><FileArchive className="h-4 w-4" aria-hidden /> ZIP ({gf.length} files)</ButtonLink>}
              </div>
              {listed.length > 0 && (
                <ul className="mt-4 divide-y divide-white/10">
                  {listed.map((f) => (
                    <li key={f.path} className="flex items-center justify-between gap-4 py-3">
                      <span className="flex min-w-0 items-center gap-3 text-sm"><FileText className="h-4 w-4 shrink-0 text-violet-300" aria-hidden /><span className="truncate">{f.title}</span></span>
                      <a href={mintDownloadUrl(result.sessionId, tier.id, "file", f.path)} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium hover:bg-white/10"><Download className="h-3.5 w-3.5" aria-hidden /> {fmt(f.bytes)}</a>
                    </li>
                  ))}
                </ul>
              )}
              {g.id === "templates" && <p className="mt-3 text-xs text-zinc-500">Individual SVG, background and PNG files are inside the ZIP, organised in svg/, backgrounds/ and png/ folders.</p>}
            </section>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-zinc-500">Download links expire after {ttlMin} minutes for security. Reload this page to get fresh ones. Need help? <a className="underline" href="/contact">Contact us</a>.</p>
    </Container>
  );
}
