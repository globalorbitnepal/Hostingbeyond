#Requires -Version 5.1
<#
  Pull encrypted HostingBeyond backup (server encrypts; Windows stores ciphertext only).
  Requires separate SSH keys: create (bundle) + fetch (stream LATEST ciphertext).
#>
param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "config.json"),
  [switch]$AllowUnencryptedTestMode,
  [switch]$RunDecryptTest
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot "HostingBeyondBackup-Lock.ps1")

function Read-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { throw "Missing config: $Path" }
  return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

function Write-Log([string]$Root, [string]$Level, [string]$Message) {
  $logDir = Join-Path $Root "logs"
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $line = "{0} [{1}] {2}" -f (Get-Date -Format "yyyy-MM-ddTHH:mm:ss"), $Level, $Message
  Add-Content -LiteralPath (Join-Path $logDir "backup.log") -Value $line
  Write-Host $line
}

function Write-BackupVerifyReport([string]$ReportPath, [hashtable]$Report) {
  $dir = Split-Path -Parent $ReportPath
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $Report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $ReportPath -Encoding UTF8
}

function Write-LastRunFail([string]$BackupRoot, [string]$ErrorMessage) {
  if (-not $BackupRoot) { return }
  try {
    $reportsDir = Join-Path $BackupRoot "reports"
    if (-not (Test-Path -LiteralPath $reportsDir)) {
      New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null
    }
    $fail = @{
      status = "FAIL"
      error = $ErrorMessage
      at = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json
    Set-Content -LiteralPath (Join-Path $reportsDir "last-run.json") -Value $fail -Encoding UTF8
  }
  catch {
    Write-Host "WARN: could not write last-run.json: $($_.Exception.Message)"
  }
}

$backupRoot = $null
$staging = $null
$lockFile = $null
$lockOwned = $false
$script:BackupMutex = $null

try {
  $config = Read-JsonFile $ConfigPath
  $backupRoot = $config.backupRoot
  if (-not $backupRoot) { throw "backupRoot required in config" }

  $lockFile = Join-Path $backupRoot "logs\backup.lock"
  Acquire-BackupLock -BackupRoot $backupRoot -LockPath $lockFile
  $lockOwned = $true

  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required (fail closed)"
  }
  if ($config.encryption.enabled -ne $true -and -not $AllowUnencryptedTestMode) {
    throw "encryption.enabled must be true for production backups"
  }

  $drive = [System.IO.Path]::GetPathRoot($backupRoot)
  $disk = Get-PSDrive -Name ($drive.TrimEnd('\').Replace(':', '')) -ErrorAction SilentlyContinue
  if ($disk -and $config.diskSpaceMinFreeGb) {
    $freeGb = $disk.Free / 1GB
    if ($freeGb -lt [double]$config.diskSpaceMinFreeGb) {
      throw "Insufficient disk space"
    }
  }

  $ts = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
  $completed = Join-Path $backupRoot ("backups\" + $ts)
  if (Test-Path -LiteralPath $completed) { throw "Completed set already exists: $ts" }

  $stagingParent = Join-Path $backupRoot "backups\_staging"
  $staging = Join-Path $stagingParent $ts
  New-Item -ItemType Directory -Force -Path $staging | Out-Null

  $ssh = $config.ssh
  if (-not $ssh.knownHostsFile) { throw "ssh.knownHostsFile required" }
  if (-not (Test-Path -LiteralPath $ssh.knownHostsFile)) {
    throw "known_hosts file missing"
  }

  $createKey = $ssh.createIdentityFile
  $fetchKey = $ssh.fetchIdentityFile
  if (-not $createKey -or -not $fetchKey) {
    throw "ssh.createIdentityFile and ssh.fetchIdentityFile required (two-key model)"
  }

  function Ssh-Opts([string]$Identity) {
    return @(
      "-i", $Identity,
      "-p", $ssh.port,
      "-o", "BatchMode=yes",
      "-o", "StrictHostKeyChecking=yes",
      "-o", "IdentitiesOnly=yes",
      "-o", ("UserKnownHostsFile=" + $ssh.knownHostsFile),
      "{0}@{1}" -f $ssh.user, $ssh.host
    )
  }

  Write-Log $backupRoot "INFO" "Remote bundle create (forced command; no client remote command)"
  $createOut = & ssh @(Ssh-Opts $createKey) 2>&1
  $artifactPath = $createOut | Select-Object -Last 1
  if (-not $artifactPath -or -not ($artifactPath -match "\.tar\.age$")) {
    throw "Remote create did not return ciphertext artifact path"
  }

  $cipherFile = Join-Path $staging ($ts + ".bundle.tar.age")
  $stderrFile = Join-Path $staging "fetch-meta.stderr"
  Write-Log $backupRoot "INFO" "Fetching ciphertext via fetch key (stdout only)"
  $fetchArgs = @(Ssh-Opts $fetchKey)
  $proc = Start-Process -FilePath "ssh" -ArgumentList $fetchArgs `
    -RedirectStandardOutput $cipherFile -RedirectStandardError $stderrFile `
    -NoNewWindow -Wait -PassThru
  if ($proc.ExitCode -ne 0) { throw "Fetch SSH failed" }

  $expectedSha = ""
  Get-Content -LiteralPath $stderrFile | ForEach-Object {
    if ($_ -match "^HB_ARTIFACT_SHA256=(.+)$") { $expectedSha = $Matches[1].Trim() }
  }

  $dr = Resolve-Path (Join-Path $PSScriptRoot "..\backup\dr")
  & node (Join-Path $dr "verify-encrypted-artifact.mjs") $cipherFile $expectedSha
  if ($LASTEXITCODE -ne 0) { throw "Ciphertext verification failed" }

  $verifyReportPath = Join-Path $backupRoot ("reports\verify-" + $ts + ".json")
  $verifyReport = @{
    status = "PASS"
    layer = "ciphertext-sha256"
    backupSetFolder = $ts
    ciphertextSha256 = $expectedSha
    ciphertextChecksumVerified = $true
    manifestVerified = $false
    innerManifestChecksumVerified = $false
    decryptTest = "skipped"
    databaseRestoreVerified = $false
    restoreDrillStatus = "PENDING"
    backupSetFinalized = $false
    note = "Ciphertext SHA-256 matches server metadata only. Does not prove database restore or full disaster recovery."
    at = (Get-Date).ToUniversalTime().ToString("o")
  }

  $extracted = Join-Path $staging "extracted"
  New-Item -ItemType Directory -Force -Path $extracted | Out-Null

  $identity = $config.restoreTest.identityFile
  if ($RunDecryptTest -or $config.restoreTest.runDecryptTestOnPull -eq $true) {
    if (-not $identity -or -not (Test-Path -LiteralPath $identity)) {
      throw "Decrypt test requested but restoreTest.identityFile missing"
    }
    $env:HB_AGE_IDENTITY_FILE = $identity
    $env:HB_DECRYPT_TEST = "1"
    & node (Join-Path $dr "verify-encrypted-artifact.mjs") $cipherFile $expectedSha
    if ($LASTEXITCODE -ne 0) { throw "Decrypt test failed" }
    & node (Join-Path $dr "extract-outer-bundle.mjs") $cipherFile $extracted
    if ($LASTEXITCODE -ne 0) { throw "Extract failed" }
    $env:HB_VERIFY_REPORT_DIR = Join-Path $backupRoot "reports"
    & node (Join-Path $dr "verify-backup-set.mjs") (Get-ChildItem $extracted -Directory | Select-Object -First 1).FullName
    if ($LASTEXITCODE -ne 0) { throw "Inner bundle verification failed" }
    $verifyReport.layer = "ciphertext-sha256;inner-bundle-checksums"
    $verifyReport.manifestVerified = $true
    $verifyReport.innerManifestChecksumVerified = $true
    $verifyReport.decryptTest = "PASS"
    $verifyReport.databaseRestoreVerified = $false
    $verifyReport.restoreDrillStatus = "PENDING"
    $verifyReport.note = "Decrypt and inner bundle checksums passed. Database pg_restore drill not run; does not prove production recovery."
    Remove-Item -LiteralPath $extracted -Recurse -Force -ErrorAction SilentlyContinue
  }

  $destCipher = Join-Path $staging "ciphertext.bundle.tar.age"
  Move-Item -LiteralPath $cipherFile -Destination $destCipher
  Copy-Item -LiteralPath $stderrFile -Destination (Join-Path $staging "ciphertext.meta.stderr")

  Move-Item -LiteralPath $staging -Destination $completed
  $staging = $null

  if (-not (Test-Path -LiteralPath $completed)) {
    throw "Backup set finalization failed: completed folder missing"
  }

  $verifyReport.backupSetFinalized = $true
  $verifyReport.backupSetFolder = $ts
  $verifyReport.at = (Get-Date).ToUniversalTime().ToString("o")
  Write-BackupVerifyReport -ReportPath $verifyReportPath -Report $verifyReport

  & node (Join-Path $dr "retention.mjs") $backupRoot --apply
  if ($LASTEXITCODE -ne 0) { throw "Retention apply failed" }

  $report = @{
    status = "SUCCESS"
    completedSet = (Split-Path $completed -Leaf)
    ciphertextOnly = $true
    decryptTestOnPull = ($RunDecryptTest -or $config.restoreTest.runDecryptTestOnPull -eq $true)
    verifyReportWritten = $true
    retentionApplied = $true
    at = (Get-Date).ToUniversalTime().ToString("o")
  } | ConvertTo-Json
  Set-Content -LiteralPath (Join-Path $backupRoot "reports\last-run.json") -Value $report

  Write-Log $backupRoot "INFO" "Backup completed (ciphertext stored): $completed"
}
catch {
  if ($backupRoot) {
    Write-Log $backupRoot "ERROR" $_.Exception.Message
  }
  else {
    Write-Host "ERROR: $($_.Exception.Message)"
  }
  if ($staging -and (Test-Path -LiteralPath $staging)) {
    Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue
  }
  Write-LastRunFail -BackupRoot $backupRoot -ErrorMessage $_.Exception.Message
  exit 1
}
finally {
  Remove-Item Env:HB_AGE_IDENTITY_FILE -ErrorAction SilentlyContinue
  Remove-Item Env:HB_DECRYPT_TEST -ErrorAction SilentlyContinue
  if ($lockOwned -and $lockFile) {
    Release-BackupLock -LockPath $lockFile
  }
}
