# Deploy Slipwise to Cloudflare

This repository deploys the Slipwise app to the Cloudflare Worker **slipwise**. It includes the application, OCR assets, SQL migrations and deployment scripts. Existing users and receipts on Sites are not copied by a source deployment.

## 1. Prepare your Cloudflare resources

In the same Cloudflare account as the Worker:

1. Open **Storage & databases > D1 SQL Database**. Create `slips-wise-db` if it does not already exist. Copy its **Database ID** from the overview.
2. Open **Storage & databases > R2 Object Storage**. Create `slips-wise-files` if it does not already exist. Keep its public development URL disabled and do not attach a public custom domain. The app serves receipts through authenticated routes.
3. If Cloudflare asks you to activate R2 or accept billing terms, complete that directly in your account. These services have separate usage limits.

Reuse existing resources with these names. Do not delete or recreate a database containing user data.

## 2. Set the Worker build settings

Open **Workers & Pages > slipwise > Settings > Build**. Connect `vanwykkelvin16-ossou/slipwise` and set:

| Setting | Value |
| --- | --- |
| Worker name | `slipwise` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `pnpm run build:cloudflare` |
| Deploy command | `pnpm run deploy:cloudflare` |
| Build variable name | `CLOUDFLARE_D1_DATABASE_ID` |
| Build variable value | The real Database ID copied from `slips-wise-db` |
| Node version | 22.13 or newer |
| Package manager | pnpm 11.25.0, declared in package.json |

Add the database ID under **Build variables and secrets**, not only runtime Variables & Secrets. Enter the UUID without quotation marks. Do not enter the database name or a sample ID.

Use the checked-in pnpm lockfile. The build token must have access to this account's Worker, D1 and R2 resources, including D1 edit permission to apply migrations. A default build token may need D1 permission added in Cloudflare.

Save the settings, then trigger a deployment of the latest `main` commit. A build for an older commit will not contain the latest fixes.

The source cannot change these dashboard settings or create account resources by being pushed to GitHub.

## 3. What the scripts do

- `build:cloudflare` checks the database ID before compiling. It builds the app and configures the generated `dist/server/wrangler.json` for Worker `slipwise`, database binding `DB`, and storage binding `BUCKET`.
- `deploy:cloudflare` checks the generated files and reapplies the account bindings. It runs a Wrangler dry run, applies pending D1 SQL migrations, and then publishes the Worker. A failed check or migration stops the deployment.
- `check:cloudflare` checks the built package with Wrangler's `--dry-run`. It does not apply remote migrations or publish a Worker.

Only `dist/client` is served as public static assets. The migration path is relative to the generated config so it remains valid across build machines. Do not upload the repository root as a static website.

Use the Cloudflare-specific commands above. Plain `npx wrangler deploy` skips the database migration helper. A generic build followed by `deploy:cloudflare` is supported, but `build:cloudflare` gives earlier configuration errors.

## 4. Optional deployment from your own terminal

With Node and pnpm installed:

```sh
git clone https://github.com/vanwykkelvin16-ossou/slipwise.git
cd slipwise
pnpm install --frozen-lockfile
pnpm exec wrangler login
export CLOUDFLARE_D1_DATABASE_ID='PASTE_YOUR_REAL_DATABASE_ID'
pnpm run build:cloudflare
pnpm run check:cloudflare
pnpm run deploy:cloudflare
```

The export command is for macOS/Linux shells. Keep the real value in your terminal environment or Cloudflare build settings; do not commit credentials.

## 5. Set up the admin portal

After deploying, use your local checkout to set the initial admin password:

```sh
pnpm run admin:setup
```

Sign in to Wrangler first as shown above. The helper prompts twice with hidden input, derives a uniquely salted PBKDF2 hash and writes the `ADMIN_PASSWORD_HASH` secret to Worker `slipwise`. It does not print or save the password or hash. Do not put a plaintext password into this secret.

Admin email: `kelvin@sabroking.co.za`. Admin login will not work until this secret is configured. First successful admin login creates the admin database record. Changing the bootstrap secret alone does not rotate an existing admin's stored password.

## Troubleshooting

| Error or symptom | Action |
| --- | --- |
| Missing/invalid `CLOUDFLARE_D1_DATABASE_ID` | Add the real D1 UUID to build variables, then run a new build. |
| Missing `dist/server` files | Use `pnpm run build:cloudflare` from repository root. |
| Worker name mismatch | Keep the dashboard Worker name as `slipwise`. The Sites slug `slips-wise` is separate. |
| D1 permission or authorization failure | Check the build token's account and D1 edit permission. |
| Database does not exist | Confirm the D1 UUID belongs to `slips-wise-db` in this account. |
| R2 bucket not found / R2 not enabled | Activate R2 if needed and create the private `slips-wise-files` bucket. |
| Table already exists during migration | Stop and inspect existing schema/migration history; do not delete customer data or blindly rerun SQL. |
| Admin login fails | Run the admin setup helper; verify the secret belongs to Worker `slipwise`. |

## Verification

On 21 September 2026, this revision passed a production build, TypeScript checking, a Wrangler deployment dry run and the initial SQL migration against a local D1 database. Those checks used a synthetic database ID for local validation only. They do not verify your Cloudflare account permissions, resource existence or live deployment.

After deployment, open the workers.dev URL shown by Cloudflare. Test signup, sign-in, saving a receipt, viewing/downloading it, exports and admin sign-in. Check that one user's private files cannot be accessed by another user. Test PWA installation and camera capture on physical iPhone/Android devices.

References: [Workers build settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) and [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).
