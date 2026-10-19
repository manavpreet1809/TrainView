import { isCalendarDate } from '@/lib/metric-utils';
import { NextResponse } from 'next/server';
import { getWorkouts } from '@/lib/garmin-data';
import { queryWorkouts, type SortKey } from '@/lib/workout-query';
import { workoutsToCsv } from '@/lib/workout-export';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const search = params.get('search') ?? '', type = params.get('type') ?? '';
  const from = params.get('from') ?? '', to = params.get('to') ?? '';
  const sort = params.get('sort') ?? 'date', direction = params.get('direction') ?? 'desc';
  if (search.length > 1000 || type.length > 100 || !['date','type','distanceKm','trainingLoad'].includes(sort) || !['asc','desc'].includes(direction) || [from,to].some(date => date && !isCalendarDate(date)) || (from && to && from > to)) {
    return NextResponse.json({error:'Invalid workout export filters.'}, {status:400, headers:{'Cache-Control':'no-store'}});
  }
  const workouts = queryWorkouts(await getWorkouts(), {search,type,from,to,sort:sort as SortKey,direction:direction as 'asc'|'desc'});
  return new Response(workoutsToCsv(workouts), {headers:{
    'Content-Type':'text/csv; charset=utf-8',
    'Content-Disposition':'attachment; filename="trainview-workouts.csv"',
    'Cache-Control':'private, no-store',
    'X-Content-Type-Options':'nosniff',
  }});
}
