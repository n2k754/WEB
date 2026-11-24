"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Soft drifting glows + fading grid. Purely decorative (aria-hidden). */
export function AnimatedBackground({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const drift = (x: number, y: number, d: number) => (reduce ? {} : { animate: { x: [0, x, 0], y: [0, y, 0] }, transition: { duration: d, repeat: Infinity, ease: "easeInOut" as const } });
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="grid-bg absolute inset-0" />
      <motion.div className="absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-violet-600/25 blur-[120px]" {...drift(60, 40, 16)} />
      <motion.div className="absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-indigo-500/20 blur-[120px]" {...drift(-50, 60, 19)} />
    </div>
  );
}
