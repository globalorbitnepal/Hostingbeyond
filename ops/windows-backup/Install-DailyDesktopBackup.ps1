#Requires -Version 5.1
<#
  One-shot Desktop daily backup setup (HostingBeyond).
  Creates Desktop\hostingbeyond, SSH keys, age recipient file, config.json, scheduled task.
  VPS still needs owner to append public keys + age recipient once (see generated VPS-OWNER-STEPS.txt).
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com",
  [string]$RepoUrl = "https://github.com/globalorbitnepal/Hostingbeyond.git"
)

$ErrorActionPreference = "Stop"
$tooling = Join-Path $BackupRoot "_tooling\Hostingbeyond"
$winBackup = Join-Path $tooling "ops\windows-backup"

function Ensure-Git {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Install Git for Windows first: https://git-scm.com/download/win"
  }
}

function Ensure-Age {
  if (-not (Get-Command age -ErrorAction SilentlyContinue)) {
    Write-Host "WARN: age not in PATH. Install from https://github.com/FiloSottile/age/releases"
    Write-Host "      Backup pull requires age before first production run."
    return $false
  }
  return $true
}

New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
@("backups", "current", "logs", "reports", "restore-tests", "keys") | ForEach-Object {
  New-Item -ItemType Directory -Force -Path (Join-Path $BackupRoot $_) | Out-Null
}

Ensure-Git
if (-not (Test-Path -LiteralPath (Join-Path $winBackup "Invoke-HostingBeyondBackup.ps1"))) {
  New-Item -ItemType Directory -Force -Path (Split-Path $tooling -Parent) | Out-Null
  if (Test-Path -LiteralPath $tooling) {
    Remove-Item -LiteralPath $tooling -Recurse -Force
  }
  git clone --depth 1 --branch main $RepoUrl $tooling
}

. (Join-Path $winBackup "Setup-DesktopBackupLayout.ps1") -BackupRoot $BackupRoot

$keys = Join-Path $BackupRoot "keys"
$createKey = Join-Path $keys "hostingbeyond-backup-create_ed25519"
$fetchKey = Join-Path $keys "hostingbeyond-backup-fetch_ed25519"
$knownHosts = Join-Path $keys "known_hosts"

if (-not (Test-Path -LiteralPath "$createKey")) {
  ssh-keygen -t ed25519 -f $createKey -N '""' -C "hostingbeyond-backup-create"
}
if (-not (Test-Path -LiteralPath "$fetchKey")) {
  ssh-keygen -t ed25519 -f $fetchKey -N '""' -C "hostingbeyond-backup-fetch"
}

if (-not (Test-Path -LiteralPath $knownHosts)) {
  $scanLines = @()
  function Add-ScanLines([string]$Scanner) {
    try {
      $raw = & $Scanner -p 22 -H $SshHost 2>&1
      foreach ($line in $raw) {
        if ($line -match "^\S+\s+ssh-") {
          $script:scanLines += [string]$line
        }
      }
    }
    catch {
      Write-Host "WARN: $Scanner failed: $($_.Exception.Message)"
    }
  }
  if (Get-Command ssh-keyscan -ErrorAction SilentlyContinue) {
    Add-ScanLines "ssh-keyscan"
  }
  if ($scanLines.Count -eq 0) {
    $gitScan = Join-Path ${env:ProgramFiles} "Git\usr\bin\ssh-keyscan.exe"
    if (Test-Path -LiteralPath $gitScan) {
      Add-ScanLines $gitScan
    }
  }
  if ($scanLines.Count -eq 0) {
    throw ('Could not build known_hosts for ' + $SshHost + ' - install Git for Windows or update OpenSSH client')
  }
  $scanLines | Out-File -FilePath $knownHosts -Encoding ascii
}

$ageIdentity = Join-Path $keys "backup-age-identity.txt"
$ageRecipient = Join-Path $keys "backup-recipient.txt"
if (Get-Command age-keygen -ErrorAction SilentlyContinue) {
  if (-not (Test-Path -LiteralPath $ageIdentity)) {
    $prevEa = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    age-keygen -o $ageIdentity 2>&1 | Out-Null
    $ErrorActionPreference = $prevEa
    if (Test-Path -LiteralPath $ageIdentity) {
      icacls $ageIdentity /inheritance:r /grant:r "${env:USERNAME}:(R,W)" 2>$null | Out-Null
    }
  }
  if (-not (Test-Path -LiteralPath $ageRecipient) -and (Test-Path -LiteralPath $ageIdentity)) {
    $pubLine = (Get-Content $ageIdentity | Where-Object { $_ -match "^age1" } | Select-Object -First 1)
    if (-not $pubLine -and (Get-Command age-keygen -ErrorAction SilentlyContinue)) {
      $prevEa = $ErrorActionPreference
      $ErrorActionPreference = "Continue"
      $pubLine = (age-keygen -y $ageIdentity 2>$null | Select-Object -First 1)
      $ErrorActionPreference = $prevEa
    }
    if ($pubLine) {
      $pubLine | Set-Content -LiteralPath $ageRecipient -Encoding ascii
    }
  }
}

$user = $env:USERNAME
$escapedRoot = $BackupRoot -replace '\\', '\\'
$configPath = Join-Path $BackupRoot "config.json"
$config = @{
  backupRoot = $BackupRoot
  ssh = @{
    host = $SshHost
    user = "hostingbeyond"
    port = 22
    createIdentityFile = $createKey
    fetchIdentityFile = $fetchKey
    knownHostsFile = $knownHosts
  }
  schedule = @{
    mode = "daily"
    timeLocal = "23:00"
    timeZoneNote = "Set Windows timezone to Kathmandu (UTC+05:45) for Nepal 11 PM"
    dayOfWeek = "Sunday"
  }
  mirror = @{
    enabled = $true
    folderName = "current"
  }
  retention = @{
    weeklyKeep = 8
    monthlyKeep = 12
  }
  encryption = @{
    enabled = $true
    required = $true
  }
  restoreTest = @{
    identityFile = $ageIdentity
    runDecryptTestOnPull = $false
  }
  testMode = @{
    syntheticOnly = $false
  }
  diskSpaceMinFreeGb = 50
}
$config | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $configPath -Encoding UTF8

$registerScript = Join-Path $winBackup "Register-ScheduledTask.ps1"
$invokeScript = Join-Path $winBackup "Invoke-HostingBeyondBackup.ps1"
Copy-Item -LiteralPath (Join-Path $winBackup "templates\README-RECOVERY.md") `
  -Destination (Join-Path $BackupRoot "README-RECOVERY.md") -Force -ErrorAction SilentlyContinue
$simpleHindi = Join-Path $tooling "docs\APKA-BACKUP-BANK-HINDI.md"
if (Test-Path -LiteralPath $simpleHindi) {
  Copy-Item -LiteralPath $simpleHindi -Destination (Join-Path $BackupRoot "APKA-BACKUP-BANK-HINDI.md") -Force
}

$vpsSteps = @"
HostingBeyond — one-time VPS steps (owner or sysadmin on 51.15.21.166)

1) As user hostingbeyond, install age PUBLIC recipient only:
   mkdir -p ~/.config/hostingbeyond-backup
   chmod 700 ~/.config/hostingbeyond-backup
   Paste contents of: $ageRecipient
   into ~/.config/hostingbeyond-backup/age-recipient.txt
   chmod 600 ~/.config/hostingbeyond-backup/age-recipient.txt

2) Append to /home/hostingbeyond/.ssh/authorized_keys:

command="/srv/apps/hostingbeyond/ops/backup/production/ssh-forced-backup.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty $(Get-Content "$createKey.pub")

command="/srv/apps/hostingbeyond/ops/backup/production/ssh-forced-fetch.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty $(Get-Content "$fetchKey.pub")

3) In /srv/apps/hostingbeyond/.env (owner):
   HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true

4) Deploy latest main on VPS (git pull) so bundle scripts exist.

5) Test from Windows:
   powershell -ExecutionPolicy Bypass -File "$invokeScript" -ConfigPath "$configPath"

Keep $ageIdentity OFF backup-only disk copies; store copy in password manager.
"@
$vpsSteps | Set-Content -LiteralPath (Join-Path $BackupRoot "VPS-OWNER-STEPS.txt") -Encoding UTF8

$vaultReminder = Join-Path $keys "PRODUCTION-ENV-VAULT-REMINDER.txt"
@(
  "Production .env secrets are NOT inside encrypted backup (by design)."
  "Keep a copy in your password manager for disaster recovery on a NEW Linux VPS."
  ""
  "Needed for 100% live behavior after restore (README-RECOVERY.md):"
  "- DATABASE_URL / Postgres credentials"
  "- NEXTAUTH_SECRET and auth-related secrets"
  "- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (Google Sign-in)"
  "- NAMESILO_API_KEY and NAMESILO_* (domain search/register API)"
  "- GOOGLE_TRANSLATE_* and service account file path (Translate API)"
  "- STRIPE_* keys and webhook secret"
  "- ORBIT_UPLOAD_DIR (must match restored upload paths)"
  ""
  "After decrypt, use metadata/env-inventory.json in the backup set for variable NAMES only."
) | Set-Content -LiteralPath $vaultReminder -Encoding ascii

$knownHosts = Join-Path $keys "known_hosts"
if (-not (Test-Path -LiteralPath $knownHosts) -or ((Get-Item $knownHosts).Length -lt 32)) {
  & (Join-Path $winBackup "Write-KnownHosts-HostingBeyond.ps1") -BackupRoot $BackupRoot -SshHost $SshHost
}

& (Join-Path $winBackup "Update-DesktopBackupTooling.ps1") -BackupRoot $BackupRoot

Write-Host ""
Write-Host "Desktop backup folder ready: $BackupRoot"
Write-Host "Scheduled: HostingBeyond-DailyBackup daily 23:00 local time."
Write-Host "Complete VPS steps in: $(Join-Path $BackupRoot 'VPS-OWNER-STEPS.txt')"
Write-Host "Set Windows timezone to Kathmandu for Nepal 11 PM."
Write-Host "Run once for 100% bank: Confirm-DesktopBank-100Percent.ps1"
