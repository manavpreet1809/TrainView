import { cp, mkdir, readdir, rm } from 'node:fs/promises';

const root = '.next/standalone';
await mkdir(`${root}/.next`, {recursive:true});
await cp('.next/static',`${root}/.next/static`,{recursive:true,force:true});
await cp('public',`${root}/public`,{recursive:true,force:true});
// Prisma native engines are loaded dynamically and need explicit packaging.
await cp('node_modules/.prisma',`${root}/node_modules/.prisma`,{recursive:true,force:true});
await cp('node_modules/@prisma/client',`${root}/node_modules/@prisma/client`,{recursive:true,force:true});
// Never distribute a developer's local environment copied by build tracing.
for (const file of await readdir(root)) {
  if (file === '.env' || file.startsWith('.env.')) await rm(`${root}/${file}`,{force:true});
}
console.log('Standalone server, native engines, and static assets are ready; local environment files excluded.');
