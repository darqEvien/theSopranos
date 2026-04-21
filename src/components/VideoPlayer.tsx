import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plyr } from 'plyr-react';
import 'plyr-react/plyr.css';

import { type Episode, getVideoUrl, getSubtitleUrl, getNextEpisode } from '../data/episodes';
import { useStore } from '../store/useStore';
import { srtToVttBlob } from '../lib/srtParser';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { introTimings } from '../data/introTimings';
import { outroTimings } from '../data/outroTimings';

interface ExtendedScreenOrientation extends ScreenOrientation {
  lock(orientation: string): Promise<void>;
  unlock(): void;
}

interface VideoPlayerProps {
  episode: Episode;
  mini?: boolean;
}

const timeToSeconds = (timeStr: string | number): number => {
  if (!timeStr || timeStr === "00:00") return 0;
  if (typeof timeStr === 'number') return timeStr;
  const parts = timeStr.toString().split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

export default function VideoPlayer({ episode, mini = false }: VideoPlayerProps) {
  const plyrRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate();

  const { user, subtitleLanguage, setSubtitleLanguage } = useStore();
  const { saveProgress, getProgress, saveSubtitleLanguage, loading: firebaseLoading } = useFirebaseProgress();

  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [playerReady, setPlayerReady] = useState(false);
  const [isAutoSkipCancelled, setIsAutoSkipCancelled] = useState(false);

  const [vttTracks, setVttTracks] = useState<{ src: string; lang: string; label: string }[]>([]);
  const [subsLoaded, setSubsLoaded] = useState(false);

  const seekAppliedRef = useRef(false);
  const skippedIntroRef = useRef(false);
  const nextEpisodeTriggeredRef = useRef(false);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextEpisode = getNextEpisode(episode.season, episode.episode);

  // ── Episode değiştiğinde seek sıfırla ────────────────────────────────────
  useEffect(() => {
    seekAppliedRef.current = false;
  }, [episode.id]);

  // ── Seek — Firebase data geldiğinde uygula ────────────────────────────────
  // getProgress, allProgress'e bağlı useCallback — Firebase güncellenince yeniden tetiklenir
  // VideoPlayer.tsx içindeki Seek Efekti
  useEffect(() => {
    // Eğer zaten seek yapıldıysa veya player hazır değilse çık
    if (seekAppliedRef.current || !playerReady) return;

    const savedProgress = getProgress(episode.id);
    // Firebase verisi henüz gelmediyse bekle (allProgress güncellenince tekrar çalışır)
    if (!savedProgress) return;

    const video = videoRef.current;
    if (!video) return;

    const doSeek = () => {
      // 10 saniyeden azsa veya tamamlandıysa seek yapma
      if (savedProgress.completed || savedProgress.currentTime <= 10) {
        seekAppliedRef.current = true;
        return;
      }

      video.currentTime = savedProgress.currentTime;
      seekAppliedRef.current = true;
      console.log("[Player] İlerleme uygulandı:", savedProgress.currentTime);
    };

    // Plyr hazır olsa bile video elementinin metadata'sı bazen geç gelebilir
    if (video.readyState >= 1) {
      doSeek();
    } else {
      video.addEventListener('loadedmetadata', doSeek, { once: true });
    }
  }, [getProgress, episode.id, playerReady]); // <--- playerReady ekledik!

  // ── Progress kaydet ───────────────────────────────────────────────────────
  const handleSaveProgress = useCallback((forceCompleted = false) => {
    const video = videoRef.current;
    if (!video || !user) return;
    const currentTime = video.currentTime;
    const duration = video.duration;
    if (currentTime > 5 && duration > 0) {
      saveProgress(episode.id, episode.season, episode.episode, currentTime, duration, forceCompleted);
    }
  }, [episode, user, saveProgress]);

  const goToNextEpisode = useCallback(() => {
    if (nextEpisode) navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`);
  }, [nextEpisode, navigate]);

  // ── Subtitle Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    const loadSubtitles = async () => {
      setSubsLoaded(false);
      const tracks: { src: string; lang: string; label: string }[] = [];
      const langs: ('tr' | 'en')[] = ['tr', 'en'];
      for (const lang of langs) {
        try {
          const url = getSubtitleUrl(episode, lang);
          const res = await fetch(url);
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          const srtText = new TextDecoder(lang === 'tr' ? 'windows-1254' : 'utf-8').decode(buf);
          tracks.push({ src: srtToVttBlob(srtText), lang, label: lang === 'tr' ? 'Türkçe' : 'English' });
        } catch (err) { console.warn(err); }
      }
      setVttTracks(tracks);
      setSubsLoaded(true);
    };
    loadSubtitles();
  }, [episode]);

  // ── Player configurations ──────────────────────────────────────────────────
  const plyrOptions = useMemo(() => ({
    controls: [
      'play-large', 'play', 'progress',
      'current-time', 'duration', 'mute', 'volume', 'settings', 'pip', 'fullscreen',
    ],
    settings: ['captions'],
    keyboard: { focused: true, global: true },
    tooltips: { controls: true, seek: true },
    captions: {
      active: subtitleLanguage !== 'off',
      update: true,
      language: subtitleLanguage === 'off' ? 'tr' : subtitleLanguage,
    },
    invertTime: false,
    speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
  }), [subtitleLanguage]);

  // subtitleLanguage kasıtlı olarak dışarıda — dil değişince Plyr remount etmesin
  const plyrSource = useMemo(() => ({
    type: 'video',
    sources: [{ src: getVideoUrl(episode), type: 'video/mp4' }],
    tracks: vttTracks.map(track => ({
      kind: 'captions',
      label: track.label,
      srclang: track.lang,
      src: track.src,
      default: track.lang === (subtitleLanguage === 'off' ? 'tr' : subtitleLanguage),
    })),
  }), [episode, vttTracks]);

  // ── Plyr ready — ref üzerinden dinle (onReady prop çalışmıyor) ────────────
  useEffect(() => {
    const player = plyrRef.current?.plyr;
    if (!player) return;

    const onReady = () => {
      videoRef.current = player.media as HTMLVideoElement;
      setPlayerReady(true);

      // Store'daki dil tercihini track'lere uygula
      const video = player.media as HTMLVideoElement;
      const applyLang = () => {
        Array.from(video.textTracks).forEach((track: TextTrack) => {
          track.mode = subtitleLanguage !== 'off' && track.language === subtitleLanguage
            ? 'showing'
            : 'disabled';
        });
      };

      if (video.textTracks.length > 0) {
        applyLang();
      } else {
        video.textTracks.addEventListener('addtrack', applyLang, { once: true });
      }

      player.play().catch(() => { });

      // Dil değiştiğinde store + Firebase'e kaydet
      const attachLangListener = () => {
        video.textTracks.addEventListener('change', () => {
          const active = Array.from(video.textTracks).find((t: TextTrack) => t.mode === 'showing');
          const lang = (active ? active.language : 'off') as 'tr' | 'en' | 'off';
          setSubtitleLanguage(lang);
          saveSubtitleLanguage(lang);
        });
      };

      if (video.textTracks.length > 0) {
        attachLangListener();
      } else {
        video.textTracks.addEventListener('addtrack', attachLangListener, { once: true });
      }
    };

    player.on('ready', onReady);
    if (player.ready) onReady(); // zaten hazırsa direkt çağır

    return () => {
      player.off('ready', onReady);
    };
  }, [plyrSource, subtitleLanguage, setSubtitleLanguage, saveSubtitleLanguage]);

  // ── Timeupdate & Ended ────────────────────────────────────────────────────
  useEffect(() => {
    const player = plyrRef.current?.plyr;
    if (!player) return;

    const handleTimeupdate = () => {
      const video = videoRef.current;
      if (!video) return;

      const currentTime = video.currentTime;
      const duration = video.duration ?? 0;

      const epKey = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;

      // Intro skip
      const timingObj = introTimings[epKey];
      const introStart = timingObj?.start !== "00:00" ? timeToSeconds(timingObj?.start ?? 0) : episode.introStart;
      const introEnd = timingObj?.end !== "00:00" ? timeToSeconds(timingObj?.end ?? 0) : episode.introEnd;

      if (introStart >= 0 && introEnd > 0 && currentTime >= introStart && currentTime < introEnd) {
        if (!skippedIntroRef.current) setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
        if (currentTime < introStart || currentTime > introEnd) skippedIntroRef.current = false;
      }

      // Next episode
      const outroTimingObj = outroTimings[epKey];
      const outroStart = outroTimingObj?.start !== "00:00"
        ? timeToSeconds(outroTimingObj?.start ?? 0)
        : (duration > 0 ? duration - 60 : 0);

      if (duration > 0 && currentTime >= outroStart && nextEpisode && !isAutoSkipCancelled) {
        if (!nextEpisodeTriggeredRef.current) {
          nextEpisodeTriggeredRef.current = true;
          setShowNextEpisode(true);
          setCountdown(5);
          handleSaveProgress(true);
        }
      } else if (currentTime < outroStart && nextEpisodeTriggeredRef.current) {
        nextEpisodeTriggeredRef.current = false;
        setShowNextEpisode(false);
      }
    };

    const handleEnded = () => {
      handleSaveProgress(true);
      if (nextEpisode) goToNextEpisode();
    };

    player.on('timeupdate', handleTimeupdate);
    player.on('ended', handleEnded);

    return () => {
      player.off('timeupdate', handleTimeupdate);
      player.off('ended', handleEnded);
    };
  }, [episode, nextEpisode, isAutoSkipCancelled, handleSaveProgress, goToNextEpisode, playerReady]);

  // ── Orientation lock ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (document.fullscreenElement && window.innerWidth < 768) {
        try {
          await (window.screen.orientation as ExtendedScreenOrientation)?.lock?.('landscape');
        } catch (err) { console.warn('Orientation lock failed:', err); }
      } else {
        try { (window.screen.orientation as ExtendedScreenOrientation)?.unlock?.(); } catch { /* ignore */ }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ── Periodic progress saving ───────────────────────────────────────────────
  useEffect(() => {
    saveIntervalRef.current = setInterval(() => handleSaveProgress(), 15000);
    const handleBeforeUnload = () => handleSaveProgress();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      handleSaveProgress();
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleSaveProgress]);

  // ── Auto-skip countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (!showNextEpisode) return;
    if (countdown === 0) { goToNextEpisode(); return; }
    const t = setTimeout(() => setCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [showNextEpisode, countdown, goToNextEpisode]);

  // ── Loading screen ────────────────────────────────────────────────────────
  if (firebaseLoading || !subsLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-red-600 font-bold text-2xl tracking-widest uppercase animate-pulse">
          Bada Bing!
        </div>
        <div className="text-gray-400 text-sm">Sopranos Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full bg-black mx-auto overflow-hidden ${mini ? 'rounded-full' : ''}`}
      style={{ '--plyr-color-main': '#dc2626' } as React.CSSProperties}
    >
      <Plyr
        ref={plyrRef}
        source={plyrSource as any}
        options={plyrOptions as any}
      />

      {/* ── Skip Intro ── */}
      {!mini && showSkipIntro && playerReady && (
        <button
          onClick={() => {
            const epKey = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
            const timingObj = introTimings[epKey];
            const end = timingObj?.end !== "00:00" ? timeToSeconds(timingObj?.end ?? 0) : episode.introEnd;
            if (videoRef.current) videoRef.current.currentTime = end - 1.5;
            setShowSkipIntro(false);
            skippedIntroRef.current = true;
          }}
          className="absolute bottom-20 right-8 z-50 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border border-red-600/50 px-6 py-2.5 rounded shadow-lg font-bold tracking-widest text-sm uppercase transition-all hover:scale-105 active:scale-95"
        >
          İntroyu Atla →
        </button>
      )}

      {/* ── Next Episode ── */}
      {!mini && showNextEpisode && nextEpisode && playerReady && (
        <div className="absolute bottom-28 right-8 z-50 animate-fade-in-up">
          <div className="bg-black/90 border border-red-600/30 rounded-xl p-5 backdrop-blur-xl relative flex items-center gap-4 max-w-sm shadow-2xl">
            <button
              onClick={() => { setIsAutoSkipCancelled(true); setShowNextEpisode(false); }}
              className="absolute -top-3 -right-3 bg-gray-900 border border-red-600/50 text-gray-400 hover:text-white hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-lg"
            >
              ×
            </button>
            <button onClick={goToNextEpisode} className="flex items-center gap-4 text-left group">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="16" fill="none"
                    className="stroke-red-600 transition-all duration-1000 linear"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (countdown * 20)}
                  />
                </svg>
                <div className="absolute font-bold text-lg text-white">{countdown}</div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Yeni Bölüm Başlıyor</span>
                <span className="text-white font-bold text-base leading-tight group-hover:text-red-500 transition-colors">
                  {nextEpisode.title}
                </span>
                <span className="text-red-600 text-xs font-bold mt-1 uppercase">Hemen Geç →</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}