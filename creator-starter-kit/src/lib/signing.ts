import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compact signed tokens (payload.signature, both base64url, HMAC-SHA256).
 * Used for expiring download URLs: the server mints them ONLY after a purchase
 * has been verified, and the download route verifies them statelessly.
 */
export interface DownloadClaims {
  /** Stripe Checkout Session id (purchase reference) */
  sid: string;
  /** package / tier id */
  pkg: string;
  /** "file" = single file path, "bundle" = zip of a group id or "all" */
  kind: "file" | "bundle";
  target: string;
  /** expiry, unix seconds */
  exp: number;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function signToken(claims: DownloadClaims, secret: string): string {
  const body = b64(JSON.stringify(claims));
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token: string, secret: string, now = Date.now()): DownloadClaims | null {
  if (typeof token !== "string" || token.length > 2048) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const c = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as DownloadClaims;
    if (typeof c.exp !== "number" || c.exp * 1000 < now) return null;
    if (!c.sid || !c.pkg || !c.target || (c.kind !== "file" && c.kind !== "bundle")) return null;
    return c;
  } catch {
    return null;
  }
}

/** Returns the signing secret, or null if missing / too short (feature stays disabled). */
export function getSigningSecret(): string | null {
  const s = process.env.DOWNLOAD_SIGNING_SECRET ?? "";
  return s.length >= 32 ? s : null;
}

export function downloadTtlSeconds(): number {
  const n = Number(process.env.DOWNLOAD_URL_TTL_SECONDS);
  return Number.isFinite(n) && n >= 60 && n <= 86400 ? n : 900;
}
