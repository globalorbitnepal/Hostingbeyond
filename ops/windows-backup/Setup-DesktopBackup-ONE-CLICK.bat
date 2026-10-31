@echo off
setlocal
echo HostingBeyond site bank — full auto setup...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-DesktopBank-FullAuto.ps1"
if errorlevel 1 pause
endlocal
