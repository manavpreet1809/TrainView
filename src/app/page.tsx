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
    getRecentWorkouts(4),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight">Your training at a glance</h1><p className="text-sm text-muted-foreground">Check your recent workouts, see your progress, or open Workouts to search and download your history.</p></div>
      <KeyMetrics metrics={metrics} />

      <RecentWorkouts workouts={recentWorkouts} />
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Your activity charts</h2>
        <p className="text-sm text-muted-foreground">Training load is the effort value recorded by your device. A higher value means more recorded effort, not a better workout.</p>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <MileageTrendChart data={mileageTrend} />
        <ReadinessLoadChart data={readinessTrend} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SleepQualityChart data={intensityTrend} className="h-full" />
        <HeartRateZonesChart data={heartZones} className="h-full" />
      </section>

      <p className="text-sm text-muted-foreground">Readiness measurements are not imported; no score is inferred. Missing heart-rate readings are left blank.</p>
    </div>
  );
}
