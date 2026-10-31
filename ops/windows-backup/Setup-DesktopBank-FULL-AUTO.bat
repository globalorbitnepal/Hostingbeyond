@echo off
REM Double-click once — no coding. Sets Nepal time, Desktop\hostingbeyond, 11 PM daily task.
powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Normal -File "%~dp0Setup-DesktopBank-FullAuto.ps1"
if errorlevel 1 (
  echo Setup failed. Screenshot this window and send to support.
  pause
  exit /b 1
)
timeout /t 8
exit /b 0
