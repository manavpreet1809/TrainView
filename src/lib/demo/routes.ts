// Fictional loop near 0 latitude/longitude, not a recorded person's location.
export function getDemoCoordinates(id: string): [number, number, number][] {
  if (id !== 'demo-01') return [];
  return Array.from({ length: 81 }, (_, i) => {
    const angle = i * Math.PI / 40;
    return [0.01 * Math.sin(angle), 0.01 * Math.cos(angle), 5 + 3 * Math.sin(angle)] as [number, number, number];
  });
}
