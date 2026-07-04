import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Coffee, Trees } from "lucide-react";

export default function PomodoroWidget() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState<"rain" | "forest" | "waves">("rain");
  const [soundVolume, setSoundVolume] = useState(0.5);

  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Focus Timer countdown logic
  useEffect(() => {
    let interval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            playAlertTone();
            handleModeChange(mode === "work" ? "short" : "work");
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  // Audio synthesis for ambient sounds to bypass external assets and ensure stability
  const startAmbientSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create white/pink noise for ambient rain/forest/waves soundscapes
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Generate Pink Noise approximation for more pleasant brown/pink sound
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // normalisation
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter to shape sound (rain = high-pass + low-pass, forest = bandpass with modulation, waves = low-pass with LFO)
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      
      if (soundType === "rain") {
        filter.frequency.value = 1200;
      } else if (soundType === "forest") {
        filter.frequency.value = 800;
      } else {
        filter.frequency.value = 500; // ocean waves
      }

      const gainNode = ctx.createGain();
      gainNode.gain.value = soundVolume * 0.15; // safety reduction factor

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(0);

      noiseNodeRef.current = noiseSource;
      filterNodeRef.current = filter;
      gainNodeRef.current = gainNode;

      // For waves mode, create a slow oscillation (LFO) to simulate ebb and flow
      if (soundType === "waves") {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // 12 seconds per wave cycle
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.1;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start(0);
      }

    } catch (e) {
      console.warn("AudioContext failed to start", e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
  };

  const playAlertTone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5 note

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  useEffect(() => {
    if (soundEnabled) {
      stopAmbientSound();
      startAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [soundEnabled, soundType]);

  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(soundVolume * 0.15, audioContextRef.current.currentTime);
    }
  }, [soundVolume]);

  const handleModeChange = (newMode: "work" | "short" | "long") => {
    setMode(newMode);
    setIsActive(false);
    setSeconds(0);
    if (newMode === "work") setMinutes(25);
    else if (newMode === "short") setMinutes(5);
    else setMinutes(15);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
    if (mode === "work") setMinutes(25);
    else if (mode === "short") setMinutes(5);
    else setMinutes(15);
  };

  const progress = (minutes * 60 + seconds) / ((mode === "work" ? 25 : mode === "short" ? 5 : 15) * 60);

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-4 justify-between">
      {/* Mode selectors */}
      <div className="flex space-x-1.5 justify-center bg-black/40 border border-white/5 p-1 rounded-lg">
        {[
          { id: "work", label: "Fokus", icon: Flame, color: "text-amber-500" },
          { id: "short", label: "Pause", icon: Coffee, color: "text-emerald-400" },
          { id: "long", label: "Pause (Weit)", icon: Trees, color: "text-blue-400" }
        ].map((m) => {
          const Icon = m.icon;
          const isSelected = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded-md transition-all text-[10px] font-mono ${
                isSelected 
                  ? "bg-white/10 text-white font-bold border border-white/10" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon size={11} className={m.color} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Visual Countdown Timer */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Progress circle SVG background */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke={mode === "work" ? "#C5A059" : mode === "short" ? "#10B981" : "#3B82F6"}
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={301.6}
              strokeDashoffset={301.6 * (1 - progress)}
              className="transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-xl font-mono font-bold text-white tracking-tight">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[8px] font-mono uppercase tracking-widest block text-slate-500 mt-0.5">
              {isActive ? "Aktiv" : "Pause"}
            </span>
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-2.5">
        <button
          onClick={toggleTimer}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider transition-all shadow-md ${
            isActive
              ? "bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/40"
              : "bg-gold hover:bg-[#b08e4d] text-black"
          }`}
        >
          {isActive ? <Pause size={11} /> : <Play size={11} />}
          <span>{isActive ? "Pause" : "Start"}</span>
        </button>
        <button
          onClick={resetTimer}
          className="p-1.5 border border-white/10 hover:border-white/25 rounded-full text-slate-400 hover:text-white transition-colors"
          title="Zurücksetzen"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      {/* Soundscape Ambient System */}
      <div className="bg-black/20 border border-white/5 p-2 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-300 flex items-center space-x-1 font-mono">
            <span>Fokus-Rauschen</span>
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1 rounded transition-colors ${
              soundEnabled ? "text-gold bg-gold/10" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
        </div>

        {soundEnabled && (
          <div className="space-y-2 animate-fadeIn text-[9px]">
            <div className="flex space-x-1">
              {[
                { id: "rain", label: "Regen" },
                { id: "forest", label: "Natur" },
                { id: "waves", label: "Meereswellen" }
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => setSoundType(snd.id as any)}
                  className={`flex-1 py-1 rounded text-center transition-all ${
                    soundType === snd.id 
                      ? "bg-white/10 text-white border border-white/10" 
                      : "bg-black/30 text-slate-400"
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-mono text-[8px]">Lautstärke:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-gold bg-zinc-800 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
