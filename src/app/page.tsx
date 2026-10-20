export const dynamic = 'force-dynamic';

import { HeartRateZonesChart } from '@/components/charts/heart-rate-zones-chart';
import { MileageTrendChart } from '@/components/charts/mileage-trend-chart';
import { ReadinessLoadChart } from '@/components/charts/readiness-load-chart';
import { SleepQualityChart } from '@/components/charts/sleep-quality-chart';
import { KeyMetrics } from '@/components/dashboard/key-metrics';
import { RecentWorkouts } from '@/components/dashboard/recent-workouts';
import {
  getHeartRateZoneBreakdown,
  getKeyMetrics,
  getMileageTrend,
  getReadinessTrend,
  getRecentWorkouts,
  getIntensityTrend,
} from '@/lib/garmin-data';

export default async function DashboardPage() {
  const [
    metrics,
    mileageTrend,
    readinessTrend,
    intensityTrend,
    heartZones,
    recentWorkouts,
  ] = await Promise.all([
    getKeyMetrics(),
    getMileageTrend(),
    getReadinessTrend(),
    getIntensityTrend(),
    getHeartRateZoneBreakdown(),
    getRecentWorkouts(2),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight">Your training at a glance</h1><p className="text-sm text-muted-foreground">Check your recent workouts, see your progress, or open Workouts to search and download your history.</p></div>
      <KeyMetrics metrics={metrics} />

      <RecentWorkouts workouts={recentWorkouts} />
      <section aria-label="Distance over time" className="space-y-3">
        <h2 className="text-xl font-semibold">Your progress</h2>
        <MileageTrendChart data={mileageTrend} />
      </section>
      <details className="rounded-lg border bg-card p-4 sm:p-5">
        <summary className="text-base font-semibold text-primary">More training details</summary>
        <div className="mt-5 space-y-5">
          <p className="text-sm text-muted-foreground">Training load is the effort value recorded by your device. Higher load means more recorded effort, not a better workout.</p>
          <ReadinessLoadChart data={readinessTrend} />
          <div className="grid gap-5 lg:grid-cols-2">
            <SleepQualityChart data={intensityTrend} />
            <HeartRateZonesChart data={heartZones} />
          </div>
        </div>
      </details>

      <p className="text-sm text-muted-foreground">Readiness measurements are not imported; no score is inferred. Missing heart-rate readings are left blank.</p>
    </div>
  );
}
