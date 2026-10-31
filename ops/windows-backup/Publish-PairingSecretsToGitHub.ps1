#Requires -Version 5.1
<#
  Upload Desktop public pairing material to GitHub Actions secrets (repo admin + gh auth).
  Public keys only — safe for GitHub Secrets storage.
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$Repo = "globalorbitnepal/Hostingbeyond"
)

$ErrorActionPreference = "Stop"
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "Install GitHub CLI (gh) and run: gh auth login"
  exit 1
}

function Strip-ForcedPrefix([string]$Line) {
  if ($Line -match '^command=') {
    return ($Line -replace '^command="[^"]*",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ', '')
  }
  return $Line
}

$steps = Join-Path $BackupRoot "VPS-OWNER-STEPS.txt"
if (-not (Test-Path -LiteralPath $steps)) {
  throw "Missing $steps — run Install-DailyDesktopBackup.ps1 first"
}

$create = $null
$fetch = $null
Get-Content -LiteralPath $steps | ForEach-Object {
  if ($_ -match 'hostingbeyond-backup-create') { $script:create = Strip-ForcedPrefix $_ }
  if ($_ -match 'hostingbeyond-backup-fetch') { $script:fetch = Strip-ForcedPrefix $_ }
}
if (-not $create -or -not $fetch) { throw "Could not parse SSH public keys from VPS-OWNER-STEPS.txt" }

$age = $null
$ageRec = Join-Path $BackupRoot "keys\backup-recipient.txt"
if (Test-Path -LiteralPath $ageRec) {
  $age = (Get-Content -LiteralPath $ageRec | Where-Object { $_ -match '^age1' } | Select-Object -First 1)
}

gh secret set DESKTOP_BACKUP_SSH_CREATE_PUB --repo $Repo --body $create
gh secret set DESKTOP_BACKUP_SSH_FETCH_PUB --repo $Repo --body $fetch
if ($age) {
  gh secret set DESKTOP_BACKUP_AGE_RECIPIENT --repo $Repo --body $age
}

Write-Host "OK: GitHub secrets updated. Starting VPS pair workflow..."
gh workflow run pair-desktop-backup-vps.yml --repo $Repo -f enable_export=true
Write-Host "OK: pair-desktop-backup-vps workflow dispatched."
