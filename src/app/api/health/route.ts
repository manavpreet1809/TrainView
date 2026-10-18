import { NextResponse } from 'next/server';
import { getDataConfig } from '@/lib/data-config';

export const dynamic = 'force-dynamic';

// Liveness/configuration only: does not query private records or remote providers.
export function GET() {
  try {
    const config = getDataConfig();
    return NextResponse.json({status: 'ok', mode: config.demo ? 'demo' : 'local'}, {headers: {'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json({status: 'configuration-error'}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
}
