#Requires -Version 5.1
<#
  Clone latest main (or use existing TEMP clone), fix PS5.1 em-dash parse issues, run Confirm.
#>
param(
  [string]$CloneDir = (Join-Path $env:TEMP "hbank"),
  [string]$BackupRoot = (Join-Path $env:USERPROFILE "Desktop\hostingbeyond")
)

$ErrorActionPreference = "Stop"

function Repair-EmDashInPs1 {
  param([string]$Root)
  Get-ChildItem -LiteralPath $Root -Filter "*.ps1" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $t = [IO.File]::ReadAllText($_.FullName)
    if ($t.IndexOf([char]0x2014) -ge 0) {
      $n = $t.Replace([char]0x2014, " - ")
      [IO.File]::WriteAllText($_.FullName, $n, (New-Object System.Text.UTF8Encoding $false))
    }
  }
}

Remove-Item -LiteralPath $CloneDir -Recurse -Force -ErrorAction SilentlyContinue
git clone --depth 1 https://github.com/globalorbitnepal/Hostingbeyond.git $CloneDir
if ($LASTEXITCODE -ne 0) { throw "git clone failed exit $LASTEXITCODE" }

$wb = Join-Path $CloneDir "ops\windows-backup"
Repair-EmDashInPs1 -Root $wb

$confirm = Join-Path $wb "Confirm-DesktopBank-100Percent.ps1"
& $confirm -BackupRoot $BackupRoot
exit $LASTEXITCODE
