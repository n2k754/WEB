import { NextResponse } from "next/server";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { validateContact } from "@/lib/contact-validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited", message: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid request." }, { status: 400 });
  }
  const { ok, errors, values, spam } = validateContact(body);
  if (spam) return NextResponse.json({ ok: true }); // silently drop bots
  if (!ok) return NextResponse.json({ error: "validation", errors }, { status: 422 });
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "The contact form is not connected to an email service yet, so your message was NOT sent." },
      { status: 503 },
    );
  }
  const sent = await sendEmail({
    to: process.env.CONTACT_TO_EMAIL!,
    replyTo: values.email,
    subject: `[Contact] ${values.subject}`,
    text: `From: ${values.name} <${values.email}>\n\n${values.message}`,
  });
  if (!sent) return NextResponse.json({ error: "send_failed", message: "We couldn't send your message. Please try again later." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
