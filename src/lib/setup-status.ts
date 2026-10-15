import { readActivityImport } from './activity-import';
import { getDataConfig } from './data-config';

export async function getSetupStatus() {
  const config = getDataConfig();
  if (config.demo) return { ...config, state: 'demo' as const, count: 16, skipped: 0, duplicates: 0 };
  const report = await readActivityImport(config.root);
  return { ...config, state: report.state, count: report.activities.length,
    skipped: report.skipped, duplicates: report.duplicates };
}
