#Requires -Version 5.1
<#
  Zero-touch Desktop "site bank" setup (HostingBeyond).
  - Nepal timezone for 11 PM daily task
  - Fresh repo install + scheduled task + audit
  - Writes simple Hindi status for owner
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com"
)

$ErrorActionPreference = "Stop"

function Set-NepalTimeZone {
  $ids = @("Nepal Standard Time", "Asia/Kathmandu")
  foreach ($id in $ids) {
    try {
      Set-TimeZone -Id $id -ErrorAction Stop
      Write-Host "OK: Windows timezone set to $id (Nepal 11 PM = 23:00 local)"
      return
    }
    catch {
      Write-Host "WARN: Could not set timezone $id : $($_.Exception.Message)"
    }
  }
  Write-Host "WARN: Set timezone manually to Kathmandu (UTC+05:45) for 11 PM Nepal."
}

Set-NepalTimeZone

$t = Join-Path $env:TEMP "hbfin-fullauto"
Remove-Item $t -Recurse -Force -ErrorAction SilentlyContinue
git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $t

& (Join-Path $t "ops\windows-backup\Finish-DesktopBackupSetup.ps1") -BackupRoot $BackupRoot -SshHost $SshHost

$keys = Join-Path $BackupRoot "keys"
$ageId = Join-Path $keys "backup-age-identity.txt"
$ageRec = Join-Path $keys "backup-recipient.txt"
if ((Test-Path $ageId) -and -not (Test-Path $ageRec) -and (Get-Command age-keygen -ErrorAction SilentlyContinue)) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  age-keygen -y $ageId 2>$null | Set-Content -LiteralPath $ageRec -Encoding ascii
  $ErrorActionPreference = $prev
}

& (Join-Path $t "ops\windows-backup\Audit-DesktopBackupFolder.ps1") -BackupRoot $BackupRoot

try {
  & (Join-Path $t "ops\windows-backup\Invoke-DesktopVpsPairing.ps1") -BackupRoot $BackupRoot
}
catch {
  Write-Host "WARN: VPS pairing via GitHub skipped: $($_.Exception.Message)"
}

$auditPath = Join-Path $BackupRoot "reports\desktop-audit.json"
$daily = "unknown"
$full = "unknown"
if (Test-Path $auditPath) {
  try {
    $a = Get-Content $auditPath -Raw | ConvertFrom-Json
    $daily = [string]$a.readyForDailyPull
    $full = [string]$a.readyForFullSiteRestore
  }
  catch { }
}

$statusPath = Join-Path $BackupRoot "APKA-STATUS-HINDI.txt"
@(
  "HostingBeyond — aapki site ki suraksha copy (Desktop bank)"
  "Folder: $BackupRoot"
  ""
  "Har raat Nepal 11 baje (23:00) — jab PC ON ho — automatic update."
  "Task name: HostingBeyond-DailyBackup"
  ""
  "Aaj ki taiyari:"
  "  Rozana backup ke liye ready: $daily"
  "  Poori site copy (encrypted) ready: $full"
  ""
  "Ye folder cPanel par upload karke site NAHI chalti."
  "Ye LIVE site ka encrypted backup hai — database + uploads + metadata."
  "Server dead / hack par naya Linux server par restore hota hai (README-RECOVERY.md)."
  ""
  "Aapko roz kuch nahi karna. PC 11 baje ke around ON rakhein."
  "Details: README-RECOVERY.md aur VPS-OWNER-STEPS.txt (server one-time)."
  ""
  "Updated: $((Get-Date).ToString('yyyy-MM-dd HH:mm'))"
) | Set-Content -LiteralPath $statusPath -Encoding UTF8

Write-Host ""
Write-Host "Full auto setup done. Status: $statusPath"
if ($full -ne "True") {
  Write-Host "NOTE: Pehli baar server par one-time pairing chahiye — phir raat ko poori encrypted copy aayegi."
}
