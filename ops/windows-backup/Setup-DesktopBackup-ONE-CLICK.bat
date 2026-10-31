@echo off
setlocal
echo HostingBeyond daily backup setup...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$t=Join-Path $env:TEMP 'Hostingbeyond-install';" ^
  "if (Test-Path $t) { Remove-Item $t -Recurse -Force };" ^
  "git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $t;" ^
  "& (Join-Path $t 'ops\windows-backup\Install-DailyDesktopBackup.ps1');" ^
  "Write-Host ''; Write-Host 'Done. Open Desktop\hostingbeyond and read VPS-OWNER-STEPS.txt for server (one time).';" ^
  "pause"
endlocal
