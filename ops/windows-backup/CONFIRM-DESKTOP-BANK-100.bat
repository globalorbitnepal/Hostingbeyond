@echo off
setlocal
set ROOT=%USERPROFILE%\Desktop\hostingbeyond
set TOOL=%ROOT%\_tooling\Hostingbeyond\ops\windows-backup
if not exist "%TOOL%\Confirm-DesktopBank-100Percent.ps1" (
  echo Cloning tooling first...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-DesktopBank-FullAuto.ps1"
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%TOOL%\Confirm-DesktopBank-100Percent.ps1"
pause
