#Requires -Version 5.1
<#
  One-shot: ensure known_hosts, pull encrypted backup, audit (after VPS pairing).
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com"
)

$ErrorActionPreference = "Stop"
$keys = Join-Path $BackupRoot "keys"
$knownHosts = Join-Path $keys "known_hosts"
New-Item -ItemType Directory -Force -Path $keys | Out-Null

$scanLines = @()
try {
  $raw = ssh-keyscan -p 22 -H $SshHost 2>&1
  foreach ($line in $raw) {
    if ($line -match "^\S+\s+ssh-") { $scanLines += [string]$line }
  }
} catch {
  Write-Warning "ssh-keyscan: $($_.Exception.Message)"
}
if ($scanLines.Count -eq 0) {
  throw "Could not build known_hosts for $SshHost"
}
$scanLines | Set-Content -LiteralPath $knownHosts -Encoding ascii
Write-Host "OK: known_hosts ($($scanLines.Count) lines)"

$repo = Join-Path $env:TEMP "hb-complete-bank"
if (Test-Path -LiteralPath $repo) { Remove-Item -LiteralPath $repo -Recurse -Force }
git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $repo
$ops = Join-Path $repo "ops\windows-backup"

$config = Join-Path $BackupRoot "config.json"
if (-not (Test-Path -LiteralPath $config)) {
  & (Join-Path $ops "Finish-DesktopBackupSetup.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
}

Write-Host "Starting encrypted backup pull (may take several minutes)..."
& (Join-Path $ops "Invoke-HostingBeyondBackup.ps1") -ConfigPath $config
& (Join-Path $ops "Audit-DesktopBackupFolder.ps1") -BackupRoot $BackupRoot

$audit = Get-Content (Join-Path $BackupRoot "reports\desktop-audit.json") -Raw | ConvertFrom-Json
Write-Host ""
Write-Host "readyForDailyPull: $($audit.readyForDailyPull)"
Write-Host "readyForFullSiteRestore: $($audit.readyForFullSiteRestore)"
if (-not $audit.readyForFullSiteRestore) { exit 1 }
Write-Host "OK: Desktop bank 100% ready for DR."
exit 0
