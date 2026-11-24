import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getTier } from "@/config/pricing";
import { getSigningSecret, verifyToken } from "@/lib/signing";
import { buildBundle, resolveFile } from "@/lib/delivery";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { ".pdf": "application/pdf", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv; charset=utf-8", ".txt": "text/plain; charset=utf-8" };
const deny = (status: number, msg: string) => new NextResponse(msg, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  const secret = getSigningSecret();
  if (!secret) return deny(503, "Downloads are not configured.");
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const claims = verifyToken(token, secret);
  if (!claims) return deny(403, "This download link is invalid or has expired. Return to your purchase page to get a new one.");
  const tier = getTier(claims.pkg);
  if (!tier) return deny(403, "Invalid package.");

  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  if (claims.kind === "bundle") {
    const b = await buildBundle(tier.id, claims.target);
    if (!b) return deny(404, "Nothing to download.");
    return new NextResponse(Buffer.from(b.data), { headers: { ...headers, "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${b.name}"` } });
  }
  const resolved = await resolveFile(tier.id, claims.target);
  if (!resolved) return deny(404, "File not found.");
  const data = await fs.readFile(resolved.abs);
  const name = path.basename(resolved.abs);
  return new NextResponse(data, { headers: { ...headers, "Content-Type": TYPES[path.extname(name)] ?? "application/octet-stream", "Content-Disposition": `attachment; filename="${name}"` } });
}
