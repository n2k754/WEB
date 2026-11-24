/** Transactional email through Resend's REST API. Returns false if not configured. */
export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.CONTACT_TO_EMAIL);

export async function sendEmail(opts: { to: string; subject: string; text: string; replyTo?: string }): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [opts.to], subject: opts.subject, text: opts.text, reply_to: opts.replyTo }),
  });
  return res.ok;
}
