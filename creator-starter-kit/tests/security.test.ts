import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { signToken, verifyToken } from "../src/lib/signing";
import { verifyStripeSignature, toForm } from "../src/lib/stripe";
import { validateContact } from "../src/lib/contact-validation";
import { rateLimit } from "../src/lib/rate-limit";

const SECRET = "x".repeat(40);
const claims = { sid: "cs_test_abcdefghijk", pkg: "pro", kind: "file" as const, target: "a/b.pdf", exp: Math.floor(Date.now() / 1000) + 60 };

test("signed download tokens: valid, tampered, expired, wrong secret", () => {
  const t = signToken(claims, SECRET);
  assert.deepEqual(verifyToken(t, SECRET), claims);
  const [body, sig] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ ...claims, pkg: "ultimate" })).toString("base64url");
  assert.equal(verifyToken(`${forged}.${sig}`, SECRET), null);
  assert.equal(verifyToken(`${body}.AAAA`, SECRET), null);
  assert.equal(verifyToken(t, "y".repeat(40)), null);
  assert.equal(verifyToken(t, SECRET, Date.now() + 120_000), null);
  assert.equal(verifyToken("garbage", SECRET), null);
});

test("stripe webhook signature verification", () => {
  const body = JSON.stringify({ id: "evt_1" });
  const whsec = "whsec_test";
  const now = Date.now();
  const t = Math.floor(now / 1000);
  const v1 = createHmac("sha256", whsec).update(`${t}.${body}`).digest("hex");
  assert.equal(verifyStripeSignature(body, `t=${t},v1=${v1}`, whsec, 300, now), true);
  assert.equal(verifyStripeSignature(body + " ", `t=${t},v1=${v1}`, whsec, 300, now), false, "modified body");
  assert.equal(verifyStripeSignature(body, `t=${t},v1=${v1}`, "whsec_other", 300, now), false, "wrong secret");
  assert.equal(verifyStripeSignature(body, `t=${t - 1000},v1=${v1}`, whsec, 300, now), false, "stale timestamp");
  assert.equal(verifyStripeSignature(body, null, whsec), false);
  assert.equal(verifyStripeSignature(body, "t=abc,v1=zz", whsec), false);
});

test("stripe form encoding", () => {
  const f = toForm({ a: 1, b: { c: "x" }, d: [{ e: 2 }] }).toString();
  assert.equal(decodeURIComponent(f), "a=1&b[c]=x&d[0][e]=2");
});

test("contact validation", () => {
  assert.equal(validateContact({ name: "A", email: "bad", subject: "", message: "short" }).ok, false);
  const ok = validateContact({ name: "Ana", email: "ana@example.com", subject: "Hello there", message: "A long enough message." });
  assert.equal(ok.ok, true);
  assert.equal(validateContact({ ...ok.values, website: "http://spam" }).spam, true);
});

test("rate limiter", () => {
  for (let i = 0; i < 3; i++) assert.equal(rateLimit("k", 3, 1000, 1000), true);
  assert.equal(rateLimit("k", 3, 1000, 1500), false);
  assert.equal(rateLimit("k", 3, 1000, 2600), true);
});
