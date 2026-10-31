#Requires -Version 5.1
<#
  Finish incomplete Desktop setup (known_hosts, config, schedule) without regenerating keys.
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com"
)

$ErrorActionPreference = "Stop"
$t = Join-Path $env:TEMP "Hostingbeyond-install"
if (-not (Test-Path (Join-Path $t "ops\windows-backup\Install-DailyDesktopBackup.ps1"))) {
  if (Test-Path $t) { Remove-Item $t -Recurse -Force }
  git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $t
}
& (Join-Path $t "ops\windows-backup\Install-DailyDesktopBackup.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
& (Join-Path $t "ops\windows-backup\Audit-DesktopBackupFolder.ps1") -BackupRoot $BackupRoot
