@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item $env:TEMP\hbank -Recurse -Force -EA SilentlyContinue; git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $env:TEMP\hbank; & (Join-Path $env:TEMP\hbank 'ops\windows-backup\Install-DesktopSourceCodeFolder.ps1'); if ($LASTEXITCODE -ne 0) { pause; exit /b $LASTEXITCODE }; pause"
