'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { IntensityRecord } from '@/types/garmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SleepQualityChartProps = {
  data: IntensityRecord[];
  className?: string;
};

export function SleepQualityChart({ data, className }: SleepQualityChartProps) {
  if (!data.length) return (
    <Card className={className}><CardHeader><CardTitle>Training chart unavailable</CardTitle></CardHeader>
      <CardContent><p className="text-sm text-muted-foreground">No records are available for this chart. Import activities with the relevant metrics or explore demo mode.</p></CardContent>
    </Card>
  );
  const formatted = data.map(entry => ({
    ...entry,
    label: new Date(`${entry.date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
    }),
  }));

  return (
    <Card className={cn('min-h-[360px]', className)}>
      <CardHeader className="pb-4">
        <CardTitle>Intensity minutes</CardTitle>
        <CardDescription>
          Garmin moderate and vigorous intensity minutes grouped by day.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} margin={{ top: 12, left: 0, right: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              stroke="dimgray"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              stroke="dimgray"
              axisLine={false}
              tickLine={false}
              fontSize={12}
              width={40}
            />
            <Tooltip content={<SleepTooltip />} />
            <Legend iconType="circle" />
            <Bar
              dataKey="moderateMinutes"
              name="Moderate minutes"
              stackId="minutes"
              fill="cornflowerblue"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="vigorousMinutes"
              name="Vigorous minutes"
              stackId="minutes"
              fill="indianred"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SleepTooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) {
    return null;
  }

  const moderate = payload.find(item => item.dataKey === 'moderateMinutes');
  const vigorous = payload.find(item => item.dataKey === 'vigorousMinutes');
  const total =
    (typeof moderate?.value === 'number' ? moderate.value : 0) +
    (typeof vigorous?.value === 'number' ? vigorous.value : 0);

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        Total {total.toFixed(0)} min
      </p>
      <p className="text-xs text-muted-foreground">
        Moderate {typeof moderate?.value === 'number' ? moderate.value.toFixed(0) : '--'} · Vigorous{' '}
        {typeof vigorous?.value === 'number' ? vigorous.value.toFixed(0) : '--'}
      </p>
    </div>
  );
}
