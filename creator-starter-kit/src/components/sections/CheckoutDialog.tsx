"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Lock, X } from "lucide-react";
import { formatPrice, type Tier } from "@/config/pricing";
import { Button } from "@/components/ui/Button";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string; notConfigured?: boolean };

export function CheckoutDialog({ tier, onClose }: { tier: Tier | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (tier && !d.open) {
      setConsent(false);
      setState({ kind: "idle" });
      d.showModal();
    }
    if (!tier && d.open) d.close();
  }, [tier]);

  async function go() {
    if (!tier) return;
    if (!consent) return setState({ kind: "error", message: "Please tick the box to confirm the delivery and withdrawal terms." });
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: tier.id, consent }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setState({ kind: "error", message: data.message ?? "Something went wrong. Please try again.", notConfigured: data.error === "not_configured" });
    } catch {
      setState({ kind: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="checkout-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-white/10 bg-ink-100 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
      {tier && (
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Checkout</p>
              <h2 id="checkout-title" className="mt-2 text-2xl font-semibold">{tier.name}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 hover:bg-white/10"><X className="h-4 w-4" /></button>
          </div>
          <p className="mt-4 text-3xl font-bold">{formatPrice(tier.priceCents, tier.currency)}<span className="ml-2 text-sm font-normal text-zinc-500">one-time</span></p>
          <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">{tier.features.map((f) => <li key={f}>• {f}</li>)}</ul>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-300">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-violet-500" />
            <span>
              I request immediate access to the digital files and acknowledge that I lose my right of withdrawal once access begins. I have read the{" "}
              <Link href="/legal#terms" target="_blank" className="text-violet-300 underline underline-offset-2">terms</Link> and{" "}
              <Link href="/legal#refunds" target="_blank" className="text-violet-300 underline underline-offset-2">refund policy</Link>.
            </span>
          </label>

          {state.kind === "error" && (
            <div role="alert" className="mt-4 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p>{state.message}</p>
                {state.notConfigured && <p className="mt-1 text-amber-200/70">No payment was attempted and you have not been charged.</p>}
              </div>
            </div>
          )}

          <Button onClick={go} loading={state.kind === "loading"} size="lg" className="mt-6 w-full" arrow>
            {state.kind === "loading" ? "Redirecting…" : "Continue to secure payment"}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-500"><Lock className="h-3 w-3" aria-hidden /> Payment is handled on the provider&apos;s secure page. We never see your card details.</p>
        </div>
      )}
    </dialog>
  );
}
