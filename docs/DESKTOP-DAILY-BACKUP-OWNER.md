# Desktop daily backup — owner setup (HostingBeyond)

**Goal:** One folder on your Windows Desktop named **`hostingbeyond`**. Every night at **11 PM Nepal time** it updates automatically with a **full encrypted copy** of the live site data (database + uploads + metadata). After server loss, restore to a **new Linux VPS** — not by “running the folder on Windows.”

**Pehli baar ~30–45 min setup.** Uske baad daily automatic — aapko kuch nahi karna.

---

## Folder layout (after setup)

```
Desktop\hostingbeyond\
  current\                    ← har roz yahi update (same path)
    ciphertext.bundle.tar.age
    ciphertext.meta.stderr
    MIRROR.json
    verify-report.json
  backups\                    ← purane verified copies (retention)
  keys\                       ← SSH + age (ACL locked)
  logs\
  reports\last-run.json       ← SUCCESS / FAIL
  config.json                 ← aapki settings (Git mein mat daalo)
  README-RECOVERY.md
```

**Important:** `current` is **encrypted**. Decrypt ke liye **age identity** password manager mein rakho — backup disk ke saath mat rakho.

---

## Step 1 — Windows folder (5 min)

PowerShell **Run as your user**:

```powershell
cd <repo-clone>\Hostingbeyond\ops\windows-backup
.\Setup-DesktopBackupLayout.ps1
# Default: %USERPROFILE%\Desktop\hostingbeyond
```

Windows timezone: **Settings → Time & language → Time zone → (UTC+05:45) Kathmandu**  
(taaki `23:00` = Nepal 11 PM)

---

## Step 2 — config.json (5 min)

```powershell
$root = Join-Path $env:USERPROFILE "Desktop\hostingbeyond"
Copy-Item .\config.example.json (Join-Path $root "config.json")
notepad (Join-Path $root "config.json")
```

Set:

- `backupRoot` → apna Desktop path (`$env:USERPROFILE\Desktop\hostingbeyond`)
- `ssh.host` → VPS IP ya `hosting.theglobalorbit.com`
- Replace `REPLACE_WITH_YOUR_WINDOWS_USER` with `$env:USERNAME`

---

## Step 3 — SSH keys + VPS forced commands (15 min)

Follow exactly:

- `ops/windows-backup/SSH-KEYS-INSTALL.md`
- `ops/windows-backup/FIRST-MANUAL-BACKUP.md`

VPS par owner approval:

- `.env` mein `HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true` (sirf backup window ke liye)
- Latest code deploy ho jisme `ops/backup/production/create-pull-bundle.sh` ho

---

## Step 4 — Daily schedule (2 min)

```powershell
cd <repo>\Hostingbeyond\ops\windows-backup
.\Register-ScheduledTask.ps1 -ConfigPath (Join-Path $env:USERPROFILE "Desktop\hostingbeyond\config.json")
```

Task name: **`HostingBeyond-DailyBackup`** — daily **23:00** local (Nepal timezone = 11 PM).

Manual test:

```powershell
Start-ScheduledTask -TaskName HostingBeyond-DailyBackup
Get-Content (Join-Path $env:USERPROFILE "Desktop\hostingbeyond\reports\last-run.json")
```

SUCCESS + `current\ciphertext.bundle.tar.age` updated = OK.

---

## Step 5 — Server mar gaya to kya karein

1. Desktop `hostingbeyond\current\` + password manager (`.env` + age identity)
2. Naya Ubuntu VPS
3. `ops/restore/bootstrap-vps.sh` phases + `ops/windows-backup/templates/README-RECOVERY.md`
4. DNS → naya server, SSL, `hostingbeyond-ctl restart`

**Zero risk nahi** — agar crash backup se pehle ho to us din ka data loss ho sakta hai (max ~24h agar roz backup chale).

---

## Related docs

| Topic                | Path                                       |
| -------------------- | ------------------------------------------ |
| Windows pull details | `ops/windows-backup/README.md`             |
| Bundle contents      | `ops/backup/production/BUNDLE-CONTENTS.md` |
| DR index             | `docs/DISASTER-RECOVERY-RUNBOOK.md`        |
| Offline copy         | `docs/OWNER-OFFLINE-BACKUP-COPY.md`        |

---

## Troubleshooting

| Problem               | Fix                                              |
| --------------------- | ------------------------------------------------ |
| `last-run.json` FAIL  | `logs\backup.log` dekho; SSH keys / VPS approval |
| `current` update nahi | Pehle manual pull SUCCESS hona chahiye           |
| CI/build unrelated    | Desktop backup alag hai — yeh VPS SSH pull hai   |
