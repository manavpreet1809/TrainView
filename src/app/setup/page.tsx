import Link from 'next/link';
import { getSetupStatus } from '@/lib/setup-status';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const status = await getSetupStatus();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Set up TrainView</h1>
      <p>Choose sample data or connect your own GarminDB exports. Configuration stays on the server.</p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div><dt>Data source</dt><dd>{status.demo ? 'Synthetic demo' : 'Local Garmin exports'}</dd></div>
        <div><dt>Activity files</dt><dd>{status.count} {status.demo ? 'samples' : 'summaries found'}</dd></div>
        <div><dt>Route maps</dt><dd>{status.maps ? 'Token configured' : 'Optional token not configured'}</dd></div>
        <div><dt>AI coaching</dt><dd>{status.coach && !status.demo ? 'Key configured' : status.demo ? 'Offline demo guidance' : 'Offline fallback'}</dd></div>
      </dl>
      <section className="space-y-2"><h2 className="text-lg font-semibold">Explore sample data</h2>
        <p>Set <code>TRAINVIEW_DEMO_MODE=true</code> in your local .env file and restart the server. Demo mode reads neither personal exports nor monitoring records and does not call OpenAI. The sample GPS loop is fictional.</p>
      </section>
      <section className="space-y-2"><h2 className="text-lg font-semibold">Connect your records</h2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Export activities using GarminDB separately.</li>
          <li>Set <code>GARMIN_DATA_ROOT</code> to your HealthData folder.</li>
          <li>Set <code>DATABASE_URL</code> to your monitoring database if available. Back it up before schema changes.</li>
          <li>Set <code>TRAINVIEW_DEMO_MODE=false</code> and restart the server.</li>
        </ol>
        <p>Expected layout: <code>HealthData/FitFiles/Activities/activity_123.json</code> and optional <code>123_ACTIVITY.fit</code>.</p>
      </section>
      <p>Real-mode AI coaching sends training summaries and questions to OpenAI when enabled. Maps contact Mapbox. Keep personal records out of public deployments. Current readiness and related values include estimates.</p>
      <Link href="/" className="inline-block underline">Open dashboard</Link>
    </section>
  );
}
