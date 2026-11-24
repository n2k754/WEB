import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductPreview } from "@/components/preview/ProductPreview";
import { GUIDE_SAMPLE_PAGES, NOTION_SAMPLE, SAMPLE_PROMPTS, getSampleTemplates } from "@/content/preview";

export function PreviewSection() {
  return (
    <section id="preview" className="scroll-mt-20 py-24">
      <Container>
        <SectionHeading eyebrow="Preview" title="See real pages from the kit" description="Browse sample templates, explore the Notion dashboard, read pages from the guide and copy actual prompts. All sample content is original and taken from the kit." />
        <div className="mt-12"><ProductPreview templates={getSampleTemplates()} prompts={SAMPLE_PROMPTS} guide={GUIDE_SAMPLE_PAGES} notion={NOTION_SAMPLE} /></div>
      </Container>
    </section>
  );
}
