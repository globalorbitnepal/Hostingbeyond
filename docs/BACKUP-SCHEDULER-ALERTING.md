# HostingBeyond — backup schedule and failure alerting (design)

**Status:** `ALERTING_NOT_CONFIGURED` — no approved webhook, email, or chat destination in the repository.

## Recommended production schedule (after tooling deploy + export authorization)

| Control             | Recommendation                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Export trigger      | Daily **forced SSH** `ssh-forced-backup.sh` **or** owner cron as `hostingbeyond` invoking `create-pull-bundle.sh`                 |
| Concurrency         | Existing `flock` on `~/.cache/hostingbeyond-backup/create-pull-bundle.lock`                                                       |
| Timeout             | Monitor job duration; investigate if export exceeds agreed window                                                                 |
| Retention (VPS)     | Owner may prune old `~/backup-export/*` **after** Windows pull verified; never delete only `LATEST` without a newer verified copy |
| Retention (Windows) | Dev project snapshots: 14 (existing `HostingBeyond-DevProjectSnapshot` task)                                                      |

## Stale / failed run detection

| Signal                   | Detection                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Export failed            | Non-zero exit; no update to `LATEST.bundle.tar.age` / matching `.meta.json`                       |
| Stale backup             | `LATEST.bundle.meta.json` `backupSetId` older than policy (e.g. 26h — see `ops/backup/README.md`) |
| Partial artifact         | Preflight or publish failure; cleanup trap removes unpublished outer tar/age/meta                 |
| Scheduler silent failure | Cron mail to `hostingbeyond` (if configured) or external monitor hitting manifest age             |

## Failure notification (owner must configure)

1. Choose an **approved** channel (internal email, Slack webhook, PagerDuty, etc.) — **not** customer-facing addresses.
2. Wrap `create-pull-bundle.sh` in a small wrapper that on non-zero exit sends a **generic** alert (exit code + stage only, no `.env`, no paths under uploads).
3. Test with a **dry-run** failure (e.g. run preflight with approval off) and confirm alert delivery to internal recipients only.

## Windows dev snapshots (separate from production bundle)

- Task: `HostingBeyond-DevProjectSnapshot` — verify with `Get-ScheduledTask`, `Get-ScheduledTaskInfo`, and `SNAPSHOT_OK.json` under `HostingBeyond-Backups\project-snapshots\`.
- Production ciphertext pull uses **fetch** key + manifest compare (`ops/windows-backup/`).

## Do not

- Enable export or deploy secrets without explicit owner windows.
- Send test notifications to customers.
- Install overlapping cron and SSH-triggered exports without coordination.
