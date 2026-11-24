import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "sm";

const base = "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";
const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-glow hover:brightness-110",
  secondary: "border border-white/15 bg-white/[0.04] text-white backdrop-blur hover:border-white/30 hover:bg-white/[0.08]",
  ghost: "text-zinc-300 hover:text-white",
};
const sizes: Record<Size, string> = { sm: "px-4 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-7 py-3.5 text-sm sm:text-base" };

interface Common { variant?: Variant; size?: Size; arrow?: boolean; className?: string; children: React.ReactNode }

export function Button({ variant = "primary", size = "md", arrow, className, children, loading, ...rest }: Common & { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
      {arrow && !loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />}
    </button>
  );
}

export function ButtonLink({ href, variant = "primary", size = "md", arrow, className, children, plain, ...rest }: Common & { href: string; plain?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  // `plain` renders a normal <a> (no client-side routing / prefetching): required for file downloads.
  if (plain) {
    return (
      <a href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
        {children}
        {arrow && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
      {arrow && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />}
    </Link>
  );
}
