# Slipwise

A mobile-first business receipt PWA built with React/Vinext, Cloudflare D1 and private R2 object storage. Currency: ZAR.

## Features

- Business owner signup, password hashing with unique salts, persistent 30-day HttpOnly sessions, rate limits and same-origin mutation checks.
- Camera or JPEG/PNG/WebP/PDF upload (10 MB maximum). Local Tesseract OCR; PDF text extraction or first-page raster OCR. Always review extracted fields before saving. All original PDF pages are retained.
- Per-owner receipt search, category/month filters, editable metadata, deletion and private original download. Files are filed by receipt year/month; export folders follow the current edited date.
- Bulk ZIP originals, PDF summaries plus originals, spreadsheet-compatible CSV with formula injection protection.
- Read-only admin contacts endpoint. Server-side role checks deny admin access to all slip and file endpoints. Initial admin password exists only as a server-side salted hash.
- Installable PWA with maskable and Apple icons, Android install prompt and Safari instructions. Offline navigation allows one explicit device-local receipt draft; account records and files are never cached by the service worker. Reconnect and sign in to review and save a draft.

## Data and hosting

Deploy this source using [CLOUDFLARE.md](CLOUDFLARE.md). Configure D1 `DB`, private R2 `BUCKET` and the admin bootstrap secret in your own account. Source export does not include existing Sites customer records or receipts.

## Verification

- TypeScript check and production build pass.
- 29 isolated integration checks against the built Worker cover signup, session restoration, login, upload, editing, deletion, original download, user isolation, admin contacts-only access, CSRF protection, validation and session revocation.
- Real Tesseract extraction verified supplier, date, receipt number, VAT, category and total on a generated receipt fixture.
- ZIP structure, CSV values and formula protection, and combined image/multipage-PDF exports verified.
- Service worker tested for offline fallback and exclusion of private API data. Icons and manifest verified.
- Desktop and 390px layouts inspected in the browser; signup and install interfaces inspected. Full authenticated browser journeys were not automated; backend journeys were tested in isolation. Physical iOS/Android installation, camera capture and persistence after device restart require real-device acceptance testing.
- WebMCP search is feature-detected; validation unavailable because the testing browser does not expose modelContext.

## Operational limits

Receipt extraction is best-effort and is never treated as a final financial record before user review. Scanning covers the first page of a PDF; all pages are stored. Exports are generated on the client, so very large selections depend on device memory. Offline drafts are temporary local files, not cloud backups. Email verification and password recovery are not included in the requested initial flow.
