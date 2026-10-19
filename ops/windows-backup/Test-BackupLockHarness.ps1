#Requires -Version 5.1
<#
  Dev-only Windows harness for backup mutex + CreateNew lock file behavior.
  See BACKUP-LOCK-TEST-HARNESS.md. Does not invoke Invoke-HostingBeyondBackup.ps1.
#>
param(
  [switch]$KeepTemp
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ($env:OS -ne "Windows_NT") {
  Write-Error "This harness must run on Windows (Windows PowerShell 5.1 or PowerShell 7+)."
  exit 2
}

. (Join-Path $PSScriptRoot "HostingBeyondBackup-Lock.ps1")

$script:Failures = @()
$script:TestRoot = $null
$script:BackupMutex = $null

function Assert-True([bool]$Condition, [string]$Message) {
  if (-not $Condition) {
    $script:Failures += $Message
    Write-Host "FAIL: $Message"
  }
  else {
    Write-Host "PASS: $Message"
  }
}

function New-HarnessLayout {
  $root = Join-Path $env:TEMP ("HostingBeyond-LockHarness-{0}" -f [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path (Join-Path $root "logs") | Out-Null
  return @{
    Root     = $root
    LockPath = Join-Path $root "logs\backup.lock"
  }
}

function Start-LockWorker {
  param(
    [string]$Mode,
    [string]$BackupRoot,
    [string]$LockPath,
    [string]$ResultPath,
    [int]$HoldSeconds = 0
  )
  $worker = Join-Path $PSScriptRoot "Test-BackupLockHarness-Worker.ps1"
  $argList = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $worker,
    "-Mode", $Mode,
    "-BackupRoot", $BackupRoot,
    "-LockPath", $LockPath,
    "-ResultPath", $ResultPath
  )
  if ($HoldSeconds -gt 0) {
    $argList += @("-HoldSeconds", [string]$HoldSeconds)
  }
  return Start-Process -FilePath "powershell.exe" -ArgumentList $argList -PassThru -WindowStyle Hidden
}

function Wait-WorkerResult {
  param(
    [System.Diagnostics.Process]$Process,
    [string]$ResultPath,
    [string]$ExpectedPhase,
    [int]$TimeoutSeconds = 60
  )
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-Path -LiteralPath $ResultPath) {
      $json = Get-Content -LiteralPath $ResultPath -Raw | ConvertFrom-Json
      if ($json.phase -eq $ExpectedPhase) {
        return $json
      }
    }
    if ($Process.HasExited -and -not (Test-Path -LiteralPath $ResultPath)) {
      break
    }
    Start-Sleep -Milliseconds 100
  }
  return $null
}

function Test-ConcurrentAcquisition {
  param($Layout)
  Write-Host "`n== Concurrent mutex (two processes) =="
  $resultA = Join-Path $Layout.Root "worker-a.json"
  $resultB = Join-Path $Layout.Root "worker-b.json"
  if (Test-Path -LiteralPath $resultA) { Remove-Item -LiteralPath $resultA -Force }
  if (Test-Path -LiteralPath $resultB) { Remove-Item -LiteralPath $resultB -Force }

  $procA = Start-LockWorker -Mode "TryAcquire" -BackupRoot $Layout.Root -LockPath $Layout.LockPath -ResultPath $resultA -HoldSeconds 4
  $procB = Start-LockWorker -Mode "TryAcquire" -BackupRoot $Layout.Root -LockPath $Layout.LockPath -ResultPath $resultB -HoldSeconds 0
  Start-Sleep -Milliseconds 150

  $jsonA = Wait-WorkerResult -Process $procA -ResultPath $resultA -ExpectedPhase "ACQUIRED" -TimeoutSeconds 30
  $jsonB = Wait-WorkerResult -Process $procB -ResultPath $resultB -ExpectedPhase "FAILED" -TimeoutSeconds 30

  $null = Wait-WorkerResult -Process $procA -ResultPath $resultA -ExpectedPhase "RELEASED" -TimeoutSeconds 30
  if (-not $procB.HasExited) {
    $procB | Wait-Process -Timeout 30 -ErrorAction SilentlyContinue
  }
  if (-not $procA.HasExited) {
    $procA | Wait-Process -Timeout 30 -ErrorAction SilentlyContinue
  }

  $acquired = @()
  if ($jsonA -and $jsonA.phase -eq "ACQUIRED") { $acquired += "A" }
  if ($jsonB -and $jsonB.phase -eq "ACQUIRED") { $acquired += "B" }
  $failed = @()
  if ($jsonB -and $jsonB.phase -eq "FAILED") { $failed += "B" }
  if ($jsonA -and $jsonA.phase -eq "FAILED") { $failed += "A" }

  Assert-True ($acquired.Count -eq 1) "exactly one concurrent worker acquires the lock (got: $($acquired -join ','))"
  Assert-True ($failed.Count -eq 1) "exactly one concurrent worker fails to acquire (got phases A=$($jsonA.phase) B=$($jsonB.phase))"

  $resultC = Join-Path $Layout.Root "worker-c.json"
  $procC = Start-LockWorker -Mode "TryAcquire" -BackupRoot $Layout.Root -LockPath $Layout.LockPath -ResultPath $resultC -HoldSeconds 0
  $jsonC = Wait-WorkerResult -Process $procC -ResultPath $resultC -ExpectedPhase "ACQUIRED" -TimeoutSeconds 30
  if (-not $procC.HasExited) {
    $procC | Wait-Process -Timeout 30 -ErrorAction SilentlyContinue
  }
  Assert-True ($null -ne $jsonC) "worker can acquire lock after the first holder releases"
}

function Test-NormalizedMutexContention {
  param($Layout)
  Write-Host "`n== Normalized backup root (case/path) =="
  $altRoot = ($Layout.Root.TrimEnd('\') + "\")
  $resultAlt = Join-Path $Layout.Root "worker-alt.json"
  $procHold = Start-LockWorker -Mode "HoldUntilKilled" -BackupRoot $Layout.Root -LockPath $Layout.LockPath -ResultPath (Join-Path $Layout.Root "worker-hold.json")
  $holding = Wait-WorkerResult -Process $procHold -ResultPath (Join-Path $Layout.Root "worker-hold.json") -ExpectedPhase "HOLDING" -TimeoutSeconds 30
  Assert-True ($null -ne $holding) "holder process acquired lock on canonical root"

  $procAlt = Start-LockWorker -Mode "TryAcquire" -BackupRoot $altRoot.ToUpperInvariant() -LockPath $Layout.LockPath -ResultPath $resultAlt
  $jsonAlt = Wait-WorkerResult -Process $procAlt -ResultPath $resultAlt -ExpectedPhase "FAILED" -TimeoutSeconds 30
  if (-not $procAlt.HasExited) {
    $procAlt | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
  }

  Assert-True ($null -ne $jsonAlt) "second root variant cannot acquire while lock is held (normalized mutex)"
  if (-not $procHold.HasExited) {
    Stop-Process -Id $procHold.Id -Force -ErrorAction SilentlyContinue
    $procHold | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
  }
  if (Test-Path -LiteralPath $Layout.LockPath) {
    Remove-Item -LiteralPath $Layout.LockPath -Force -ErrorAction SilentlyContinue
  }
}

function Test-AbandonedMutexRecovery {
  param($Layout)
  Write-Host "`n== Abandoned mutex (killed holder) =="
  $holdResult = Join-Path $Layout.Root "worker-abandon.json"
  $proc = Start-LockWorker -Mode "HoldUntilKilled" -BackupRoot $Layout.Root -LockPath $Layout.LockPath -ResultPath $holdResult
  $holding = Wait-WorkerResult -Process $proc -ResultPath $holdResult -ExpectedPhase "HOLDING" -TimeoutSeconds 30
  Assert-True ($null -ne $holding) "holder acquired lock before forced termination"
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  $proc | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 500

  $script:BackupMutex = $null
  try {
    Acquire-BackupLock -BackupRoot $Layout.Root -LockPath $Layout.LockPath
    Assert-True $true "new process acquires lock after abandoned mutex (killed holder)"
    Release-BackupLock -LockPath $Layout.LockPath
  }
  catch {
    Assert-True $false "new process acquires lock after abandoned mutex (killed holder): $($_.Exception.Message)"
  }
}

function Test-StaleAndMalformedLocks {
  param($Layout)
  Write-Host "`n== Stale / malformed lock file (no live backup) =="

  $script:BackupMutex = $null
  Set-Content -LiteralPath $Layout.LockPath -Value "not-a-pid" -Encoding ASCII -NoNewline
  try {
    Acquire-BackupLock -BackupRoot $Layout.Root -LockPath $Layout.LockPath
    Assert-True $false "fresh malformed lock file should block acquisition"
    Release-BackupLock -LockPath $Layout.LockPath
  }
  catch {
    Assert-True ($_.Exception.Message -match "malformed lock file") "fresh malformed lock rejects with expected message"
  }

  $deadPid = 2147483646
  while (Test-BackupLockProcessAlive -OwnerPid $deadPid) {
    $deadPid--
  }
  Set-Content -LiteralPath $Layout.LockPath -Value ([string]$deadPid) -Encoding ASCII -NoNewline
  try {
    Acquire-BackupLock -BackupRoot $Layout.Root -LockPath $Layout.LockPath
    Assert-True $true "dead owner PID lock file is removed and lock acquired"
    Release-BackupLock -LockPath $Layout.LockPath
  }
  catch {
    Assert-True $false "dead owner PID lock file is removed and lock acquired: $($_.Exception.Message)"
  }

  Set-Content -LiteralPath $Layout.LockPath -Value "still-not-a-pid" -Encoding ASCII -NoNewline
  $item = Get-Item -LiteralPath $Layout.LockPath
  $item.LastWriteTime = (Get-Date).AddHours(-7)
  try {
    Acquire-BackupLock -BackupRoot $Layout.Root -LockPath $Layout.LockPath
    Assert-True $true "stale malformed lock file (>6h) is removed and lock acquired"
    Release-BackupLock -LockPath $Layout.LockPath
  }
  catch {
    Assert-True $false "stale malformed lock file (>6h) is removed and lock acquired: $($_.Exception.Message)"
  }
}

try {
  $layout = New-HarnessLayout
  $script:TestRoot = $layout.Root
  Write-Host "Harness temp root: $($layout.Root)"

  Test-ConcurrentAcquisition -Layout $layout
  Test-NormalizedMutexContention -Layout $layout
  Test-AbandonedMutexRecovery -Layout $layout
  Test-StaleAndMalformedLocks -Layout $layout
}
finally {
  if ($script:TestRoot -and -not $KeepTemp) {
    try {
      Remove-Item -LiteralPath $script:TestRoot -Recurse -Force -ErrorAction Stop
      Write-Host "`nCleaned harness temp: $($script:TestRoot)"
    }
    catch {
      Write-Host "WARN: could not remove harness temp $($script:TestRoot): $($_.Exception.Message)"
    }
  }
}

if ($script:Failures.Count -gt 0) {
  Write-Host "`nHarness finished with $($script:Failures.Count) failure(s)."
  exit 1
}

Write-Host "`nAll backup lock harness checks passed."
exit 0
