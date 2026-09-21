import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const configPath = resolve(projectRoot, 'dist/server/wrangler.json');

export function databaseId() {
  const id = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim();
  if (!id || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)
      || /^0{8}-0{4}-(?:0{4}|4000)-(?:0{4}|8000)-0{12}$/.test(id)) {
    throw new Error('Add CLOUDFLARE_D1_DATABASE_ID to Cloudflare Settings > Build > Build variables and secrets. Use the real ID from slips-wise-db, not its name. See CLOUDFLARE.md.');
  }
  return id;
}

export function configureCloudflare() {
  const id = databaseId();
  for (const path of ['dist/server/wrangler.json', 'dist/server/index.js', 'dist/client', 'drizzle']) {
    if (!existsSync(resolve(projectRoot, path))) {
      throw new Error(`Missing ${path}. Run pnpm run build:cloudflare before deployment.`);
    }
  }
  if (!readdirSync(resolve(projectRoot, 'drizzle')).some(name => name.endsWith('.sql'))) {
    throw new Error('No SQL migrations found in drizzle; deployment stopped.');
  }
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  config.name = 'slipwise';
  config.topLevelName = 'slipwise';
  config.workers_dev = true;
  config.d1_databases = [{
    binding: 'DB', database_name: 'slips-wise-db', database_id: id,
    migrations_dir: '../../drizzle',
  }];
  config.r2_buckets = [{ binding: 'BUCKET', bucket_name: 'slips-wise-files' }];
  config.assets = { ...config.assets, directory: '../client' };
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log('Configured Worker slipwise, D1 DB and private R2 BUCKET.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  configureCloudflare();
}
