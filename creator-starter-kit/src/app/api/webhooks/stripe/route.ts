import { NextResponse } from "next/server";
import { getTier } from "@/config/pricing";
import { SITE } from "@/config/site";
import { isWebhookConfigured, verifyStripeSignature, type CheckoutSession } from "@/lib/stripe";
import { getOrder, getOrderByPaymentIntent, saveOrder } from "@/lib/orders";
import { isEmailConfigured, sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, any> };
}

export async function POST(req: Request) {
  if (!isWebhookConfigured()) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  // Signature must be checked against the RAW body.
  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  let event: StripeEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = obj as unknown as CheckoutSession;
      const tier = getTier(s.metadata?.package ?? "");
      if (tier && s.payment_status === "paid") {
        const existing = await getOrder(s.id);
        const email = s.customer_details?.email ?? s.customer_email ?? null;
        const order = { sessionId: s.id, paymentIntent: s.payment_intent ?? null, tier: tier.id, email, status: "paid" as const, updatedAt: new Date().toISOString(), emailedAt: existing?.emailedAt };
        await saveOrder(order);
        if (email && !existing?.emailedAt && isEmailConfigured()) {
          const sent = await sendEmail({
            to: email,
            subject: `Your ${SITE.shortName} access — ${tier.name}`,
            text: `Thank you for your purchase.\n\nYour files are available here (keep this link private):\n${SITE.url}/success?session_id=${s.id}\n\nIf you have any question, use the contact page on ${SITE.url}/contact.`,
          });
          if (sent) await saveOrder({ ...order, emailedAt: new Date().toISOString() });
        }
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const s = obj as unknown as CheckoutSession;
      await saveOrder({ sessionId: s.id, tier: s.metadata?.package ?? "", status: "failed", updatedAt: new Date().toISOString() });
      break;
    }
    case "charge.refunded": {
      const pi = obj.payment_intent as string | undefined;
      const fully = obj.refunded === true;
      const order = pi ? await getOrderByPaymentIntent(pi) : undefined;
      if (order && fully) await saveOrder({ ...order, status: "refunded", updatedAt: new Date().toISOString() });
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
