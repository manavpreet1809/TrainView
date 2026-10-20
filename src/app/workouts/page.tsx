export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutTable } from '@/components/workouts/workout-table';
import { getWorkoutSummary, getWorkouts } from '@/lib/garmin-data';

export default async function WorkoutsPage() {
  const [workouts, summary] = await Promise.all([getWorkouts(), getWorkoutSummary()]);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your workouts</h1>
        <p className="text-sm text-muted-foreground">Find an activity, open its details, or download your filtered results.</p>
      </div>
      <dl aria-label="All workout totals" className="grid grid-cols-1 divide-y rounded-lg border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-4"><dt className="text-sm text-muted-foreground">Distance in the last 7 days</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{summary.weekDistance.toFixed(1)} km</dd></div>
        <div className="p-4"><dt className="text-sm text-muted-foreground">Total recorded time</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{(summary.totalDuration / 60).toFixed(1)} hours</dd></div>
        <div className="p-4"><dt className="text-sm text-muted-foreground">All workouts</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{workouts.length}</dd></div>
      </dl>
      <Card>
        <CardHeader>
          <CardTitle>Workout log</CardTitle>
          <CardDescription>Use the filters below. The totals above include all workouts, even when the list is filtered.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4"><WorkoutTable workouts={workouts} /></CardContent>
      </Card>
    </div>
  );
}
