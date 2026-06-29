import React, { useState } from "react";
import { NewsArticle } from "../types";
import { Sparkles, Scale, AlertCircle, RefreshCw, FileText } from "lucide-react";

interface NewsBiasWidgetProps {
  initialNews: NewsArticle[];
  onAddLog: (log: string) => void;
}

export default function NewsBiasWidget({ initialNews, onAddLog }: NewsBiasWidgetProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialNews);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [inputText, setInputText] = useState("");
  const [inputTitle, setInputTitle] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const currentArticle = articles[selectedIdx];

  const handleCustomAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setAnalyzing(true);

    try {
      const response = await fetch("/api/summarize-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: inputTitle.trim() || "Benutzerdefinierter Artikel",
          articleText: inputText.trim()
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const newArt: NewsArticle = {
        id: "art-" + Date.now(),
        title: inputTitle.trim() || "Benutzerdefinierter Artikel",
        url: "",
        text: inputText,
        summary: data.summary,
        biasAnalysis: data.biasAnalysis,
        mainstreamView: data.mainstreamView,
        alternativeView: data.alternativeView,
        credibilityScore: data.credibilityScore
      };

      setArticles((prev) => [newArt, ...prev]);
      setSelectedIdx(0);
      setInputText("");
      setInputTitle("");
      onAddLog(`Nachrichtenanalyse: "${newArt.title}" analysiert (Bias-Index: ${newArt.credibilityScore}%).`);
    } catch (err: any) {
      console.error(err);
      alert("Fehler bei der Nachrichtenanalyse: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Selector and Paste button */}
      <div className="flex gap-2 items-center border-b border-white/5 pb-2">
        <Scale className="text-amber-400 shrink-0" size={14} />
        <select
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(parseInt(e.target.value))}
          className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-1.5 py-0.5 text-[10px] flex-1 focus:outline-none"
        >
          {articles.map((art, idx) => (
            <option key={art.id} value={idx}>
              {art.title}
            </option>
          ))}
        </select>
      </div>

      {/* Article View Panel */}
      {currentArticle && (
        <div className="flex-1 space-y-2.5 max-h-[160px] overflow-y-auto custom-scrollbar p-2 bg-slate-950/60 rounded-lg border border-slate-900/60">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 font-semibold">Glaubwürdigkeits-Index:</span>
            <span className={`font-bold ${
              (currentArticle.credibilityScore || 80) > 75 ? "text-emerald-400" : "text-amber-400"
            }`}>
              {currentArticle.credibilityScore || 80}%
            </span>
          </div>

          {currentArticle.summary && (
            <div className="text-slate-300">
              <span className="text-slate-500 font-bold block text-[9px] font-mono uppercase">Zusammenfassung:</span>
              <p className="leading-relaxed">{currentArticle.summary}</p>
            </div>
          )}

          {currentArticle.biasAnalysis && (
            <div className="text-slate-300">
              <span className="text-slate-500 font-bold block text-[9px] font-mono uppercase">Bias & Tendenz:</span>
              <p className="leading-relaxed italic text-amber-300/90">{currentArticle.biasAnalysis}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-[10px]">
              <span className="text-sky-400 font-bold block mb-0.5 font-mono">Mainstream Sicht:</span>
              <p className="text-slate-400 leading-normal">{currentArticle.mainstreamView || "Lade Mainstream-Narrativ..."}</p>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80 text-[10px]">
              <span className="text-emerald-400 font-bold block mb-0.5 font-mono">Alternative Sicht:</span>
              <p className="text-slate-400 leading-normal">{currentArticle.alternativeView || "Lade alternative Perspektiven..."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Paste Form */}
      <form onSubmit={handleCustomAnalyze} className="space-y-2 pt-1 border-t border-white/5 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-mono flex items-center space-x-1">
            <FileText size={10} />
            <span>Neuen Artikel analysieren:</span>
          </span>
        </div>
        <div className="space-y-1.5">
          <input
            type="text"
            placeholder="Artikel-Titel..."
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
          />
          <textarea
            placeholder="Kopiere den Text eines Artikels aus Mainstream oder alternativen Medien hierhin..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={2}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 custom-scrollbar resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={!inputText.trim() || analyzing}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-950 text-slate-950 font-bold py-1 rounded transition-colors flex items-center justify-center space-x-1"
        >
          {analyzing ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>Vergleiche Medien-Quellen...</span>
            </>
          ) : (
            <>
              <Sparkles size={12} />
              <span>Nachricht auf Tendenzen & Bias analysieren</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
