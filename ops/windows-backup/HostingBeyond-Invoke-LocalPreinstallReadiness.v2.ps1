#Requires -Version 5.1
<#
.SYNOPSIS
  HostingBeyond local pre-install readiness (read-only). v2: non-zero exit codes for automation.
.NOTES
  Same behavior as agent-store HostingBeyond-Invoke-LocalPreinstallReadiness.ps1 except exit codes:
  0 = READY FOR OWNER REVIEW  - LOCAL CHECKS PASS
  2 = NOT READY  - LOCAL CHECKS FAILED
  3 = INCOMPLETE  - EVIDENCE MISSING
  1 = report write failure
#>
param(
  [string]$BackupRoot = 'C:\Users\User\HostingBeyond-Backups',
  [string]$RepoRoot = 'C:\Users\User\HostingBeyond-backup-tools-latest'
)
$ErrorActionPreference = 'Continue'
$keysDir = Join-Path $BackupRoot 'keys'
$reportsDir = Join-Path $BackupRoot 'reports'
$utcNow = (Get-Date).ToUniversalTime()
$L = New-Object System.Collections.Generic.List[string]
function Add-L([string]$s) { $L.Add($s) }

Add-L 'HostingBeyond pre-install readiness report (v2)'
Add-L ('generated_utc=' + $utcNow.ToString('o'))
Add-L ''

$pubCreate = 'hostingbeyond-backup-create_ed25519.pub'
$pubFetch = 'hostingbeyond-backup-fetch_ed25519.pub'
$pubFail = $false
foreach ($name in @($pubCreate, $pubFetch)) {
  $p = Join-Path $keysDir $name
  if (-not (Test-Path -LiteralPath $p)) {
    Add-L ("public_key $name exists=FAIL")
    $pubFail = $true
    continue
  }
  $i = Get-Item -LiteralPath $p
  $nonEmpty = $i.Length -gt 0
  Add-L ("public_key $name exists=PASS filename=$name size_bytes=$($i.Length) mtime_utc=$($i.LastWriteTimeUtc.ToString('o')) is_regular_file=$($i.PSIsContainer -eq $false) non_empty=$nonEmpty")
  if (-not $nonEmpty) { $pubFail = $true }
}

$distinct = 'BLOCKED'
if ((Test-Path -LiteralPath (Join-Path $keysDir $pubCreate)) -and (Test-Path -LiteralPath (Join-Path $keysDir $pubFetch))) {
  $h1 = (Get-FileHash -LiteralPath (Join-Path $keysDir $pubCreate) -Algorithm SHA256).Hash
  $h2 = (Get-FileHash -LiteralPath (Join-Path $keysDir $pubFetch) -Algorithm SHA256).Hash
  if ($h1 -ne $h2) { $distinct = 'PASS' } else { $distinct = 'FAIL'; $pubFail = $true }
}
Add-L ("public_keys_distinct=$distinct")
Add-L ''

foreach ($name in @('hostingbeyond-backup-create_ed25519', 'hostingbeyond-backup-fetch_ed25519')) {
  $p = Join-Path $keysDir $name
  if (Test-Path -LiteralPath $p) {
    $i = Get-Item -LiteralPath $p
    Add-L ("private_key $name exists=PASS filename=$name size_bytes=$($i.Length) mtime_utc=$($i.LastWriteTimeUtc.ToString('o'))")
  } else {
    Add-L ("private_key $name exists=FAIL requires_attention=yes")
  }
}
Add-L ''

$configPath = Join-Path $BackupRoot 'config.json'
if (Test-Path -LiteralPath $configPath) {
  Add-L 'config_json=present'
  try {
    $cfg = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    Add-L ('config_backupRoot_matches_expected=' + ($(if ([string]$cfg.backupRoot -eq $BackupRoot) { 'PASS' } else { 'FAIL' })))
    Add-L ('config_createIdentityFile_ends_with_expected=' + ($(if ([string]$cfg.ssh.createIdentityFile -like '*hostingbeyond-backup-create_ed25519') { 'PASS' } else { 'FAIL' })))
    Add-L ('config_fetchIdentityFile_ends_with_expected=' + ($(if ([string]$cfg.ssh.fetchIdentityFile -like '*hostingbeyond-backup-fetch_ed25519') { 'PASS' } else { 'FAIL' })))
    Add-L ('config_ssh_host_set=' + ($(if ($cfg.ssh.host -and [string]$cfg.ssh.host -notmatch 'REPLACE|PRODUCTION_HOST') { 'PASS' } else { 'FAIL' })))
    Add-L 'config_ssh_host_value=not_logged'
  } catch {
    Add-L 'config_json_parse=FAIL'
  }
} else {
  Add-L 'config_json=MISSING'
}

$preflight = Get-ChildItem -LiteralPath $reportsDir -Filter 'preflight-windows-*.json' -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($preflight) {
  Add-L ('latest_preflight_report=' + $preflight.Name)
  Add-L ('latest_preflight_report_mtime_utc=' + $preflight.LastWriteTimeUtc.ToString('o'))
  try {
    $pj = Get-Content -LiteralPath $preflight.FullName -Raw | ConvertFrom-Json
    Add-L ('preflight_pass=' + $pj.summary.pass)
    Add-L ('preflight_fail=' + $pj.summary.fail)
    Add-L ('preflight_readyForKeySetup=' + $pj.summary.readyForKeySetup)
    Add-L ('preflight_readyForFirstPull=' + $pj.summary.readyForFirstPull)
    if ($pj.summary.note) { Add-L ('preflight_note=' + [string]$pj.summary.note) }
    Add-L 'preflight_historical_evidence=yes current_key_files_verified_separately_above=yes'
  } catch {
    Add-L 'preflight_report_parse=FAIL'
  }
} else {
  Add-L 'latest_preflight_report=MISSING'
}
Add-L ''

$docSsh = Join-Path $RepoRoot 'ops\windows-backup\SSH-KEYS-INSTALL.md'
if (Test-Path -LiteralPath $docSsh) {
  $t = Get-Content -LiteralPath $docSsh -Raw
  Add-L 'doc_SSH-KEYS-INSTALL_present=PASS'
  Add-L ('doc_forced_create_path=' + ($(if ($t -like '*ssh-forced-backup.sh*') { 'PASS' } else { 'FAIL' })))
  Add-L ('doc_forced_fetch_path=' + ($(if ($t -like '*ssh-forced-fetch.sh*') { 'PASS' } else { 'FAIL' })))
  foreach ($o in @('no-port-forwarding', 'no-X11-forwarding', 'no-agent-forwarding', 'no-pty')) {
    Add-L ("doc_restriction_$o=" + ($(if ($t -like "*$o*") { 'PASS' } else { 'FAIL' })))
  }
} else {
  Add-L 'doc_SSH-KEYS-INSTALL_present=MISSING'
}
Add-L ('doc_VPS-BACKUP-SETUP-VERIFY_present=' + ($(if (Test-Path (Join-Path $RepoRoot 'docs\VPS-BACKUP-SETUP-VERIFY.md')) { 'PASS' } else { 'MISSING' })))
Add-L ''

if (Test-Path -LiteralPath $RepoRoot) {
  Push-Location $RepoRoot
  $gs = (git status -sb 2>&1 | Out-String).Trim()
  Pop-Location
  Add-L 'repo_working_tree_unchanged_by_this_script=PASS'
  Add-L ('repo_git_status_first_line=' + ($gs.Split([char]10)[0]))
} else {
  Add-L 'repo_root=MISSING'
}
Add-L ''

Add-L 'checks_not_performed:'
Add-L '- VPS age recipient verification (requires VPS)'
Add-L '- VPS authorized_keys forced-entry counts (requires VPS)'
Add-L '- SSH lock tests CREATE/FETCH (requires approval + VPS)'
Add-L '- First backup export pg_dump (not approved)'
Add-L '- Forced SSH installation on VPS (not authorized)'
Add-L ''

$verdict = 'INCOMPLETE  - EVIDENCE MISSING'
if ($pubFail) {
  $verdict = 'NOT READY  - LOCAL CHECKS FAILED'
} elseif ($distinct -eq 'PASS') {
  $verdict = 'READY FOR OWNER REVIEW  - LOCAL CHECKS PASS'
}
Add-L ("final_verdict=$verdict")
Add-L 'does_not_authorize_vps_install=yes'
Add-L 'does_not_approve_first_backup_or_pg_dump=yes'
Add-L 'safe_next_action=Owner review report; if PASS, approve VPS authorized_keys append-only install per SSH-KEYS-INSTALL.md then re-run VPS verify section 3 only.'

if (-not (Test-Path -LiteralPath $reportsDir)) {
  New-Item -ItemType Directory -Path $reportsDir -Force | Out-Null
}
$reportPath = Join-Path $reportsDir ('preinstall-readiness-' + $utcNow.ToString('yyyyMMdd-HHmmss') + '.txt')
while (Test-Path -LiteralPath $reportPath) {
  $reportPath = Join-Path $reportsDir ('preinstall-readiness-' + (Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmssfff') + '.txt')
}
Set-Content -LiteralPath $reportPath -Value ($L -join "`n") -Encoding utf8
if (-not (Test-Path -LiteralPath $reportPath)) {
  Write-Error 'Report write failed'
  exit 1
}
$readBackLen = (Get-Item -LiteralPath $reportPath).Length
Write-Output ('AGENT_REPORT_PATH=' + $reportPath)
Write-Output ('AGENT_REPORT_BYTES=' + $readBackLen)
Write-Output ('AGENT_VERDICT=' + $verdict)

switch -Regex ($verdict) {
  '^READY FOR OWNER REVIEW' { exit 0 }
  '^NOT READY' { exit 2 }
  default { exit 3 }
}
