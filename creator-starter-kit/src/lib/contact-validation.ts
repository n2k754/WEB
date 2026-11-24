export interface ContactValues { name: string; email: string; subject: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the browser form (instant feedback) and the API route (authoritative check). */
export function validateContact(input: unknown): { ok: boolean; errors: ContactErrors; values: ContactValues; spam: boolean } {
  const i = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const s = (k: string) => (typeof i[k] === "string" ? (i[k] as string).trim() : "");
  const values: ContactValues = { name: s("name"), email: s("email"), subject: s("subject").replace(/\s+/g, " "), message: s("message") };
  const errors: ContactErrors = {};
  if (values.name.length < 2 || values.name.length > 100) errors.name = "Please enter your name (2–100 characters).";
  if (!EMAIL.test(values.email) || values.email.length > 200) errors.email = "Please enter a valid email address.";
  if (values.subject.length < 3 || values.subject.length > 150) errors.subject = "Please add a subject (3–150 characters).";
  if (values.message.length < 10 || values.message.length > 5000) errors.message = "Your message should be between 10 and 5000 characters.";
  const spam = s("website").length > 0; // honeypot field
  return { ok: Object.keys(errors).length === 0, errors, values, spam };
}
