import fixtures from './activities.json';

// Dates follow the current day so the sample remains useful for weekly charts.
export function getDemoActivities(now = new Date()) {
  return fixtures.map((fixture, index) => {
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - fixture.daysAgo);
    startTime.setHours(8, 0, 0, 0);
    return {
      ...fixture,
      name: `Sample ${fixture.type} ${index + 1}`,
      startTime,
      moderateMinutes: Math.round(fixture.durationMinutes * 0.7),
      vigorousMinutes: Math.round(fixture.durationMinutes * 0.2),
      hrZones: [120, 900, 480, 180, 60],
      fitFile: '',
      hasPolyline: index === 0,
    };
  });
}
