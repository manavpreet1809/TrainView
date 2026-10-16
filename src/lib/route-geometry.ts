export type RoutePoint = [number, number, number];
export function normalizeRoute(values: unknown[], limit = 750): RoutePoint[] {
  if (!Number.isInteger(limit) || limit < 2) throw new Error('Route limit must be at least two');
  const points: RoutePoint[] = [];
  for (const value of values) {
    if (!Array.isArray(value)) continue;
    const [lat, lon, altitude] = value;
    if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const point: RoutePoint = [lat, lon, typeof altitude === 'number' && Number.isFinite(altitude) ? altitude : 0];
    const prev = points.at(-1);
    if (!prev || prev.some((entry, i) => entry !== point[i])) points.push(point);
  }
  if (points.length <= limit) return points;
  return Array.from({length: limit}, (_,i) => points[Math.round(i * (points.length-1)/(limit-1))]);
}
export function routeDistanceKm(points: RoutePoint[]) {
  const radians = (value: number) => value * Math.PI / 180;
  let distance = 0;
  for (let i=1; i<points.length; i++) {
    const [a,b] = [points[i-1],points[i]];
    const dlat = radians(b[0]-a[0]), dlon = radians(b[1]-a[1]);
    const h = Math.sin(dlat/2)**2 + Math.cos(radians(a[0]))*Math.cos(radians(b[0]))*Math.sin(dlon/2)**2;
    distance += 6371 * 2 * Math.asin(Math.sqrt(Math.min(1,h)));
  }
  return distance;
}
