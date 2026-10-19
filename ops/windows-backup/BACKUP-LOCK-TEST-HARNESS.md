# Windows backup lock test harness (dev only)

This harness exercises the **same** lock primitives as production (`HostingBeyondBackup-Lock.ps1`) without running `Invoke-HostingBeyondBackup.ps1`, SSH, PostgreSQL, or real backup paths.

## What Linux CI proves vs Windows

| Check                                      | Where                    | Proves concurrency?                                             |
| ------------------------------------------ | ------------------------ | --------------------------------------------------------------- |
| `Invoke-HostingBeyondBackup.lock.test.mjs` | Linux / any OS with Node | **No** — static review of lock source                           |
| `Test-BackupLockHarness.ps1`               | **Windows only**         | **Yes** — two `powershell.exe` workers + killed-holder recovery |

Node static tests cannot validate `System.Threading.Mutex` or `FileMode.CreateNew` behavior on Windows. Run this harness on a Windows desktop or VM before trusting lock changes in production.

## Requirements

- Windows 10/11 or Windows Server
- **Windows PowerShell 5.1** (`powershell.exe`) — harness spawns 5.1 workers explicitly
- Repository checkout (or copy `ops/windows-backup/` scripts together):
  - `HostingBeyondBackup-Lock.ps1`
  - `Test-BackupLockHarness.ps1`
  - `Test-BackupLockHarness-Worker.ps1`

No `config.json`, credentials, or `D:\` backup layout required.

## Run

From an elevated or normal user session (no admin required):

```powershell
cd C:\path\to\Hostingbeyond\ops\windows-backup
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Test-BackupLockHarness.ps1
```

Optional: keep the temp directory for inspection:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\Test-BackupLockHarness.ps1 -KeepTemp
```

Exit code `0` = all checks passed; `1` = assertion failure; `2` = not running on Windows.

## Scenarios covered

1. **Concurrent acquisition** — two workers target the same normalized backup root; exactly one `ACQUIRED`, one `FAILED`; a third worker `ACQUIRED` after release.
2. **Normalized mutex** — differing case/trailing slash on `backupRoot` cannot bypass an active lock.
3. **Abandoned mutex** — worker killed while holding lock; next acquisition succeeds (recovery).
4. **Malformed lock file** — recent non-PID content blocks; dead PID is cleared; content older than 6 hours is cleared.

Temp data lives under `%TEMP%\HostingBeyond-LockHarness-<guid>\` and is deleted on success unless `-KeepTemp`.

## Production backup / restore drill

| Step                       | Status                       |
| -------------------------- | ---------------------------- |
| Production backup executed | **PENDING** (owner approval) |
| Isolated restore drill     | **PENDING**                  |
