# First manual backup cycle (Windows) — PENDING execution

Run on your **Windows desktop** after VPS scripts are deployed. **Not** runnable from Linux dev.

## 1. Create directories

```powershell
$root = "D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond"
@("backups","logs","reports","restore-tests","keys") | ForEach-Object {
  New-Item -ItemType Directory -Force -Path (Join-Path $root $_)
}
```

## 2. Install dependencies

- **OpenSSH client** (Windows 10+ optional feature)
- **Node.js** 22 LTS (for `verify-backup-set.mjs` / retention)
- **age**: `winget install FiloSottile.age` or release from GitHub

## 3. Two backup SSH keys (create + fetch)

```powershell
$create = "D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\hostingbeyond-backup-create_ed25519"
$fetch  = "D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\hostingbeyond-backup-fetch_ed25519"
ssh-keygen -t ed25519 -f $create -C "hostingbeyond-backup-create"
ssh-keygen -t ed25519 -f $fetch  -C "hostingbeyond-backup-fetch"
```

Install **public** keys per `SSH-KEYS-INSTALL.md` (owner-reviewed `authorized_keys`).  
**Do not** reuse the GitHub Actions deploy key.

## 3b. Age public recipient on VPS (not private identity)

Owner copies **only** the `age1...` public line to  
`~/.config/hostingbeyond-backup/age-recipient.txt` on the server.  
Database dumps are encrypted **on the VPS** before transfer; Windows stores **ciphertext only** (`*.bundle.tar.age`).

## 4. Pin server host key

```powershell
$kh = "D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\known_hosts"
ssh-keyscan -p 22 -H YOUR_PRODUCTION_HOST | Out-File -Encoding ascii $kh
# Visually confirm host matches your infrastructure record before saving.
```

## 5. Encryption (required for production)

```powershell
# Identity stays on Windows / password manager — NEVER on VPS
age-keygen -o D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\keys\backup-age-identity.txt
# Copy PUBLIC age1... line to VPS age-recipient.txt (see SSH-KEYS-INSTALL.md)
```

Test decrypt on a **small dummy file** before relying on production backups.  
Optional first pull: `-RunDecryptTest` after identity is configured.

## 6. Configuration

Copy from repo `ops/windows-backup/config.example.json` →  
`D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\config.json`  
Set `ssh.host`, paths, and `encryption.ageRecipientFile`.

Copy `Invoke-HostingBeyondBackup.ps1` and `..\backup\dr\*.mjs` tree (or clone repo on Windows).

## 7. First manual pull

```powershell
cd D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond
powershell -NoProfile -ExecutionPolicy Bypass -File .\Invoke-HostingBeyondBackup.ps1 -ConfigPath .\config.json
```

Expected: `backups\YYYY-MM-DD_HH-mm-ss\` with **outer ciphertext only**:

- `ciphertext.bundle.tar.age` — encrypted transfer artifact (matches VPS `*.bundle.tar.age`)
- `ciphertext.meta.stderr` — server lines `HB_ARTIFACT_SHA256=…` and `HB_BACKUP_SET_ID=…`

The pull script verifies ciphertext SHA-256 against server metadata before finalizing the set. Plaintext database dumps and inner `manifest.json` exist only briefly on the VPS during export, not on Windows unless you run a decrypt test.

## 8. Verify

**Layer 1 (always):** compare Windows `Get-FileHash` on `ciphertext.bundle.tar.age` to `HB_ARTIFACT_SHA256` in `ciphertext.meta.stderr` (see `docs/WINDOWS-PC-BACKUP.md`).

**Layer 2 (recommended first run):** re-run pull with `-RunDecryptTest` so `verify-encrypted-artifact.mjs` decrypts the outer bundle and `verify-backup-set.mjs` checks the inner tree:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Invoke-HostingBeyondBackup.ps1 `
  -ConfigPath .\config.json -RunDecryptTest
```

Or verify an extracted inner set manually:

```powershell
node D:\path\to\repo\ops\backup\dr\verify-backup-set.mjs `
  D:\path\to\extracted-inner-bundle\<timestamp>
```

See `ops/backup/dr/ARTIFACT-INTEGRITY.md` for which SHA-256 applies at each layer.

## 9. Isolated restore test (lab)

**RESTORE TEST PENDING** until you have a disposable Postgres database named e.g. `hostingbeyond_restore_test` on **localhost only**.

## 10. Schedule (only after manual SUCCESS)

```powershell
.\Register-ScheduledTask.ps1 -ConfigPath D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\config.json
```

Default: Sunday 02:00 local, start when available, ignore overlapping runs.
