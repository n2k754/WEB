"use client";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container className="py-32 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-semibold">We hit an unexpected problem</h1>
      <p className="mx-auto mt-4 max-w-md text-zinc-400">Please try again. If it keeps happening, contact us.</p>
      <Button onClick={reset} className="mt-8">Try again</Button>
    </Container>
  );
}
