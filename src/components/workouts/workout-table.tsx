'use client';

import { useMemo, useState } from 'react';
import { queryWorkouts, type SortKey } from '@/lib/workout-query';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Flame, MapPin, Timer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Workout } from '@/types/garmin';
import { ActivityMap } from '@/components/workouts/activity-map';

type WorkoutTableProps = {
  workouts: Workout[];
};


export function WorkoutTable({ workouts }: WorkoutTableProps) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const types = useMemo(() => [...new Set(workouts.map(row => row.type))].sort(), [workouts]);
  const invalidRange = Boolean(from && to && from > to);
  const sortedWorkouts = useMemo(() => queryWorkouts(workouts, {
    search, type, from, to, sort: sortKey, direction: sortDirection,
  }), [workouts, search, type, from, to, sortKey, sortDirection]);
  const clearFilters = () => { setSearch(''); setType(''); setFrom(''); setTo(''); };

  const selectedWorkout = sortedWorkouts.find(
    workout => workout.id === selectedWorkoutId,
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('desc');
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1 text-sm">Search workouts
          <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Title, type, location, or tag" />
        </label>
        <label className="space-y-1 text-sm">Activity type
          <select className="h-9 w-full rounded-md border bg-background px-3" value={type} onChange={event => setType(event.target.value)}>
            <option value="">All types</option>{types.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm">From date<Input type="date" value={from} aria-invalid={invalidRange} aria-describedby={invalidRange ? 'date-range-error' : undefined} onInput={event => setFrom(event.currentTarget.value)} /></label>
        <label className="space-y-1 text-sm">To date<Input type="date" value={to} aria-invalid={invalidRange} aria-describedby={invalidRange ? 'date-range-error' : undefined} onInput={event => setTo(event.currentTarget.value)} /></label>
      </div>
      {invalidRange && <p id="date-range-error" role="alert" className="text-sm text-destructive">From date must be on or before to date.</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-sm text-muted-foreground">{sortedWorkouts.length} of {workouts.length} workouts. Summary cards describe all imported activities.</p>
        <Button type="button" variant="outline" onClick={clearFilters} disabled={!search && !type && !from && !to}>Clear filters</Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border/70" role="region" aria-label="Workout log table" tabIndex={0}>
        <table className="min-w-full divide-y divide-border/70">
          <caption className="sr-only">Workout log. Use column buttons to sort and Open to inspect a session.</caption>
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <Th label="Date" direction={sortKey === 'date' ? sortDirection : undefined} onClick={() => handleSort('date')} />
              <Th label="Type" direction={sortKey === 'type' ? sortDirection : undefined} onClick={() => handleSort('type')} />
              <th className="px-4 py-3">Session</th>
              <Th label="Distance" direction={sortKey === 'distanceKm' ? sortDirection : undefined} onClick={() => handleSort('distanceKm')} />
              <th className="px-4 py-3">Duration</th>
              <Th label="Load" direction={sortKey === 'trainingLoad' ? sortDirection : undefined} onClick={() => handleSort('trainingLoad')} />
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {!sortedWorkouts.length && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">{workouts.length ? 'No workouts match these filters. Try a broader search or clear filters.' : 'No workouts imported yet. Connect Garmin exports or enable demo mode in Data setup.'}</td></tr>}
            {sortedWorkouts.map(workout => (
              <tr
                key={workout.id}
                className="transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  {new Date(workout.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="capitalize">
                    {workout.type.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    {workout.title}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workout.location ?? '—'}
                  </p>
                </td>
                <td className="px-4 py-3">{workout.distanceKm.toFixed(1)} km</td>
                <td className="px-4 py-3">{Math.round(workout.durationMinutes)} min</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {workout.trainingLoad ?? '—'}
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">
                    {workout.averageHeartRate
                      ? `${workout.averageHeartRate} bpm avg`
                      : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {workout.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Dialog onOpenChange={open => !open && setSelectedWorkoutId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Open ${workout.title}`}
                        onClick={() => setSelectedWorkoutId(workout.id)}
                      >
                        Open
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                      {selectedWorkout ? (
                        <>
                          <DialogHeader className="space-y-1">
                            <DialogTitle>{selectedWorkout.title}</DialogTitle>
                            <DialogDescription>
                              {new Date(selectedWorkout.date).toLocaleString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                year: 'numeric',
                                day: 'numeric',
                              })}{' '}
                              • {selectedWorkout.location ?? '—'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-muted/40 p-4 text-sm">
                            <Info icon={<MapPin className="size-4" />} label="Distance">{selectedWorkout.distanceKm.toFixed(2)} km</Info>
                            <Info icon={<Timer className="size-4" />} label="Duration">
                              {Math.round(selectedWorkout.durationMinutes)} min
                            </Info>
                            <Info icon={<Flame className="size-4" />} label="Training load">
                              {selectedWorkout.trainingLoad ?? '—'}
                            </Info>
                            <Info icon={<Flame className="size-4" />} label="Calories">
                              {selectedWorkout.calories ?? '—'}
                            </Info>
                            <Info icon={<MapPin className="size-4" />} label="Pace / HR">
                              {selectedWorkout.averagePace ?? 'pace n/a'} •{' '}
                              {selectedWorkout.averageHeartRate
                                ? `${selectedWorkout.averageHeartRate} bpm`
                                : 'HR n/a'}
                            </Info>
                          </div>
                          {selectedWorkout.hasRoute ? (
                            <ActivityMap
                              activityId={selectedWorkout.id}
                              className="mt-4"
                            />
                          ) : (
                            <div className="mt-4 flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/40 text-xs text-muted-foreground">
                              No GPS trace available for this activity.
                            </div>
                          )}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">
                              Splits
                            </h4>
                            {!selectedWorkout.splits.length && <p className="text-sm text-muted-foreground">Split records were not imported for this session.</p>}
                            <div className="grid gap-2 md:grid-cols-2">
                              {selectedWorkout.splits.map(split => (
                                <div
                                  key={`${selectedWorkout.id}-${split.segment}`}
                                  className="rounded-lg border border-border/60 p-3 text-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-foreground">
                                      {split.segment}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {split.distanceKm.toFixed(1)} km
                                    </span>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Pace {split.pace}</span>
                                    <span>HR {split.heartRate} bpm</span>
                                  </div>
                                  {split.notes && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      {split.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          {selectedWorkout.notes && (
                            <p className="text-sm text-muted-foreground">
                              {selectedWorkout.notes}
                            </p>
                          )}
                        </>
                      ) : null}
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Th({ label, onClick, direction }: { label: string; onClick: () => void; direction?: 'asc' | 'desc' }) {
  return (
    <th scope="col" aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'} className="px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        <ArrowUpDown aria-hidden="true" className="size-3.5" />
        <span className="sr-only">{direction ? `, sorted ${direction === 'asc' ? 'ascending' : 'descending'}` : 'Sort column'}</span>
      </button>
    </th>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{children}</span>
      </div>
    </div>
  );
}
