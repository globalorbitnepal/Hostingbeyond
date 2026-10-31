#Requires -Version 5.1
<#
  Desktop layout (owner):
    Desktop\source code_hostingbeyond          = full GitHub website code (no secrets)
    Desktop\hostingbeyond_DATABASE_BACKUP      = shortcut text -> use hostingbeyond bank
    Desktop\hostingbeyond_ENV_README             = where .env lives (KeePass / server)
#>
param(
  [string]$Desktop = [Environment]::GetFolderPath("Desktop"),
  [string]$RepoUrl = "https://github.com/globalorbitnepal/Hostingbeyond.git"
)

$ErrorActionPreference = "Stop"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Install Git for Windows first: https://git-scm.com/download/win"
}

$codeDir = Join-Path $Desktop "source code_hostingbeyond"
$envReadme = Join-Path $Desktop "hostingbeyond_ENV_README"
$dbReadme = Join-Path $Desktop "hostingbeyond_DATABASE_BACKUP"

if (Test-Path -LiteralPath $codeDir) {
  Remove-Item -LiteralPath $codeDir -Recurse -Force
}
Write-Host "Cloning full website source to: $codeDir"
git clone --depth 1 --branch main $RepoUrl $codeDir

@(
  "Production .env (Google, Stripe, NameSilo, DB passwords) is NOT in this folder."
  ""
  "Where to keep it:"
  "  1) KeePassXC entry: HostingBeyond production .env"
  "  2) Live server only: /srv/apps/hostingbeyond/.env"
  ""
  "Download .env once via WinSCP from server — never WhatsApp/email."
  ""
  "Template names only (no secrets): source code_hostingbeyond\.env.example"
) | Set-Content -LiteralPath (Join-Path $envReadme "READ-ME-FIRST.txt") -Encoding UTF8

@(
  "Customer database + Orbit files are NOT inside the source code folder."
  ""
  "They are in your encrypted backup bank:"
  "  Desktop\hostingbeyond\current\ciphertext.bundle.tar.age"
  ""
  "Nightly auto-update at 11 PM Nepal when PC is on."
  "Disaster restore: Desktop\hostingbeyond\README-RECOVERY.md"
) | Set-Content -LiteralPath (Join-Path $dbReadme "READ-ME-FIRST.txt") -Encoding UTF8

Write-Host ""
Write-Host "OK: Full site CODE -> $codeDir"
Write-Host "OK: ENV instructions -> $envReadme\READ-ME-FIRST.txt"
Write-Host "OK: DATABASE info -> $dbReadme\READ-ME-FIRST.txt"
Write-Host ""
