import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p>This TrainView page does not exist.</p>
      <Link className="underline" href="/">Return to your dashboard</Link>
    </section>
  );
}
