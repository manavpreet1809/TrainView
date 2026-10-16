import { normalizeRoute } from './route-geometry';
import { isRouteId } from './route-id';
import { readActivityImport } from './activity-import';
import { localDateKey, formatPace, mean } from './metric-utils';
import { getDataConfig } from './data-config';
import { getDemoActivities } from './demo/activities';
import { getDemoCoordinates } from './demo/routes';
import { getDemoSteps } from './demo/monitoring';
import fs from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  HeartRateZone,
  IntensityRecord,
  ReadinessSnapshot,
  TrainingFocus,
  WeeklyMileage,
  Workout,
} from '@/types/garmin';

export type KeyMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  helper: string;
};

type ActivityFile = import('./activity-import').ImportedActivity;

const DATA_ROOT = getDataConfig().root;


type FitRecord = {
  type?: string;
  data?: {
    position_lat?: number;
    position_long?: number;
    [key: string]: unknown;
  };
};

type ParsedFit = {
  records?: FitRecord[];
};

type FitDecoderModule = {
  fit2json: (arrayBuffer: ArrayBuffer) => unknown;
  parseRecords: (
    json: unknown,
    options?: { skipUnknown?: boolean },
  ) => ParsedFit;
};

let fitDecoderLoader: Promise<FitDecoderModule> | null = null;

async function getFitDecoder() {
  if (!fitDecoderLoader) {
    fitDecoderLoader = import('fit-decoder').then(
      mod => (mod.default ?? mod) as FitDecoderModule,
    );
  }

  return fitDecoderLoader;
}

const sum = (values: number[]) =>
  values.reduce((total, value) => total + (value || 0), 0);

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const startOfWeek = (date: Date) => {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7; // make Monday start
  copy.setDate(copy.getDate() - diff);
  return copy;
};

const toISODate = (date: Date) => localDateKey(date);

const round = (value: number, digits = 1) =>
  Number.isFinite(value) ? Number(value.toFixed(digits)) : 0;

const safePace = formatPace;
export const getImportReport = cache(async () => readActivityImport(DATA_ROOT));
const loadActivities = cache(async (): Promise<ActivityFile[]> => {
  if (getDataConfig().demo) return getDemoActivities();
  return (await getImportReport()).activities;
});

const hasMonitoringTable = cache(async () => {
  try {
    const rows = await prisma.$queryRaw<{ name: string }[]>(Prisma.sql`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = 'monitoring'
      LIMIT 1
    `);
    return rows.length > 0;
  } catch (error) {
    console.warn('[garmin-data] Unable to inspect monitoring table', error);
    return false;
  }
});

const loadMonitoringSteps = cache(async () => {
  if (getDataConfig().demo) return getDemoSteps();
  const tableExists = await hasMonitoringTable();
  if (!tableExists) {
    return [];
  }

  try {
    const rows = await prisma.$queryRaw<
      { day: string; steps: number | null }[]
    >(Prisma.sql`
      SELECT
        date(timestamp) AS day,
        SUM(COALESCE(steps, 0)) AS steps
      FROM monitoring
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    `);
    return rows ?? [];
  } catch (error) {
    console.warn('[garmin-data] Unable to query monitoring steps', error);
    return [];
  }
});

function trendDelta(current: number, previous: number) {
  const delta = current - previous;
  const trend: KeyMetric['trend'] =
    delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat';
  const prefix = delta >= 0 ? '+' : '';
  return { delta: `${prefix}${round(delta, 1)}`, trend };
}

export const getKeyMetrics = cache(async (): Promise<KeyMetric[]> => {
  const activities = await loadActivities();
  if (activities.length === 0) {
    return [
      {
        id: 'no-data',
        label: 'No Garmin data found',
        value: '--',
        delta: 'Import data via GarminDB',
        trend: 'flat',
        helper:
          'Run garmindb_cli.py --all --download --import --analyze, then refresh.',
      },
    ];
  }

  const monitoringSteps = await loadMonitoringSteps();

  const now = new Date();
  const sevenDaysAgo = startOfDay(new Date(now));
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fourteenDaysAgo = startOfDay(new Date(now));
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const inRange = (activity: ActivityFile, from: Date, to: Date) => {
    const ts = activity.startTime.getTime();
    return ts >= from.getTime() && ts <= to.getTime();
  };

  const currentRange = activities.filter(activity =>
    inRange(activity, sevenDaysAgo, now),
  );
  const previousRange = activities.filter(activity =>
    inRange(activity, fourteenDaysAgo, new Date(sevenDaysAgo.getTime() - 1)),
  );

  const distanceCurrent = sum(currentRange.map(a => a.distanceKm));
  const distancePrevious = sum(previousRange.map(a => a.distanceKm));
  const longest = currentRange.length
    ? Math.max(...currentRange.map(a => a.distanceKm))
    : 0;
  const { delta: distanceDelta, trend: distanceTrend } = trendDelta(
    distanceCurrent,
    distancePrevious,
  );

  const loadCurrent = sum(currentRange.map(a => a.trainingLoad));
  const loadPrevious = sum(previousRange.map(a => a.trainingLoad));
  const { delta: loadDelta, trend: loadTrend } = trendDelta(
    loadCurrent,
    loadPrevious,
  );

  const intensityCurrent = sum(
    currentRange.map(a => a.moderateMinutes + a.vigorousMinutes),
  );
  const intensityPrevious = sum(
    previousRange.map(a => a.moderateMinutes + a.vigorousMinutes),
  );
  const { delta: intensityDelta, trend: intensityTrend } = trendDelta(
    intensityCurrent,
    intensityPrevious,
  );

  const avgHrCurrent = mean(currentRange.map(a => a.averageHeartRate ?? 0));
  const avgHrPrevious = mean(previousRange.map(a => a.averageHeartRate ?? 0));
  const { delta: hrDelta, trend: hrTrend } = trendDelta(avgHrCurrent ?? 0, avgHrPrevious ?? 0);

  const stepsCurrent = monitoringSteps
    .filter(row => {
      const day = startOfDay(new Date(`${row.day}T00:00:00`));
      return day >= sevenDaysAgo && day <= now;
    })
    .reduce((acc, row) => acc + (row.steps ?? 0), 0);
  const stepsPrevious = monitoringSteps
    .filter(row => {
      const day = startOfDay(new Date(`${row.day}T00:00:00`));
      return day >= fourteenDaysAgo && day < sevenDaysAgo;
    })
    .reduce((acc, row) => acc + (row.steps ?? 0), 0);
  const { delta: stepsDelta, trend: stepsTrend } = trendDelta(
    stepsCurrent,
    stepsPrevious,
  );

  const metrics: KeyMetric[] = [
    {
      id: 'weekly-distance',
      label: '7-day distance',
      value: `${round(distanceCurrent)} km`,
      delta: `${distanceDelta} km vs prev`,
      trend: distanceTrend,
      helper: `Longest session ${round(longest)} km`,
    },
  ];

  const hasStepData = monitoringSteps.length > 0 && stepsCurrent > 0;
  if (hasStepData) {
    metrics.push({
      id: 'steps',
      label: '7-day steps',
      value: `${Math.round(stepsCurrent)}`,
      delta: `${stepsDelta} vs prev`,
      trend: stepsTrend,
      helper: 'Steps captured by Garmin daily monitoring.',
    });
  }

  metrics.push(
    {
      id: 'training-load',
      label: 'Training load',
      value: loadCurrent ? `${Math.round(loadCurrent)}` : '—',
      delta: `${loadDelta} vs prev`,
      trend: loadTrend,
      helper: 'Sum of activity training load for the last 7 days.',
    },
    {
      id: 'intensity',
      label: 'Intensity minutes',
      value: `${Math.round(intensityCurrent)} min`,
      delta: `${intensityDelta} min vs prev`,
      trend: intensityTrend,
      helper: 'Moderate + vigorous minutes recorded by Garmin activities.',
    },
    {
      id: 'avg-hr',
      label: 'Avg activity HR',
      value: avgHrCurrent ? `${Math.round(avgHrCurrent)} bpm` : '—',
      delta: avgHrCurrent !== null && avgHrPrevious !== null ? `${hrDelta} bpm vs prev` : 'Comparison unavailable',
      trend: hrTrend,
      helper: 'Average activity heart-rate (Garmin summary files).',
    },
  );

  return metrics;
});

export const getMileageTrend = cache(async (): Promise<WeeklyMileage[]> => {
  const activities = await loadActivities();
  if (activities.length === 0) return [];

  const grouped = new Map<
    string,
    {
      distance: number;
      trainingLoad: number;
      longRun: number;
      count: number;
    }
  >();

  activities.forEach(activity => {
    const key = toISODate(startOfWeek(activity.startTime));
    const bucket = grouped.get(key) ?? {
      distance: 0,
      trainingLoad: 0,
      longRun: 0,
      count: 0,
    };
    bucket.distance += activity.distanceKm;
    bucket.trainingLoad += activity.trainingLoad;
    bucket.longRun = Math.max(bucket.longRun, activity.distanceKm);
    bucket.count += 1;
    grouped.set(key, bucket);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, bucket]) => {
      return {
        week,
        distanceKm: round(bucket.distance, 1),
        elevationGain: 0,
        longRunKm: round(bucket.longRun, 1),
        trainingLoad: Math.round(bucket.trainingLoad),
        activityCount: bucket.count,
      };
    });
});

export const getReadinessTrend = cache(
  async (): Promise<ReadinessSnapshot[]> => {
    const activities = await loadActivities();
    if (activities.length === 0) return [];

    const byDay = new Map<
      string,
      {
        heartRates: number[];
        maxHeartRates: number[];
        trainingLoad: number;
        intensityMinutes: number;
      }
    >();

    activities.forEach(activity => {
      const key = toISODate(activity.startTime);
      const bucket = byDay.get(key) ?? {
        heartRates: [],
        maxHeartRates: [],
        trainingLoad: 0,
        intensityMinutes: 0,
      };
      if (activity.averageHeartRate) {
        bucket.heartRates.push(activity.averageHeartRate);
      }
      if (activity.maxHeartRate) {
        bucket.maxHeartRates.push(activity.maxHeartRate);
      }
      bucket.trainingLoad += activity.trainingLoad;
      bucket.intensityMinutes +=
        activity.moderateMinutes + activity.vigorousMinutes;
      byDay.set(key, bucket);
    });

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, bucket]) => {
        const avgHeartRate =
          bucket.heartRates.length > 0
            ? sum(bucket.heartRates) / bucket.heartRates.length
            : 0;
        return {
          date,
          acuteLoad: Math.round(bucket.trainingLoad),
          avgHeartRate: bucket.heartRates.length ? Math.round(avgHeartRate) : null,
        };
      });
  },
);

export const getIntensityTrend = cache(
  async (): Promise<IntensityRecord[]> => {
    const activities = await loadActivities();
    if (activities.length === 0) return [];

    const byDay = new Map<
      string,
      { moderate: number; vigorous: number }
    >();

    activities.forEach(activity => {
      const key = toISODate(activity.startTime);
      const bucket = byDay.get(key) ?? { moderate: 0, vigorous: 0 };
      bucket.moderate += activity.moderateMinutes;
      bucket.vigorous += activity.vigorousMinutes;
      byDay.set(key, bucket);
    });

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, bucket]) => ({
        date,
        moderateMinutes: Math.round(bucket.moderate),
        vigorousMinutes: Math.round(bucket.vigorous),
      }));
  },
);

export const getHeartRateZoneBreakdown = cache(
  async (): Promise<HeartRateZone[]> => {
    const activities = await loadActivities();
    if (activities.length === 0) return [];

    const totals = [0, 0, 0, 0, 0];
    activities.forEach(activity => {
      activity.hrZones.forEach((seconds, index) => {
        totals[index] += seconds;
      });
    });

    const totalSeconds = sum(totals);
    if (!totalSeconds) return [];

    const labels = ['Recovery', 'Endurance', 'Tempo', 'Threshold', 'VO₂ Max'];

    return totals.map((seconds, index) => ({
      zone: `Z${index + 1}`,
      label: labels[index],
      percentage: round((seconds / totalSeconds) * 100, 1),
    }));
  },
);

export const getTrainingFocus = cache(
  async (): Promise<TrainingFocus[]> => {
    const zones = await getHeartRateZoneBreakdown();
    if (zones.length === 0) {
      return [
        {
          title: 'No Garmin data yet',
          description:
            'Import activities with GarminDB and refresh to unlock coaching insights.',
          impact: 'neutral',
          delta: 0,
        },
      ];
    }

    const endurance = zones.find(zone => zone.zone === 'Z2')?.percentage ?? 0;
    const tempo = zones.find(zone => zone.zone === 'Z3')?.percentage ?? 0;
    const threshold = zones.find(zone => zone.zone === 'Z4')?.percentage ?? 0;

    return [
      {
        title: 'Endurance base',
        description: `You spent ${round(
          endurance,
        )}% of recent training in Z2. Keep steady aerobic sessions to maintain resilience.`,
        impact: endurance > 35 ? 'positive' : 'neutral',
        delta: Math.round(endurance - 30),
      },
      {
        title: 'Tempo conditioning',
        description: `Tempo/threshold accounted for ${round(
          tempo + threshold,
        )}% of time. Add one focused quality workout if you need more race specificity.`,
        impact: tempo + threshold > 20 ? 'positive' : 'neutral',
        delta: Math.round(tempo + threshold),
      },
      {
        title: 'High-intensity balance',
        description:
          'Keep VO₂ max efforts targeted—brief doses keep the engine sharp without overstressing recovery.',
        impact: threshold > 15 ? 'neutral' : 'positive',
        delta: Math.round(threshold),
      },
    ];
  },
);

const mapActivityToWorkout = (activity: ActivityFile): Workout => ({
  id: activity.id,
  date: activity.startTime.toISOString(),
  type: activity.type.replace('_', ' '),
  title: activity.name,
  distanceKm: round(activity.distanceKm, 2),
  durationMinutes: round(activity.durationMinutes, 1),
  averagePace: safePace(activity.distanceKm, activity.durationMinutes),
  trainingLoad: Math.round(activity.trainingLoad),
  averageHeartRate: activity.averageHeartRate
    ? Math.round(activity.averageHeartRate)
    : undefined,
  maxHeartRate: activity.maxHeartRate
    ? Math.round(activity.maxHeartRate)
    : undefined,
  calories: activity.calories ? Math.round(activity.calories) : undefined,
  tags: [activity.type.replace('_', ' ')],
  splits: [],
  moderateMinutes: activity.moderateMinutes,
  vigorousMinutes: activity.vigorousMinutes,
  hasRoute: activity.hasPolyline,
});

export const getRecentWorkouts = cache(
  async (limit = 5): Promise<Workout[]> => {
    const activities = await loadActivities();
    return activities.slice(0, limit).map(mapActivityToWorkout);
  },
);

export const getWorkouts = cache(async (): Promise<Workout[]> => {
  const activities = await loadActivities();
  return activities.map(mapActivityToWorkout);
});

type RoutePoint = [number, number, number];

const coordinatesCache = new Map<string, RoutePoint[]>();

export async function getActivityCoordinates(
  activityId: string,
): Promise<RoutePoint[]> {
  if (!isRouteId(activityId)) return [];
  if (getDataConfig().demo) return getDemoCoordinates(activityId);
  if (!activityId) {
    return [];
  }

  if (coordinatesCache.has(activityId)) {
    return coordinatesCache.get(activityId) ?? [];
  }

  const fitPath = path.join(
    DATA_ROOT,
    'FitFiles',
    'Activities',
    `${activityId}_ACTIVITY.fit`,
  );

  try {
    const file = await fs.readFile(fitPath);
    const arrayBuffer = file.buffer.slice(
      file.byteOffset ?? 0,
      file.byteOffset + file.byteLength,
    );

    const fitDecoder = await getFitDecoder();

    const raw = fitDecoder.fit2json(arrayBuffer);
    const parsed = fitDecoder.parseRecords(raw, { skipUnknown: true });
    const records = Array.isArray(parsed.records) ? parsed.records : [];

    const coordinates: RoutePoint[] = [];
    for (const record of records) {
      if (record?.type !== 'record') continue;
      const data = record.data;
      const positionLat =
        typeof data?.position_lat === 'number' ? data.position_lat : undefined;
      const positionLong =
        typeof data?.position_long === 'number'
          ? data.position_long
          : undefined;
      const altitude =
        typeof data?.altitude === 'number' ? data.altitude : undefined;

      if (
        typeof positionLat === 'number' &&
        typeof positionLong === 'number' &&
        Number.isFinite(positionLat) &&
        Number.isFinite(positionLong)
      ) {
        coordinates.push([positionLat, positionLong, altitude ?? 0]);
      }
    }

    if (coordinates.length === 0) {
      coordinatesCache.set(activityId, []);
      return [];
    }

    const simplified = normalizeRoute(coordinates);
    coordinatesCache.set(activityId, simplified);
    return simplified;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.warn('[garmin-data] Failed to load route for activity', activityId, error);
    }
    coordinatesCache.set(activityId, []);
    return [];
  }
}

export const getWorkoutSummary = cache(async () => {
  const activities = await loadActivities();
  if (activities.length === 0) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      averageLoad: 0,
      weekDistance: 0,
      qualitySessions: 0,
      longestSession: undefined,
    };
  }

  const totalDistance = sum(activities.map(a => a.distanceKm));
  const totalDuration = sum(activities.map(a => a.durationMinutes));
  const averageLoad =
    activities.length > 0
      ? sum(activities.map(a => a.trainingLoad)) / activities.length
      : 0;

  const now = new Date();
  const sevenDaysAgo = startOfDay(new Date(now));
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const weekly = activities.filter(
    activity => activity.startTime >= sevenDaysAgo && activity.startTime <= now,
  );
  const weekDistance = sum(weekly.map(a => a.distanceKm));

  const qualitySessions = activities.filter(
    activity => activity.trainingLoad >= 130,
  ).length;

  const longestSession = activities.reduce<ActivityFile | undefined>(
    (longest, activity) =>
      !longest || activity.distanceKm > longest.distanceKm
        ? activity
        : longest,
    undefined,
  );

  return {
    totalDistance: round(totalDistance, 1),
    totalDuration: round(totalDuration, 1),
    averageLoad: round(averageLoad, 1),
    weekDistance: round(weekDistance, 1),
    qualitySessions,
    longestSession: longestSession
      ? mapActivityToWorkout(longestSession)
      : undefined,
  };
});

// No goal event is inferred from past workout history.
export const getNextRacePlan = cache(async () => ({
  name: 'No race goal configured', date: '', location: '', targetTime: '--',
  focusBlocks: [] as { label: string; weeks: number; emphasis: string }[],
}));
export type RacePlan = Awaited<ReturnType<typeof getNextRacePlan>>;
