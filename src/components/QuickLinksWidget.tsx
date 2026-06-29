import React, { useState } from "react";
import { QuickLink } from "../types";
import { Sparkles, Brain, Bot, Code, Languages, ExternalLink, Plus, Trash2 } from "lucide-react";

interface QuickLinksWidgetProps {
  links: QuickLink[];
  onAddLink: (link: QuickLink) => void;
  onDeleteLink: (id: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles size={12} />,
  Brain: <Brain size={12} />,
  Bot: <Bot size={12} />,
  Code: <Code size={12} />,
  Languages: <Languages size={12} />
};

export default function QuickLinksWidget({ links, onAddLink, onDeleteLink }: QuickLinksWidgetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Bot");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    const newLink: QuickLink = {
      id: "ql-" + Date.now(),
      title: newTitle.trim(),
      url,
      icon: selectedIcon,
      color: "text-violet-400 bg-violet-950/40 border-violet-900/50"
    };

    onAddLink(newLink);
    setNewTitle("");
    setNewUrl("");
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* List Header */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-mono">Öffne deine Lieblings-KI oder KI-Agenten direkt:</span>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-violet-400 hover:text-white text-[10px] font-mono flex items-center space-x-0.5"
        >
          <Plus size={10} />
          <span>Hinzufügen</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg space-y-2 text-[10px]">
          <div className="flex gap-1.5">
            <div className="flex-1">
              <span className="text-slate-500 block mb-0.5">Name:</span>
              <input
                type="text"
                placeholder="Perplexity"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Icon:</span>
              <select
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-200"
              >
                <option value="Sparkles">Sparkles</option>
                <option value="Brain">Brain</option>
                <option value="Bot">Bot</option>
                <option value="Code">Code</option>
                <option value="Languages">Languages</option>
              </select>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">URL:</span>
            <input
              type="text"
              placeholder="perplexity.ai"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-500 text-slate-950 font-bold px-2.5 py-0.5 rounded"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* Grid of Quick Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {links.map((link) => (
          <div
            key={link.id}
            className={`group flex items-center justify-between p-2 rounded-lg border transition-all hover:scale-[1.02] ${link.color || "text-slate-200 bg-slate-900 border-slate-800"}`}
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 min-w-0 flex-1 hover:underline"
            >
              <span className="shrink-0">{ICON_MAP[link.icon] || <Bot size={12} />}</span>
              <span className="font-semibold text-[11px] truncate">{link.title}</span>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
            </a>

            {/* Custom Link Deletion */}
            {links.length > 3 && (
              <button
                onClick={() => onDeleteLink(link.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-0.5 rounded transition-opacity shrink-0 ml-1"
                title="Link löschen"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
