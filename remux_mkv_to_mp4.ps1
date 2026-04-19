param(
    [switch]$DeleteOriginal = $true
)

# Mutlak yol belirleyelim (Tidal hataları önlemek için)
$basePath = (Get-Item -Path ".\").FullName
$ffmpegPath = Join-Path $basePath "ffmpeg.exe"

# 1. FFmpeg İndirme (Eğer yoksa)
if (-Not (Test-Path $ffmpegPath)) {
    Write-Host "FFmpeg bulunamadı. Sizin için otomatik olarak indiriliyor, lütfen bekleyin..." -ForegroundColor Yellow
    $url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    $zipPath = Join-Path $basePath "ffmpeg.zip"
    Invoke-WebRequest -Uri $url -OutFile $zipPath
    
    Write-Host "Çıkartılıyor..." -ForegroundColor Yellow
    $extractPath = Join-Path $basePath "ffmpeg_extracted"
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    
    # Exe dosyasını ana dizine taşı
    $exe = Get-ChildItem -Path $extractPath -Filter "ffmpeg.exe" -Recurse | Select-Object -First 1
    Move-Item -Path $exe.FullName -Destination $ffmpegPath -Force
    
    # Temizlik
    Remove-Item -Path $zipPath -Force
    Remove-Item -Path $extractPath -Recurse -Force
    Write-Host "FFmpeg başarıyla $ffmpegPath konumuna kuruldu!" -ForegroundColor Green
}

# 2. MKV Tarama ve Remux (Dönüştürme) İşlemi
$videosFolder = Join-Path $basePath "public\videos"
$mkvFiles = Get-ChildItem -Path $videosFolder -Filter *.mkv -Recurse

if ($mkvFiles.Count -eq 0) {
    Write-Host "Hiç .mkv dosyası bulunamadı." -ForegroundColor Cyan
    exit
}

Write-Host "Toplam $($mkvFiles.Count) adet MKV dosyası .mp4 formatına GÖRÜNTÜYÜ BOZMADAN aktarılıyor..." -ForegroundColor Cyan

foreach ($file in $mkvFiles) {
    $mp4File = [System.IO.Path]::ChangeExtension($file.FullName, ".mp4")
    
    if (Test-Path $mp4File) {
        Write-Host "Atlanıyor (Zaten var): $($file.Name)" -ForegroundColor Gray
        continue
    }

    Write-Host "İşleniyor: $($file.Name) ..." -ForegroundColor Yellow
    # -c copy kaliteyi bozmaz. -tag:v hvc1 Apple/iOS cihazların HEVC/x265 Siyah Ekran hatasını çözen altın komuttur!
    $args = @("-i", "`"$($file.FullName)`"", "-c", "copy", "-tag:v", "hvc1", "`"$mp4File`"")
    
    # FFmpeg'i çalıştır (Doğrudan çağrı Start-Process yerine daha güvenlidir)
    $process = Start-Process -FilePath $ffmpegPath -ArgumentList $args -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host " BAŞARILI: Yabancı uzantı mp4 yapıldı." -ForegroundColor Green
        if ($DeleteOriginal) {
            Remove-Item $file.FullName -Force
            Write-Host "   Orjinal mkv silindi." -ForegroundColor DarkGray
        }
    } else {
        Write-Host " HATA: Desteklenmeyen codec veya bozuk dosya: $($file.Name)" -ForegroundColor Red
        # Eğer varsa hatalı mp4'ü sil
        if (Test-Path $mp4File) { Remove-Item $mp4File -Force }
    }
}

Write-Host "`n BÜTÜN İŞLEMLER TAMAMLANDI! Artık videolar mobil cihazlarda izlenebilir." -ForegroundColor Green
