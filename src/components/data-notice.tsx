import Link from 'next/link';
import { getSetupStatus } from '@/lib/setup-status';

export async function DataNotice() {
  const status = await getSetupStatus();
  const messages = {
    demo: 'Demo mode: all workouts, steps, and routes are synthetic. No personal exports are read.',
    ready: 'Local Garmin exports are connected.',
    empty: 'Your activity folder contains no workout summaries yet.',
    missing: 'Get started by exploring demo data or connecting your Garmin exports.',
    unavailable: 'The activity folder could not be read. Check local access permissions.',
  };
  return (
    <aside aria-label="Data source" className="rounded-lg border bg-background p-4 text-sm">
      <p>{messages[status.state]}</p>
      <Link href="/setup" className="mt-2 inline-block underline">Data setup and privacy</Link>
    </aside>
  );
}
