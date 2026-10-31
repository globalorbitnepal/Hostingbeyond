#Requires -Version 5.1
<#
  Finish incomplete Desktop setup (known_hosts, config, schedule) without regenerating keys.
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com"
)

$ErrorActionPreference = "Stop"
$repoFromScript = $null
try {
  $repoFromScript = (Resolve-Path (Join-Path $PSScriptRoot "..\..") -ErrorAction Stop).Path
} catch {
  $repoFromScript = $null
}
if ($repoFromScript -and (Test-Path (Join-Path $repoFromScript "ops\windows-backup\Install-DailyDesktopBackup.ps1"))) {
  $t = $repoFromScript
} else {
  $t = Join-Path $env:TEMP "Hostingbeyond-install"
  if (Test-Path $t) { Remove-Item $t -Recurse -Force }
  git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $t
}
& (Join-Path $t "ops\windows-backup\Install-DailyDesktopBackup.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
& (Join-Path $t "ops\windows-backup\Audit-DesktopBackupFolder.ps1") -BackupRoot $BackupRoot
