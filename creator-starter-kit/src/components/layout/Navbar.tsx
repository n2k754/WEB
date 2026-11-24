"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <header className={cn("sticky top-0 z-50 border-b transition-colors", scrolled || open ? "border-white/10 bg-ink/80 backdrop-blur-xl" : "border-transparent bg-transparent")}>
      <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active = l.href === pathname;
            return (
              <li key={l.href}>
                <Link href={l.href} aria-current={active ? "page" : undefined} className={cn("rounded-full px-4 py-2 text-sm transition hover:text-white", active ? "text-white" : "text-zinc-400")}>
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          <ButtonLink href="/#pricing" size="sm" className="hidden sm:inline-flex">Get the Kit</ButtonLink>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-ink/95 px-5 pb-8 pt-4 backdrop-blur-xl md:hidden">
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-2xl px-4 py-4 text-lg font-medium text-zinc-200 hover:bg-white/5">{l.label}</Link>
                </li>
              ))}
            </ul>
            <ButtonLink href="/#pricing" size="lg" className="mt-6 w-full" arrow>Get the Kit</ButtonLink>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
