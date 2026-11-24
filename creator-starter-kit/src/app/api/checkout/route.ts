import { NextResponse } from "next/server";
import { getTier } from "@/config/pricing";
import { createCheckoutSession, isStripeConfigured, StripeError } from "@/lib/stripe";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited", message: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  let body: { tier?: string; consent?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid request." }, { status: 400 });
  }
  const tier = getTier(String(body.tier ?? ""));
  if (!tier) return NextResponse.json({ error: "unknown_package", message: "Unknown package." }, { status: 400 });
  if (body.consent !== true) {
    return NextResponse.json({ error: "consent_required", message: "Please confirm the delivery and withdrawal terms to continue." }, { status: 400 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "Checkout is not activated yet: the payment provider has not been configured on this site." },
      { status: 503 },
    );
  }
  try {
    // Price comes from src/config/pricing.ts on the server — never from the browser.
    const session = await createCheckoutSession(tier);
    if (!session.url) throw new Error("No checkout URL returned");
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout failed", e instanceof StripeError ? `${e.status} ${e.message}` : e);
    return NextResponse.json({ error: "provider_error", message: "We couldn't start the checkout. Please try again later." }, { status: 502 });
  }
}
