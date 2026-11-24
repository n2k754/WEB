/**
 * End-to-end test of checkout → webhook → verification → signed download,
 * against a local MOCK of the Stripe API (STRIPE_API_BASE). No real payment is involved.
 */
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createHmac } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";

const SESSION = "cs_test_a1B2c3D4e5F6g7H8i9J0";
const sessions: Record<string, any> = {};
let server: http.Server;

before(async () => {
  server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      if (req.headers.authorization !== "Bearer sk_test_mock") { res.statusCode = 401; return res.end(JSON.stringify({ error: { message: "bad key" } })); }
      if (req.method === "POST" && req.url === "/v1/checkout/sessions") {
        const p = new URLSearchParams(body);
        sessions[SESSION] = { id: SESSION, url: `https://checkout.stripe.test/${SESSION}`, status: "open", payment_status: "unpaid", metadata: { package: p.get("metadata[package]") }, created: Math.floor(Date.now() / 1000), amount_total: Number(p.get("line_items[0][price_data][unit_amount]")), payment_intent: "pi_test_1", customer_details: { email: "buyer@example.com" } };
        return res.end(JSON.stringify(sessions[SESSION]));
      }
      const m = req.url?.match(/^\/v1\/checkout\/sessions\/(.+)$/);
      if (m && sessions[m[1]]) return res.end(JSON.stringify(sessions[m[1]]));
      res.statusCode = 404; res.end(JSON.stringify({ error: { message: "No such session" } }));
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  Object.assign(process.env, {
    STRIPE_API_BASE: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    STRIPE_SECRET_KEY: "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
    DOWNLOAD_SIGNING_SECRET: "s".repeat(48),
    ORDERS_FILE: join(mkdtempSync(join(tmpdir(), "csk-")), "orders.json"),
  });
});
after(() => server.close());

const post = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(url, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

test("full purchase flow", async () => {
  const checkout = await import("../src/app/api/checkout/route");
  const webhook = await import("../src/app/api/webhooks/stripe/route");
  const { verifyPurchase, mintDownloadUrl, filesForTier } = await import("../src/lib/delivery");
  const download = await import("../src/app/api/download/route");

  // consent is mandatory
  let r: Response = await checkout.POST(post("http://x/api/checkout", { tier: "pro" }));
  assert.equal(r.status, 400);
  r = await checkout.POST(post("http://x/api/checkout", { tier: "nope", consent: true }));
  assert.equal(r.status, 400);

  // checkout creates a provider session and returns a redirect URL
  r = await checkout.POST(post("http://x/api/checkout", { tier: "pro", consent: true }));
  assert.equal(r.status, 200);
  assert.match((await r.json()).url, /checkout\.stripe\.test/);
  assert.equal(sessions[SESSION].amount_total, 1999, "price comes from server config");

  // before payment: never unlocked, even though the browser could hit /success?session_id=...
  assert.equal((await verifyPurchase(SESSION)).status, "unpaid");

  // webhook with bad signature is rejected
  r = await webhook.POST(post("http://x/api/webhooks/stripe", "{}", { "stripe-signature": "t=1,v1=00" }));
  assert.equal(r.status, 400);

  // payment completes at the provider, then a correctly signed webhook arrives
  sessions[SESSION] = { ...sessions[SESSION], status: "complete", payment_status: "paid" };
  const event = JSON.stringify({ id: "evt_1", type: "checkout.session.completed", data: { object: sessions[SESSION] } });
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", "whsec_mock").update(`${t}.${event}`).digest("hex");
  r = await webhook.POST(post("http://x/api/webhooks/stripe", event, { "stripe-signature": `t=${t},v1=${sig}` }));
  assert.equal(r.status, 200);

  const purchase = await verifyPurchase(SESSION);
  assert.equal(purchase.status, "paid");
  assert.equal(purchase.status === "paid" && purchase.tier, "pro");

  // signed download works for entitled files, and only for those
  const files = await filesForTier("pro");
  const pdf = files.find((f) => f.path.endsWith("20-AI-Prompts.pdf"))!;
  const url = mintDownloadUrl(SESSION, "pro", "file", pdf.path);
  r = await download.GET(new Request(`http://x${url}`));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/pdf");
  assert.equal((await r.arrayBuffer()).byteLength, pdf.bytes);

  const ultimateOnly = (await filesForTier("ultimate")).find((f) => f.path.includes("Brand-Planning"))!;
  const forged = mintDownloadUrl(SESSION, "pro", "file", ultimateOnly.path);
  assert.equal((await download.GET(new Request(`http://x${forged}`))).status, 404, "pro cannot fetch ultimate files");
  assert.equal((await download.GET(new Request("http://x/api/download?token=abc"))).status, 403);
  assert.equal((await download.GET(new Request("http://x/api/download"))).status, 403);

  // bundle
  r = await download.GET(new Request(`http://x${mintDownloadUrl(SESSION, "pro", "bundle", "prompts")}`));
  assert.equal(r.headers.get("content-type"), "application/zip");

  // refund webhook revokes access
  const refund = JSON.stringify({ id: "evt_2", type: "charge.refunded", data: { object: { payment_intent: "pi_test_1", refunded: true } } });
  const sig2 = createHmac("sha256", "whsec_mock").update(`${t}.${refund}`).digest("hex");
  assert.equal((await webhook.POST(post("http://x/api/webhooks/stripe", refund, { "stripe-signature": `t=${t},v1=${sig2}` }))).status, 200);
  assert.equal((await verifyPurchase(SESSION)).status, "refunded");

  // garbage / unknown ids
  assert.equal((await verifyPurchase("hello")).status, "invalid");
  assert.equal((await verifyPurchase("cs_test_doesnotexist123456")).status, "not_found");
});

test("checkout refuses to pretend when Stripe is not configured", async () => {
  const saved = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = "";
  const checkout = await import("../src/app/api/checkout/route");
  const r = await checkout.POST(post("http://x/api/checkout", { tier: "starter", consent: true }, { "x-forwarded-for": "8.8.8.8" }));
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, "not_configured");
  process.env.STRIPE_SECRET_KEY = saved;
});

test("contact form refuses to pretend when email is not configured", async () => {
  const contact = await import("../src/app/api/contact/route");
  const r = await contact.POST(post("http://x/api/contact", { name: "Ana", email: "ana@example.com", subject: "Hello", message: "A long enough message." }));
  assert.equal(r.status, 503);
  assert.equal((await r.json()).error, "not_configured");
  const bad = await contact.POST(post("http://x/api/contact", { name: "", email: "x", subject: "", message: "" }));
  assert.equal(bad.status, 422);
});
