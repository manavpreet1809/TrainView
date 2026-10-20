export default function Loading() {
  return (
    <section role="status" aria-label="Loading page" className="space-y-5">
      <p className="text-sm text-muted-foreground">Loading your activity data…</p>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-8 w-56 rounded-md bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="h-24 rounded-lg border bg-muted/50" />)}</div>
        <div className="h-64 rounded-lg border bg-muted/30" />
      </div>
    </section>
  );
}
