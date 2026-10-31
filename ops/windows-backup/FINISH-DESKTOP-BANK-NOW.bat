@echo off
REM Double-click: finish remaining Desktop bank setup (clone + Confirm + log).
setlocal
set "ROOT=%USERPROFILE%\Desktop\hostingbeyond"
if not exist "%ROOT%\reports" mkdir "%ROOT%\reports"
set "LOG=%ROOT%\reports\confirm-last-run.log"
echo === Started %DATE% %TIME% ===>> "%LOG%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item $env:TEMP\hbank -Recurse -Force -EA SilentlyContinue; git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $env:TEMP\hbank; & (Join-Path $env:TEMP\hbank 'ops\windows-backup\Invoke-ConfirmDesktopBank.ps1'); exit $LASTEXITCODE" >> "%LOG%" 2>&1
set EC=%ERRORLEVEL%
echo === Exit code: %EC% ===>> "%LOG%"
type "%LOG%"
if %EC%==0 (echo. & echo OK: Desktop bank ready.) else (echo. & echo FAIL: see log above.)
pause
exit /b %EC%
