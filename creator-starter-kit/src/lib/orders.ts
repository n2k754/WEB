import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Order store. Orders are written ONLY by the verified webhook.
 *
 * The default implementation is a JSON file: perfect for local development and a
 * single long-running server (VPS / Docker with a volume). On serverless hosts
 * (Vercel, Netlify) the filesystem is ephemeral: swap these three functions for a
 * database or KV store (Postgres, Redis, Upstash, Vercel KV, …). The rest of the
 * code only uses this interface. The success page also verifies directly with
 * Stripe, so purchases still unlock correctly if the store is empty.
 */
export interface Order {
  sessionId: string;
  paymentIntent?: string | null;
  tier: string;
  email?: string | null;
  status: "paid" | "refunded" | "failed";
  updatedAt: string;
  emailedAt?: string;
}

const file = () => process.env.ORDERS_FILE ?? path.join(process.cwd(), ".data", "orders.json");

async function readAll(): Promise<Record<string, Order>> {
  try {
    return JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ file(), "utf8"));
  } catch {
    return {};
  }
}

let queue: Promise<unknown> = Promise.resolve();

export async function saveOrder(order: Order): Promise<void> {
  // serialise writes inside this process
  queue = queue.then(async () => {
    const all = await readAll();
    all[order.sessionId] = order;
    await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(file()), { recursive: true });
    const tmp = `${file()}.${process.pid}.tmp`;
    await fs.writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(all, null, 2));
    await fs.rename(/*turbopackIgnore: true*/ tmp, file());
  });
  await queue;
}

export async function getOrder(sessionId: string): Promise<Order | undefined> {
  return (await readAll())[sessionId];
}

export async function getOrderByPaymentIntent(pi: string): Promise<Order | undefined> {
  return Object.values(await readAll()).find((o) => o.paymentIntent === pi);
}
