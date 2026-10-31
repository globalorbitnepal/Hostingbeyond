#Requires -Version 5.1
<#
  Owner one-shot: sync tooling, known_hosts, encrypted pull, mirror, full audit + Hindi status.
  Goal: nightly 11 PM Nepal + zero-loss DATA on PC (not "upload folder = live site").
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com",
  [switch]$RunDecryptTest
)

$ErrorActionPreference = "Stop"
$configPath = Join-Path $BackupRoot "config.json"
$keys = Join-Path $BackupRoot "keys"
$vaultReminder = Join-Path $keys "PRODUCTION-ENV-VAULT-REMINDER.txt"
if (-not (Test-Path -LiteralPath $vaultReminder)) {
  New-Item -ItemType Directory -Force -Path $keys | Out-Null
  @(
    "Production .env secrets are NOT inside encrypted backup (by design)."
    "Keep a copy in your password manager for disaster recovery on a NEW Linux VPS."
    ""
    "Needed for live site after restore: DATABASE_URL, NEXTAUTH, GOOGLE OAuth, NAMESILO_*, GOOGLE_TRANSLATE_*, STRIPE_*, ORBIT_UPLOAD_DIR."
    "See metadata/env-inventory.json in backup for variable names."
  ) | Set-Content -LiteralPath $vaultReminder -Encoding ascii
}

if (-not (Test-Path -LiteralPath $configPath)) {
  $fin = Join-Path $env:TEMP "hb-confirm-fin"
  Remove-Item $fin -Recurse -Force -ErrorAction SilentlyContinue
  git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $fin
  & (Join-Path $fin "ops\windows-backup\Finish-DesktopBackupSetup.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
}

$tooling = Join-Path $BackupRoot "_tooling\Hostingbeyond"
if (-not (Test-Path -LiteralPath (Join-Path $tooling "ops\windows-backup\Update-DesktopBackupTooling.ps1"))) {
  $seed = Join-Path $env:TEMP "hb-confirm-seed"
  Remove-Item $seed -Recurse -Force -ErrorAction SilentlyContinue
  git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $seed
  New-Item -ItemType Directory -Force -Path (Split-Path $tooling -Parent) | Out-Null
  Copy-Item -LiteralPath $seed -Destination $tooling -Recurse -Force
}

$ops = Join-Path $tooling "ops\windows-backup"
& (Join-Path $ops "Update-DesktopBackupTooling.ps1") -BackupRoot $BackupRoot

& (Join-Path $ops "Write-KnownHosts-HostingBeyond.ps1") -BackupRoot $BackupRoot -SshHost $SshHost

if (Test-Path (Join-Path $BackupRoot "VPS-OWNER-STEPS.txt")) {
  try {
    & (Join-Path $ops "Invoke-DesktopVpsPairing.ps1") -BackupRoot $BackupRoot
  }
  catch {
    Write-Host "WARN: VPS pairing dispatch skipped: $($_.Exception.Message)"
  }
}

Write-Host "Pulling encrypted site bank from VPS (several minutes)..."
$pullArgs = @{ ConfigPath = $configPath }
if ($RunDecryptTest) { $pullArgs.RunDecryptTest = $true }
& (Join-Path $ops "Invoke-HostingBeyondBackup.ps1") @pullArgs

& (Join-Path $ops "Audit-DesktopBackupFolder.ps1") -BackupRoot $BackupRoot
$auditPath = Join-Path $BackupRoot "reports\desktop-audit.json"
$a = Get-Content $auditPath -Raw | ConvertFrom-Json

Write-Host ""
Write-Host "=== Aapka goal (seedha) ==="
Write-Host "Roz 11 PM auto update ready: $($a.nightlyAutoUpdateReady)"
Write-Host "Encrypted site DATA on PC (DB+Orbit backup): $($a.encryptedSiteDataOnPcReady)"
Write-Host "Zero-loss recovery PATH ready (runbook+keys+data): $($a.zeroLossRecoveryPathReady)"
Write-Host "Folder upload = live site (always false): $($a.liveSiteOnNewServerWithoutRestoreSteps)"
Write-Host ""

@(
  "HostingBeyond Desktop bank — status"
  "Updated: $((Get-Date).ToString('yyyy-MM-dd HH:mm'))"
  ""
  "Roz 11 PM Nepal (PC ON): $($a.nightlyAutoUpdateReady)"
  "Encrypted poori site DATA copy: $($a.encryptedSiteDataOnPcReady)"
  "Naye server restore path ready: $($a.zeroLossRecoveryPathReady)"
  ""
  "Google Sign / NameSilo / Translate: production .env se (password manager) — backup mein values nahi."
  "Live site: naya Linux VPS + Git code + README-RECOVERY.md — folder seedha upload NAHI."
  ""
  "Padhein: APKA-ZERO-LOSS-HINDI.md"
) | Set-Content -LiteralPath (Join-Path $BackupRoot "APKA-STATUS-HINDI.txt") -Encoding ascii

if (-not $a.nightlyAutoUpdateReady -or -not $a.encryptedSiteDataOnPcReady) {
  Write-Host "FAIL: Bank abhi 100% nightly + data copy ke liye ready nahi. Missing: $($a.missing -join ', ')"
  exit 1
}

Write-Host "OK: Desktop bank ready for nightly auto-update + zero-loss DATA on PC."
Write-Host "NOTE: APIs (Google/NameSilo/Translate) naye server par .env se — README-RECOVERY.md follow karein."
exit 0
