#Requires -Version 5.1
<#
  Audit Desktop\hostingbeyond backup folder and print JSON + human summary.
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond")
)

$ErrorActionPreference = "Continue"
$report = @{
  backupRoot = $BackupRoot
  at = (Get-Date).ToUniversalTime().ToString("o")
  checks = @{}
  missing = @()
  readyForDailyPull = $false
  readyForFullSiteRestore = $false
  nightlyAutoUpdateReady = $false
  encryptedSiteDataOnPcReady = $false
  zeroLossRecoveryPathReady = $false
  liveSiteOnNewServerWithoutRestoreSteps = $false
}

function Set-Check([string]$Name, [bool]$Ok, [string]$Detail = "") {
  $report.checks[$Name] = @{ ok = $Ok; detail = $Detail }
  if (-not $Ok) { $script:report.missing += $Name }
}

$dirs = @("backups", "current", "logs", "reports", "keys")
foreach ($d in $dirs) {
  Set-Check "dir_$d" (Test-Path -LiteralPath (Join-Path $BackupRoot $d)) $d
}

$keys = Join-Path $BackupRoot "keys"
Set-Check "key_create" (Test-Path "$keys\hostingbeyond-backup-create_ed25519") "create private"
Set-Check "key_fetch" (Test-Path "$keys\hostingbeyond-backup-fetch_ed25519") "fetch private"
Set-Check "key_create_pub" (Test-Path "$keys\hostingbeyond-backup-create_ed25519.pub") "create public"
Set-Check "key_fetch_pub" (Test-Path "$keys\hostingbeyond-backup-fetch_ed25519.pub") "fetch public"
Set-Check "known_hosts" (Test-Path "$keys\known_hosts") "known_hosts"
Set-Check "age_recipient" (Test-Path "$keys\backup-recipient.txt") "age public recipient"
Set-Check "age_identity" (Test-Path "$keys\backup-age-identity.txt") "age identity (keep in vault too)"

Set-Check "config_json" (Test-Path (Join-Path $BackupRoot "config.json")) "config.json"
Set-Check "vps_steps" (Test-Path (Join-Path $BackupRoot "VPS-OWNER-STEPS.txt")) "VPS-OWNER-STEPS.txt"
Set-Check "readme_recovery" (Test-Path (Join-Path $BackupRoot "README-RECOVERY.md")) "README-RECOVERY.md"

$currentCipher = Join-Path $BackupRoot "current\ciphertext.bundle.tar.age"
Set-Check "current_ciphertext" (Test-Path -LiteralPath $currentCipher) "daily mirror bundle"
if (Test-Path -LiteralPath $currentCipher) {
  $sz = (Get-Item -LiteralPath $currentCipher).Length
  Set-Check "current_ciphertext_size" ($sz -gt 1000000) ("bytes=$sz")
}

$toolingInvoke = Join-Path $BackupRoot "_tooling\Hostingbeyond\ops\windows-backup\Invoke-HostingBeyondBackup.ps1"
Set-Check "tooling_clone" (Test-Path -LiteralPath $toolingInvoke) "_tooling from Git main"

Set-Check "env_vault_reminder" (Test-Path (Join-Path $BackupRoot "keys\PRODUCTION-ENV-VAULT-REMINDER.txt")) "API secrets checklist"

$task = Get-ScheduledTask -TaskName "HostingBeyond-DailyBackup" -ErrorAction SilentlyContinue
Set-Check "scheduled_task" ($null -ne $task) "HostingBeyond-DailyBackup"

$lastRunPath = Join-Path $BackupRoot "reports\last-run.json"
if (Test-Path $lastRunPath) {
  try {
    $lr = Get-Content $lastRunPath -Raw | ConvertFrom-Json
    Set-Check "last_run_success" ($lr.status -eq "SUCCESS") "status=$($lr.status)"
  }
  catch {
    Set-Check "last_run_success" $false "invalid last-run.json"
  }
}
else {
  Set-Check "last_run_success" $false "no last-run.json yet"
}

if (Test-Path (Join-Path $BackupRoot "config.json")) {
  try {
    $cfg = Get-Content (Join-Path $BackupRoot "config.json") -Raw | ConvertFrom-Json
    Set-Check "config_ssh_host" ([bool]$cfg.ssh.host) $cfg.ssh.host
    Set-Check "config_mirror" ($cfg.mirror.enabled -eq $true) "mirror.current"
  }
  catch {
    Set-Check "config_json_parse" $false $_.Exception.Message
  }
}

$tz = [System.TimeZoneInfo]::Local.Id
Set-Check "timezone_nepal" ($tz -match "Nepal|Katmandu|Kathmandu") "Windows TZ=$tz (set Kathmandu for 11 PM)"

$report.readyForDailyPull = (
  $report.checks.key_create.ok -and
  $report.checks.key_fetch.ok -and
  $report.checks.config_json.ok -and
  $report.checks.scheduled_task.ok -and
  $report.checks.known_hosts.ok
)

$report.readyForFullSiteRestore = (
  $report.checks.current_ciphertext.ok -and
  $report.checks.last_run_success.ok -and
  $report.checks.age_identity.ok -and
  $report.checks.readme_recovery.ok
)

$report.nightlyAutoUpdateReady = $report.readyForDailyPull
$report.encryptedSiteDataOnPcReady = $report.readyForFullSiteRestore
$report.zeroLossRecoveryPathReady = (
  $report.encryptedSiteDataOnPcReady -and
  $report.checks.tooling_clone.ok -and
  $report.checks.env_vault_reminder.ok
)
$report.liveSiteOnNewServerWithoutRestoreSteps = $false

$outJson = Join-Path $BackupRoot "reports\desktop-audit.json"
New-Item -ItemType Directory -Force -Path (Join-Path $BackupRoot "reports") | Out-Null
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $outJson -Encoding UTF8

Write-Host ""
Write-Host "=== HostingBeyond Desktop Backup Audit ==="
Write-Host "Root: $BackupRoot"
Write-Host "Daily pull ready: $($report.readyForDailyPull)"
Write-Host "Full DR copy ready (needs successful VPS pull): $($report.readyForFullSiteRestore)"
Write-Host "Nightly 11 PM auto-update ready: $($report.nightlyAutoUpdateReady)"
Write-Host "Encrypted site DATA on PC: $($report.encryptedSiteDataOnPcReady)"
Write-Host "Zero-loss recovery PATH ready: $($report.zeroLossRecoveryPathReady)"
Write-Host "Upload folder = live site (always false): $($report.liveSiteOnNewServerWithoutRestoreSteps)"
if ($report.missing.Count -gt 0) {
  Write-Host "Missing/failed checks: $($report.missing -join ', ')"
}
Write-Host "Report: $outJson"
Write-Host ""

if (-not $report.readyForDailyPull) { exit 2 }
if (-not $report.encryptedSiteDataOnPcReady) { exit 3 }
if (-not $report.zeroLossRecoveryPathReady) { exit 4 }
exit 0
