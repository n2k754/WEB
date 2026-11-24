import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="CREATOR STARTER KIT — home">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-glow" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.6 5.6L21 10l-4.6 4.2L17.6 21 12 17.8 6.4 21l1.2-6.8L3 10l6.4-1.4z" /></svg>
      </span>
      <span className="text-[13px] font-bold tracking-[0.16em] sm:text-sm">CREATOR STARTER KIT</span>
    </Link>
  );
}
