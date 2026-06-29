import React, { useState } from "react";
import { Sparkles, FileEdit, Clipboard, Check, RefreshCw } from "lucide-react";

export default function WritingAssistantWidget() {
  const [inputText, setInputText] = useState("");
  const [styleMode, setStyleMode] = useState("formal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    correctedText: string;
    suggestions: string[];
    improvements: Array<{ original: string; replacement: string }>;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/writing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim(), mode: styleMode })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      console.error(err);
      alert("Fehler bei der Textoptimierung: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Editor & Style Select Row */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="font-mono text-slate-400 flex items-center space-x-1">
          <FileEdit size={12} className="text-violet-400" />
          <span>KI-Textoptimierung:</span>
        </span>
        <select
          value={styleMode}
          onChange={(e) => setStyleMode(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5 text-[10px]"
        >
          <option value="formal">Formell & Professionell</option>
          <option value="friendly">Herzlich & Freundlich</option>
          <option value="concise">Kurz & Prägnant</option>
          <option value="creative">Kreativ & Bildhaft</option>
        </select>
      </div>

      {/* Grid: Original Input vs Corrected Output */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="flex flex-col">
          <textarea
            placeholder="Schreibe oder füge deinen Text hier ein, den die KI überarbeiten soll..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 custom-scrollbar resize-none text-[10px]"
          />
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/60 overflow-y-auto max-h-[180px] custom-scrollbar text-[10px] space-y-2.5 relative">
          {result ? (
            <>
              <div className="flex justify-between items-center border-b border-white/5 pb-1">
                <span className="text-emerald-400 font-bold font-mono text-[9px] uppercase">Optimierter Text:</span>
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 flex items-center space-x-0.5"
                  title="In die Zwischenablage kopieren"
                >
                  {copied ? <Check size={10} className="text-emerald-400" /> : <Clipboard size={10} />}
                  <span>{copied ? "Kopiert" : "Kopieren"}</span>
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{result.correctedText}</p>

              {result.improvements && result.improvements.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-slate-500 font-bold block mb-1 font-mono text-[9px]">Änderungen:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.improvements.map((imp, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-900/80 rounded border border-slate-800 text-slate-400 text-[9px] font-mono">
                        <span className="line-through text-rose-400/80 pr-1">{imp.original}</span>
                        <span>➔</span>
                        <span className="text-emerald-400 font-semibold pl-1">{imp.replacement}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-slate-500 font-bold block mb-1 font-mono text-[9px]">Stilistische Hinweise:</span>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-slate-400 leading-normal">
                    {result.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-[10px] p-4 text-center">
              <span>Keine Optimierung durchgeführt. Trage Text ein und drücke den Button unten.</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={!inputText.trim() || loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-950 text-slate-950 font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center space-x-1"
      >
        {loading ? (
          <>
            <RefreshCw size={12} className="animate-spin text-violet-300" />
            <span>Optimiere Grammatik & Stil...</span>
          </>
        ) : (
          <>
            <Sparkles size={12} />
            <span>Text mit KI korrigieren & veredeln</span>
          </>
        )}
      </button>
    </div>
  );
}
