# Upload Brain OS MP3s to a GitHub Release (separate repo — keeps Pages repo small).
#
# Prereqs:
#   1. Install GitHub CLI: https://cli.github.com/
#   2. Run: gh auth login
#   3. Create an empty GitHub repo, e.g. brain-os-audio
#
# Usage:
#   pwsh -File publish-audio-release.ps1
#   pwsh -File publish-audio-release.ps1 -Repo YOUR_USER/brain-os-audio -Tag v1

param(
  [string]$Repo = "michaelthomsoncc/daily-news-site",

  [string]$Tag = "lewis-learning-audio-v1",

  [string]$AudioDir = (Join-Path $PSScriptRoot "audio")
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI (gh) is not installed. Get it from https://cli.github.com/"
}

$files = Get-ChildItem $AudioDir -Filter "*.mp3" | Sort-Object Name
if (-not $files.Count) {
  throw "No MP3 files found in $AudioDir"
}

Write-Host "Uploading $($files.Count) files ($([math]::Round(($files | Measure-Object Length -Sum).Sum / 1MB, 1)) MB) to $Repo release $Tag..."

$existing = gh release view $Tag --repo $Repo 2>$null
if ($LASTEXITCODE -ne 0) {
  gh release create $Tag --repo $Repo --title "Brain OS audio $Tag" --notes "Audio files for the Brain OS learning walk."
} else {
  Write-Host "Release $Tag already exists — uploading assets to it."
}

foreach ($file in $files) {
  Write-Host "  $($file.Name)"
  gh release upload $Tag $file.FullName --repo $Repo --clobber
}

$base = "https://github.com/$Repo/releases/download/$Tag"
Write-Host ""
Write-Host "Done. Paste this into index.html as AUDIO_BASE_URL:"
Write-Host $base