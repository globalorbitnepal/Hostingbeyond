# HostingBeyond — Windows desktop backup (pull model)

The Windows PC **initiates SSH** to production and pulls a backup bundle created by `ops/backup/production/create-pull-bundle.sh` on the VPS. No new inbound ports on the VPS.

## Status

| Step                                   | Status                                              |
| -------------------------------------- | --------------------------------------------------- |
| Scripts in repository                  | **PASS** (dev checkout)                             |
| Desktop `hostingbeyond\current` mirror | **PASS** (see `docs/DESKTOP-DAILY-BACKUP-OWNER.md`) |
| Task Scheduler registered              | **PENDING** (run on Windows)                        |
| Production backup executed             | **PENDING** (owner approval)                        |
| Isolated restore test                  | **PENDING**                                         |

## One-time setup (owner)

**Quick path (Desktop folder, daily 11 PM Nepal):** `docs/DESKTOP-DAILY-BACKUP-OWNER.md`

1. Create directory layout on **your Windows PC** (mandatory final destination):

   ```
   %USERPROFILE%\Desktop\hostingbeyond\
     backups\  current\  logs\  reports\  restore-tests\  keys\
   ```

   Or run: `Setup-DesktopBackupLayout.ps1` in this folder.

   Resolve the real path in PowerShell: `Join-Path $env:USERPROFILE 'Desktop\hostingbeyond'`.

2. Copy `config.example.json` → `config.json`; set `backupRoot` and `ssh.host` (no secrets in Git).

3. Generate a **dedicated** backup SSH key (do not reuse GitHub deploy key):

   ```powershell
   ssh-keygen -t ed25519 -f D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\hostingbeyond-backup_ed25519
   ```

4. On the VPS (owner-approved): install **read-only** `authorized_keys` entry for `command="...",no-port-forwarding` wrapping `create-pull-bundle.sh` — see `ops/backup/production/README.md`.

5. Deploy latest app code to `/srv/apps/hostingbeyond` so the bundle script exists.

6. Install [age](https://github.com/FiloSottile/age) on Windows; create recipient file under `keys\backup-recipient.txt`; store **age identity** in password manager (not on same disk as only copy of backups).

7. Restrict ACLs: only your Windows user + Administrators on `keys\` and `backups\`.

8. Register schedule:

   ```powershell
   cd D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond
   # Copy Invoke-HostingBeyondBackup.ps1 + Register-ScheduledTask.ps1 + config.json here, or clone repo path
   .\Register-ScheduledTask.ps1 -ConfigPath .\config.json
   ```

9. Copy `templates/README-RECOVERY.md` to `D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\README-RECOVERY.md`.

## Encryption (fail closed)

Production pulls **require** `age` and `encryption.enabled` + `encryption.required` in `config.json`.  
Unencrypted backups are allowed only with `-AllowUnencryptedTestMode` and `testMode.syntheticOnly: true` (lab/synthetic data).

Recovery identity must be stored **outside** the backup disk (password manager). See `FIRST-MANUAL-BACKUP.md`.

## Manual run

```powershell
.\Invoke-HostingBeyondBackup.ps1 -ConfigPath D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\config.json
```

Step-by-step first cycle: **`FIRST-MANUAL-BACKUP.md`**.

## Verification on Windows

Requires Node.js on desktop (for manifest verification / retention):

```powershell
node \path\to\repo\ops\backup\dr\verify-backup-set.mjs D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\backups\<set>
```

Isolated restore test: see `ops/backup/dr/restore-test-isolated.mjs` and `README-RECOVERY.md`.
