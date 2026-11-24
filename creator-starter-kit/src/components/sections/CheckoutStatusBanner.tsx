"use client";
import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

/** Shown when the buyer comes back from the provider's page without paying (?checkout=cancelled). */
export function CheckoutStatusBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(new URLSearchParams(window.location.search).get("checkout") === "cancelled"), []);
  if (!show) return null;
  return (
    <div role="status" className="mx-auto mb-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-zinc-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" aria-hidden />
      <p className="flex-1">Checkout was cancelled and you have not been charged. Pick a package whenever you&apos;re ready.</p>
      <button type="button" onClick={() => setShow(false)} aria-label="Dismiss" className="text-zinc-500 hover:text-white"><X className="h-4 w-4" /></button>
    </div>
  );
}
