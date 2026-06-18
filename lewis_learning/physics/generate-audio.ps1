# Generate GCSE physics benchmark MP3s via xAI TTS API
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
$speed = if ($env:TTS_SPEED) { [double]$env:TTS_SPEED } else { 1.0 }

$files = @(
    @{ src = "1-energy.txt"; out = "01-energy.mp3" }
    @{ src = "2-electricity.txt"; out = "02-electricity.mp3" }
    @{ src = "3-particle-model.txt"; out = "03-particle-model.mp3" }
    @{ src = "4-atomic-radioactivity.txt"; out = "04-atomic-radioactivity.mp3" }
    @{ src = "5-forces-motion.txt"; out = "05-forces-motion.mp3" }
    @{ src = "6-forces-pressure.txt"; out = "06-forces-pressure.mp3" }
    @{ src = "7-waves.txt"; out = "07-waves.mp3" }
    @{ src = "8-light-sound.txt"; out = "08-light-sound.mp3" }
    @{ src = "9-magnetism.txt"; out = "09-magnetism.mp3" }
    @{ src = "10-space-mixed.txt"; out = "10-space-mixed.mp3" }
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