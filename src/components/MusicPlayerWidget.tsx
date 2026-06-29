import React, { useState } from "react";
import { Music, Play, Pause, SkipForward, Radio, Sliders, Volume2 } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string; // Embed or mock play
  source: "YouTube" | "Spotify" | "SoundCloud" | "Ambient Synth";
}

export default function MusicPlayerWidget() {
  const [tracks, setTracks] = useState<Track[]>([
    { id: "tr1", title: "Lo-Fi Study Beats", artist: "Chillhop Music", url: "https://www.youtube.com/embed/jfKfPfyJRdk", source: "YouTube" },
    { id: "tr2", title: "Ambient Space Meditation", artist: "Sonne und Mond", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWYpTMfeOajL", source: "Spotify" },
    { id: "tr3", title: "Deep Focus Ambient Synth", artist: "Web Audio Synthesizer", url: "", source: "Ambient Synth" }
  ]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Web Audio Synth state
  const [synthWave, setSynthWave] = useState<OscillatorType>("sine");
  const [synthFreq, setSynthFreq] = useState(220); // Low calming frequency
  const [activeOscillator, setActiveOscillator] = useState<OscillatorNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const currentTrack = tracks[currentIdx];

  // Web Audio Synthesizer implementation
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
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // Low volume ambient noise

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      setActiveOscillator(osc);
      setIsPlaying(true);
    } catch (err) {
      console.error("Synthesizer failed to start", err);
    }
  };

  const stopSynth = () => {
    if (activeOscillator) {
      activeOscillator.stop();
      activeOscillator.disconnect();
      setActiveOscillator(null);
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (currentTrack.source === "Ambient Synth") {
      if (isPlaying) {
        stopSynth();
      } else {
        startSynth();
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    stopSynth();
    setCurrentIdx((prev) => (prev + 1) % tracks.length);
    setIsPlaying(false);
  };

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

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Current Player Status */}
      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
            {currentTrack.source === "Ambient Synth" ? (
              <Radio size={16} className="text-gold animate-pulse" />
            ) : (
              <Music size={16} className="text-gold" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-200 block truncate">{currentTrack.title}</span>
            <span className="text-[10px] text-slate-500 block truncate">{currentTrack.artist} ({currentTrack.source})</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={togglePlayback}
            className="w-7 h-7 rounded-full bg-gold hover:bg-[#b08e4d] text-black flex items-center justify-center font-bold transition-all"
          >
            {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
          <button
            onClick={handleNext}
            className="w-7 h-7 rounded-full bg-black/40 border border-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all"
            title="Nächster Titel"
          >
            <SkipForward size={12} />
          </button>
        </div>
      </div>

      {/* Conditional Embed Player / Ambient Web-Audio Synth Controls */}
      {currentTrack.source === "Ambient Synth" ? (
        <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 pb-1">
            <span className="font-mono flex items-center space-x-1">
              <Sliders size={10} className="text-gold" />
              <span>Ambient Synthesizer (Web Audio API)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <span className="text-slate-500 block mb-1">Oszillator Wellenform:</span>
              <select
                value={synthWave}
                onChange={(e) => handleWaveChange(e.target.value as OscillatorType)}
                className="w-full bg-black/60 border border-white/5 rounded px-1.5 py-0.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold/30"
              >
                <option value="sine">Sinus (Ruhig)</option>
                <option value="triangle">Dreieck (Sanft)</option>
                <option value="sawtooth">Sägezahn (Mächtig)</option>
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
          <div className="text-[9px] text-slate-500 font-mono italic">
            Der Synthesizer generiert Live-Sound direkt im Browser. Perfekt für Fokus-Phasen.
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-black/20 rounded-lg border border-white/5 overflow-hidden relative" style={{ minHeight: "120px" }}>
          {currentTrack.url ? (
            <iframe
              src={currentTrack.url}
              className="w-full h-full border-0 rounded-lg"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-[10px]">
              <span>Embed Player wird geladen...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
