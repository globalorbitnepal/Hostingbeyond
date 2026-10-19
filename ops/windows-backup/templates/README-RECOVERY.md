# HostingBeyond — disaster recovery (owner runbook)

Copy this file to: `D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\README-RECOVERY.md`

**Not automated.** Follow after complete server loss. Requires owner approval for DNS, payments, and production secrets.

**Lab vs production:** Isolated restore drills use `ops/backup/dr/restore-test-isolated.mjs` only against **`hostingbeyond_restore_test`** on localhost (`ops/backup/dr/ISOLATED-RESTORE-SETUP.md`). **This runbook is production recovery** — it modifies the live application database and files. Do not confuse the two paths.

**Restore drill:** **PENDING** until owner completes lab `restore-test-isolated.mjs`. A Windows `verify-*.json` with `layer: ciphertext-sha256` does **not** prove database restore works.

---

## 1. Identify the newest **verified** backup

1. Open `D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\reports\last-run.json` — status must be `SUCCESS`.
2. Under `reports\`, confirm `verify-<YYYY-MM-DD_HH-mm-ss>.json` for the backup folder shows `status: PASS`. `layer: ciphertext-sha256` means checksum only; `inner-bundle-checksums` requires optional decrypt test on pull.
3. Under `backups\`, use the matching timestamp folder (or re-run inner verification after decrypt):

   ```powershell
   node <repo>\ops\backup\dr\verify-backup-set.mjs D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\backups\<YYYY-MM-DD_HH-mm-ss>
   ```

4. If database file is `hostingbeyond.dump.age`, decrypt with your **age identity** (from password manager — not stored next to backups only):

   ```powershell
   age -d -i <path-to-age-identity> -o hostingbeyond.dump hostingbeyond.dump.age
   ```

---

## 2. Recover encryption keys

| Asset             | Where                                                           |
| ----------------- | --------------------------------------------------------------- |
| age identity      | Password manager / offline backup — **not** in Git              |
| SSH backup key    | `keys\hostingbeyond-backup_ed25519` (optional for old server)   |
| Production `.env` | Password manager / secure vault — **required** for full service |
| TLS private keys  | Let's Encrypt on old server or re-issue on new server           |

If age identity is lost, database `.age` files are **not recoverable**.

---

## 3. Provision replacement VPS

- Ubuntu LTS (match or exceed current server).
- Create user `hostingbeyond`, firewall allow 22/80/443 (owner policy).
- Install: `git`, `nodejs` 22.x, `npm`, `postgresql` client, `nginx`, `certbot`, `pm2` (global for hostingbeyond user).

---

## 4. Restore application code

```bash
sudo -u hostingbeyond -H git clone git@github.com:globalorbitnepal/Hostingbeyond.git /srv/apps/hostingbeyond
cd /srv/apps/hostingbeyond
git checkout <manifest.gitCommit from backup metadata/server-facts.json>
npm ci
```

Or deploy latest `main` **only if** owner accepts schema drift risk — prefer manifest commit.

---

## 5. Restore PostgreSQL (destructive — production only)

**Warning:** `pg_restore` drops and recreates objects in the **target database**. Confirm database name (`hostingbeyond_db` per bundle metadata), backups, and maintenance window before proceeding. This is **not** the lab `restore-test-isolated.mjs` flow.

1. Create empty database and role (match `metadata/server-facts.json` `databaseName`).
2. **Owner:** place `DATABASE_URL` in `/srv/apps/hostingbeyond/.env` (from vault — never commit).
3. Restore dump (owner confirmation required):

   ```bash
   pg_restore --no-owner --no-acl -d <target_db> /path/to/hostingbeyond.dump
   ```

   Use `--clean --if-exists` only when you intend to replace all objects in that database.

4. **Do not** run `prisma migrate reset`.
5. Check migration history:

   ```bash
   cd /srv/apps/hostingbeyond && npx prisma migrate status
   ```

   If `beyond_ai` rename repair needed: `docs/MIGRATION-HISTORY-REPAIR.md` **before** `migrate deploy`.

6. Apply pending migrations only with owner approval and `docs/RELEASE-GATE.md` gates.

---

## 6. Restore files

Extract each `files/*.tar.gz` from the backup set to paths recorded in bundle (typical):

- `/data/hostingbeyond/uploads` ← `orbit_uploads.tar.gz`
- `/srv/apps/hostingbeyond/public/uploads` ← `public_uploads.tar.gz`
- etc.

Set `ORBIT_UPLOAD_DIR` in `.env` to match production layout.

---

## 7. Environment configuration

Use `metadata/env-inventory.json` as a checklist of **names** to configure in `.env`. Copy values from secure vault — never from manifest.

---

## 8. Nginx, TLS, DNS

1. Recreate Nginx site proxying to `127.0.0.1:3030` (copy from old server or template).
2. `certbot --nginx -d hosting.theglobalorbit.com` (or restore certs via approved secure transfer).
3. **Lower TTL** before cutover; update DNS A/AAAA to new VPS only after validation.

---

## 9. PM2

```bash
sudo cp ops/hostingbeyond-ctl /usr/local/sbin/hostingbeyond-ctl  # if not on server image
sudo -u hostingbeyond -H /usr/local/sbin/hostingbeyond-ctl restart
```

Build: `npm run build` as `hostingbeyond` with `.env` present.

---

## 10. Validation (before traffic cutover)

- [ ] `curl -I https://hosting.theglobalorbit.com` (on new server via `/etc/hosts` test first)
- [ ] Customer login (email + OAuth if configured)
- [ ] Orbit admin passkey login
- [ ] CMS/blog pages and media URLs
- [ ] Domain search (live availability configured)
- [ ] Wallet balance matches `sourceAggregates` / spot checks (no PII in logs)
- [ ] Hosting orders visible in account

---

## 11. Avoid duplicate side effects

| Risk                            | Mitigation                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Stripe webhook replay           | Use Stripe Dashboard to pause/disable endpoint until new URL verified; reconcile wallet ledger |
| Domain registrar double actions | Do not replay in-flight `PROCESSING` orders; verify `DomainOrder` statuses                     |
| Renewal/cron jobs               | Keep old server **stopped** or isolated; enable jobs only on new server after cutover          |
| Email SMTP                      | Verify single active sender                                                                    |

---

## 12. Cutover / rollback

- **Cutover:** DNS to new VPS only when section 10 passes.
- **Rollback:** Revert DNS to old server if still available; do not destroy old DB until new site is stable.

---

## 13. Automation vs owner approval

| Automated (after setup)      | Owner approval required        |
| ---------------------------- | ------------------------------ |
| Windows weekly pull backup   | First SSH key on VPS           |
| Manifest checksum verify     | DNS cutover                    |
| Retention after verified set | `migrate deploy` on production |
|                              | Stripe/webhook URL changes     |
|                              | `.env` creation on new server  |

---

## Isolated restore test (non-production)

Create DB `hostingbeyond_restore_test` on **localhost** only; use `ops/backup/dr/restore-test-isolated.mjs` with libpq env pointing **only** at that database. Refuses `hostingbeyond_db` and non-local `PGHOST`. **RESTORE TEST PENDING** until owner runs this at least once.

## Encryption key recovery

1. Locate age **identity** file (created with `age-keygen`) from password manager / offline backup.
2. Decrypt: `age -d -i <identity> -o hostingbeyond.dump hostingbeyond.dump.age`
3. If identity exists only on the same disk as backups, **DR is incomplete** — fix key custody before relying on backups.
