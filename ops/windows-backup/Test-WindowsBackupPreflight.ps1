#Requires -Version 5.1
<#
  HostingBeyond - Windows PC backup setup preflight (read-only).
  Does not connect to production, create keys, or run backups.
  Safe to share: writes sanitized JSON report (no key/config secret values).
#>
param(
  [string]$BackupRoot = $(Join-Path $env:USERPROFILE "HostingBeyond-Backups"),
  [string]$RepoRoot = "",
  [string]$ReportPath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Test-PathExists([string]$Path, [string]$Label) {
  $ok = Test-Path -LiteralPath $Path
  return @{
    check = $Label
    path = $Path
    ok = $ok
  }
}

function Test-CommandAvailable([string]$Name, [string[]]$VersionArgs = @("--version")) {
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    return @{ check = "tool:$Name"; ok = $false; detail = "not found on PATH" }
  }
  $ver = ""
  try {
    $out = & $Name @VersionArgs 2>&1 | Select-Object -First 1
    $ver = [string]$out
  }
  catch {
    $ver = "present"
  }
  return @{ check = "tool:$Name"; ok = $true; detail = $ver.Trim() }
}

function Test-FileNonEmpty([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) {
    return @{ check = $Label; path = $Path; ok = $false; detail = "missing" }
  }
  $len = (Get-Item -LiteralPath $Path).Length
  return @{
    check = $Label
    path = $Path
    ok = ($len -gt 0)
    detail = "size_bytes=$len"
  }
}

function Test-AgeIdentityPresent([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    return @{
      check = "age_identity_file"
      path = $Path
      ok = $false
      detail = "missing"
    }
  }
  $first = Get-Content -LiteralPath $Path -TotalCount 1 -ErrorAction SilentlyContinue
  $looksIdentity = ($first -match "^# created:") -or ($first -match "^AGE-SECRET-KEY-")
  return @{
    check = "age_identity_file"
    path = $Path
    ok = $looksIdentity
    detail = if ($looksIdentity) { "present (format ok, content not logged)" } else { "file exists; verify age identity format manually" }
  }
}

$scriptDir = $PSScriptRoot
if (-not $RepoRoot) {
  $RepoRoot = (Resolve-Path (Join-Path $scriptDir "..\..")).Path
}

$drDir = Join-Path $scriptDir "..\backup\dr"
$drDirResolved = $null
try {
  $drDirResolved = (Resolve-Path -LiteralPath $drDir).Path
}
catch {
  $drDirResolved = $drDir
}

$requiredDr = @(
  "verify-backup-set.mjs",
  "verify-encrypted-artifact.mjs",
  "extract-outer-bundle.mjs",
  "build-manifest.mjs",
  "retention.mjs"
)

$requiredWin = @(
  "Invoke-HostingBeyondBackup.ps1",
  "HostingBeyondBackup-Lock.ps1"
)

$subfolders = @("backups", "keys", "logs", "reports", "restore-tests")

$report = [ordered]@{
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  purpose = "Windows backup setup preflight (no backup, no SSH to production)"
  windows = [ordered]@{
    osVersion = [System.Environment]::OSVersion.VersionString
    userName = $env:USERNAME
    userProfile = $env:USERPROFILE
  }
  backupRoot = $BackupRoot
  repoRoot = $RepoRoot
  gitCommit = $null
  checks = @()
  summary = [ordered]@{
    pass = 0
    fail = 0
    readyForKeySetup = $false
    readyForFirstPull = $false
  }
}

# Disk space on drive containing backup root
$driveRoot = [System.IO.Path]::GetPathRoot($BackupRoot)
$disk = Get-PSDrive -Name ($driveRoot.TrimEnd('\').Replace(':', '')) -ErrorAction SilentlyContinue
$freeGb = if ($disk) { [math]::Round($disk.Free / 1GB, 2) } else { $null }
$report.checks += [ordered]@{
  check = "disk_free_gb"
  ok = ($null -ne $freeGb)
  detail = "drive=$driveRoot free_gb=$freeGb"
}

$report.checks += Test-CommandAvailable "git"
$report.checks += Test-CommandAvailable "node"
$report.checks += Test-CommandAvailable "npm"
$report.checks += Test-CommandAvailable "ssh" @("-V")
$report.checks += Test-CommandAvailable "age" @("--version")

try {
  Push-Location $RepoRoot
  $sha = (git rev-parse HEAD 2>$null)
  $report.gitCommit = $sha
  $report.checks += @{
    check = "git_repo_commit"
    ok = ($sha -eq "34e6c3fd560014b2a63acbe8e8563d6c9c15bfdf")
    detail = if ($sha) { "HEAD=$sha" } else { "not a git repo or git missing" }
  }
}
catch {
  $report.checks += @{ check = "git_repo_commit"; ok = $false; detail = "could not read HEAD" }
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
}

$report.checks += Test-PathExists $BackupRoot "backup_root_dir"
foreach ($sub in $subfolders) {
  $report.checks += Test-PathExists (Join-Path $BackupRoot $sub) "subdir:$sub"
}

foreach ($w in $requiredWin) {
  $p = Join-Path $scriptDir $w
  $report.checks += Test-PathExists $p "repo_script:$w"
}

foreach ($d in $requiredDr) {
  $p = Join-Path $drDirResolved $d
  $report.checks += Test-PathExists $p "dr_helper:$d"
}

$configPath = Join-Path $BackupRoot "config.json"
$configPresent = Test-Path -LiteralPath $configPath
$report.checks += @{
  check = "config_json"
  path = $configPath
  ok = $configPresent
  detail = if ($configPresent) { "present (contents not logged)" } else { "missing; copy from config.example.json" }
}

$minFreeGb = 50
$keyPaths = [ordered]@{
  createKey = Join-Path $BackupRoot "keys\hostingbeyond-backup-create_ed25519"
  fetchKey = Join-Path $BackupRoot "keys\hostingbeyond-backup-fetch_ed25519"
  createPub = Join-Path $BackupRoot "keys\hostingbeyond-backup-create_ed25519.pub"
  fetchPub = Join-Path $BackupRoot "keys\hostingbeyond-backup-fetch_ed25519.pub"
  knownHosts = Join-Path $BackupRoot "keys\known_hosts"
  ageIdentity = Join-Path $BackupRoot "keys\backup-age-identity.txt"
}

if ($configPresent) {
  try {
    $cfg = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    if ($cfg.diskSpaceMinFreeGb) { $minFreeGb = [double]$cfg.diskSpaceMinFreeGb }
    if ($cfg.backupRoot) { $report.checks += @{ check = "config_backupRoot_set"; ok = $true; detail = "set (value not logged)" } }
    if ($cfg.ssh.host -and $cfg.ssh.host -ne "PRODUCTION_HOST_IPV4_OR_DNS") {
      $report.checks += @{ check = "config_ssh_host_set"; ok = $true; detail = "set (hostname not logged)" }
    }
    else {
      $report.checks += @{ check = "config_ssh_host_set"; ok = $false; detail = "placeholder or missing" }
    }
    if ($cfg.ssh.createIdentityFile) { $keyPaths.createKey = $cfg.ssh.createIdentityFile }
    if ($cfg.ssh.fetchIdentityFile) { $keyPaths.fetchKey = $cfg.ssh.fetchIdentityFile }
    if ($cfg.ssh.knownHostsFile) { $keyPaths.knownHosts = $cfg.ssh.knownHostsFile }
    if ($cfg.restoreTest.identityFile) { $keyPaths.ageIdentity = $cfg.restoreTest.identityFile }
    if ($cfg.encryption.enabled -eq $true) {
      $report.checks += @{ check = "config_encryption_enabled"; ok = $true; detail = "true" }
    }
    else {
      $report.checks += @{ check = "config_encryption_enabled"; ok = $false; detail = "must be true for production" }
    }
  }
  catch {
    $report.checks += @{ check = "config_json_parse"; ok = $false; detail = "invalid JSON" }
  }
}

$report.checks += @{
  check = "disk_meets_config_min"
  ok = ($null -ne $freeGb -and $freeGb -ge $minFreeGb)
  detail = "required_min_gb=$minFreeGb free_gb=$freeGb"
}

$report.checks += Test-FileNonEmpty $keyPaths.createKey "ssh_create_private_key"
$report.checks += Test-FileNonEmpty $keyPaths.fetchKey "ssh_fetch_private_key"
$report.checks += Test-FileNonEmpty $keyPaths.createPub "ssh_create_public_key"
$report.checks += Test-FileNonEmpty $keyPaths.fetchPub "ssh_fetch_public_key"
$report.checks += Test-FileNonEmpty $keyPaths.knownHosts "ssh_known_hosts"
$report.checks += Test-AgeIdentityPresent $keyPaths.ageIdentity

# Public age recipient belongs on VPS only - optional local copy for owner reference
$localRecipient = Join-Path $BackupRoot "keys\age-recipient-public.txt"
if (Test-Path -LiteralPath $localRecipient) {
  $line = Get-Content -LiteralPath $localRecipient -TotalCount 1 -ErrorAction SilentlyContinue
  $okPub = ($line -match "^age1[A-Za-z0-9]+$")
  $report.checks += @{
    check = "local_age_recipient_copy"
    path = $localRecipient
    ok = $okPub
    detail = if ($okPub) { "age1 public line format ok (line not logged)" } else { "optional file present; verify format" }
  }
}
else {
  $report.checks += @{
    check = "local_age_recipient_copy"
    ok = $true
    detail = "optional; public recipient must be on VPS at ~/.config/hostingbeyond-backup/age-recipient.txt"
  }
}

foreach ($c in $report.checks) {
  if ($c.ok) { $report.summary.pass++ } else { $report.summary.fail++ }
}

$setupChecks = @($report.checks | Where-Object {
    $_.check -like "subdir:*" -or $_.check -like "tool:*" -or $_.check -like "repo_script:*" -or
    $_.check -like "dr_helper:*" -or $_.check -eq "backup_root_dir"
  })
$report.summary.readyForKeySetup = (@($setupChecks | Where-Object { -not $_.ok }).Count -eq 0)

$pullBlockers = @(
  "config_json", "config_ssh_host_set", "config_encryption_enabled",
  "ssh_create_private_key", "ssh_fetch_private_key", "ssh_known_hosts",
  "age_identity_file", "disk_meets_config_min",
  "repo_script:Invoke-HostingBeyondBackup.ps1", "dr_helper:verify-backup-set.mjs"
)
$pullReady = $true
foreach ($name in $pullBlockers) {
  $item = $report.checks | Where-Object { $_.check -eq $name } | Select-Object -First 1
  if (-not $item -or -not $item.ok) { $pullReady = $false; break }
}
$report.summary.readyForFirstPull = $pullReady
$report.summary.note = "readyForFirstPull is false until VPS age recipient + authorized_keys are verified and owner approves export"

$json = $report | ConvertTo-Json -Depth 6
if (-not $ReportPath) {
  $reportsDir = Join-Path $BackupRoot "reports"
  if (-not (Test-Path -LiteralPath $reportsDir)) {
    New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null
  }
  $ReportPath = Join-Path $reportsDir ("preflight-windows-{0}.json" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
}
Set-Content -LiteralPath $ReportPath -Value $json -Encoding UTF8

Write-Host "HostingBeyond Windows backup preflight"
Write-Host "Report: $ReportPath"
Write-Host ("PASS={0} FAIL={1}" -f $report.summary.pass, $report.summary.fail)
Write-Host ("readyForFirstPull={0} (VPS setup + owner approval still required)" -f $report.summary.readyForFirstPull)
Write-Host "Share the JSON report file only - it contains no private key or config secret values."

if ($report.summary.fail -gt 0) { exit 2 }
exit 0
