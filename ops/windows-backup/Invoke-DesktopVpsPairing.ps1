#Requires -Version 5.1
<#
  One-time: trigger GitHub Action to pair VPS for this Desktop's SSH/age keys.
  Requires GitHub CLI (gh) logged in as repo admin, OR writes manual instructions.
#>
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$Repo = "globalorbitnepal/Hostingbeyond"
)

$ErrorActionPreference = "Stop"
$steps = Join-Path $BackupRoot "VPS-OWNER-STEPS.txt"
if (-not (Test-Path -LiteralPath $steps)) {
  Write-Host "SKIP pairing: missing VPS-OWNER-STEPS.txt (run Install first)"
  exit 0
}

function Strip-ForcedPrefix([string]$Line) {
  if ($Line -match '^command=') {
    return ($Line -replace '^command="[^"]*",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ', '')
  }
  return $Line
}

$create = $null
$fetch = $null
Get-Content -LiteralPath $steps | ForEach-Object {
  if ($_ -match 'hostingbeyond-backup-create') { $script:create = Strip-ForcedPrefix $_ }
  if ($_ -match 'hostingbeyond-backup-fetch') { $script:fetch = Strip-ForcedPrefix $_ }
}
$ageRec = Join-Path $BackupRoot "keys\backup-recipient.txt"
$age = $null
if (Test-Path -LiteralPath $ageRec) {
  $age = (Get-Content -LiteralPath $ageRec | Where-Object { $_ -match '^age1' } | Select-Object -First 1)
}

if (-not $create -or -not $fetch) {
  Write-Host "SKIP pairing: could not parse SSH public keys from VPS-OWNER-STEPS.txt"
  exit 0
}

$reports = Join-Path $BackupRoot "reports"
New-Item -ItemType Directory -Force -Path $reports | Out-Null
$manual = Join-Path $reports "VPS-PAIR-GITHUB-ACTION.txt"
@(
  "If automatic gh failed, run GitHub Action manually:"
  "Repo: $Repo"
  "Workflow: Pair desktop backup (VPS one-time)"
  ""
  "create_pub:"
  $create
  ""
  "fetch_pub:"
  $fetch
  ""
  "age_recipient:"
  $(if ($age) { $age } else { "(generate backup-recipient.txt first)" })
) | Set-Content -LiteralPath $manual -Encoding UTF8

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "gh CLI not installed — wrote $manual"
  Write-Host "NEXT: On any machine with gh auth login, run:"
  Write-Host "  gh workflow run pair-desktop-backup-vps.yml --repo $Repo -f enable_export=true -f create_pub=<line> -f fetch_pub=<line>"
  exit 2
}

$token = $null
try { $token = (gh auth token 2>$null).Trim() } catch { }
if (-not $token) {
  Write-Host "gh not logged in — run: gh auth login"
  Write-Host "Pairing values saved in: $manual"
  exit 2
}

try {
  $wfArgs = @(
    "workflow", "run", "pair-desktop-backup-vps.yml",
    "--repo", $Repo,
    "-f", "enable_export=true",
    "-f", "create_pub=$create",
    "-f", "fetch_pub=$fetch"
  )
  if ($age) { $wfArgs += @("-f", "age_recipient=$age") }
  & gh @wfArgs 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -ne 0) { throw "gh workflow run exit $LASTEXITCODE" }
  Write-Host "OK: GitHub Action pair-desktop-backup-vps dispatched."
}
catch {
  Write-Host "GitHub pair dispatch failed: $($_.Exception.Message)"
  Write-Host "See $manual"
  exit 1
}
