import {env} from 'cloudflare:workers';
// Set this server-side Cloudflare secret before using the admin portal.
export function adminHash(): string | null {
  const value=env.ADMIN_PASSWORD_HASH;
  return typeof value==='string' && /^pbkdf2\$100000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(value) ? value : null;
}
export const DUMMY_HASH='pbkdf2$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000';
