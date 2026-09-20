import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const configPath='dist/server/wrangler.json';
const config=JSON.parse(readFileSync(configPath,'utf8'));
if(config.name!=='slips-wise'||config.d1_databases?.[0]?.database_name!=='slips-wise-db')throw new Error('Run npm run build:cloudflare before deployment.');
function wrangler(args){const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js',...args],{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1)}
wrangler(['d1','migrations','apply','DB','--remote','--config',configPath]);
wrangler(['deploy','--config',configPath]);
