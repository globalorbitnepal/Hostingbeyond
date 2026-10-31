#Requires -Version 5.1
<#
  UTF-8 JSON without BOM  - Node dr scripts reject BOM-prefixed verify reports.
#>
function Write-JsonFileNoBom {
  param(
    [Parameter(Mandatory)]
    [string]$Path,
    [Parameter(Mandatory)]
    [object]$Object,
    [int]$Depth = 6
  )
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $json = if ($Object -is [string]) { $Object } else { $Object | ConvertTo-Json -Depth $Depth }
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($Path, $json, $utf8)
}
