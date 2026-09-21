import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { configureCloudflare, databaseId, projectRoot } from './configure-cloudflare.mjs';

// Fail before compiling when the account-specific database setting is missing.
databaseId();
const result = spawnSync(process.execPath, [resolve(projectRoot, 'scripts/run-framework.mjs'), 'build'], {
  cwd: projectRoot, stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
configureCloudflare();
