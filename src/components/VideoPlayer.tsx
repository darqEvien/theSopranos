import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'vidstack/bundle';
import { MediaPlayer, MediaProvider, Track, Gesture } from '@vidstack/react';
import type { MediaPlayerInstance, MediaTimeUpdateEventDetail } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { type Episode, getVideoUrl, getSubtitleUrl, getNextEpisode } from '../data/episodes';
import { useStore } from '../store/useStore';
import { srtToVttBlob } from '../lib/srtParser';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { introTimings } from '../data/introTimings';
import { outroTimings } from '../data/outroTimings';

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
  const playerRef = useRef<MediaPlayerInstance>(null);
  const navigate = useNavigate();
  const { user, subtitleLanguage } = useStore();
  const { saveProgress, getProgress, loading: firebaseLoading } = useFirebaseProgress();

  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [playerReady, setPlayerReady] = useState(false);
  const [isAutoSkipCancelled, setIsAutoSkipCancelled] = useState(false);
  const [vttTracks, setVttTracks] = useState<{ src: string; lang: string; label: string }[]>([]);

  const skippedIntroRef = useRef(false);
  const nextEpisodeTriggeredRef = useRef(false);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextEpisode = getNextEpisode(episode.season, episode.episode);

  const handleSaveProgress = useCallback((forceCompleted = false) => {
    const player = playerRef.current;
    if (!player || !user) return;
    const currentTime = player.currentTime;
    const duration = player.duration;
    if (currentTime > 5 && duration > 0) {
      saveProgress(episode.id, episode.season, episode.episode, currentTime, duration, forceCompleted);
    }
  }, [episode, user, saveProgress]);

  const goToNextEpisode = useCallback(() => {
    if (nextEpisode) {
      navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`);
    }
  }, [nextEpisode, navigate]);

  // Orientation lock logic
  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (document.fullscreenElement && window.innerWidth < 768) {
        try {
          if (window.screen.orientation && (window.screen.orientation as any).lock) {
            await (window.screen.orientation as any).lock('landscape');
          }
        } catch (err) {
          console.warn("Orientation lock failed:", err);
        }
      } else {
        try {
          if (window.screen.orientation && (window.screen.orientation as any).unlock) {
            (window.screen.orientation as any).unlock();
          }
        } catch { }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Subtitle loader
  useEffect(() => {
    const loadSubtitles = async () => {
      const tracks = [];
      const langs: ('tr' | 'en')[] = ['tr', 'en'];
      const labels = { tr: 'Türkçe', en: 'English' };

      for (const lang of langs) {
        try {
          const url = getSubtitleUrl(episode, lang);
          const res = await fetch(url);
          if (!res.ok) continue;

          const buf = await res.arrayBuffer();
          let srtText = "";
          try {
            srtText = new TextDecoder('utf-8', { fatal: true }).decode(buf);
          } catch {
            srtText = new TextDecoder('windows-1254').decode(buf);
          }

          const vttBlobUrl = srtToVttBlob(srtText);
          tracks.push({ src: vttBlobUrl, lang, label: labels[lang] });
        } catch (err) {
          console.warn(`Subtitle error (${lang}):`, err);
        }
      }
      setVttTracks(tracks);
    };

    loadSubtitles();
  }, [episode]);

  // Initial playback setup
  const onCanPlay = () => {
    setPlayerReady(true);
    const savedProgress = getProgress(episode.id);
    if (savedProgress && !savedProgress.completed && savedProgress.currentTime > 10) {
      playerRef.current!.currentTime = savedProgress.currentTime;
    }
    playerRef.current?.play().catch(() => { });
  };

  const onTimeUpdate = (detail: MediaTimeUpdateEventDetail) => {
    const currentTime = detail.currentTime;
    const duration = playerRef.current?.state.duration ?? 0;

    // Intro Skip Logic
    const epKey = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
    const timingObj = introTimings[epKey];
    const introStart = timingObj && timingObj.start !== "00:00" ? timeToSeconds(timingObj.start) : episode.introStart;
    const introEnd = timingObj && timingObj.end !== "00:00" ? timeToSeconds(timingObj.end) : episode.introEnd;

    if (introStart >= 0 && introEnd > 0 && currentTime >= introStart && currentTime < introEnd) {
      if (!skippedIntroRef.current) setShowSkipIntro(true);
    } else {
      setShowSkipIntro(false);
      if (currentTime < introStart || currentTime > introEnd) {
        skippedIntroRef.current = false;
      }
    }

    // Next Episode Logic
    const outroTimingObj = outroTimings[epKey];
    const outroStart = outroTimingObj && outroTimingObj.start !== "00:00" ? timeToSeconds(outroTimingObj.start) : (duration > 0 ? duration - 60 : 0);

    if (duration > 0 && currentTime >= outroStart && nextEpisode && !isAutoSkipCancelled) {
      if (!nextEpisodeTriggeredRef.current) {
        nextEpisodeTriggeredRef.current = true;
        setShowNextEpisode(true);
        setCountdown(5);
        handleSaveProgress(true); // Tag as completed
      }
    } else if (currentTime < outroStart) {
      if (nextEpisodeTriggeredRef.current) {
        nextEpisodeTriggeredRef.current = false;
        setShowNextEpisode(false);
      }
    }
  };

  const onEnded = () => {
    handleSaveProgress(true);
    if (nextEpisode) goToNextEpisode();
  };

  // Auto-skip timer
  useEffect(() => {
    if (showNextEpisode && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showNextEpisode && countdown === 0) {
      goToNextEpisode();
    }
  }, [showNextEpisode, countdown, goToNextEpisode]);

  // Periodic progress saving
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

  if (firebaseLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white animate-pulse">Sopranos Yükleniyor...</div>
      </div>
    );
  }

  const videoUrl = getVideoUrl(episode);

  return (
    <div className={`relative w-full aspect-video sm:h-full bg-black mx-auto overflow-hidden ${mini ? 'rounded-full' : ''}`}>
      <MediaPlayer
        ref={playerRef}
        title={episode.titleTr}
        src={videoUrl}
        crossOrigin="anonymous"
        playsInline
        onCanPlay={onCanPlay}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        className="w-full h-full group"
      >
        <MediaProvider>
          {vttTracks.map(track => (
            <Track
              key={track.lang}
              src={track.src}
              kind="subtitles"
              label={track.label}
              lang={track.lang}
              default={subtitleLanguage === track.lang}
            />
          ))}
        </MediaProvider>

        {/* Gestures */}
        <Gesture className="absolute inset-0 z-10 block h-full w-full" event="pointerup" action="toggle:paused" />
        <Gesture className="absolute inset-0 z-10 block h-full w-full" event="dblpointerup" action="toggle:fullscreen" />
        <Gesture className="absolute left-0 top-0 z-20 block h-full w-1/4" event="dblpointerup" action="seek:-10" />
        <Gesture className="absolute right-0 top-0 z-20 block h-full w-1/4" event="dblpointerup" action="seek:10" />

        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      {/* Custom Overlays */}
      {!mini && showSkipIntro && playerReady && (
        <button
          onClick={() => {
            const epKey = `S${String(episode.season).padStart(2, '0')}E${String(episode.episode).padStart(2, '0')}`;
            const timingObj = introTimings[epKey];
            const end = timingObj && timingObj.end !== "00:00" ? timeToSeconds(timingObj.end) : episode.introEnd;
            if (playerRef.current) playerRef.current.currentTime = end - 1.5;
            setShowSkipIntro(false);
            skippedIntroRef.current = true;
          }}
          className="absolute bottom-20 right-8 z-50 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded shadow-lg font-bold tracking-widest text-sm uppercase transition-all hover:scale-105 active:scale-95"
        >
          İntroyu Atla →
        </button>
      )}

      {!mini && showNextEpisode && nextEpisode && playerReady && (
        <div className="absolute bottom-28 right-8 z-50 animate-fade-in-up">
          <div className="bg-black/90 border border-white/10 rounded-xl p-5 backdrop-blur-xl relative flex items-center gap-4 max-w-sm shadow-2xl">
            <button
              onClick={() => {
                setIsAutoSkipCancelled(true);
                setShowNextEpisode(false);
              }}
              className="absolute -top-3 -right-3 bg-gray-800 border border-white/20 text-gray-400 hover:text-white hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-lg"
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
                  {nextEpisode.titleTr}
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