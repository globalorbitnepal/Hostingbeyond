# HostingBeyond — backup & disaster recovery audit

**Audit date:** 2026-10-19 (Day 2 refresh; repository + docs; **no production connection**).  
**Prior audit:** 2026-10-16.  
**Production paths below** are from code/deploy workflow unless marked **Verify on VPS**.

## Executive summary

| Area                           | Status                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| PostgreSQL customer & CMS data | In DB — **must** backup via `pg_dump`                                                  |
| Upload/media                   | **Likely** `/data/hostingbeyond/uploads` + legacy `public/uploads` — **Verify on VPS** |
| Secrets / `.env`               | `/srv/apps/hostingbeyond/.env` — **never** in Git; separate secure recovery            |
| Git source                     | `globalorbitnepal/Hostingbeyond` — not sufficient alone for DR                         |
| Existing `ops/backup/*.sh`     | Staging/local only (blocks production `.env`)                                          |
| Windows automation             | Implemented in repo — **PENDING** owner setup                                          |
| Nginx / TLS / DNS              | **Not in repo** — document recovery; **Verify on VPS**                                 |

## Audit matrix

| Component                             | Actual location                                                                                                     | Backup method                                                       | Restore method                                                                           | Sensitive?        | Verified?                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------- |
| PostgreSQL (all Prisma models)        | `DATABASE_URL` in prod `.env` (name often `hostingbeyond_db` per `.env.example`)                                    | `pg_dump -Fc` in `create-pull-bundle.sh`                            | `pg_restore` to new DB + `prisma migrate deploy` if needed                               | **Yes**           | **PARTIAL** (script + local tests; prod **PENDING**)                         |
| `_prisma_migrations`                  | Inside PostgreSQL                                                                                                   | Included in logical dump                                            | Restore with DB; see `docs/MIGRATION-HISTORY-REPAIR.md`                                  | No                | **PARTIAL**                                                                  |
| Customer users/sessions/OAuth         | Tables `CustomerUser`, `CustomerSession`, `CustomerOAuthAccount`                                                    | DB dump                                                             | DB restore                                                                               | **Yes**           | Repo schema **PASS**                                                         |
| Wallet / Stripe ledger                | `CustomerWallet`, `WalletTransaction`, `WalletPayment`                                                              | DB dump                                                             | DB restore; **pause webhooks** during cutover                                            | **Yes**           | Repo **PASS**                                                                |
| Domain orders/registrations/transfers | `DomainOrder`, `DomainRegistration`, `DomainTransferRecord`, carts                                                  | DB dump                                                             | DB restore                                                                               | **Yes**           | Repo **PASS**                                                                |
| Hosting catalog & orders              | `HostingProduct*`, `HostingOrder`, `HostingAddon`, `HostingOrderCheckout` (migration `20261018010000`)              | DB dump                                                             | DB restore; **verify** checkout table on prod before relying on Stripe checkout          | **Yes**           | Repo **PASS**; prod schema **PENDING** (migrate skipped on deploy `78a30a7`) |
| Invoices (DB + PDF)                   | `Invoice` + `invoices-private/` under `INVOICE_STORAGE_DIR` / `ORBIT_UPLOAD_DIR` (`lib/billing/invoice-storage.ts`) | DB dump + upload tar in bundle                                      | Restore DB + extract files; PDF route `app/api/account/invoices/[publicId]/pdf/route.ts` | **Yes**           | Repo **PASS**; prod paths **Verify on VPS**                                  |
| Blog/CMS                              | `BlogPost`, `Blog*`, `PageContent`, `SiteSettings`, `MediaAsset`                                                    | DB dump                                                             | DB restore                                                                               | Mixed             | Repo **PASS**                                                                |
| Beyond AI                             | `BeyondAiSubscription`, `BeyondAiProject`                                                                           | DB dump                                                             | DB restore                                                                               | **Yes**           | Repo **PASS**                                                                |
| Orbit admin / WebAuthn                | `AdminUser`, `WebAuthnCredential`, sessions                                                                         | DB dump                                                             | DB restore                                                                               | **Yes**           | Repo **PASS**                                                                |
| Primary upload dir                    | `ORBIT_UPLOAD_DIR` (prod example `/data/hostingbeyond/uploads`)                                                     | Tar in bundle                                                       | Extract to same path on new server                                                       | Maybe             | **Verify on VPS**                                                            |
| Legacy `public/uploads`               | `$APP_ROOT/public/uploads` (deploy preserves)                                                                       | Tar if present                                                      | Extract under app root                                                                   | Maybe             | **Verify on VPS**                                                            |
| `data/uploads`                        | `$APP_ROOT/data/uploads`                                                                                            | Tar if present                                                      | Extract                                                                                  | Maybe             | **Verify on VPS**                                                            |
| `data/hostingbeyond`                  | `$APP_ROOT/data/hostingbeyond`                                                                                      | Tar if present                                                      | Extract                                                                                  | Maybe             | **Verify on VPS**                                                            |
| Application code                      | `/srv/apps/hostingbeyond` git checkout                                                                              | Metadata: `gitCommit` + optional full tree via git clone on restore | `git clone` + `origin/main` at commit or latest after DR decision                        | No                | Deploy.yml **PASS**                                                          |
| Prisma schema/migrations              | `prisma/` in repo                                                                                                   | `prisma-migrations.tar.gz` in bundle                                | Extract + `migrate deploy`                                                               | No                | **PASS**                                                                     |
| Production `.env`                     | `/srv/apps/hostingbeyond/.env`                                                                                      | **Not** in bundle; names-only `env-inventory.json`                  | Manual restore from password manager / secure vault                                      | **Yes**           | **PENDING** secure procedure                                                 |
| PM2 process                           | `hostingbeyond` via `/usr/local/sbin/hostingbeyond-ctl`                                                             | Documented in recovery README                                       | Recreate from deploy workflow                                                            | No                | **Verify on VPS**                                                            |
| Nginx vhost / TLS                     | Server config (not in app repo)                                                                                     | Manual copy or certbot re-issue                                     | `certbot` + recreate vhost                                                               | **Yes** (keys)    | **PENDING**                                                                  |
| DNS                                   | `hosting.theglobalorbit.com`                                                                                        | Document registrar records                                          | Update A/AAAA at cutover                                                                 | No                | **PENDING** owner records                                                    |
| GitHub Actions deploy                 | `.github/workflows/deploy.yml`                                                                                      | N/A                                                                 | Reconfigure secrets on new VPS                                                           | **Yes** (secrets) | Repo **PASS**                                                                |
| Stripe webhooks                       | Stripe Dashboard                                                                                                    | N/A                                                                 | Point to new URL after validation                                                        | **Yes**           | **PENDING**                                                                  |
| Domain API keys                       | `.env`                                                                                                              | Not in backup manifest                                              | Restore from vault                                                                       | **Yes**           | **PENDING**                                                                  |

## Prisma / migrations (recovery notes)

- **19** migration folders in repo (through `20261018010000_hosting_order_checkout`).
- Newer migrations (verify on production before migrate): `20261017163000_invoices`, `20261017194500_invoice_user_restrict`, `20261018010000_hosting_order_checkout`.
- Production may still record `20250924190000_beyond_ai` — repair per `docs/MIGRATION-HISTORY-REPAIR.md` before migrate.
- **Do not** infer production applied migrations from app deploy alone (`MIGRATE_SKIPPED` on last known deploy).
- Do **not** run `prisma migrate reset` on production.

## Environment variables (names only)

Canonical list in `ops/backup/production/env-inventory.mjs` (derived from `.env.example` + code). Additional keys may exist in production `.env` — reported as `additionalKeysPresent` in inventory output.

## Infrastructure (documented assumptions — verify on VPS)

| Item        | Source                       | Verify?                                  |
| ----------- | ---------------------------- | ---------------------------------------- |
| Node 22     | `ci.yml`                     | **Verify** `node -v` on VPS              |
| App port    | `127.0.0.1:3030`             | `hostingbeyond-ctl`, deploy.yml **PASS** |
| PM2 user    | `hostingbeyond`              | **PASS** in repo                         |
| Nginx proxy | `hosting.theglobalorbit.com` | **PENDING** config copy                  |
| PostgreSQL  | Local to VPS (typical)       | **Verify** version `psql --version`      |

## Gaps / unknowns

1. Exact production `ORBIT_UPLOAD_DIR` and whether all media live only there or also under `public/uploads`.
2. Nginx site file path and TLS certificate storage (`/etc/letsencrypt/...`).
3. Whether PostgreSQL runs on same host or managed service (affects dump method).
4. Cron/systemd beyond deploy (renewal jobs, etc.) — search app for schedulers: mostly in-app/PM2 unless **Verify**.
5. Provider-level DB snapshots (recommended in addition to logical dump).

## Compatibility with existing scripts

| Script                                        | Role                                            |
| --------------------------------------------- | ----------------------------------------------- |
| `hostingbeyond-backup.sh`                     | Unchanged; staging/local                        |
| `create-pull-bundle.sh`                       | New; production export for pull                 |
| `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md`        | Pre-migrate read-only SQL; B10 checkout/invoice |
| `docs/DAY2-PRODUCTION-PREFLIGHT-CHECKLIST.md` | Owner PASS/FAIL table                           |
| `docs/DISASTER-RECOVERY-RUNBOOK.md`           | DR index + proposed RPO/RTO                     |
| `docs/OWNER-OFFLINE-BACKUP-COPY.md`           | PC / HDD / offline copy procedure               |
| `ops/backup/dr/RESTORE-DRILL-LAB.md`          | Isolated restore drill                          |
