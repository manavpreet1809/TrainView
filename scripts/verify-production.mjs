import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const standalone = process.argv.includes('--standalone');
const port = standalone ? '3105' : '3104';
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, standalone ? ['.next/standalone/server.js'] : ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', port], {
  env: {...process.env, TRAINVIEW_DEMO_MODE:'true', PORT:port, HOSTNAME:'127.0.0.1'}, stdio:'inherit',
});
try {
  let ready = false;
  for(let attempt=0; attempt<60; attempt++) {
    if(server.exitCode !== null) throw new Error('Production server exited before verification');
    try { const response = await fetch(`${base}/setup`); if(response.ok) {ready=true;break;} } catch {}
    await delay(250);
  }
  if(!ready) throw new Error('Production server did not become ready');
  const code = await new Promise((resolve,reject)=> {
    const smoke=spawn(process.execPath,['scripts/smoke.mjs'],{env:{...process.env,TRAINVIEW_TEST_URL:base},stdio:'inherit'});
    smoke.on('error',reject);smoke.on('exit',resolve);
  });
  if(code!==0) throw new Error('Production smoke verification failed');
} finally {
  server.kill('SIGTERM');
}
