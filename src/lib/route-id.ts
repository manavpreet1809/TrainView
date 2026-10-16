export function isRouteId(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 32 && /^(?:[0-9]+|demo-[0-9]{2})$/.test(value);
}
