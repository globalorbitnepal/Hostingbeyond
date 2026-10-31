#Requires -Version 5.1
param(
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond"),
  [string]$SshHost = "hosting.theglobalorbit.com",
  [int]$Port = 22
)

$ErrorActionPreference = "Stop"
$keysDir = Join-Path $BackupRoot "keys"
New-Item -ItemType Directory -Force -Path $keysDir | Out-Null
$knownHosts = Join-Path $keysDir "known_hosts"

function Get-ScanLines([string]$Scanner) {
  $scanLines = @()
  $raw = & $Scanner -p $Port -H $SshHost 2>&1
  foreach ($line in $raw) {
    if ($line -match "^\S+\s+ssh-") { $scanLines += [string]$line }
  }
  return $scanLines
}

$scanLines = @()
if (Get-Command ssh-keyscan -ErrorAction SilentlyContinue) {
  $scanLines = Get-ScanLines "ssh-keyscan"
}
if ($scanLines.Count -eq 0) {
  $gitScan = "${env:ProgramFiles}\Git\usr\bin\ssh-keyscan.exe"
  if (Test-Path -LiteralPath $gitScan) {
    $scanLines = Get-ScanLines $gitScan
  }
}
if ($scanLines.Count -eq 0) {
  throw "ssh-keyscan returned 0 keys (update Git for Windows or OpenSSH client)"
}

$scanLines | Set-Content -LiteralPath $knownHosts -Encoding ascii
Write-Host "OK: $knownHosts ($($scanLines.Count) lines)"
