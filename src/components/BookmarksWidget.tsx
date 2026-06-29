import React, { useState } from "react";
import { Bookmark } from "../types";
import { Plus, Search, ExternalLink, Trash2, FolderOpen, Upload, Info } from "lucide-react";

interface BookmarksWidgetProps {
  bookmarks: Bookmark[];
  onAddBookmark: (b: Bookmark) => void;
  onAddBookmarks?: (bms: Bookmark[]) => void;
  onDeleteBookmark: (id: string) => void;
}

export default function BookmarksWidget({ bookmarks, onAddBookmark, onAddBookmarks, onDeleteBookmark }: BookmarksWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Allgemein");

  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let url = newUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    const newB: Bookmark = {
      id: "bm-" + Date.now(),
      title: newTitle.trim(),
      url,
      category: newCategory.trim()
    };

    onAddBookmark(newB);
    setNewTitle("");
    setNewUrl("");
    setShowAddForm(false);
  };

  const handleChromeImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setImportError("Datei konnte nicht gelesen werden.");
          return;
        }

        const lines = text.split(/\r?\n/);
        const importedBms: Bookmark[] = [];
        let currentCategory = "Importiert";

        const h3Regex = /<H3[^>]*>(.*?)<\/H3>/i;
        const aRegex = /<A\s+HREF="([^"]+)"[^>]*>(.*?)<\/A>/i;

        lines.forEach((line) => {
          const h3Match = line.match(h3Regex);
          if (h3Match) {
            currentCategory = h3Match[1].trim() || "Importiert";
          }

          const aMatch = line.match(aRegex);
          if (aMatch) {
            const url = aMatch[1];
            // Strip HTML tags from anchor text
            const title = aMatch[2].replace(/<\/?[^>]+(>|$)/g, "").trim() || url;
            importedBms.push({
              id: "bm-chrome-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
              title,
              url,
              category: currentCategory
            });
          }
        });

        if (importedBms.length === 0) {
          setImportError("Keine gültigen Lesezeichen in dieser Datei gefunden.");
          return;
        }

        if (onAddBookmarks) {
          onAddBookmarks(importedBms);
        } else {
          // Fallback if bulk callback is not provided
          importedBms.forEach((b) => onAddBookmark(b));
        }

        setImportSuccess(`${importedBms.length} Lesezeichen erfolgreich importiert!`);
        setTimeout(() => {
          setShowImport(false);
          setImportSuccess("");
        }, 3000);
      } catch (err) {
        setImportError("Fehler beim Verarbeiten der Lesezeichendatei.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Search Bar & Add Button */}
      <div className="flex items-center space-x-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1.5 text-slate-500" size={12} />
          <input
            type="text"
            placeholder="Lesezeichen suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg pl-8 pr-2 py-1 text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
        <button
          onClick={() => {
            setShowImport(!showImport);
            setShowAddForm(false);
          }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0 font-bold border ${
            showImport
              ? "bg-amber-600 border-amber-500 text-slate-950"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/5"
          }`}
          title="Google Chrome Lesezeichen importieren"
        >
          <Upload size={14} />
        </button>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowImport(false);
          }}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0 font-bold border ${
            showAddForm
              ? "bg-amber-600 border-amber-500 text-slate-950"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/5"
          }`}
          title="Lesezeichen hinzufügen"
        >
          <Plus size={14} />
        </button>
      </div>

      {showImport && (
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg space-y-2 text-[10px] animate-fadeIn">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <Upload size={12} />
            <span>Chrome-Lesezeichen (.html) importieren</span>
          </div>
          
          <p className="text-slate-400 leading-normal">
            Exportiere deine Lesezeichen aus Google Chrome als HTML-Datei und lade sie hier hoch, um deine Ordnerstruktur und Lesezeichen vollständig zu übertragen.
          </p>

          <div className="border border-dashed border-slate-850 hover:border-amber-500/50 rounded-lg p-3 text-center cursor-pointer transition-colors relative bg-black/20">
            <input
              type="file"
              accept=".html"
              onChange={handleChromeImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload size={18} className="mx-auto text-slate-500 mb-1" />
            <span className="text-slate-300 block font-semibold">Bookmarks-Datei auswählen</span>
            <span className="text-[8px] text-slate-500 block mt-0.5">Unterstützt Chrome-HTML-Export</span>
          </div>

          <div className="flex items-start space-x-1 bg-slate-900/60 p-1.5 rounded border border-slate-850 text-[8px] text-slate-400 leading-normal">
            <Info size={10} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Anleitung:</strong> In Chrome <strong>Strg + Umschalt + O</strong> drücken, oben rechts auf das Drei-Punkte-Menü klicken und <strong>Lesezeichen exportieren</strong> wählen.
            </span>
          </div>

          {importError && (
            <div className="text-rose-400 font-mono text-[9px] bg-rose-950/20 border border-rose-900/30 p-1.5 rounded text-center">
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="text-emerald-400 font-mono text-[9px] bg-emerald-950/20 border border-emerald-900/30 p-1.5 rounded text-center">
              {importSuccess}
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-lg space-y-2 text-[10px]">
          <div>
            <span className="text-slate-500 block mb-0.5">Titel:</span>
            <input
              type="text"
              placeholder="Google Scholar"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">URL:</span>
            <input
              type="text"
              placeholder="scholar.google.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Ordner / Kategorie:</span>
            <input
              type="text"
              placeholder="Lernen, News, Freizeit"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded"
            >
              Hinzufügen
            </button>
          </div>
        </form>
      )}

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[220px] custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-600 py-4 font-mono text-[10px]">Keine Lesezeichen gefunden.</div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-2 rounded bg-slate-950/40 hover:bg-slate-950 border border-slate-900/60 text-slate-300"
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <FolderOpen size={12} className="text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-200 hover:text-amber-400 flex items-center space-x-1 text-[11px] leading-tight"
                  >
                    <span className="truncate">{b.title}</span>
                    <ExternalLink size={10} className="shrink-0 opacity-50" />
                  </a>
                  <div className="text-[9px] font-mono text-slate-500 mt-0.5 flex items-center space-x-1">
                    <span className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800 text-slate-400">{b.category}</span>
                    <span className="truncate max-w-[120px] text-slate-600">{b.url.replace(/^https?:\/\//i, "")}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteBookmark(b.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors shrink-0 ml-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
