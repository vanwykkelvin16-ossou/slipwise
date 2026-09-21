import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { configureCloudflare, configPath, projectRoot } from './configure-cloudflare.mjs';

const args = process.argv.slice(2);
if (args.some(arg => arg !== '--dry-run')) throw new Error('Only --dry-run is supported.');
// Reapply the account bindings even if the user used the generic build command.
configureCloudflare();
function wrangler(args) {
  const result = spawnSync(process.execPath, [resolve(projectRoot, 'node_modules/wrangler/bin/wrangler.js'), ...args], {
    cwd: projectRoot, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Validate the bundle before any production database or Worker changes.
wrangler(['deploy', '--config', configPath, '--dry-run']);
if (!args.includes('--dry-run')) {
  wrangler(['d1', 'migrations', 'apply', 'DB', '--remote', '--config', configPath]);
  wrangler(['deploy', '--config', configPath]);
}
