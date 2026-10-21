# HostingBeyond — production backup policy

**Last reviewed:** 2026-10-21 (dev host inspection; no production backup executed).  
**Owner approval:** required before first `create-pull-bundle.sh` on VPS.

## Protection layers (do not conflate)

| Layer                                  | What it protects                    | Current evidence                                                                                          |
| -------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Git (`globalorbitnepal/Hostingbeyond`) | Source, migrations, deploy workflow | **PASS** — canonical remote                                                                               |
| Linux dev workspace                    | Active development                  | **PASS** — `/home/sysadmin/dev/Hostingbeyond`                                                             |
| Windows Desktop master + snapshots     | Owner offline copy of dev tree      | **PASS** — verify report `dev-desktop-recovery-20261021-171121.json`; manual snapshot `2026-10-21_171607` |
| Production pull bundle                 | DB + uploads + metadata ciphertext  | **NOT CREATED** — `~/backup-export` absent for `hostingbeyond`                                            |
| Provider / hypervisor snapshots        | Host-level DR                       | **UNKNOWN** — not inventoried in repo                                                                     |

## Verified production resources (read-only, 2026-10-21)

| Resource        | Location / note                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------- |
| App checkout    | `/srv/apps/hostingbeyond` (user `hostingbeyond`, PM2 per deploy docs)                          |
| App listen      | `127.0.0.1:3030` (Nginx site `hostingbeyond` under `/etc/nginx/sites-enabled/`)                |
| Public hostname | `hosting.theglobalorbit.com` (documented)                                                      |
| Primary uploads | `/data/hostingbeyond/uploads` (~18M observed)                                                  |
| Legacy uploads  | `public/uploads`, `data/` under app root                                                       |
| PostgreSQL      | Via `DATABASE_URL` in production `.env` (name enforced as `hostingbeyond_db` in export script) |
| Export tooling  | `ops/backup/production/create-pull-bundle.sh`, forced SSH wrappers, `encrypt-artifact.sh`      |
| Disk on VPS     | `/` ~397G free of 467G (~11% used)                                                             |

Secrets (`.env`, TLS keys, Stripe, domain API keys) are **not** in Git bundles; recover from owner vault. See `ops/backup/production/env-inventory.mjs` for variable **names** only.

## Threat model (summary)

| Risk                     | Mitigation in design                                           |
| ------------------------ | -------------------------------------------------------------- |
| Accidental file deletion | Git + encrypted pull bundle + offline Windows copy             |
| Bad deploy               | Git pin + `metadata/gitCommit` in bundle                       |
| DB corruption / loss     | `pg_dump -Fc` + `pg_restore -l` verify before publish          |
| Host failure             | Rebuild VPS + restore from ciphertext + `.env` vault           |
| Credential compromise    | Rotate secrets; backups exclude `.env` plaintext               |
| Ransomware / backup wipe | Off-site Windows pull; separate keys; retention on PC          |
| Backup job failure       | Non-zero exit; failed bundle removed; `LATEST` only on success |

## Proposed objectives (not measured commitments)

| Metric  | Discussion baseline                 | Measured?                                   |
| ------- | ----------------------------------- | ------------------------------------------- |
| **RPO** | 24h if daily export + pull succeeds | **No** — no production backup timestamp yet |
| **RTO** | 4–8h single-VPS rebuild + restore   | **No** — restore drill **PENDING**          |

## Backup matrix (production)

| Asset             | Method                               | Schedule (target)                       | Retention (target)       | Status                                                                                                                 |
| ----------------- | ------------------------------------ | --------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL        | `pg_dump -Fc` → encrypt              | Daily after owner enables cron/SSH pull | 14+ offline copies on PC | **BLOCKED** — set `HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true` in production `.env` for approved window only |
| Upload trees      | tar members in bundle                | Same as DB                              | Same                     | **BLOCKED**                                                                                                            |
| Prisma migrations | `prisma-migrations.tar.gz` in bundle | Same                                    | Same                     | **BLOCKED**                                                                                                            |
| Env inventory     | `env-inventory.json` (names only)    | Same                                    | Same                     | **BLOCKED**                                                                                                            |
| App code          | Git + `gitCommit` in metadata        | Continuous (Git)                        | N/A                      | **PASS**                                                                                                               |
| Nginx/TLS/DNS     | Manual export / certbot              | Documented in DR runbook                | N/A                      | **PENDING** owner copy                                                                                                 |

## Destination and encryption

- **On-server staging:** `~/backup-export/<timestamp>/` then outer `*.bundle.tar.age` (see `ops/backup/production/README.md`).
- **Off-site:** Windows pull via `ssh-forced-fetch.sh` (read-only stream of `LATEST.bundle.tar.age`).
- **Encryption:** age recipient on server; private identity on Windows only (`ops/windows-backup/`).
- **Access:** forced-command SSH keys; no shell, no write to `.env`.

Do not configure a new cloud destination or purchase storage without owner approval.

## Automation gates

1. Owner approves `docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md` checklist.
2. Install age recipient + forced SSH keys on VPS.
3. Manual test: `sudo -u hostingbeyond -H .../create-pull-bundle.sh` (stdout = ciphertext path).
4. Windows pull + `verify-backup-set.mjs`.
5. Optional: systemd/cron on VPS for scheduled export (not applied in Day 2 inspection).

## Monitoring and alerts

No production backup alert channel verified. Required integrations (document only):

- Failed export exit code ≠ 0
- Zero-byte or missing ciphertext
- Checksum mismatch vs `.meta.json`
- Missed schedule / stale `LATEST`
- Disk threshold on `backup-export` and `/data`

## Related documents

- `docs/BACKUP-DR-AUDIT.md` — component matrix
- `docs/DISASTER-RECOVERY-RUNBOOK.md` — recovery index
- `docs/backup-restore-validation.md` — integrity checklist
- `ops/backup/dr/RESTORE-DRILL-LAB.md` — isolated drill
- `docs/OWNER-OFFLINE-BACKUP-COPY.md` — PC procedure
