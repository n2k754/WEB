/**
 * Business details shown on /legal and in the footer.
 * They come from environment variables so that NOTHING is invented.
 * Missing values are rendered as a clearly highlighted "to complete" marker.
 */
const env = (v: string | undefined) => (v && v.trim() ? v.trim() : "");

export const BUSINESS = {
  name: env(process.env.NEXT_PUBLIC_BUSINESS_NAME),
  legalForm: env(process.env.NEXT_PUBLIC_BUSINESS_LEGAL_FORM),
  address: env(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS),
  country: env(process.env.NEXT_PUBLIC_BUSINESS_COUNTRY),
  registration: env(process.env.NEXT_PUBLIC_BUSINESS_REGISTRATION),
  vat: env(process.env.NEXT_PUBLIC_BUSINESS_VAT),
  publisher: env(process.env.NEXT_PUBLIC_BUSINESS_PUBLISHER),
  hosting: env(process.env.NEXT_PUBLIC_BUSINESS_HOSTING),
  email: env(process.env.NEXT_PUBLIC_SUPPORT_EMAIL),
};

export const BUSINESS_FIELDS: { key: keyof typeof BUSINESS; label: string; env: string }[] = [
  { key: "name", label: "Trading name", env: "NEXT_PUBLIC_BUSINESS_NAME" },
  { key: "legalForm", label: "Legal form", env: "NEXT_PUBLIC_BUSINESS_LEGAL_FORM" },
  { key: "address", label: "Registered address", env: "NEXT_PUBLIC_BUSINESS_ADDRESS" },
  { key: "country", label: "Country of establishment", env: "NEXT_PUBLIC_BUSINESS_COUNTRY" },
  { key: "registration", label: "Business registration number", env: "NEXT_PUBLIC_BUSINESS_REGISTRATION" },
  { key: "vat", label: "VAT number (if applicable)", env: "NEXT_PUBLIC_BUSINESS_VAT" },
  { key: "publisher", label: "Publication director", env: "NEXT_PUBLIC_BUSINESS_PUBLISHER" },
  { key: "hosting", label: "Hosting provider", env: "NEXT_PUBLIC_BUSINESS_HOSTING" },
  { key: "email", label: "Support email", env: "NEXT_PUBLIC_SUPPORT_EMAIL" },
];

/** Refund / withdrawal policy parameters — referenced by FAQ, legal pages and checkout consent. */
export const POLICY = {
  /** Days during which refund requests for defective / undelivered files are accepted. */
  faultClaimDays: 30,
  lastUpdated: "24 November 2026",
};
