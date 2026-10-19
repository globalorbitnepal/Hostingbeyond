# HostingBeyond backup — Windows PC as final destination (owner)

**Requirement:** The verified backup must live on **your Windows PC local disk**, not on the VPS, another server, or cloud as the primary copy.

**This document does not create or download backups.** Approval is required before the first production export.

---

## 1. Resolve your PC path and disk space (run on Windows)

Open **PowerShell** on the desktop that will store backups:

```powershell
$BackupRoot = Join-Path $env:USERPROFILE "HostingBeyond-Backups"
$drive = [System.IO.Path]::GetPathRoot($BackupRoot)
$disk = Get-PSDrive -Name ($drive.TrimEnd('\').Replace(':', '')) -ErrorAction SilentlyContinue
Write-Host "Backup root (final destination): $BackupRoot"
if ($disk) {
  Write-Host ("Free space on {0}: {1:N2} GB" -f $drive, ($disk.Free / 1GB))
} else {
  Write-Host "WARN: could not read free space for $drive"
}
```

Create layout **only if missing** (does not delete existing files):

```powershell
$BackupRoot = Join-Path $env:USERPROFILE "HostingBeyond-Backups"
@("backups", "logs", "reports", "restore-tests", "keys") | ForEach-Object {
  $p = Join-Path $BackupRoot $_
  if (-not (Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Force -Path $p | Out-Null
    Write-Host "Created: $p"
  } else {
    Write-Host "Exists (preserved): $p"
  }
}
```

Record in your private log: resolved `BackupRoot`, free GB, date (UTC). **Do not** commit `config.json` or keys to Git.

Recommended minimum free space: **50 GB** (`diskSpaceMinFreeGb` in config); increase if upload volume is large.

---

## 2. Blockers before first pull (current repo state)

| Blocker                                                 | Status                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `create-pull-bundle.sh` on production VPS at `78a30a7`  | **Missing** — deploy backup tooling first (`docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md`) |
| Owner approval to run production `pg_dump` export       | **Required**                                                                         |
| Windows `config.json` + SSH keys + age recipient on VPS | **Owner setup** (`ops/windows-backup/FIRST-MANUAL-BACKUP.md`)                        |

---

## 3. Secure transfer model (encrypted only)

1. **VPS (as `hostingbeyond`):** `create-pull-bundle.sh` → `pg_dump`, pack uploads (includes `invoices-private` under `ORBIT_UPLOAD_DIR` when configured), encrypt with **age** using **public recipient** on server.
2. **Transfer:** Windows runs `Invoke-HostingBeyondBackup.ps1` — SSH **fetch** key streams **only** `~/backup-export/LATEST.bundle.tar.age` (ciphertext). No plaintext database over the wire.
3. **Storage on PC:** `Join-Path $env:USERPROFILE "HostingBeyond-Backups\backups\<timestamp>\ciphertext.bundle.tar.age"` (script finalizes under `backups\`).
4. **Decryption key:** `age` **identity** stays on PC and/or password manager — **never** in the `.age` file, Git, logs, or VPS recipient file.

Optional first run: `-RunDecryptTest` to decrypt and run `verify-backup-set.mjs` on inner bundle (still does not prove full DR until lab `pg_restore`).

---

## 4. Configure Windows pull

1. Copy from repo: `ops/windows-backup/Invoke-HostingBeyondBackup.ps1`, `HostingBeyondBackup-Lock.ps1`, `ops/backup/dr/*.mjs` (or clone repo on PC).
2. Copy `ops/windows-backup/config.example.json` → `%USERPROFILE%\HostingBeyond-Backups\config.json`.
3. Set paths using **your** resolved `$BackupRoot` (example):

```json
"backupRoot": "C:\\Users\\YOUR_USER\\HostingBeyond-Backups"
```

Use doubled backslashes in JSON. Replace `YOUR_USER` with the output of `$env:USERNAME` — do not guess.

4. Install forced SSH commands on VPS: `ops/windows-backup/SSH-KEYS-INSTALL.md`.

---

## 5. After transfer — verify before calling SUCCESS

On Windows (after manual pull or `-RunDecryptTest`):

```powershell
$set = "YYYY-MM-DD_HH-mm-ss"   # folder name under backups\
$root = Join-Path $env:USERPROFILE "HostingBeyond-Backups"
$cipher = Join-Path $root "backups\$set\ciphertext.bundle.tar.age"
Get-Item -LiteralPath $cipher | Select-Object FullName, Length, LastWriteTimeUtc
Get-FileHash -LiteralPath $cipher -Algorithm SHA256
```

Compare SHA-256 to server stderr line `HB_ARTIFACT_SHA256=...` from fetch (saved as `ciphertext.meta.stderr` in the set folder).

For **invoice/upload coverage** after decrypt test:

- Inner bundle should list `files/orbit_uploads.tar.gz` in `manifest.json`.
- Optionally list tar contents (no customer data in tickets):  
  `tar -tzf ...\orbit_uploads.tar.gz | Select-String invoices-private`

**SUCCESS criteria:** ciphertext on PC under `backups\<set>\`, hash match, `reports\verify-<set>.json` with `backupSetFinalized: true`, and (if enabled) inner `verify-backup-set.mjs` exit 0.

---

## 6. Isolated restore (not on production)

Use **`hostingbeyond_restore_test`** only: `ops/backup/dr/RESTORE-DRILL-LAB.md`. Never restore into `hostingbeyond_db` from this procedure.

---

## 7. One-shot manual pull (after approvals)

```powershell
cd (Join-Path $env:USERPROFILE "HostingBeyond-Backups")
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\Invoke-HostingBeyondBackup.ps1 `
  -ConfigPath .\config.json `
  -RunDecryptTest   # recommended first time only
```

---

## Related

- `ops/windows-backup/FIRST-MANUAL-BACKUP.md` — first cycle detail
- `ops/backup/production/BUNDLE-CONTENTS.md` — what is included/excluded
- `docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md` — ship scripts to VPS
- `docs/OWNER-DAY2-EXECUTION-CHECKLIST.md` — full ordered steps
