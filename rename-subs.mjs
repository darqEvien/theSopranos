import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ts dosyalarını okuyabilmek için doğrudan JSON okuyamayacağımızdan, bölüm mantığını buraya taşıyalım.
// Veya basitçe, sadece SxxExx deseninden klasör ve dosya ismini kendimiz de üretebiliriz fakat episodes.ts içinde başlıklar var.

// Ancak orijinal isim formatımız belli: 
// `The Sopranos (1999) - S${ss}E${ee} - ${episode.title} (1080p BluRay x265 ImE).en.srt`

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, 'public', 'temp-eng-subs');
const videosDir = path.join(__dirname, 'public', 'videos');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log("📂 Lütfen İngilizce SRT dosyalarınızı 'public/temp-eng-subs' klasörü içine kopyalayın.");
console.log("Ardından komut satırında 'node rename-subs.mjs' çalıştırın.\n");

// Klasör varsa çalıştır
if (fs.existsSync(tempDir)) {
  const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.srt'));
  let matchedCount = 0;

  files.forEach(file => {
    // Örnek dosya adı: The.Sopranos.S01E03.Denial.Anger.Acceptance.1080p.HMAX.WEB-DL.DD.2.0.H.264-SLiGNOME-NHI.srt
    // Veya sadece S01E03 barındıran herhangi biri
    const match = file.match(/S(\d{2})E(\d{2})/i);
    
    if (match) {
      const season = parseInt(match[1], 10);
      const episode = parseInt(match[2], 10);
      
      const ssStr = String(season).padStart(2, '0');
      const eeStr = String(episode).padStart(2, '0');
      
      const targetSeasonDir = path.join(videosDir, `Season ${season}`);
      
      if (fs.existsSync(targetSeasonDir)) {
        // İlgili sezondaki mp4 veya srt dosyasını bul ki title'ı çekebilelim
        const seasonFiles = fs.readdirSync(targetSeasonDir);
        const refFile = seasonFiles.find(f => f.includes(`S${ssStr}E${eeStr}`));
        
        if (refFile) {
          // Örn refFile: "The Sopranos (1999) - S01E03 - Denial, Anger, Acceptance (1080p BluRay x265 ImE).mp4"
          // Uzantıyı kaldırıp .en.srt ekleyelim
          const baseName = refFile.replace(/\.(mp4|srt|vtt)$/i, '');
          const newName = `${baseName}.en.srt`;
          
          const oldPath = path.join(tempDir, file);
          const newPath = path.join(targetSeasonDir, newName);
          
          fs.copyFileSync(oldPath, newPath);
          fs.unlinkSync(oldPath);
          console.log(`✅ Kopyalandı ve Taşındı: ${file}  -->  ${newName}`);
          matchedCount++;
        } else {
          console.log(`⚠️ Hata: Bölüm bulunamadı - S${ssStr}E${eeStr} (Klasör: Season ${season})`);
        }
      } else {
        console.log(`⚠️ Hata: Sezon klasörü bulunamadı - Season ${season}`);
      }
    } else {
      console.log(`⚠️ SGeçildi: Desen (SxxExx) bulunamadı - ${file}`);
    }
  });

  if (files.length > 0) {
    console.log(`\n🎉 İşlem tamamlandı! Toplam ${matchedCount} dosya taşındı ve yeniden adlandırıldı.`);
  }
}
