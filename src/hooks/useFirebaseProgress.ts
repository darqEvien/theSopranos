import { useEffect, useRef, useState, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';
import { getNextEpisode, getEpisode } from '../data/episodes';

// ─── Tip ──────────────────────────────────────────────────────────────────────
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

// ─── Yeni yapı ────────────────────────────────────────────────────────────────
// users/{uid}/progress/{episodeId}
// Her bölüm kendi dokümanı — tek büyük doküman yok

// ─── Eski yapıdan yeni yapıya migrasyon (bir kez çalışır) ────────────────────
async function migrateIfNeeded(uid: string): Promise<void> {
  try {
    const oldRef = doc(db, 'user_progress', uid);
    const oldSnap = await getDoc(oldRef);
    if (!oldSnap.exists()) return;

    const oldData = oldSnap.data().progress as Record<string, WatchProgress> | undefined;
    if (!oldData || Object.keys(oldData).length === 0) return;

    // Yeni subcollection'a taşı
    const progressCol = collection(db, 'users', uid, 'progress');
    const writes = Object.values(oldData).map((p) =>
      setDoc(doc(progressCol, p.episodeId), p)
    );
    await Promise.all(writes);

    // Eski dokümanı temizle (progress alanını boşalt, silme)
    await setDoc(oldRef, { progress: {}, migrated: true }, { merge: true });

    console.log(`[Progress] Migrasyon tamamlandı: ${Object.keys(oldData).length} bölüm taşındı.`);
  } catch (err) {
    console.error('[Progress] Migrasyon hatası:', err);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFirebaseProgress() {
  const { user } = useStore();
  const [allProgress, setAllProgress] = useState<Record<string, WatchProgress>>({});
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Gerçek zamanlı dinleyici ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setAllProgress({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Önce migrasyonu kontrol et, sonra dinleyiciyi başlat
    migrateIfNeeded(user.uid).then(() => {
      const progressCol = collection(db, 'users', user.uid, 'progress');

      // Gerçek zamanlı dinleyici — herhangi bir değişiklikte otomatik günceller
      const unsubscribe = onSnapshot(
        progressCol,
        (snap) => {
          const data: Record<string, WatchProgress> = {};
          snap.forEach((d) => {
            data[d.id] = d.data() as WatchProgress;
          });
          setAllProgress(data);
          setLoading(false);
        },
        (err) => {
          console.error('[Progress] Dinleyici hatası (AdBlock olabilir):', err);
          setLoading(false);
        }
      );

      return unsubscribe;
    });
  }, [user?.uid]);

  // ── İlerleme kaydet (debounced) ────────────────────────────────────────────
  const saveProgress = useCallback((
    episodeId: string,
    season: number,
    episode: number,
    currentTime: number,
    duration: number,
    forceCompleted?: boolean
  ) => {
    if (!user) return;

    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    const completed = forceCompleted || percentage >= 90;

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

    // UI'ı anında güncelle
    setAllProgress((prev) => ({ ...prev, [episodeId]: progressData }));

    // Firebase'e yazmayı debounce et — seek patlamasını önler
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const episodeRef = doc(db, 'users', user.uid, 'progress', episodeId);
        await setDoc(episodeRef, progressData);
      } catch (err) {
        console.error('[Progress] Kayıt hatası:', err);
      }
    }, 3000);
  }, [user]);

  // ── Okuma yardımcıları ─────────────────────────────────────────────────────

  // Tek bölüm ilerlemesi
  const getProgress = useCallback(
    (episodeId: string): WatchProgress | null => allProgress[episodeId] ?? null,
    [allProgress]
  );

  // En son izlenen (tamamlanmamış veya en son bittiyse bir sonraki) bölüm
  const getLastWatched = useCallback((): WatchProgress | null => {
    if (Object.keys(allProgress).length === 0) return null;

    // En son dokunulan bölümü bul
    const sorted = Object.values(allProgress).sort((a, b) => 
      new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
    );

    const latest = sorted[0];

    // Eğer son izlediği bittiyse, bir sonrakini öner
    if (latest.completed) {
      const next = getNextEpisode(latest.season, latest.episode);
      if (next) {
        return {
          episodeId: next.id,
          season: next.season,
          episode: next.episode,
          currentTime: 0,
          duration: 0,
          percentage: 0,
          lastWatched: latest.lastWatched,
          completed: false
        };
      }
    }

    return latest;
  }, [allProgress]);

  // Sezon istatistikleri
  const getSeasonProgress = useCallback((seasonNumber: number) => {
    const seasonEpisodeCounts: Record<number, number> = {
      1: 13, 2: 13, 3: 13, 4: 13, 5: 13, 6: 21,
    };
    const total = seasonEpisodeCounts[seasonNumber] ?? 13;
    const completed = Object.values(allProgress).filter(
      (p) => p.season === seasonNumber && p.completed
    ).length;

    return {
      watched: completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  }, [allProgress]);

  return {
    allProgress,
    loading,
    saveProgress,
    getProgress,
    getLastWatched,
    getSeasonProgress,
  };
}

// ─── Format helper ─────────────────────────────────────────────────────────────
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}