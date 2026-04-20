param(
    [switch]$DeleteOriginal = $false,
    [int]$SegmentTime = 6,
    [int]$Crf = 20
)

# Mutlak yol belirleyelim
$basePath = (Get-Item -Path ".\").FullName
$ffmpegPath = Join-Path $basePath "ffmpeg.exe"

# 1. FFmpeg Kontrolü
if (-Not (Test-Path $ffmpegPath)) {
    Write-Host "FFmpeg bulunamadı! Lütfen remux scriptini çalıştırarak ffmpeg indirin veya manuel ekleyin." -ForegroundColor Red
    exit
}

$videosFolder = Join-Path $basePath "public\videos"
if (-Not (Test-Path $videosFolder)) {
    Write-Host "Klasör bulunamadı: $videosFolder" -ForegroundColor Red
    exit
}

# 2. Videoları Tara
$videoFiles = Get-ChildItem -Path $videosFolder -Include *.mkv, *.mp4 -Recurse

if ($videoFiles.Count -eq 0) {
    Write-Host "İşlenecek MKV veya MP4 dosyası bulunamadı." -ForegroundColor Cyan
    exit
}

Write-Host "Toplam $($videoFiles.Count) adet video HLS formatına (ANLIK SEEK DESTEĞİYLE) dönüştürülüyor..." -ForegroundColor Cyan
Write-Host "UYARI: Bu işlem transcode içerdiği için zaman alacaktır (CRF: $Crf, Segment Time: $SegmentTime)." -ForegroundColor Yellow

foreach ($file in $videoFiles) {
    $parentDir = $file.DirectoryName
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $outputFolder = Join-Path $parentDir $baseName
    $m3u8Path = Join-Path $outputFolder "index.m3u8"

    # Eğer klasör zaten varsa ve m3u8 mevcutsa atla
    if (Test-Path $m3u8Path) { 
        Write-Host "Atlanıyor (Zaten HLS): $baseName" -ForegroundColor Gray
        continue 
    }

    # Hedef klasörü oluştur
    if (-Not (Test-Path $outputFolder)) { New-Item -ItemType Directory -Path $outputFolder }

    Write-Host "İşleniyor: $baseName ..." -ForegroundColor Yellow

    # FFmpeg Komutu:
    # -i: Giriş dosyası
    # -c:v libx264: En uyumlu video codec
    # -crf 20: Çok yüksek kalite (18-23 arası önerilir, düşük sayı=yüksek kalite)
    # -preset fast: Kodlama hızı/kalite dengesi
    # -g 48 -keyint_min 48: Her 2 saniyede bir anahtar kare (IDR) zorlar. BU ANLIK SEEK SAĞLAR.
    # -sc_threshold 0: Sahne değişimlerinde ekstra anahtar kare atmayı kapatır (segment uyumu için)
    # -c:a aac -b:a 192k: Standart kaliteli ses
    # -f hls: HLS formatı
    # -hls_time 6: 6 saniyelik parçalar
    # -hls_playlist_type vod: Tamamlanmış video olduğunu belirtir
    
    $args = @(
        "-i", "`"$($file.FullName)`"",
        "-c:v", "libx264",
        "-crf", "$Crf",
        "-preset", "fast",
        "-g", "48",
        "-keyint_min", "48",
        "-sc_threshold", "0",
        "-c:a", "aac",
        "-b:a", "192k",
        "-f", "hls",
        "-hls_time", "$SegmentTime",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", "`"$outputFolder\seg_%03d.ts`"",
        "`"$m3u8Path`""
    )

    $process = Start-Process -FilePath $ffmpegPath -ArgumentList $args -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host " BAŞARILI: HLS oluşturuldu ($baseName/index.m3u8)" -ForegroundColor Green
        if ($DeleteOriginal) {
            Remove-Item $file.FullName -Force
            Write-Host "   Orijinal dosya silindi." -ForegroundColor DarkGray
        }
    } else {
        Write-Host " HATA: Dönüştürme başarısız: $baseName" -ForegroundColor Red
        # Hatalı klasörü temizle
        if (Test-Path $outputFolder) { Remove-Item $outputFolder -Recurse -Force }
    }
}

Write-Host "`n BÜTÜN İŞLEMLER TAMAMLANDI! Artık videolar anlık kaydırma destekli HLS formatında." -ForegroundColor Green
