#Requires -Version 5.1
<#
  HostingBeyond backup lock primitives (mutex + exclusive lock file).
  Dot-sourced by Invoke-HostingBeyondBackup.ps1 and dev-only Test-BackupLockHarness.ps1.
#>

function Get-LockOwnerPid([string]$LockPath) {
  try {
    $raw = (Get-Content -LiteralPath $LockPath -Raw).Trim()
    $parsed = 0
    if ([int]::TryParse($raw, [ref]$parsed)) {
      return $parsed
    }
  }
  catch {
    return $null
  }
  return $null
}

function Test-BackupLockProcessAlive([int]$OwnerPid) {
  if ($OwnerPid -le 0) { return $false }
  return $null -ne (Get-Process -Id $OwnerPid -ErrorAction SilentlyContinue)
}

function Get-BackupMutexName([string]$BackupRoot) {
  $normalized = $BackupRoot.Trim().ToLowerInvariant()
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($normalized)
    $hash = $sha.ComputeHash($bytes)
    $hex = [System.BitConverter]::ToString($hash).Replace("-", "")
    return "Local\HostingBeyondBackup-{0}" -f $hex.Substring(0, 32)
  }
  finally {
    $sha.Dispose()
  }
}

function Remove-StaleLockFileIfSafe([string]$LockPath) {
  if (-not (Test-Path -LiteralPath $LockPath)) { return }
  $ownerPid = Get-LockOwnerPid -LockPath $LockPath
  if ($null -ne $ownerPid -and (Test-BackupLockProcessAlive -OwnerPid $ownerPid)) {
    throw "Another backup may be running (lock file references live process $ownerPid)"
  }
  if ($null -eq $ownerPid) {
    $age = (Get-Date) - (Get-Item -LiteralPath $LockPath).LastWriteTime
    if ($age.TotalHours -lt 6) {
      throw "Another backup may be running (malformed lock file)"
    }
  }
  Remove-Item -LiteralPath $LockPath -Force
}

function Write-LockFileExclusive([string]$LockPath) {
  $logDir = Split-Path -Parent $LockPath
  if (-not (Test-Path -LiteralPath $logDir)) {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  }
  $payload = [System.Text.Encoding]::ASCII.GetBytes([string]$PID)
  try {
    $fs = [System.IO.File]::Open(
      $LockPath,
      [System.IO.FileMode]::CreateNew,
      [System.IO.FileAccess]::Write,
      [System.IO.FileShare]::None
    )
    $fs.Write($payload, 0, $payload.Length)
    $fs.Flush()
    $fs.Close()
  }
  catch [System.IO.IOException] {
    throw "Another backup may be running (exclusive lock file creation failed)"
  }
}

function Acquire-BackupLock([string]$BackupRoot, [string]$LockPath) {
  $mutexName = Get-BackupMutexName -BackupRoot $BackupRoot
  $mutex = New-Object System.Threading.Mutex($false, $mutexName)
  if (-not $mutex.WaitOne(0)) {
    $mutex.Dispose()
    if (Test-Path -LiteralPath $LockPath) {
      $ownerPid = Get-LockOwnerPid -LockPath $LockPath
      if ($null -ne $ownerPid -and (Test-BackupLockProcessAlive -OwnerPid $ownerPid)) {
        throw "Another backup may be running (lock held by process $ownerPid)"
      }
    }
    throw "Another backup may be running (backup mutex unavailable)"
  }
  try {
    Remove-StaleLockFileIfSafe -LockPath $LockPath
    Write-LockFileExclusive -LockPath $LockPath
  }
  catch {
    try { $mutex.ReleaseMutex() } catch { }
    $mutex.Dispose()
    throw
  }
  $script:BackupMutex = $mutex
}

function Release-BackupLock([string]$LockPath) {
  if ($LockPath -and (Test-Path -LiteralPath $LockPath)) {
    try {
      $owner = (Get-Content -LiteralPath $LockPath -Raw).Trim()
      if ($owner -eq [string]$PID) {
        Remove-Item -LiteralPath $LockPath -Force
      }
    }
    catch {
      Write-Host "WARN: could not release backup lock file: $($_.Exception.Message)"
    }
  }
  if ($script:BackupMutex) {
    try { $script:BackupMutex.ReleaseMutex() } catch { }
    try { $script:BackupMutex.Dispose() } catch { }
    $script:BackupMutex = $null
  }
}
