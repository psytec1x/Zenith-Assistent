import React, { useState } from "react";
import { ContentBlock } from "../types";
import { Plus, Play, Code, Eye, FileText, Image, Video, Layers, Trash2 } from "lucide-react";

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onUpdateBlocks: (updated: ContentBlock[]) => void;
}

export default function ContentBlockEditor({ blocks, onUpdateBlocks }: ContentBlockEditorProps) {
  const [showBlockTypes, setShowBlockTypes] = useState(false);

  const handleAddBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: "cb-" + Date.now(),
      type,
      value: 
        type === "text" ? "Schreibe deine Notizen hier..." :
        type === "code" ? "def hello():\n    print('Hello World!')" :
        type === "html" ? "<div class='p-4 bg-indigo-950/40 rounded border border-indigo-800 text-center font-bold text-indigo-400'>Ausführbares HTML</div>" :
        type === "image" ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop" :
        "",
      language: type === "code" ? "python" : undefined,
      title: type === "html" ? "Interaktives Widget" : type === "code" ? "Python-Skript" : undefined,
      isExecuted: type === "html" ? true : undefined
    };

    onUpdateBlocks([...blocks, newBlock]);
    setShowBlockTypes(false);
  };

  const handleUpdateBlockValue = (id: string, value: string) => {
    onUpdateBlocks(blocks.map((b) => b.id === id ? { ...b, value } : b));
  };

  const handleUpdateBlockMeta = (id: string, fields: Partial<ContentBlock>) => {
    onUpdateBlocks(blocks.map((b) => b.id === id ? { ...b, ...fields } : b));
  };

  const handleDeleteBlock = (id: string) => {
    onUpdateBlocks(blocks.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="space-y-3">
        {blocks.map((block) => (
          <div key={block.id} className="group/block relative bg-slate-900/40 border border-slate-900/60 p-3 rounded-xl hover:border-slate-800 transition-all">
            
            {/* Block Action Header */}
            <div className="flex justify-between items-center mb-2 text-[10px] text-slate-500 font-mono opacity-0 group-hover/block:opacity-100 transition-opacity">
              <span className="flex items-center space-x-1 uppercase font-semibold">
                {block.type === "text" && <FileText size={10} />}
                {block.type === "code" && <Code size={10} />}
                {block.type === "html" && <Layers size={10} />}
                {block.type === "image" && <Image size={10} />}
                <span>{block.type} Block</span>
              </span>

              <button
                onClick={() => handleDeleteBlock(block.id)}
                className="text-rose-400 hover:bg-rose-500/15 p-1 rounded shrink-0 transition-colors"
                title="Block löschen"
              >
                <Trash2 size={11} />
              </button>
            </div>

            {/* Block Input Area */}
            {block.type === "text" && (
              <textarea
                value={block.value}
                onChange={(e) => handleUpdateBlockValue(block.id, e.target.value)}
                rows={2}
                className="w-full bg-transparent border-0 text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 resize-none text-xs leading-relaxed"
                placeholder="Schreibe Notizen, To-Dos oder Anmerkungen..."
              />
            )}

            {block.type === "code" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={block.title || ""}
                    placeholder="Dateiname / Titel..."
                    onChange={(e) => handleUpdateBlockMeta(block.id, { title: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono rounded px-1.5 py-0.5 focus:outline-none"
                  />
                  <select
                    value={block.language || "javascript"}
                    onChange={(e) => handleUpdateBlockMeta(block.id, { language: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono rounded px-1.5 py-0.5"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>
                <textarea
                  value={block.value}
                  onChange={(e) => handleUpdateBlockValue(block.id, e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 custom-scrollbar"
                />
              </div>
            )}

            {block.type === "html" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <input
                    type="text"
                    value={block.title || ""}
                    placeholder="Widget Name..."
                    onChange={(e) => handleUpdateBlockMeta(block.id, { title: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-slate-400 rounded px-1.5 py-0.5 focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdateBlockMeta(block.id, { isExecuted: !block.isExecuted })}
                    className={`px-2 py-0.5 rounded border flex items-center space-x-1 ${
                      block.isExecuted ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    {block.isExecuted ? <Eye size={10} /> : <Play size={10} />}
                    <span>{block.isExecuted ? "Vorschau Aktiv" : "Ausführen"}</span>
                  </button>
                </div>

                <textarea
                  value={block.value}
                  onChange={(e) => handleUpdateBlockValue(block.id, e.target.value)}
                  rows={4}
                  placeholder="<h2>Füge HTML Code ein...</h2>"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 focus:outline-none"
                />

                {/* Secure Executing Sandboxed Code Viewport */}
                {block.isExecuted && (
                  <div className="mt-2 p-3 bg-slate-950 rounded-lg border border-slate-850 overflow-hidden relative">
                    <iframe
                      srcDoc={`
                        <html>
                          <head>
                            <script src="https://cdn.tailwindcss.com"></script>
                            <style>
                              body { background: #0b0f19; color: #cbd5e1; font-family: monospace; padding: 10px; margin: 0; }
                            </style>
                          </head>
                          <body>
                            ${block.value}
                          </body>
                        </html>
                      `}
                      className="w-full min-h-[140px] border-0"
                      sandbox="allow-scripts"
                      title="Executed block iframe"
                    />
                  </div>
                )}
              </div>
            )}

            {block.type === "image" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.value}
                  onChange={(e) => handleUpdateBlockValue(block.id, e.target.value)}
                  placeholder="Füge eine Bild URL ein..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-300 focus:outline-none"
                />
                {block.value && (
                  <img
                    src={block.value}
                    alt="Custom block view"
                    className="max-h-[220px] rounded-lg object-cover w-full border border-slate-900"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop";
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Block Selector Trigger */}
      <div className="relative pt-2">
        <button
          onClick={() => setShowBlockTypes(!showBlockTypes)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-xs font-semibold"
        >
          <Plus size={14} />
          <span>Inhalt / Element hinzufügen</span>
        </button>

        {showBlockTypes && (
          <div className="absolute top-10 left-0 z-50 bg-slate-950 border border-slate-800 rounded-lg p-2 shadow-xl flex gap-1.5 flex-wrap w-72">
            <button
              onClick={() => handleAddBlock("text")}
              className="px-2.5 py-1 hover:bg-white/5 rounded border border-slate-900 text-slate-300 text-[10px] font-mono flex items-center space-x-1"
            >
              <FileText size={10} className="text-sky-400" />
              <span>Text</span>
            </button>
            <button
              onClick={() => handleAddBlock("code")}
              className="px-2.5 py-1 hover:bg-white/5 rounded border border-slate-900 text-slate-300 text-[10px] font-mono flex items-center space-x-1"
            >
              <Code size={10} className="text-violet-400" />
              <span>Code Block</span>
            </button>
            <button
              onClick={() => handleAddBlock("html")}
              className="px-2.5 py-1 hover:bg-white/5 rounded border border-slate-900 text-slate-300 text-[10px] font-mono flex items-center space-x-1"
            >
              <Layers size={10} className="text-emerald-400" />
              <span>HTML (Live!)</span>
            </button>
            <button
              onClick={() => handleAddBlock("image")}
              className="px-2.5 py-1 hover:bg-white/5 rounded border border-slate-900 text-slate-300 text-[10px] font-mono flex items-center space-x-1"
            >
              <Image size={10} className="text-amber-400" />
              <span>Bild</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
