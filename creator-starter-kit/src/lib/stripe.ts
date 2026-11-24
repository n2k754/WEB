import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE } from "@/config/site";
import { formatPrice, type Tier } from "@/config/pricing";

/**
 * Minimal Stripe Checkout integration over the REST API (no SDK, no extra dependency).
 * The secret key only ever lives in server-side code / environment variables.
 */
const apiBase = () => (process.env.STRIPE_API_BASE ?? "https://api.stripe.com").replace(/\/$/, "");

export const isStripeConfigured = () => /^(sk|rk)_(test|live)_/.test(process.env.STRIPE_SECRET_KEY ?? "");
export const isWebhookConfigured = () => (process.env.STRIPE_WEBHOOK_SECRET ?? "").startsWith("whsec_");

export class StripeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Flattens {a:{b:1}, c:[{d:2}]} into Stripe's bracket notation. */
export function toForm(obj: Record<string, unknown>, prefix = "", out = new URLSearchParams()): URLSearchParams {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === "object" ? toForm(item as Record<string, unknown>, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(item))));
    else if (typeof v === "object") toForm(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripeFetch<T>(path: string, init?: { method?: string; body?: URLSearchParams }): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init?.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: init?.body,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } } & T;
  if (!res.ok) throw new StripeError(json.error?.message ?? `Stripe error ${res.status}`, res.status);
  return json;
}

export interface CheckoutSession {
  id: string;
  url?: string | null;
  status?: string;
  payment_status?: "paid" | "unpaid" | "no_payment_required";
  payment_intent?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string>;
  created?: number;
  amount_total?: number | null;
  currency?: string | null;
}

export async function createCheckoutSession(tier: Tier): Promise<CheckoutSession> {
  const now = new Date().toISOString();
  const params = toForm({
    mode: "payment",
    locale: "auto",
    billing_address_collection: "auto",
    success_url: `${SITE.url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/?checkout=cancelled#pricing`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: tier.currency,
          unit_amount: tier.priceCents,
          product_data: {
            name: `${SITE.name} — ${tier.name}`,
            description: tier.features.slice(0, 4).join(" · ").slice(0, 300),
          },
        },
      },
    ],
    metadata: { package: tier.id, consent_digital_delivery: "true", consent_at: now },
    payment_intent_data: { metadata: { package: tier.id } },
    custom_text: {
      submit: {
        message: `Price: ${formatPrice(tier.priceCents, tier.currency)}. Digital content is made available immediately after payment. By paying, you request immediate access and acknowledge that you lose your right of withdrawal once access to the files has begun.`,
      },
    },
  });
  return stripeFetch<CheckoutSession>("/v1/checkout/sessions", { method: "POST", body: params });
}

export function isValidSessionId(id: unknown): id is string {
  return typeof id === "string" && /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(id);
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  if (!isValidSessionId(id)) throw new StripeError("Invalid session id", 400);
  return stripeFetch<CheckoutSession>(`/v1/checkout/sessions/${encodeURIComponent(id)}`);
}

/**
 * Verifies a Stripe webhook signature header ("t=...,v1=...") against the RAW request body.
 * Rejects stale timestamps (replay protection).
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, toleranceSec = 300, nowMs = Date.now()): boolean {
  if (!header) return false;
  const parts = header.split(",").map((p) => p.trim().split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || sigs.length === 0 || !/^\d+$/.test(t)) return false;
  if (Math.abs(nowMs / 1000 - Number(t)) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest();
  return sigs.some((s) => {
    try {
      const given = Buffer.from(s, "hex");
      return given.length === expected.length && timingSafeEqual(given, expected);
    } catch {
      return false;
    }
  });
}
