#Requires -Version 5.1
<#
  One Desktop folder with everything grouped (owner pack):
    Desktop\source code_hostingbeyond\
      website-code\                 = full GitHub site (design, Orbit UI code, APIs code)
      _database_orbit_ENCRYPTED\    = copy from Desktop\hostingbeyond (DB + Orbit inside .age)
      _env_passwords\               = .env.example + optional SCP from server + KeePass note
      APKA-FULL-FOLDER-HINDI.txt    = what is where
#>
param(
  [string]$Desktop = [Environment]::GetFolderPath("Desktop"),
  [string]$RepoUrl = "https://github.com/globalorbitnepal/Hostingbeyond.git",
  [string]$SshHost = "hosting.theglobalorbit.com",
  [string]$SshUser = "hostingbeyond"
)

$ErrorActionPreference = "Stop"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Install Git for Windows first: https://git-scm.com/download/win"
}

$root = Join-Path $Desktop "source code_hostingbeyond"
$bank = Join-Path $Desktop "hostingbeyond"

if (Test-Path -LiteralPath $root) {
  Remove-Item -LiteralPath $root -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $root | Out-Null

Write-Host "1/4 Cloning full website from GitHub..."
$web = Join-Path $root "website-code"
git clone --depth 1 --branch main $RepoUrl $web

Write-Host "2/4 Copying encrypted database + Orbit backup from Desktop\hostingbeyond..."
$enc = Join-Path $root "_database_orbit_ENCRYPTED"
New-Item -ItemType Directory -Force -Path $enc | Out-Null
$cipher = Join-Path $bank "current\ciphertext.bundle.tar.age"
if (Test-Path -LiteralPath $cipher) {
  Copy-Item -LiteralPath $cipher -Destination $enc -Force
  Get-ChildItem -LiteralPath (Join-Path $bank "current") -File -ErrorAction SilentlyContinue |
    Copy-Item -Destination $enc -Force -ErrorAction SilentlyContinue
}
else {
  Write-Host "WARN: No ciphertext yet — run Desktop bank Confirm first."
}
$lr = Join-Path $bank "reports\last-run.json"
if (Test-Path -LiteralPath $lr) {
  Copy-Item -LiteralPath $lr -Destination $enc -Force
}
$latestBackup = Get-ChildItem -LiteralPath (Join-Path $bank "backups") -Directory -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending | Select-Object -First 1
if ($latestBackup) {
  $destSnap = Join-Path $enc ("backup_snapshot_" + $latestBackup.Name)
  New-Item -ItemType Directory -Force -Path $destSnap | Out-Null
  Copy-Item -LiteralPath (Join-Path $latestBackup.FullName "*") -Destination $destSnap -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "3/4 ENV folder (.env example + try server copy)..."
$envDir = Join-Path $root "_env_passwords"
New-Item -ItemType Directory -Force -Path $envDir | Out-Null
$example = Join-Path $web ".env.example"
if (Test-Path -LiteralPath $example) {
  Copy-Item -LiteralPath $example -Destination (Join-Path $envDir ".env.example") -Force
}
$prodEnv = Join-Path $envDir "production.env.from-server.txt"
$gotEnv = $false
if (Get-Command scp -ErrorAction SilentlyContinue) {
  $remote = "${SshUser}@${SshHost}:/srv/apps/hostingbeyond/.env"
  Write-Host "    Trying SCP (needs your SSH key or password)..."
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & scp -o BatchMode=no -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new $remote $prodEnv 2>$null
  $ErrorActionPreference = $prev
  if ((Test-Path -LiteralPath $prodEnv) -and ((Get-Item $prodEnv).Length -gt 50)) {
    $gotEnv = $true
    Write-Host "    OK: production .env copied into _env_passwords\"
  }
  else {
    Remove-Item -LiteralPath $prodEnv -Force -ErrorAction SilentlyContinue
  }
}
if (-not $gotEnv) {
  @(
    "production.env.from-server.txt yahan tab aayegi jab:"
    ""
    "  WinSCP se server se download karo:"
    "    Remote: /srv/apps/hostingbeyond/.env"
    "    Save as: isi folder mein production.env.from-server.txt"
    ""
    "  Ya KeePassXC mein rakho — is folder mein plain file mat chhodo agar PC shared hai."
    ""
    "Server: $SshUser@$SshHost"
  ) | Set-Content -LiteralPath $prodEnv -Encoding UTF8
}

Write-Host "4/4 Hindi guide..."
@(
  "HostingBeyond — ek folder mein sab (simple)"
  ""
  "website-code\"
  "  Poori site ki coding: design, pages, /orbit UI, payment code (GitHub jaisa live)."
  ""
  "_database_orbit_ENCRYPTED\"
  "  Customers + database + Orbit photos/videos — ENCRYPTED box (.age)."
  "  Khulne ke liye: Desktop\hostingbeyond\keys\ (age identity) + README-RECOVERY."
  "  Ye plain photos nahi — restore par server par nikalte hain."
  ""
  "_env_passwords\"
  "  Google, Stripe, NameSilo, DB password — production.env.from-server.txt"
  "  + .env.example (sirf naam, secrets nahi)."
  "  Best: KeePassXC mein bhi copy rakho; is PC par kisi ko mat dikhao."
  ""
  "Roz auto update: Desktop\hostingbeyond (11 PM) — is pack ko dubara chalao script se refresh."
  ""
  "Script dubara:"
  "  ops\windows-backup\Install-DesktopSourceCodeFolder.ps1 (repo se)"
) | Set-Content -LiteralPath (Join-Path $root "APKA-FULL-FOLDER-HINDI.txt") -Encoding UTF8

Write-Host ""
Write-Host "OK: Full pack -> $root"
Write-Host "     website-code\ = GitHub full site"
Write-Host "     _database_orbit_ENCRYPTED\ = DB + Orbit (encrypted copy from bank)"
Write-Host "     _env_passwords\ = .env (server copy if SCP worked, else READ inside)"
Write-Host ""
