import React, { useState } from "react";
import { Email } from "../types";
import { Mail, RefreshCw, Sparkles, Check, Trash2, Tag, AlertTriangle } from "lucide-react";

interface EmailInboxWidgetProps {
  initialEmails: Email[];
  onAddLog: (log: string) => void;
}

export default function EmailInboxWidget({ initialEmails, onAddLog }: EmailInboxWidgetProps) {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [newSender, setNewSender] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("All");

  const currentEmail = emails[selectedIdx];

  const handleCustomEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBody.trim()) return;
    setAnalyzing(true);

    try {
      const res = await fetch("/api/categorize-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: newSender.trim() || "unbekannt@absender.de",
          subject: newSubject.trim() || "Kein Betreff",
          body: newBody.trim()
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newMail: Email = {
        id: "mail-" + Date.now(),
        sender: newSender.trim() || "unbekannt@absender.de",
        subject: newSubject.trim() || "Kein Betreff",
        body: newBody,
        summary: data.summary,
        category: data.category || "Allgemein",
        priority: data.priority || "medium",
        actionItems: data.actionItems || [],
        sentiment: data.sentiment || "Neutral",
        receivedAt: new Date().toISOString()
      };

      setEmails((prev) => [newMail, ...prev]);
      setSelectedIdx(0);
      setNewSender("");
      setNewSubject("");
      setNewBody("");
      onAddLog(`KI-E-Mail: Neue Mail analysiert. Kategorie: "${newMail.category}"`);
    } catch (err: any) {
      console.error(err);
      alert("Fehler bei der E-Mail-Analyse: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredEmails = emails.filter((mail) => {
    if (activeTab === "All") return true;
    return mail.category === activeTab;
  });

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Category Folders */}
      <div className="flex space-x-1 overflow-x-auto pb-1.5 border-b border-white/5 shrink-0 custom-scrollbar text-[10px] font-mono">
        {["All", "Wichtig", "Arbeit", "Newsletter", "Spam"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-2 py-0.5 rounded-md transition-colors shrink-0 ${
              activeTab === cat
                ? "bg-blue-600 text-slate-950 font-bold"
                : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid: Email List + Active Email Panel */}
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
        {/* List column */}
        <div className="space-y-1.5 overflow-y-auto max-h-[160px] custom-scrollbar">
          {filteredEmails.length === 0 ? (
            <div className="text-center text-slate-600 py-6 font-mono text-[10px]">Postfach leer.</div>
          ) : (
            filteredEmails.map((mail, idx) => {
              const realIndex = emails.findIndex((m) => m.id === mail.id);
              const isSelected = selectedIdx === realIndex;
              return (
                <button
                  key={mail.id}
                  onClick={() => setSelectedIdx(realIndex)}
                  className={`w-full text-left p-2 rounded border transition-all ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-800"
                      : "bg-slate-900/60 border-slate-900 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate pr-1">{mail.sender.split("@")[0]}</span>
                    {mail.priority === "high" && <AlertTriangle size={10} className="text-rose-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate font-semibold mt-0.5">{mail.subject}</div>
                  <div className="flex justify-between items-center text-[8px] font-mono mt-1 text-slate-500">
                    <span className="px-1 bg-slate-950 rounded border border-slate-900 text-slate-400">{mail.category}</span>
                    <span>{new Date(mail.receivedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Email Detail column */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/60 overflow-y-auto max-h-[160px] custom-scrollbar text-[10px] space-y-2.5">
          {currentEmail ? (
            <>
              <div className="border-b border-white/5 pb-1 text-[9px] font-mono text-slate-500">
                <div>Von: <span className="text-slate-300">{currentEmail.sender}</span></div>
                <div>Thema: <span className="text-slate-300 font-semibold">{currentEmail.subject}</span></div>
              </div>

              {currentEmail.summary && (
                <div className="bg-blue-950/10 border border-blue-900/30 p-2 rounded">
                  <span className="text-blue-400 font-bold block mb-0.5 font-mono text-[9px] flex items-center space-x-1">
                    <Sparkles size={10} />
                    <span>KI-Zusammenfassung:</span>
                  </span>
                  <p className="text-slate-300 leading-normal italic">{currentEmail.summary}</p>
                </div>
              )}

              {currentEmail.actionItems && currentEmail.actionItems.length > 0 && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1 font-mono text-[9px]">Vorgeschlagene To-Dos:</span>
                  <ul className="space-y-1 pl-2">
                    {currentEmail.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-1.5 text-slate-400 leading-tight">
                        <Check size={8} className="text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentEmail.sentiment && (
                <div className="text-[9px] font-mono text-slate-500 flex items-center space-x-1">
                  <span>Sentiment:</span>
                  <span className="text-emerald-400/80 px-1.5 py-0.2 bg-slate-900 rounded border border-slate-800">{currentEmail.sentiment}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-600 italic py-8 font-mono">Keine E-Mail ausgewählt.</div>
          )}
        </div>
      </div>

      {/* Paste Email Form */}
      <form onSubmit={handleCustomEmailSubmit} className="space-y-1.5 pt-2 border-t border-white/5 text-[10px]">
        <span className="text-slate-400 font-mono block">E-Mail kopieren & analysieren lassen:</span>
        <div className="grid grid-cols-2 gap-1.5">
          <input
            type="text"
            placeholder="Absender..."
            value={newSender}
            onChange={(e) => setNewSender(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Betreff..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
          />
        </div>
        <textarea
          placeholder="Füge hier den E-Mail-Inhalt ein..."
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          rows={1.5}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar resize-none"
        />
        <button
          type="submit"
          disabled={!newBody.trim() || analyzing}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-950 text-slate-950 font-bold py-1 rounded transition-colors flex items-center justify-center space-x-1"
        >
          {analyzing ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span>Verarbeite mit KI...</span>
            </>
          ) : (
            <>
              <Sparkles size={12} />
              <span>E-Mail intelligent kategorisieren & zusammenfassen</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
