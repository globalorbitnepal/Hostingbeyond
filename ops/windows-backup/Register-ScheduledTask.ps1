#Requires -Version 5.1
<#
.SYNOPSIS
  Register daily or weekly HostingBeyond backup task.
.PARAMETER ConfigPath
  Path to config.json (backupRoot, schedule).
#>
param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "config.json"),
  [string]$TaskName = "HostingBeyond-DailyBackup"
)

$ErrorActionPreference = "Stop"
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$backupRoot = $config.backupRoot
$scriptPath = Join-Path $PSScriptRoot "Invoke-HostingBeyondBackup.ps1"
$time = if ($config.schedule.timeLocal) { $config.schedule.timeLocal } else { "23:00" }
$mode = if ($config.schedule.mode) { $config.schedule.mode.ToLowerInvariant() } else { "daily" }
$day = if ($config.schedule.dayOfWeek) { $config.schedule.dayOfWeek } else { "Sunday" }

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -ConfigPath `"$ConfigPath`""

if ($mode -eq "weekly") {
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $day -At $time
  $scheduleLabel = "$day $time (weekly)"
}
else {
  $trigger = New-ScheduledTaskTrigger -Daily -At $time
  $scheduleLabel = "daily $time (set Windows timezone to Nepal for 11 PM local)"
}

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 8)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
  -Description "HostingBeyond pull backup to $backupRoot" -Force

Write-Host "Registered task $TaskName ($scheduleLabel)."
Write-Host "Backup root: $backupRoot"
Write-Host "Run manually: Start-ScheduledTask -TaskName $TaskName"
