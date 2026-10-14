'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section role="alert" className="space-y-4">
      <h1 className="text-2xl font-semibold">Unable to load this page</h1>
      <p>Check your local data configuration and try again.</p>
      <button className="rounded border px-4 py-2" onClick={reset}>Try again</button>
    </section>
  );
}
