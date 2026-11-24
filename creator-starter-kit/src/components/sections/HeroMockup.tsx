"use client";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, CalendarDays, Check, WandSparkles } from "lucide-react";
import { TemplateSvg } from "@/components/ui/TemplateSvg";

interface Tpl { id: string; name: string; svg: string }

const days = ["M", "T", "W", "T", "F", "S", "S"];
const chips: Record<number, string> = { 1: "bg-violet-500/70", 2: "bg-indigo-500/70", 4: "bg-fuchsia-500/60", 8: "bg-violet-500/70", 10: "bg-indigo-500/70", 12: "bg-emerald-500/60", 15: "bg-violet-500/70", 17: "bg-indigo-500/70" };

export function HeroMockup({ templates }: { templates: Tpl[] }) {
  const reduce = useReducedMotion();
  const enter = (delay: number, x = 0, y = 24) => (reduce ? {} : { initial: { opacity: 0, x, y }, animate: { opacity: 1, x: 0, y: 0 }, transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const } });
  const [post, launch, story] = templates;

  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-[560px]" aria-hidden>
      <div className="absolute inset-8 rounded-full bg-violet-600/30 blur-[90px]" />

      {/* Dashboard window */}
      <motion.div {...enter(0.15)} className="absolute left-[6%] top-[8%] w-[78%]">
        <div className="glass !rounded-2xl p-3 shadow-glow">
          <div className="flex items-center gap-1.5 px-1 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-3 text-[10px] text-zinc-500">Creator Dashboard</span>
          </div>
          <div className="flex gap-3">
            <div className="hidden w-[26%] space-y-1.5 sm:block">
              {["Content Calendar", "Idea Database", "Published", "Weekly Plan"].map((t, i) => (
                <div key={t} className={`truncate rounded-lg px-2 py-1.5 text-[9px] ${i === 0 ? "bg-violet-500/25 text-violet-200" : "text-zinc-500"}`}>{t}</div>
              ))}
            </div>
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-zinc-300"><CalendarDays className="h-3 w-3 text-violet-300" /> December</div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => <div key={i} className="text-center text-[8px] text-zinc-600">{d}</div>)}
                {Array.from({ length: 21 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-md border border-white/5 bg-white/[0.03] p-0.5">
                    {chips[i] && <div className={`h-full rounded-sm ${chips[i]}`} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Template cards */}
      <motion.div {...enter(0.45, -30, 20)} className="absolute bottom-[2%] left-[0%] w-[27%] -rotate-6">
        <div className="animate-float overflow-hidden rounded-2xl border border-white/15 shadow-2xl"><TemplateSvg id={story.id} svg={story.svg} scope="hero" label={story.name} className="aspect-[9/16] [&>svg]:block" /></div>
      </motion.div>
      <motion.div {...enter(0.55, 0, 30)} className="absolute bottom-[0%] left-[30%] w-[27%] rotate-2">
        <div className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl" style={{ animation: "float 7s ease-in-out infinite" }}><TemplateSvg id={post.id} svg={post.svg} scope="hero" label={post.name} className="aspect-[4/5] [&>svg]:block" /></div>
      </motion.div>
      <motion.div {...enter(0.65, 30, 20)} className="absolute bottom-[4%] right-[10%] hidden w-[22%] rotate-6 sm:block">
        <div className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl" style={{ animation: "float 8s ease-in-out infinite" }}><TemplateSvg id={launch.id} svg={launch.svg} scope="hero" label={launch.name} className="aspect-[4/5] [&>svg]:block" /></div>
      </motion.div>

      {/* PDF guide */}
      <motion.div {...enter(0.35, 30, -10)} className="absolute right-[0%] top-[0%] w-[22%] rotate-3">
        <div className="animate-float rounded-xl border border-white/15 bg-gradient-to-br from-violet-600 to-indigo-700 p-3 shadow-glow">
          <BookOpen className="h-4 w-4 text-white/80" />
          <p className="mt-6 text-[10px] font-bold leading-tight">The Digital Business Guide</p>
          <p className="mt-1 text-[8px] text-violet-200">8 chapters · PDF</p>
        </div>
      </motion.div>

      {/* Floating chips */}
      <motion.div {...enter(0.9, 0, 10)} className="absolute right-[2%] top-[44%] hidden sm:block">
        <div className="glass !rounded-xl flex items-center gap-2 px-3 py-2 text-[11px]" style={{ animation: "float 5s ease-in-out infinite" }}><WandSparkles className="h-3.5 w-3.5 text-violet-300" /> 20 AI prompts</div>
      </motion.div>
      <motion.div {...enter(1, 0, 10)} className="absolute left-[34%] top-[0%] hidden sm:block">
        <div className="glass !rounded-xl flex items-center gap-2 px-3 py-2 text-[11px]" style={{ animation: "float 6.5s ease-in-out infinite" }}><Check className="h-3.5 w-3.5 text-emerald-400" /> 30 TikTok ideas</div>
      </motion.div>
    </div>
  );
}
