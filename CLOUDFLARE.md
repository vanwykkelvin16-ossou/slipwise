# Deploy Slipwise to Cloudflare

This is the complete Slipwise app: Cloudflare Worker, D1 database, private R2 storage, local OCR and PWA. Source export does not copy existing users, sessions or receipts from Sites. Plan a separate data migration before moving existing customers.

## Create resources

1. Create D1 database `slips-wise-db` and copy its database ID.
2. Create R2 bucket `slips-wise-files`. Keep public/r2.dev access disabled. All receipt access is authenticated through the Worker.
3. R2 activation may require billing setup. Workers, D1 and R2 have separate usage limits; a free address does not mean unlimited free storage or hosting.

## Connect GitHub in Workers & Pages

Select `vanwykkelvin16-ossou/slipwise` and use:

| Setting | Value |
| --- | --- |
| Worker name | `slipwise` |
| Production branch | `main` |
| Root | Repository root (`/`) |
| Build command | `pnpm run build:cloudflare` |
| Deploy command | `pnpm run deploy:cloudflare` |
| Build variable `CLOUDFLARE_D1_DATABASE_ID` | Your real D1 database ID |
| Node version | 22.13 or newer |
| Package manager | pnpm 11.25.0, from package.json |

Use the checked-in lockfile. The deployment credential needs access to the Worker, D1 migrations and R2 bucket in your account. The build writes the generated `dist/server/wrangler.json` with DB and BUCKET bindings; deploy applies SQL migrations first. Only dist/client is served publicly. Missing database configuration stops deployment with an explicit error.

Use the workers.dev address shown on the `slipwise` Worker after a successful deployment. The Sites slug `slips-wise` is separate from the Cloudflare Worker name.

## Repair the failed dashboard build

Open Workers & Pages > slipwise > Settings > Build. Set the build and deploy commands to the values above. The generic `pnpm run build` skips the production binding configuration, and plain `npx wrangler deploy` skips the migration helper.

Under Build variables and secrets, add `CLOUDFLARE_D1_DATABASE_ID` using the ID from the `slips-wise-db` D1 database overview. This is a build variable, not a runtime secret. Ensure `slips-wise-db` and the private `slips-wise-files` R2 bucket exist in the same account. Keep those resource names unchanged.

Deploy the latest `main` commit after saving the settings. If it fails, inspect the final lines of the deploy log. A D1 authorization error requires a build token with D1 edit access; an R2-not-found error requires the named bucket. Never substitute a placeholder database ID.

## Configure admin

Administrator email: `kelvin@sabroking.co.za`. No actual password or admin password hash is committed. Admin bootstrap requires the Worker secret `ADMIN_PASSWORD_HASH`.

In your local checkout with dependencies installed:

```sh
npx wrangler login
npm run admin:setup
```

The helper requests a password with hidden input, derives a uniquely salted PBKDF2 hash and sends it directly to the Cloudflare Worker secret. It never prints or saves the password/hash. Use the agreed initial password or choose a stronger one. Never add it to public source or NEXT_PUBLIC variables. First successful admin login creates the database admin. For an existing administrator, rotating the bootstrap secret alone does not change the stored password: update that admin database hash and revoke sessions separately.

## Verify after deployment

Test signup/login/sign-out, persistent sessions, scanning images/PDFs, reviewing and saving, editing/deleting, private downloads, bulk ZIP/PDF/CSV and admin contacts-only access. Test iPhone/Android installation and camera capture on physical devices. The original app and secret-based export passed 29 isolated backend checks, TypeScript, production build and a Wrangler deployment dry run before export. New-account live deployment has not yet been tested.

Official build documentation: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
