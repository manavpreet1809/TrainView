import path from 'node:path';

export function getDataConfig(env: NodeJS.ProcessEnv = process.env) {
  const mode = env.TRAINVIEW_DEMO_MODE?.trim().toLowerCase();
  if (mode && !['true', 'false'].includes(mode)) {
    throw new Error('TRAINVIEW_DEMO_MODE must be true or false.');
  }
  return {
    demo: env.VERCEL === '1' || mode === 'true',
    root: env.GARMIN_DATA_ROOT?.trim() || path.resolve(process.cwd(), 'HealthData'),
    maps: Boolean(env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()),
    coach: Boolean(env.OPENAI_API_KEY?.trim()),
  };
}
