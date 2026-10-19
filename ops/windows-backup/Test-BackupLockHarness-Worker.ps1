#Requires -Version 5.1
<#
  Dev-only worker for Test-BackupLockHarness.ps1 (one scenario per invocation).
  Does not run backups, SSH, or database access.
#>
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("TryAcquire", "HoldUntilKilled")]
  [string]$Mode,

  [Parameter(Mandatory = $true)]
  [string]$BackupRoot,

  [Parameter(Mandatory = $true)]
  [string]$LockPath,

  [Parameter(Mandatory = $true)]
  [string]$ResultPath,

  [int]$HoldSeconds = 0
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. (Join-Path $PSScriptRoot "HostingBeyondBackup-Lock.ps1")
$script:BackupMutex = $null

function Write-WorkerResult([string]$Phase, [string]$Detail = "") {
  $payload = @{
    phase  = $Phase
    detail = $Detail
    pid    = $PID
    at     = (Get-Date).ToUniversalTime().ToString("o")
  }
  $dir = Split-Path -Parent $ResultPath
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $payload | ConvertTo-Json -Compress | Set-Content -LiteralPath $ResultPath -Encoding UTF8
}

try {
  switch ($Mode) {
    "TryAcquire" {
      Acquire-BackupLock -BackupRoot $BackupRoot -LockPath $LockPath
      Write-WorkerResult -Phase "ACQUIRED"
      if ($HoldSeconds -gt 0) {
        Start-Sleep -Seconds $HoldSeconds
      }
      Release-BackupLock -LockPath $LockPath
      Write-WorkerResult -Phase "RELEASED"
      exit 0
    }
    "HoldUntilKilled" {
      Acquire-BackupLock -BackupRoot $BackupRoot -LockPath $LockPath
      Write-WorkerResult -Phase "HOLDING"
      while ($true) {
        Start-Sleep -Milliseconds 250
      }
    }
  }
}
catch {
  Write-WorkerResult -Phase "FAILED" -Detail $_.Exception.Message
  exit 1
}
