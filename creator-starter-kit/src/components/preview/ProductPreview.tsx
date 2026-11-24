"use client";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, Copy, Database, LayoutTemplate, WandSparkles } from "lucide-react";
import { TemplateSvg } from "@/components/ui/TemplateSvg";
import { cn } from "@/lib/cn";

interface Tpl { id: string; name: string; category: string; categoryLabel: string; width: number; height: number; svg: string }
interface Prompt { id: number; category: string; title: string; useWhen: string; prompt: string; tip: string }
interface GuidePage { chapter: string; title: string; body: string[]; callout: string; page: number }
interface Notion { columns: string[]; cards: { status: string; title: string; platform: string; pillar: string; date: string }[]; weekly: { label: string; value: string }[]; databases: string[] }

const TABS = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "notion", label: "Notion dashboard", icon: Database },
  { id: "guide", label: "Business guide", icon: BookOpen },
  { id: "prompts", label: "AI prompts", icon: WandSparkles },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function ProductPreview({ templates, prompts, guide, notion }: { templates: Tpl[]; prompts: Prompt[]; guide: GuidePage[]; notion: Notion }) {
  const [tab, setTab] = useState<TabId>("templates");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKey(e: React.KeyboardEvent) {
    const i = TABS.findIndex((t) => t.id === tab);
    const n = e.key === "ArrowRight" ? (i + 1) % TABS.length : e.key === "ArrowLeft" ? (i - 1 + TABS.length) % TABS.length : -1;
    if (n >= 0) { e.preventDefault(); setTab(TABS[n].id); refs.current[TABS[n].id]?.focus(); }
  }

  return (
    <div className="glass !rounded-[2rem] p-3 sm:p-5">
      <div role="tablist" aria-label="Product preview" onKeyDown={onKey} className="grid grid-cols-2 gap-1 rounded-2xl bg-black/30 p-1.5 sm:flex">
        {TABS.map((t) => (
          <button key={t.id} ref={(el) => { refs.current[t.id] = el; }} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1} onClick={() => setTab(t.id)} className={cn("flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition", tab === t.id ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-glow" : "text-zinc-400 hover:text-white")}>
            <t.icon className="h-4 w-4" aria-hidden /> {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5 min-h-[520px] px-1 sm:px-3">
        <AnimatePresence mode="wait">
          <motion.div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === "templates" && <TemplatesPane templates={templates} />}
            {tab === "notion" && <NotionPane data={notion} />}
            {tab === "guide" && <GuidePane pages={guide} />}
            {tab === "prompts" && <PromptsPane prompts={prompts} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="px-3 pb-2 pt-4 text-center text-xs text-zinc-500">Original sample content from the kit. Downloads are available only after a confirmed purchase.</p>
    </div>
  );
}

/* ───── Templates ───── */
function TemplatesPane({ templates }: { templates: Tpl[] }) {
  const cats = useMemo(() => Array.from(new Map(templates.map((t) => [t.category, t.categoryLabel])).entries()), [templates]);
  const [cat, setCat] = useState<string>("all");
  const list = templates.filter((t) => cat === "all" || t.category === cat);
  const [selId, setSelId] = useState(templates[0]?.id);
  const sel = list.find((t) => t.id === selId) ?? list[0];

  if (!list.length) return <Empty text="No templates in this category." />;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {[["all", "All"], ...cats].map(([id, label]) => (
            <button key={id} aria-pressed={cat === id} onClick={() => setCat(id)} className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition", cat === id ? "border-violet-400/60 bg-violet-500/20 text-violet-100" : "border-white/10 text-zinc-400 hover:text-white")}>{label}</button>
          ))}
        </div>
        <ul className="mt-5 grid grid-cols-3 items-start gap-3 sm:grid-cols-4">
          {list.map((t) => (
            <li key={t.id}>
              <button onClick={() => setSelId(t.id)} aria-pressed={sel?.id === t.id} aria-label={`Preview ${t.name}`} className={cn("block w-full overflow-hidden rounded-xl border-2 transition hover:scale-[1.03]", sel?.id === t.id ? "border-violet-400" : "border-transparent")}>
                <TemplateSvg id={t.id} svg={t.svg} scope="thumb" label={t.name} className="[&>svg]:block" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {sel && (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/15 shadow-glow">
            <TemplateSvg id={sel.id} svg={sel.svg} scope="large" label={sel.name} className="[&>svg]:block" />
          </div>
          <p className="mt-4 text-sm font-semibold">{sel.name}</p>
          <p className="text-xs text-zinc-500">{sel.categoryLabel} · {sel.width} × {sel.height} px</p>
        </div>
      )}
    </div>
  );
}

/* ───── Notion ───── */
function NotionPane({ data }: { data: Notion }) {
  const [view, setView] = useState<"board" | "weekly">("board");
  return (
    <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Databases</p>
        <ul className="space-y-1">{data.databases.map((d, i) => <li key={d} className={cn("rounded-lg px-3 py-2 text-sm", i === 0 ? "bg-violet-500/20 text-violet-100" : "text-zinc-400")}>{d}</li>)}</ul>
      </div>
      <div>
        <div className="mb-4 flex gap-2" role="group" aria-label="View">
          {(["board", "weekly"] as const).map((v) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium", view === v ? "border-violet-400/60 bg-violet-500/20" : "border-white/10 text-zinc-400")}>
              {v === "board" ? <><Database className="h-3.5 w-3.5" aria-hidden /> Board by status</> : <><CalendarDays className="h-3.5 w-3.5" aria-hidden /> Weekly planning</>}
            </button>
          ))}
        </div>
        {view === "board" ? (
          <div className="grid gap-3 overflow-x-auto sm:grid-cols-4">
            {data.columns.map((col) => (
              <div key={col} className="min-w-[160px] rounded-2xl bg-black/20 p-3">
                <p className="mb-3 text-xs font-semibold text-zinc-300">{col} <span className="ml-1 text-zinc-600">{data.cards.filter((c) => c.status === col).length}</span></p>
                <div className="space-y-2.5">
                  {data.cards.filter((c) => c.status === col).map((c) => (
                    <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[13px] font-medium leading-snug">{c.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]"><span className="rounded bg-violet-500/25 px-1.5 py-0.5 text-violet-200">{c.platform}</span><span className="rounded bg-indigo-500/25 px-1.5 py-0.5 text-indigo-200">{c.pillar}</span><span className="text-zinc-500">{c.date}</span></div>
                    </div>
                  ))}
                  {!data.cards.some((c) => c.status === col) && <p className="text-xs text-zinc-600">Nothing here yet</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {data.weekly.map((w) => (
              <div key={w.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><dt className="text-xs uppercase tracking-widest text-zinc-500">{w.label}</dt><dd className="mt-1 text-lg font-semibold">{w.value}</dd></div>
            ))}
          </dl>
        )}
        <p className="mt-4 text-xs text-zinc-500">Illustration of the dashboard you build from the included CSV files and setup guide. Sample rows are examples to replace with your own.</p>
      </div>
    </div>
  );
}

/* ───── Guide ───── */
function GuidePane({ pages }: { pages: GuidePage[] }) {
  const [i, setI] = useState(0);
  const p = pages[i];
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl bg-white p-7 text-zinc-800 shadow-2xl sm:p-10" style={{ minHeight: 380 }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">{p.chapter}</p>
        <h3 className="mt-3 text-2xl font-bold leading-tight text-zinc-900">{p.title}</h3>
        <div className="mt-4 h-0.5 w-12 bg-violet-500" />
        {p.body.map((t) => <p key={t.slice(0, 20)} className="mt-4 text-[14px] leading-7">{t}</p>)}
        <div className="mt-6 rounded-lg border-l-4 border-violet-500 bg-violet-50 p-4 text-[13px] leading-6">{p.callout}</div>
        <p className="mt-6 text-right text-[10px] text-zinc-400">Page {p.page} of 18 · sample</p>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <button onClick={() => setI((i - 1 + pages.length) % pages.length)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5" aria-label="Previous sample page"><ChevronLeft className="h-4 w-4" /> Prev</button>
        <span className="text-sm text-zinc-500" aria-live="polite">Sample {i + 1} / {pages.length}</span>
        <button onClick={() => setI((i + 1) % pages.length)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5" aria-label="Next sample page">Next <ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/* ───── Prompts ───── */
function PromptsPane({ prompts }: { prompts: Prompt[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  async function copy(p: Prompt) {
    try {
      await navigator.clipboard.writeText(p.prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = p.prompt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    setCopied(p.id);
    setTimeout(() => setCopied((c) => (c === p.id ? null : c)), 1800);
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {prompts.map((p) => (
        <article key={p.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-300">{p.category}</p>
          <h3 className="mt-1 font-semibold">{p.title}</h3>
          <p className="mt-1 text-xs text-zinc-500">{p.useWhen}</p>
          <pre className="mt-3 max-h-40 flex-1 overflow-auto whitespace-pre-wrap rounded-xl bg-black/40 p-3 font-mono text-[11.5px] leading-5 text-zinc-300">{p.prompt}</pre>
          <button onClick={() => copy(p)} className="mt-3 inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/15 px-4 py-2 text-xs font-medium hover:bg-white/10">
            {copied === p.id ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy prompt</>}
          </button>
        </article>
      ))}
      <p className="text-xs text-zinc-500 md:col-span-2">4 of 20 prompts shown. Replace each [BRACKETED] placeholder with your own details.</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-white/15 text-sm text-zinc-500">{text}</div>;
}
