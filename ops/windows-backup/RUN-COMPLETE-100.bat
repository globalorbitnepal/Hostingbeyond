@echo off
setlocal
set LOG=%USERPROFILE%\Desktop\hostingbeyond\reports\confirm-last-run.log
set PS=%TEMP%\hbank-run.ps1
if not exist "%USERPROFILE%\Desktop\hostingbeyond\reports" mkdir "%USERPROFILE%\Desktop\hostingbeyond\reports"
(
  echo === HostingBeyond Confirm started %DATE% %TIME% ===
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Remove-Item $env:TEMP\hbank -Recurse -Force -EA SilentlyContinue; git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $env:TEMP\hbank; & (Join-Path $env:TEMP\hbank 'ops\windows-backup\Confirm-DesktopBank-100Percent.ps1'); exit $LASTEXITCODE"
  echo === Exit code: %ERRORLEVEL% ===
) >> "%LOG%" 2>&1
type "%LOG%"
pause
