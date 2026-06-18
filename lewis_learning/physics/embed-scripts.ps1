# Re-embed episode .txt scripts into physics/index.html
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$indexPath = Join-Path $here "index.html"
$map = [ordered]@{
  ep1  = "1-energy.txt"
  ep2  = "2-electricity.txt"
  ep3  = "3-particle-model.txt"
  ep4  = "4-atomic-radioactivity.txt"
  ep5  = "5-forces-motion.txt"
  ep6  = "6-forces-pressure.txt"
  ep7  = "7-waves.txt"
  ep8  = "8-light-sound.txt"
  ep9  = "9-magnetism.txt"
  ep10 = "10-space-mixed.txt"
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
$correctMatch = [regex]::Match($html, '(?m)^\s*const CORRECT = \{')
$end = if ($correctMatch.Success) { $correctMatch.Index } else { -1 }

if ($start -ge 0 -and $end -gt $start) {
  $html = $html.Substring(0, $start) + $embed + "`n`n" + $html.Substring($end)
} else {
  throw "Could not find SCRIPTS block in index.html (start=$start end=$end)"
}

Set-Content $indexPath $html -Encoding UTF8 -NoNewline
Write-Host "Embedded scripts into $indexPath"