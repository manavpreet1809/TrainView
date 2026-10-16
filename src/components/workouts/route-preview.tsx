import type { RoutePoint } from '@/lib/route-geometry';
import { routeDistanceKm } from '@/lib/route-geometry';

export function RoutePreview({ coordinates, message }: { coordinates: RoutePoint[]; message: string }) {
  const lats=coordinates.map(point=>point[0]), lons=coordinates.map(point=>point[1]);
  const minLat=Math.min(...lats), minLon=Math.min(...lons);
  const latSpan=Math.max(...lats)-minLat, lonSpan=Math.max(...lons)-minLon;
  const scale=280/Math.max(latSpan,lonSpan,0.00001);
  const points=coordinates.map(([lat,lon])=>`${10+(lon-minLon)*scale},${290-(lat-minLat)*scale}`).join(' ');
  return <section className="rounded-xl border p-4 space-y-2" aria-label="Route preview">
    <p className="text-sm">{message}</p>
    <svg viewBox="0 0 300 300" className="h-64 w-full" role="img" aria-label="Simplified route shape without a basemap"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" /></svg>
    <p className="text-sm text-muted-foreground">Approximate sampled route distance: {routeDistanceKm(coordinates).toFixed(2)} km. Route shape only; no basemap or elevation scale.</p>
  </section>;
}
