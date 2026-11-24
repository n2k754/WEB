import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number][] = [["", 1], ["/product", 0.9], ["/included", 0.8], ["/faq", 0.7], ["/contact", 0.5], ["/legal", 0.4]];
  return pages.map(([p, priority]) => ({ url: `${SITE.url}${p}`, lastModified: now, changeFrequency: "monthly", priority }));
}
