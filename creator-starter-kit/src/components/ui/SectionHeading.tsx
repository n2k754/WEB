import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, description, align = "center", as: Tag = "h2", className }: { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; align?: "center" | "left"; as?: "h1" | "h2"; className?: string }) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">{title}</Tag>
      {description && <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">{description}</p>}
    </Reveal>
  );
}
