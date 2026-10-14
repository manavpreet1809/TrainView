import fs from 'node:fs/promises';
import path from 'node:path';
import { getDataConfig } from './data-config';

export async function getSetupStatus() {
  const config = getDataConfig();
  if (config.demo) return { ...config, state: 'demo' as const, count: 16 };
  try {
    const entries = await fs.readdir(path.join(config.root, 'FitFiles', 'Activities'));
    const count = entries.filter(name => /^activity_\d+\.json$/i.test(name)).length;
    return { ...config, state: count ? 'ready' as const : 'empty' as const, count };
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    return { ...config, state: missing ? 'missing' as const : 'unavailable' as const, count: 0 };
  }
}
