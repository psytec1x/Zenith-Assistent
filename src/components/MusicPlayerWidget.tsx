import React, { useState, useEffect } from "react";
import { Music, Play, Plus, Search, Trash2, Sliders, Radio, ArrowRight, ExternalLink, HelpCircle, Heart } from "lucide-react";

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  url: string; // original url
  embedUrl: string; // parsed embed url
  source: "YouTube" | "Spotify" | "SoundCloud" | "Ambient Synth";
  isCustom?: boolean;
}

const DEFAULT_PLAYLISTS: PlaylistTrack[] = [
  {
    id: "pl-lofi-1",
    title: "Lo-Fi Girl Study Beats ☕",
    artist: "Lofi Girl (YouTube)",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    source: "YouTube"
  },
  {
    id: "pl-synth-1",
    title: "Synthwave Retro Beats 🌌",
    artist: "RetroMix (YouTube)",
    url: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    embedUrl: "https://www.youtube.com/embed/4xDzrJKXOOY",
    source: "YouTube"
  },
  {
    id: "pl-spotify-lofi",
    title: "Lofi Beats Playlist",
    artist: "Spotify Curated",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn",
    source: "Spotify"
  },
  {
    id: "pl-spotify-focus",
    title: "Deep Focus Piano 🎹",
    artist: "Spotify Editorial",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWYpTMfeOajL",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWYpTMfeOajL",
    source: "Spotify"
  },
  {
    id: "pl-sc-lofi",
    title: "SoundCloud Chill Beats",
    artist: "Lofi Hip Hop Radio",
    url: "https://soundcloud.com/lofigirl/sets/lofi-hip-hop-radio-beats-to-relax-study-to",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Flofigirl%2Fsets%2Flofi-hip-hop-radio-beats-to-relax-study-to&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true",
    source: "SoundCloud"
  },
  {
    id: "pl-synth-web",
    title: "Ambient Synthesizer (Web Audio)",
    artist: "Lokaler Live-Oszillator",
    url: "local-synth",
    embedUrl: "synth",
    source: "Ambient Synth"
  }
];

// Curated database for search queries
const SEARCH_DATABASE: PlaylistTrack[] = [
  {
    id: "db-lofi-1",
    title: "Lofi Study Beats ☕",
    artist: "Lofi Girl Radio (YouTube Live)",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk",
    source: "YouTube"
  },
  {
    id: "db-lofi-2",
    title: "Chill Lofi Sleeping Music 🌙",
    artist: "Lofi Records (YouTube)",
    url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
    embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
    source: "YouTube"
  },
  {
    id: "db-synth-1",
    title: "Classic Synthwave Radio 🌆",
    artist: "Lofi Girl Synthwave",
    url: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    embedUrl: "https://www.youtube.com/embed/4xDzrJKXOOY",
    source: "YouTube"
  },
  {
    id: "db-jazz-1",
    title: "Coffee Shop Jazz Beats 🎷",
    artist: "Cafe Music BGM channel",
    url: "https://www.youtube.com/watch?v=gS678iGZzH0",
    embedUrl: "https://www.youtube.com/embed/gS678iGZzH0",
    source: "YouTube"
  },
  {
    id: "db-class-1",
    title: "Classical Piano Focus 🎼",
    artist: "Halidon Music (YouTube)",
    url: "https://www.youtube.com/watch?v=mYKLvYGqaC0",
    embedUrl: "https://www.youtube.com/embed/mYKLvYGqaC0",
    source: "YouTube"
  },
  {
    id: "db-spotify-1",
    title: "Lofi Beats - Relaxing Music",
    artist: "Spotify (Playlist)",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn",
    source: "Spotify"
  },
  {
    id: "db-spotify-2",
    title: "Deep Focus - Study & Coding",
    artist: "Spotify (Playlist)",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWWYpTMfeOajL",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWYpTMfeOajL",
    source: "Spotify"
  },
  {
    id: "db-spotify-3",
    title: "Jazz in the Background",
    artist: "Spotify (Playlist)",
    url: "https://open.spotify.com/playlist/37i9dQZF1DWV7g3v70Z7uX",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWV7g3v70Z7uX",
    source: "Spotify"
  },
  {
    id: "db-spotify-4",
    title: "Peaceful Piano - Focus",
    artist: "Spotify (Playlist)",
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO",
    source: "Spotify"
  },
  {
    id: "db-sc-1",
    title: "Lo-Fi Hip Hop Beats",
    artist: "SoundCloud Curated",
    url: "https://soundcloud.com/lofigirl/sets/lofi-hip-hop-radio-beats-to-relax-study-to",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Flofigirl%2Fsets%2Flofi-hip-hop-radio-beats-to-relax-study-to&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true",
    source: "SoundCloud"
  },
  {
    id: "db-sc-2",
    title: "Synthwave Outrun & Cyberpunk",
    artist: "SoundCloud Beats",
    url: "https://soundcloud.com/user-537447073/sets/ambient-sleep-meditation",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A%2F%2Fsoundcloud.com%2Fuser-537447073%2Fsets%2Fambient-sleep-meditation&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true",
    source: "SoundCloud"
  }
];

export function parseAudioUrl(url: string): { source: "YouTube" | "Spotify" | "SoundCloud"; embedUrl: string } | null {
  const cleanUrl = url.trim();

  // YouTube Checks
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    let listId = "";
    const listMatch = cleanUrl.match(/[&?]list=([^&]+)/);
    if (listMatch) {
      listId = listMatch[1];
      return {
        source: "YouTube",
        embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}`
      };
    }

    let videoId = "";
    if (cleanUrl.includes("youtu.be/")) {
      const parts = cleanUrl.split("youtu.be/");
      videoId = parts[1]?.split(/[?#]/)[0];
    } else {
      const videoMatch = cleanUrl.match(/[&?]v=([^&]+)/);
      if (videoMatch) videoId = videoMatch[1];
    }
    if (videoId) {
      return {
        source: "YouTube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    }
  }

  // Spotify Checks
  if (cleanUrl.includes("spotify.com")) {
    const playlistMatch = cleanUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);
    if (playlistMatch) {
      return {
        source: "Spotify",
        embedUrl: `https://open.spotify.com/embed/playlist/${playlistMatch[1]}`
      };
    }
    const albumMatch = cleanUrl.match(/\/album\/([a-zA-Z0-9]+)/);
    if (albumMatch) {
      return {
        source: "Spotify",
        embedUrl: `https://open.spotify.com/embed/album/${albumMatch[1]}`
      };
    }
    const trackMatch = cleanUrl.match(/\/track\/([a-zA-Z0-9]+)/);
    if (trackMatch) {
      return {
        source: "Spotify",
        embedUrl: `https://open.spotify.com/embed/track/${trackMatch[1]}`
      };
    }
  }

  // SoundCloud Checks
  if (cleanUrl.includes("soundcloud.com")) {
    return {
      source: "SoundCloud",
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(cleanUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=true`
    };
  }

  return null;
}

export default function MusicPlayerWidget() {
  const [playlists, setPlaylists] = useState<PlaylistTrack[]>(() => {
    const saved = localStorage.getItem("playlist_player_widgets");
    return saved ? JSON.parse(saved) : DEFAULT_PLAYLISTS;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaylistTrack[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [inputArtist, setInputArtist] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "search" | "playlists">("player");

  // Web Audio Synth local states
  const [synthWave, setSynthWave] = useState<OscillatorType>("sine");
  const [synthFreq, setSynthFreq] = useState(220);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);
  const [activeOscillator, setActiveOscillator] = useState<OscillatorNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem("playlist_player_widgets", JSON.stringify(playlists));
  }, [playlists]);

  const currentTrack = playlists[currentIdx] || DEFAULT_PLAYLISTS[0];

  // Web Audio Synthesizer methods
  const startSynth = () => {
    try {
      const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) setAudioContext(ctx);

      if (activeOscillator) {
        activeOscillator.stop();
        activeOscillator.disconnect();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = synthWave;
      osc.frequency.setValueAtTime(synthFreq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      setActiveOscillator(osc);
      setIsPlayingSynth(true);
    } catch (err) {
      console.error("Synth could not be started", err);
    }
  };

  const stopSynth = () => {
    if (activeOscillator) {
      activeOscillator.stop();
      activeOscillator.disconnect();
      setActiveOscillator(null);
    }
    setIsPlayingSynth(false);
  };

  // Turn off synth on track change
  useEffect(() => {
    stopSynth();
  }, [currentIdx]);

  const handleFreqChange = (val: number) => {
    setSynthFreq(val);
    if (activeOscillator && audioContext) {
      activeOscillator.frequency.setValueAtTime(val, audioContext.currentTime);
    }
  };

  const handleWaveChange = (wave: OscillatorType) => {
    setSynthWave(wave);
    if (activeOscillator) {
      activeOscillator.type = wave;
    }
  };

  // URL Parsing & addition
  const handleAddPlaylistUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!inputUrl) {
      setErrorMsg("Bitte gib eine gültige URL ein.");
      return;
    }

    const parsed = parseAudioUrl(inputUrl);
    if (!parsed) {
      setErrorMsg("Ungültige Playlist-URL. Bitte Spotify, YouTube oder SoundCloud Link verwenden.");
      return;
    }

    const sourceLabel = parsed.source;
    const title = inputTitle.trim() || `Meine Playlist (${sourceLabel})`;
    const artist = inputArtist.trim() || `Hinzugefügter Link`;

    const newTrack: PlaylistTrack = {
      id: "custom-" + Date.now(),
      title,
      artist,
      url: inputUrl,
      embedUrl: parsed.embedUrl,
      source: parsed.source,
      isCustom: true
    };

    const updated = [...playlists, newTrack];
    setPlaylists(updated);
    setInputUrl("");
    setInputTitle("");
    setInputArtist("");
    setShowAddForm(false);
    setCurrentIdx(updated.length - 1);
    setActiveTab("player");
  };

  // Delete dynamic list entries
  const handleDeletePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = playlists.filter((p) => p.id !== id);
    setPlaylists(updated);
    if (currentIdx >= updated.length) {
      setCurrentIdx(Math.max(0, updated.length - 1));
    }
  };

  // Search logic
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lower = query.toLowerCase();
    const results = SEARCH_DATABASE.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.artist.toLowerCase().includes(lower) ||
        item.source.toLowerCase().includes(lower)
    );

    // If no direct results in preset DB, provide a fallback filtered dynamically or build a dynamic Search outcome
    if (results.length === 0) {
      // Create a fallback result matching user's term dynamically
      setSearchResults([
        {
          id: `search-fallback-${Date.now()}-yt`,
          title: `Suche "${query}" auf YouTube 📺`,
          artist: "Direkte YouTube-Suche",
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          embedUrl: `https://www.youtube.com/embed/videoseries?list=PL3oW2tjiIxvSzkYvTjpxp2O_gOaZpW9r4`, // high quality LoFi fallback stream
          source: "YouTube"
        },
        {
          id: `search-fallback-${Date.now()}-sp`,
          title: `Suche "${query}" auf Spotify 🎵`,
          artist: "Direkte Spotify-Suche",
          url: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
          embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWYpTMfeOajL",
          source: "Spotify"
        }
      ]);
    } else {
      setSearchResults(results);
    }
  };

  const handlePlaySearchResult = (item: PlaylistTrack) => {
    // Check if item is already in playlist
    const existing = playlists.find((p) => p.url === item.url || p.embedUrl === item.embedUrl);
    if (existing) {
      const idx = playlists.indexOf(existing);
      setCurrentIdx(idx);
    } else {
      const updated = [...playlists, { ...item, id: `add-${Date.now()}` }];
      setPlaylists(updated);
      setCurrentIdx(updated.length - 1);
    }
    setActiveTab("player");
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Tab Selectors */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex space-x-1">
          {[
            { id: "player", label: "Player" },
            { id: "playlists", label: "Mediathek" },
            { id: "search", label: "Suche" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id !== "player") stopSynth();
              }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono border transition-all ${
                activeTab === tab.id
                  ? "bg-gold border-transparent text-black font-semibold shadow-md shadow-gold/10"
                  : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-mono border border-gold/20 transition-all"
        >
          <Plus size={10} />
          <span>URL hinzufügen</span>
        </button>
      </div>

      {/* URL Import Form */}
      {showAddForm && (
        <form onSubmit={handleAddPlaylistUrl} className="bg-black/40 p-3 rounded-lg border border-white/10 space-y-2.5 animate-fadeIn">
          <div className="text-[10px] font-mono font-semibold text-gold border-b border-white/5 pb-1 flex justify-between items-center">
            <span>Playlist / Stream Link importieren</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-400 block font-mono">URL (Spotify, YouTube, SoundCloud):</label>
            <input
              type="text"
              placeholder="z.B. https://open.spotify.com/playlist/..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-black/60 border border-white/5 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 block font-mono">Titel (optional):</label>
              <input
                type="text"
                placeholder="z.B. Chillhop Cafe"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400 block font-mono">Interpret (optional):</label>
              <input
                type="text"
                placeholder="z.B. Lofi Girl"
                value={inputArtist}
                onChange={(e) => setInputArtist(e.target.value)}
                className="w-full bg-black/60 border border-white/5 rounded px-2 py-1 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-[9px] text-rose-400 font-mono bg-rose-500/5 p-1.5 rounded border border-rose-500/10">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3 py-1 rounded bg-gold text-black font-semibold text-[10px] font-mono hover:bg-[#b08e4d] transition-colors"
            >
              Stream einbinden
            </button>
          </div>
        </form>
      )}

      {/* Main Content Areas */}
      {activeTab === "player" && (
        <div className="flex flex-col h-full space-y-3 flex-1">
          {/* Active Station Display */}
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                {currentTrack.source === "Ambient Synth" ? (
                  <Radio size={14} className={`text-gold ${isPlayingSynth ? "animate-pulse" : ""}`} />
                ) : (
                  <Music size={14} className="text-gold" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-slate-200 block truncate">{currentTrack.title}</span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {currentTrack.artist} • <span className="text-gold font-mono text-[9px] uppercase">{currentTrack.source}</span>
                </span>
              </div>
            </div>

            {currentTrack.source === "Ambient Synth" && (
              <button
                onClick={() => (isPlayingSynth ? stopSynth() : startSynth())}
                className="w-7 h-7 rounded-full bg-gold hover:bg-[#b08e4d] text-black flex items-center justify-center font-bold transition-all shrink-0 shadow-md shadow-gold/5"
              >
                {isPlayingSynth ? <span className="text-[9px] font-mono font-bold">||</span> : <span className="text-[10px] font-bold">▶</span>}
              </button>
            )}
          </div>

          {/* Player Display Container */}
          {currentTrack.source === "Ambient Synth" ? (
            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 pb-1">
                <span className="font-mono flex items-center space-x-1">
                  <Sliders size={10} className="text-gold" />
                  <span>Ambient Synthesizer (Live Oszillator)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block mb-1">Wellenform:</span>
                  <select
                    value={synthWave}
                    onChange={(e) => handleWaveChange(e.target.value as OscillatorType)}
                    className="w-full bg-black/60 border border-white/5 rounded px-1.5 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value="sine">Sinus (Sanft)</option>
                    <option value="triangle">Dreieck (Mellow)</option>
                    <option value="sawtooth">Sägezahn (Stark)</option>
                    <option value="square">Rechteck (Retro)</option>
                  </select>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Frequenz: {synthFreq} Hz</span>
                  <input
                    type="range"
                    min={110}
                    max={440}
                    value={synthFreq}
                    onChange={(e) => handleFreqChange(parseInt(e.target.value))}
                    className="w-full accent-gold h-1 bg-white/5 rounded-lg cursor-pointer mt-1"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-500 font-mono italic leading-normal">
                Generiert Live-Konzentrationsschwingungen im Browser. Ideal in Kombination mit Pomodoro.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-[160px] bg-black/40 rounded-lg border border-white/5 overflow-hidden relative">
              {currentTrack.embedUrl ? (
                <iframe
                  src={currentTrack.embedUrl}
                  className="w-full h-full border-0 absolute inset-0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-[10px]">
                  <span>Embed-Player wird vorbereitet...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "playlists" && (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
          {playlists.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => setCurrentIdx(idx)}
              className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                idx === currentIdx
                  ? "bg-gold/5 border-gold/30 text-white"
                  : "bg-black/20 border-white/5 hover:border-white/10 text-slate-400"
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-[9px] font-mono text-slate-600 w-3">{idx + 1}.</span>
                <span className={`text-[9px] font-mono font-semibold uppercase px-1 rounded shrink-0 ${
                  track.source === "Spotify" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  track.source === "YouTube" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                  track.source === "SoundCloud" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                  "bg-gold/10 text-gold border border-gold/20"
                }`}>
                  {track.source}
                </span>
                <div className="min-w-0">
                  <span className={`font-medium block truncate text-xs ${idx === currentIdx ? "text-gold font-semibold" : "text-slate-300"}`}>
                    {track.title}
                  </span>
                  <span className="text-[9px] text-slate-500 block truncate">{track.artist}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 ml-2 shrink-0">
                {idx === currentIdx && (
                  <span className="text-[8px] font-mono text-gold animate-pulse">AKTIV</span>
                )}
                {track.isCustom && (
                  <button
                    onClick={(e) => handleDeletePlaylist(track.id, e)}
                    className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 transition-colors"
                    title="Entfernen"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "search" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2 text-slate-500" size={12} />
            <input
              type="text"
              placeholder="z.B. Lofi, Synthwave, Jazz, Piano..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-gold/30 font-sans"
            />
          </div>

          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
            {searchQuery ? (
              searchResults.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-[10px]">
                  Keine passenden Playlists gefunden. Try "Lofi" or "Piano".
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handlePlaySearchResult(item)}
                    className="p-2 bg-black/20 hover:bg-black/40 border border-white/5 hover:border-gold/20 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-medium text-slate-200 block truncate">{item.title}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{item.artist}</span>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 shrink-0">
                      <span className="text-[8px] font-mono text-slate-500 bg-white/5 px-1 rounded uppercase">
                        {item.source}
                      </span>
                      <span className="text-gold text-[10px] font-bold">▶ Play</span>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Beliebte Musik-Genres:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Lofi", "Synthwave", "Jazz", "Piano"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className="py-1 px-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] border border-white/5 text-left transition-colors"
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
