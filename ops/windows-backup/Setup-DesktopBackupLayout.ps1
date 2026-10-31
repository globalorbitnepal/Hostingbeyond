#Requires -Version 5.1
<#
.SYNOPSIS
  One-time layout for Desktop\hostingbeyond daily disaster-recovery folder.
.DESCRIPTION
  Creates backups, current, logs, reports, restore-tests, keys under backupRoot.
  Default backupRoot: %USERPROFILE%\Desktop\hostingbeyond
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond")
)

$ErrorActionPreference = "Stop"

@("backups", "current", "logs", "reports", "restore-tests", "keys") | ForEach-Object {
  $p = Join-Path $BackupRoot $_
  if (-not (Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Force -Path $p | Out-Null
    Write-Host "Created: $p"
  }
  else {
    Write-Host "Exists: $p"
  }
}

$readmeSrc = Join-Path $PSScriptRoot "templates\README-RECOVERY.md"
$readmeDst = Join-Path $BackupRoot "README-RECOVERY.md"
if ((Test-Path -LiteralPath $readmeSrc) -and -not (Test-Path -LiteralPath $readmeDst)) {
  Copy-Item -LiteralPath $readmeSrc -Destination $readmeDst
  Write-Host "Copied README-RECOVERY.md"
}

Write-Host ""
Write-Host "Backup root: $BackupRoot"
Write-Host "Next: copy config.example.json to config.json here, set ssh.host, install keys, then:"
Write-Host "  .\Register-ScheduledTask.ps1 -ConfigPath (Join-Path '$BackupRoot' 'config.json')"
