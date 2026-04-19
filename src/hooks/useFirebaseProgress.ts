import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';

export interface WatchProgress {
  episodeId: string;
  season: number;
  episode: number;
  currentTime: number;
  duration: number;
  percentage: number;
  lastWatched: string;
  completed: boolean;
}

// Global olarak tüm ilerlemeleri hafızada da tutabiliriz.
// Şimdilik performansı artırmak için Zustand veya React Query de kullanabilirdik.
export function useFirebaseProgress() {
  const { user } = useStore();
  const [allProgress, setAllProgress] = useState<Record<string, WatchProgress>>({});
  const [loading, setLoading] = useState(true);

  // Kullanıcının veritabanı log'unu oku
  useEffect(() => {
    if (!user) {
      setAllProgress({});
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'user_progress', user.uid);
        const docSnap: any = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firebase bağlantı süresi doldu (AdBlock olabilir)')), 3000)
          )
        ]);
        
        if (docSnap && docSnap.exists && docSnap.exists()) {
          setAllProgress(docSnap.data().progress || {});
        } else if (docSnap && docSnap.exists === false) {
          // Eğer doküman yoksa boş oluştur (Bağlantı engellenmemişse)
          setDoc(docRef, { progress: {} }).catch(console.error);
          setAllProgress({});
        }
      } catch (err) {
        console.error("Progress fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  // İzleme durumunu Firestore'a kaydet (Debounce mantığı eklenmeli ileride)
  const saveProgress = async (
    episodeId: string,
    season: number,
    episode: number,
    currentTime: number,
    duration: number
  ) => {
    if (!user) return; // Sadece giriş yapmış kullanıcılar veritabanına yazabilir

    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const completed = percentage >= 90;

    const progressData: WatchProgress = {
      episodeId,
      season,
      episode,
      currentTime,
      duration,
      percentage,
      lastWatched: new Date().toISOString(),
      completed,
    };

    // Hafızayı anında güncelle
    setAllProgress((prev) => ({ ...prev, [episodeId]: progressData }));

    // Firebase'i güncelle (updateDoc yerine setDoc merge: true kullanıyoruz ki doküman yoksa patlamasın)
    try {
      const docRef = doc(db, 'user_progress', user.uid);
      await setDoc(docRef, {
        progress: {
          [episodeId]: progressData
        }
      }, { merge: true });
    } catch (err) {
      console.error("Progress update error:", err);
    }
  };

  const getProgress = (episodeId: string) => allProgress[episodeId] || null;

  const getLastWatched = (): WatchProgress | null => {
    const entries = Object.values(allProgress);
    if (entries.length === 0) return null;

    return entries.reduce((latest, current) => {
      return new Date(current.lastWatched) > new Date(latest.lastWatched)
        ? current
        : latest;
    });
  };

  const getSeasonProgress = (seasonNumber: number) => {
    const seasonEntries = Object.values(allProgress).filter((p) => p.season === seasonNumber);
    const completed = seasonEntries.filter((p) => p.completed).length;

    const seasonEpisodeCounts: Record<number, number> = {
      1: 13, 2: 13, 3: 13, 4: 13, 5: 13, 6: 21,
    };
    const total = seasonEpisodeCounts[seasonNumber] || 13;

    return {
      watched: completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  return {
    allProgress,
    loading,
    saveProgress,
    getProgress,
    getLastWatched,
    getSeasonProgress
  };
}

// Global format helper
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
