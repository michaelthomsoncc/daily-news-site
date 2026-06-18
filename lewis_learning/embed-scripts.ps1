# Re-embed episode .txt scripts into index.html (run after editing script files).
# Usage: pwsh -File embed-scripts.ps1

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$indexPath = Join-Path $here "index.html"
$map = [ordered]@{
  intro = "0-intro.txt"
  ep1   = "1.txt"
  ep2   = "2.txt"
  ep3   = "3.txt"
  ep4   = "4.txt"
  ep5   = "5.txt"
  ep6   = "6.txt"
  ep7   = "7.txt"
  ep8   = "8.txt"
  ep9   = "9.txt"
  ep10  = "10.txt"
}

$lines = @("    const SCRIPTS = {")
foreach ($kv in $map.GetEnumerator()) {
  $text = Get-Content (Join-Path $here $kv.Value) -Raw -Encoding UTF8
  $json = ($text | ConvertTo-Json -Compress)
  $lines += "      `"$($kv.Key)`": $json,"
}
$lines += "    };"
$embed = $lines -join "`n"

$html = Get-Content $indexPath -Raw -Encoding UTF8
$start = $html.IndexOf("    const SCRIPTS = {")
$end = $html.IndexOf("    const CORRECT = {")

if ($start -ge 0 -and $end -gt $start) {
  $html = $html.Substring(0, $start) + $embed + "`n`n" + $html.Substring($end)
} else {
  $marker = 'const LOCKED_KEY = "brain-os-quiz-locked";'
  $html = $html.Replace($marker, $marker + "`n`n" + $embed)
}

Set-Content $indexPath $html -Encoding UTF8 -NoNewline
Write-Host "Embedded scripts into $indexPath"