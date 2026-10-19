#Requires -Version 5.1
<#
.SYNOPSIS
  Register weekly HostingBeyond backup task (default Sunday 02:00 local).
.PARAMETER ConfigPath
  Path to config.json (backupRoot, schedule).
#>
param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "config.json"),
  [string]$TaskName = "HostingBeyond-WeeklyBackup"
)

$ErrorActionPreference = "Stop"
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$backupRoot = $config.backupRoot
$scriptPath = Join-Path $PSScriptRoot "Invoke-HostingBeyondBackup.ps1"
$time = if ($config.schedule.timeLocal) { $config.schedule.timeLocal } else { "02:00" }
$day = if ($config.schedule.dayOfWeek) { $config.schedule.dayOfWeek } else { "Sunday" }

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -ConfigPath `"$ConfigPath`""

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $day -At $time
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 8)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
  -Description "HostingBeyond pull backup to $backupRoot" -Force

Write-Host "Registered task $TaskName ($day $time). Run manually: Start-ScheduledTask -TaskName $TaskName"
