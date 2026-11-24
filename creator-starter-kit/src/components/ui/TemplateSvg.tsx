/** Renders one of our generated template SVGs inline. `scope` keeps gradient ids unique when a template appears twice. */
export function TemplateSvg({ id, svg, scope, label, className }: { id: string; svg: string; scope: string; label: string; className?: string }) {
  const html = svg
    .replaceAll(`${id}-`, `${scope}-${id}-`)
    .replace(/ width="\d+" height="\d+"/, ' width="100%" height="100%"')
    .replace("<svg ", `<svg role="img" aria-label="${label.replace(/"/g, "")}" preserveAspectRatio="xMidYMid meet" `);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
