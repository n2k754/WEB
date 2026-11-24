"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { validateContact, type ContactErrors } from "@/lib/contact-validation";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "success" } | { kind: "error"; message: string };

export function ContactForm() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const v = validateContact(data);
    setErrors(v.errors);
    if (!v.ok) {
      (form.querySelector(`[name="${Object.keys(v.errors)[0]}"]`) as HTMLElement | null)?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ kind: "success" });
        form.reset();
      } else if (res.status === 422 && json.errors) {
        setErrors(json.errors);
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: json.message ?? "Something went wrong. Please try again later." });
      }
    } catch {
      setStatus({ kind: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return (
      <div role="status" className="glass flex flex-col items-center p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" aria-hidden />
        <h2 className="mt-4 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 max-w-sm text-zinc-400">Thank you. We&apos;ll reply to the email address you provided as soon as we can.</p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus({ kind: "idle" })}>Send another message</Button>
      </div>
    );
  }

  const field = (name: keyof ContactErrors, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`c-${name}`} className="mb-2 block text-sm font-medium">{label}</label>
      <input id={`c-${name}`} name={name} className="input" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `c-${name}-err` : undefined} {...props} />
      {errors[name] && <p id={`c-${name}-err`} className="mt-1.5 text-sm text-rose-300">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="glass space-y-5 p-6 sm:p-8" aria-busy={status.kind === "sending"}>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Name", { autoComplete: "name", maxLength: 100 })}
        {field("email", "Email", { type: "email", autoComplete: "email", maxLength: 200 })}
      </div>
      {field("subject", "Subject", { maxLength: 150 })}
      <div>
        <label htmlFor="c-message" className="mb-2 block text-sm font-medium">Message</label>
        <textarea id="c-message" name="message" rows={6} maxLength={5000} className="input resize-y" aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-message-err" : undefined} />
        {errors.message && <p id="c-message-err" className="mt-1.5 text-sm text-rose-300">{errors.message}</p>}
      </div>
      {/* honeypot: hidden from people and assistive tech */}
      <div className="absolute -left-[9999px]" aria-hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {status.kind === "error" && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{status.message}</div>
      )}
      <Button type="submit" size="lg" loading={status.kind === "sending"} className="w-full sm:w-auto" arrow>{status.kind === "sending" ? "Sending…" : "Send message"}</Button>
      <p className="text-xs text-zinc-500">We use your details only to answer your message. See the <a className="underline" href="/legal#privacy">privacy policy</a>.</p>
    </form>
  );
}
