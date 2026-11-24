import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="py-24" aria-busy="true">
      <div role="status" aria-label="Loading">
        <div className="skeleton mx-auto h-4 w-32 rounded-full" />
        <div className="skeleton mx-auto mt-6 h-12 w-3/4 max-w-xl rounded-2xl" />
        <div className="skeleton mx-auto mt-4 h-5 w-1/2 max-w-md rounded-full" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-56 rounded-3xl" />)}</div>
      </div>
    </Container>
  );
}
