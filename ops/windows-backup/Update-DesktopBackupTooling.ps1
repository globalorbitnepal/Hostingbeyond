#Requires -Version 5.1
<#
  Refresh Desktop\_tooling\Hostingbeyond from GitHub main and re-register nightly task.
  Scheduled task must use this copy (not %TEMP%) so BOM/mirror fixes deploy with git pull.
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$RepoUrl = "https://github.com/globalorbitnepal/Hostingbeyond.git"
)

$ErrorActionPreference = "Stop"
$tooling = Join-Path $BackupRoot "_tooling\Hostingbeyond"
$winBackup = Join-Path $tooling "ops\windows-backup"
$configPath = Join-Path $BackupRoot "config.json"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git for Windows required"
}

New-Item -ItemType Directory -Force -Path (Split-Path $tooling -Parent) | Out-Null
if (-not (Test-Path -LiteralPath (Join-Path $winBackup "Invoke-HostingBeyondBackup.ps1"))) {
  if (Test-Path -LiteralPath $tooling) {
    Remove-Item -LiteralPath $tooling -Recurse -Force
  }
  git clone --depth 1 --branch main $RepoUrl $tooling
}
else {
  git -C $tooling fetch --depth 1 origin main 2>&1 | Out-Null
  git -C $tooling reset --hard origin/main 2>&1 | Out-Null
}

$commit = (git -C $tooling rev-parse --short HEAD 2>$null).Trim()
Write-Host "OK: tooling at $commit under $tooling"

$readmeSrc = Join-Path $winBackup "templates\README-RECOVERY.md"
if (Test-Path -LiteralPath $readmeSrc) {
  Copy-Item -LiteralPath $readmeSrc -Destination (Join-Path $BackupRoot "README-RECOVERY.md") -Force
}

$hindiSrc = Join-Path $tooling "docs\APKA-ZERO-LOSS-HINDI.md"
if (Test-Path -LiteralPath $hindiSrc) {
  Copy-Item -LiteralPath $hindiSrc -Destination (Join-Path $BackupRoot "APKA-ZERO-LOSS-HINDI.md") -Force
}

if (Test-Path -LiteralPath $configPath) {
  & (Join-Path $winBackup "Register-ScheduledTask.ps1") -ConfigPath $configPath
}
else {
  Write-Host "WARN: config.json missing — run Install-DailyDesktopBackup first"
}
