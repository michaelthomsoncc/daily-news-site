# Generate John Wharton ancestry MP3s via xAI TTS API
# Requires: $env:XAI_API_KEY from https://console.x.ai
# Usage: pwsh -File generate-audio.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$outDir = Join-Path $root "audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

if (-not $env:XAI_API_KEY) {
    Write-Error "XAI_API_KEY is not set. Get a key from https://console.x.ai and run: `$env:XAI_API_KEY = 'xai-...'"
}

$voice = if ($env:TTS_VOICE) { $env:TTS_VOICE } else { "leo" }
$speed = if ($env:TTS_SPEED) { [double]$env:TTS_SPEED } else { 0.95 }

$files = @(
    @{ src = "1.txt"; out = "01-dukes-and-shepherd.mp3" }
    @{ src = "2.txt"; out = "02-george-miner.mp3" }
    @{ src = "3.txt"; out = "03-last-pitmen.mp3" }
)

foreach ($item in $files) {
    $srcPath = Join-Path $root $item.src
    if (-not (Test-Path $srcPath)) {
        Write-Warning "Skipping missing $($item.src)"
        continue
    }

    $text = Get-Content $srcPath -Raw
    $chars = $text.Length
    if ($chars -gt 15000) {
        Write-Error "$($item.src) is $chars chars (max 15000 per request). Split the file first."
    }

    Write-Host "Generating $($item.out) ($chars chars, voice=$voice, speed=$speed)..."

    $body = @{
        text = $text
        voice_id = $voice
        language = "en"
        speed = $speed
        output_format = @{
            codec = "mp3"
            sample_rate = 44100
            bit_rate = 192000
        }
    } | ConvertTo-Json -Depth 4

    $outPath = Join-Path $outDir $item.out
    $headers = @{
        Authorization = "Bearer $env:XAI_API_KEY"
        "Content-Type" = "application/json"
    }

    try {
        Invoke-RestMethod -Uri "https://api.x.ai/v1/tts" -Method Post -Headers $headers -Body $body -OutFile $outPath
        $size = (Get-Item $outPath).Length
        Write-Host "  Saved $outPath ($([math]::Round($size/1MB, 2)) MB)"
    } catch {
        Write-Error "Failed on $($item.src): $($_.Exception.Message)"
    }
}

Write-Host "Done. Files in $outDir"