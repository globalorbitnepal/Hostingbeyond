#Requires -Version 5.1
<#
  One-shot: ensure known_hosts, pull encrypted backup, audit (after VPS pairing).
  Uses Desktop\_tooling\Hostingbeyond (same as nightly task).
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com"
)

$ErrorActionPreference = "Stop"
$tooling = Join-Path $BackupRoot "_tooling\Hostingbeyond"
$ops = Join-Path $tooling "ops\windows-backup"

if (-not (Test-Path -LiteralPath (Join-Path $ops "Confirm-DesktopBank-100Percent.ps1"))) {
  $repo = Join-Path $env:TEMP "hb-complete-bank"
  if (Test-Path -LiteralPath $repo) { Remove-Item -LiteralPath $repo -Recurse -Force }
  git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $repo
  & (Join-Path $repo "ops\windows-backup\Finish-DesktopBackupSetup.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
}

& (Join-Path $ops "Confirm-DesktopBank-100Percent.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
