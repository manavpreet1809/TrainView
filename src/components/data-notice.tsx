import Link from 'next/link';
import { getSetupStatus } from '@/lib/setup-status';

export async function DataNotice() {
  const status = await getSetupStatus();
  const messages = {
    demo: 'Demo mode: all workouts, steps, and routes are made-up examples. Your personal Garmin data is not used.',
    ready: 'Local Garmin exports are connected.',
    empty: 'Your activity folder contains no workout summaries yet.',
    missing: 'Get started by exploring demo data or connecting your Garmin exports.',
    unavailable: 'The activity folder could not be read. Check local access permissions.',
  };
  return (
    <aside aria-label="Data source" className="border-l-4 border-primary bg-accent/40 px-4 py-3 text-sm">
      <p>{messages[status.state]}</p>
      {(status.skipped > 0 || status.duplicates > 0) && <p>{status.skipped} invalid summaries and {status.duplicates} duplicate IDs were skipped. Review your exports in data setup.</p>}
      <Link href="/setup" className="mt-2 inline-block underline">About this data</Link>
    </aside>
  );
}
