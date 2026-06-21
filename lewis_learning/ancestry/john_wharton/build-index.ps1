# Inject john_wharton quiz data into index.html and embed scripts.
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$dataPath = Join-Path $here "quiz-data.js"
$indexPath = Join-Path $here "index.html"
$data = Get-Content $dataPath -Raw -Encoding UTF8
$html = Get-Content $indexPath -Raw -Encoding UTF8

$correctMatch = [regex]::Match($html, '(?m)^\s*const CORRECT = \{')
$start = if ($correctMatch.Success) { $correctMatch.Index } else { -1 }
$end = $html.IndexOf("    const list = document.getElementById")
if ($start -lt 0 -or $end -lt 0) { throw "Could not find injection points in index.html" }

$html = $html.Substring(0, $start) + $data.Trim() + "`n`n" + $html.Substring($end)
Set-Content $indexPath $html -Encoding UTF8 -NoNewline
& (Join-Path $here "embed-scripts.ps1")
Write-Host "John Wharton index.html built."