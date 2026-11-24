export function JsonLd({ data }: { data: unknown }) {
  // JSON.stringify output is escaped for </script> safety
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
