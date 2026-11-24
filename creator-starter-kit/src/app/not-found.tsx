import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="mx-auto mt-4 max-w-md text-zinc-400">The link may be broken or the page may have moved.</p>
      <ButtonLink href="/" className="mt-8" arrow>Back to home</ButtonLink>
    </Container>
  );
}
