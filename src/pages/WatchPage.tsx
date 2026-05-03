import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { getEpisode, getSeasonByNumber, getNextEpisode, getPreviousEpisode } from '../data/episodes';
import VideoPlayer from '../components/VideoPlayer';
import { useFirebaseProgress } from '../hooks/useFirebaseProgress';
import { ArrowLeft, ArrowRight, ListVideo, Home, X, PlayCircle, CheckCircle, Monitor, MonitorOff, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import EpisodeComments from '../components/EpisodeComments';

export default function WatchPage() {
  const { seasonNumber, episodeNumber } = useParams<{ seasonNumber: string; episodeNumber: string }>();
  const navigate = useNavigate();

  const season = parseInt(seasonNumber || '1', 10);
  const epNum = parseInt(episodeNumber || '1', 10);

  const episode = getEpisode(season, epNum);
  const nextEpisode = getNextEpisode(season, epNum);
  const prevEpisode = getPreviousEpisode(season, epNum);

  const { getProgress } = useFirebaseProgress();
  const { user, autoPlayNext, setAutoPlayNext } = useStore();

  const [mode, setMode] = useState<'sinematik' | 'normal'>('normal');
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [selectedSeasonDrawer, setSelectedSeasonDrawer] = useState(season);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsPlaylistOpen(false);
    setSelectedSeasonDrawer(season);
  }, [episode?.id, season]);

  if (!episode) {
    return <Navigate to="/" />;
  }

  // Hem Sinematik Çekmecede hem de Normal Yan Menüde kullanılacak ortak Oynatma Listesi Bileşeni
  const PlaylistContent = ({ isDrawer = false }: { isDrawer?: boolean }) => (
    <div className={`flex flex-col h-full ${!isDrawer && 'bg-[#0a0a0a] rounded-2xl border border-white/5 shadow-xl overflow-hidden'}`}>
      <div className={`p-4 border-b border-white/5 shrink-0 flex flex-col gap-3 ${!isDrawer && 'bg-[#111]/50'}`}>
        {isDrawer && (
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-white tracking-tight">Oynatma Listesi</h3>
            <button onClick={() => setIsPlaylistOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <select
            value={selectedSeasonDrawer}
            onChange={(e) => setSelectedSeasonDrawer(parseInt(e.target.value))}
            className="flex-1 bg-[#1a1a1a] border border-white/10 text-white text-sm font-bold p-3 rounded-lg outline-none focus:border-red-500 transition-colors appearance-none cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(s => (
              <option key={s} value={s}>Sezon {s}</option>
            ))}
          </select>
          <button
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`shrink-0 flex flex-col justify-center items-center h-full px-3 py-1.5 rounded-lg border transition-all ${autoPlayNext ? 'bg-red-900/10 border-red-500/30' : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'}`}
            title={autoPlayNext ? "Otomatik Geçişi Kapat" : "Otomatik Geçişi Aç"}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${autoPlayNext ? 'text-red-500' : 'text-gray-500'}`}>Oto Geçiş</span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${autoPlayNext ? 'bg-red-600' : 'bg-gray-600'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform absolute top-0.5 ${autoPlayNext ? 'translate-x-4 left-0.5' : 'translate-x-0 left-0.5'}`} />
            </div>
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar ${!isDrawer && 'max-h-[600px]'}`}>
        {getSeasonByNumber(selectedSeasonDrawer)?.episodes.map((ep) => {
          const isCurrent = ep.id === episode.id;
          const epProg = getProgress(ep.id);
          const isCompleted = epProg?.completed;

          return (
            <button
              key={ep.id}
              onClick={() => navigate(`/watch/${ep.season}/${ep.episode}`)}
              className={`w-full group flex gap-3 p-2.5 rounded-xl transition-all text-left border ${isCurrent ? 'bg-red-900/10 border-red-500/30 ring-1 ring-red-500/50' : 'hover:bg-[#1a1a1a] border-transparent'}`}
            >
              <div className="relative w-24 h-14 shrink-0 bg-black rounded-md overflow-hidden ring-1 ring-white/10">
                <img
                  src={`/images/thumbnails/Season ${ep.season}/S${String(ep.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}.jpg`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  alt={ep.title}
                />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <PlayCircle size={20} className={isCurrent ? "text-red-500" : "text-white"} />
                </div>
                {epProg && epProg.percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div className="h-full bg-red-600" style={{ width: `${Math.min(epProg.percentage, 100)}%` }} />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-red-500' : 'text-gray-500'}`}>Bölüm {ep.episode}</span>
                  {isCompleted && <CheckCircle size={12} className="text-green-500" />}
                </div>
                <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{ep.title}</h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-600 font-sans">

      {/* Üst Navigasyon Barı */}
      <div className={`${mode === 'sinematik' ? 'fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none' : 'sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/5'} p-4 lg:px-8 flex items-center justify-between transition-all duration-500`}>
        <div className="pointer-events-auto flex items-center gap-4">
          <button onClick={() => navigate(`/`)} className="bg-black/60 p-2.5 rounded-full border border-white/10 hover:bg-white/20 transition-all shadow-lg">
            <Home size={18} />
          </button>
          <button onClick={() => navigate(`/season/${season}`)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <div className="bg-black/40 p-2 rounded-full border border-white/10"><ArrowLeft size={16} /></div>
            <span className="font-semibold text-sm">Sezon {season}</span>
          </button>
        </div>

        {mode === 'sinematik' && (
          <div className="text-center pointer-events-none hidden md:block">
            <h1 className="font-serif text-xl font-bold tracking-tight text-white drop-shadow-lg">S{String(season).padStart(2, '0')} E{String(epNum).padStart(2, '0')}</h1>
            <p className="text-xs font-medium text-gray-300">{episode.title}</p>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-3">
          <button onClick={() => setMode(mode === 'sinematik' ? 'normal' : 'sinematik')} className="bg-black/60 p-2.5 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all group" title={mode === 'sinematik' ? 'Normal Mod' : 'Sinematik Mod'}>
            {mode === 'sinematik' ? <Monitor size={18} className="group-hover:text-red-500" /> : <MonitorOff size={18} className="group-hover:text-red-500" />}
          </button>

          {user && (
            <Link to={`/profile/${user.displayName}`} className="bg-black/60 p-2 rounded-full border border-white/10 hover:border-red-500/50 transition-all">
              {user.photoURL ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 flex items-center justify-center"><User size={18} className="text-gray-400" /></div>}
            </Link>
          )}

          {mode === 'sinematik' && (
            <button onClick={() => setIsPlaylistOpen(!isPlaylistOpen)} className="bg-black/60 px-4 py-2 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-white/10 transition-all flex items-center gap-2 group">
              <ListVideo size={18} className="group-hover:text-red-500" />
              <span className="font-bold text-xs uppercase tracking-widest hidden sm:inline">Bölümler</span>
            </button>
          )}
        </div>
      </div>

      {/* Ana İçerik Alanı */}
      <div className={mode === 'sinematik' ? 'w-full h-[calc(100vh-80px)] relative bg-black flex items-center justify-center' : 'max-w-[1700px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8 transition-all duration-700'}>

        {/* Sol Taraf: Video + Bilgiler */}
        <div className={mode === 'sinematik' ? 'w-full h-full flex items-center justify-center' : 'w-full rounded-2xl ring-1 ring-white/5'}>
          {/* Video Player Kutusu */}
          <div
            className={`
              transition-all duration-700 ease-in-out shadow-2xl
              ${mode === 'sinematik'
                ? (isPlaylistOpen
                  ? 'w-[72%] rounded-[2rem] ring-4 ring-white/5 -translate-x-24'
                  : 'w-[90%] rounded-[2rem] ring-4 ring-white/5')
                : 'w-full aspect-video rounded-2xl ring-1 ring-white/5'
              }
            `}
            style={mode === 'sinematik' ? { aspectRatio: '16/9' } : undefined}
          >
            <div className={`w-full h-full overflow-hidden ${mode === 'sinematik' ? 'rounded-[2rem]' : 'rounded-2xl'}`}>
              <VideoPlayer key={episode.id} episode={episode} />
            </div>
          </div>

          {/* Normal Mod: Alt Bilgi ve Yorumlar */}
          {mode === 'normal' && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                <h2 className="font-serif text-3xl font-bold tracking-tight text-white">{episode.title}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  {prevEpisode && (
                    <button onClick={() => navigate(`/watch/${prevEpisode.season}/${prevEpisode.episode}`)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10 text-sm font-semibold">
                      <ArrowLeft size={16} /> Önceki Bölüm
                    </button>
                  )}
                  {nextEpisode && (
                    <button onClick={() => navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`)} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors border border-red-500/50 text-white text-sm font-semibold shadow-lg shadow-red-900/20">
                      Sonraki Bölüm <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white/10 text-white px-3 py-1 rounded-md text-xs font-bold uppercase border border-white/5">S{String(season).padStart(2, '0')} E{String(epNum).padStart(2, '0')}</span>
                <span className="text-gray-400 text-sm font-medium">{episode.airDate}</span>
              </div>
              <p className="text-gray-300 leading-relaxed max-w-4xl mb-12 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">{episode.description}</p>

              <EpisodeComments episodeId={episode.id} />
            </div>
          )}
        </div>

        {/* Sağ Taraf: Oynatma Listesi (Sadece Normal Modda görünür) */}
        {mode === 'normal' && (
          <div className="w-full lg:w-[400px] shrink-0">
            <PlaylistContent />
          </div>
        )}
      </div>

      {/* Sinematik Mod: Çekmece ve Alt Bilgiler */}
      {mode === 'sinematik' && (
        <>
          <div className={`fixed inset-y-0 right-0 z-[100] w-full sm:w-96 bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl transition-transform duration-500 ease-in-out transform ${isPlaylistOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <PlaylistContent isDrawer={true} />
          </div>

          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
              <h2 className="font-serif text-4xl font-bold tracking-tight">{episode.title}</h2>
              <div className="flex items-center gap-3 shrink-0">
                {prevEpisode && (
                  <button onClick={() => navigate(`/watch/${prevEpisode.season}/${prevEpisode.episode}`)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-lg transition-colors border border-white/10 font-semibold">
                    <ArrowLeft size={18} /> Önceki Bölüm
                  </button>
                )}
                {nextEpisode && (
                  <button onClick={() => navigate(`/watch/${nextEpisode.season}/${nextEpisode.episode}`)} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 px-5 py-2.5 rounded-lg transition-colors border border-red-500/50 text-white font-semibold shadow-lg shadow-red-900/20">
                    Sonraki Bölüm <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg mb-12 max-w-3xl">{episode.description}</p>
            <EpisodeComments episodeId={episode.id} />
          </div>
        </>
      )}

    </div>
  );
}