import { promises as fs } from "node:fs";
import path from "node:path";
import { zipSync } from "fflate";
import { TIERS, getTier, type TierId } from "@/config/pricing";
import { retrieveCheckoutSession, isStripeConfigured, isValidSessionId, StripeError } from "./stripe";
import { getOrder } from "./orders";
import { signToken, getSigningSecret, downloadTtlSeconds } from "./signing";

const ROOT = () => path.join(process.cwd(), "private-files");

export interface ManifestFile { path: string; title: string; group: string; tiers: TierId[]; listed: boolean; bytes: number }
export interface ManifestGroup { id: string; label: string; description: string; tiers: TierId[] }
interface Manifest { groups: ManifestGroup[]; files: ManifestFile[] }

let manifestCache: Manifest | null = null;
export async function loadManifest(): Promise<Manifest> {
  if (manifestCache) return manifestCache;
  manifestCache = JSON.parse(await fs.readFile(path.join(ROOT(), "manifest.json"), "utf8"));
  return manifestCache!;
}

export async function filesForTier(tier: TierId) {
  const m = await loadManifest();
  return m.files.filter((f) => f.tiers.includes(tier));
}

/** Resolves a manifest path for a tier, or null. Only manifest paths are ever served (no traversal). */
export async function resolveFile(tier: TierId, rel: string): Promise<{ abs: string; file: ManifestFile } | null> {
  const f = (await filesForTier(tier)).find((x) => x.path === rel);
  if (!f) return null;
  const abs = path.resolve(ROOT(), f.path);
  if (!abs.startsWith(path.resolve(ROOT()) + path.sep)) return null;
  return { abs, file: f };
}

/** Zips a group (or everything) the tier is entitled to. In-memory: packages are ~12 MB. */
export async function buildBundle(tier: TierId, target: string): Promise<{ data: Uint8Array; name: string } | null> {
  const files = (await filesForTier(tier)).filter((f) => target === "all" || f.group === target);
  if (!files.length) return null;
  const entries: Record<string, Uint8Array> = {};
  for (const f of files) entries[f.path] = new Uint8Array(await fs.readFile(path.join(ROOT(), f.path)));
  return { data: zipSync(entries, { level: 0 }), name: `creator-starter-kit-${tier}-${target}.zip` };
}

/* ─────────── purchase verification ─────────── */

export type PurchaseStatus =
  | { status: "paid"; tier: TierId; email?: string | null; sessionId: string }
  | { status: "pending" | "unpaid" | "refunded" | "not_found" | "expired" | "unconfigured" | "invalid" | "error" };

/**
 * Decides whether a purchase is confirmed. Never trusts anything sent by the browser except the
 * opaque session id: payment status always comes from Stripe's API (secret key) and/or an order
 * written by the signature-verified webhook.
 */
export async function verifyPurchase(sessionId: unknown): Promise<PurchaseStatus> {
  if (!isValidSessionId(sessionId)) return { status: "invalid" };
  if (!isStripeConfigured() || !getSigningSecret()) return { status: "unconfigured" };
  try {
    const order = await getOrder(sessionId);
    if (order?.status === "refunded") return { status: "refunded" };
    const s = await retrieveCheckoutSession(sessionId);
    const tier = getTier(s.metadata?.package ?? "");
    if (!tier) return { status: "error" };
    const maxAgeDays = Number(process.env.ACCESS_LINK_MAX_AGE_DAYS) || 90;
    if (s.created && Date.now() / 1000 - s.created > maxAgeDays * 86400) return { status: "expired" };
    const paid = s.payment_status === "paid" && s.status === "complete";
    if (!paid) return { status: s.status === "complete" ? "pending" : "unpaid" };
    return { status: "paid", tier: tier.id, email: s.customer_details?.email ?? order?.email, sessionId };
  } catch (e) {
    if (e instanceof StripeError && e.status === 404) return { status: "not_found" };
    console.error("verifyPurchase failed", e instanceof Error ? e.message : e);
    return { status: "error" };
  }
}

export function mintDownloadUrl(sessionId: string, tier: TierId, kind: "file" | "bundle", target: string): string {
  const secret = getSigningSecret();
  if (!secret) throw new Error("DOWNLOAD_SIGNING_SECRET is not configured");
  const token = signToken({ sid: sessionId, pkg: tier, kind, target, exp: Math.floor(Date.now() / 1000) + downloadTtlSeconds() }, secret);
  return `/api/download?token=${encodeURIComponent(token)}`;
}

export { TIERS };
