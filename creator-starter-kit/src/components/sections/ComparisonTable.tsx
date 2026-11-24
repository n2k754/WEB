import { Check, Minus } from "lucide-react";
import { TIERS, formatPrice } from "@/config/pricing";
import { COMPONENTS, ULTIMATE_EXTRAS } from "@/content/product";

export function ComparisonTable() {
  const rows = [
    ...COMPONENTS.map((c) => ({ label: c.title, values: [c.availability.starter, c.availability.pro, c.availability.ultimate] })),
    { label: "Brand planning workbook", values: ["—", "—", "Included"] },
    { label: "Bonus content planning guide", values: ["—", "—", "Included"] },
    { label: "Future updates where available", values: ["—", "—", "Included"] },
  ];
  const cell = (v: string) => (v === "—" ? <Minus className="mx-auto h-4 w-4 text-zinc-600" aria-label="Not included" /> : v === "Included" ? <Check className="mx-auto h-4 w-4 text-violet-300" aria-label="Included" /> : <span className="text-zinc-200">{v}</span>);
  void ULTIMATE_EXTRAS;
  return (
    <div className="glass overflow-x-auto !rounded-2xl">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Comparison of what each package contains</caption>
        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className="p-4 font-medium text-zinc-400 sm:p-5">Resource</th>
            {TIERS.map((t) => (
              <th key={t.id} scope="col" className={`p-4 text-center sm:p-5 ${t.recommended ? "text-violet-200" : ""}`}>
                <span className="block font-bold tracking-wider">{t.name}</span>
                <span className="block text-xs font-normal text-zinc-500">{formatPrice(t.priceCents, t.currency)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-white/5 last:border-0">
              <th scope="row" className="p-4 font-medium text-zinc-300 sm:p-5">{r.label}</th>
              {r.values.map((v, i) => <td key={i} className="p-4 text-center sm:p-5">{cell(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
