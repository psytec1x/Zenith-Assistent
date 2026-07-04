import React, { useState } from "react";
import { 
  Settings, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  Palette, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GripVertical
} from "lucide-react";
import { DashboardWidget } from "../types";
import { motion } from "motion/react";

interface WidgetWrapperProps {
  widget: DashboardWidget;
  onUpdate: (updated: DashboardWidget) => void;
  onDelete: () => void;
  children?: any;
  key?: any;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  isMobile?: boolean;
}

const COLOR_MAP: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  slate: {
    bg: "bg-dark-panel hover:bg-[#15181e] border-white/5 hover:border-gold/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-white/5",
    accent: "bg-white/5 text-gold",
    text: "text-slate-300"
  },
  blue: {
    bg: "bg-dark-panel border-blue-900/20 hover:border-blue-900/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-blue-900/20",
    accent: "bg-blue-950/40 text-blue-300",
    text: "text-slate-300"
  },
  emerald: {
    bg: "bg-dark-panel border-emerald-900/20 hover:border-emerald-900/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-emerald-900/20",
    accent: "bg-emerald-950/40 text-emerald-300",
    text: "text-slate-300"
  },
  amber: {
    bg: "bg-dark-panel border-gold/20 hover:border-gold/50 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-gold/20",
    accent: "bg-gold/10 text-gold",
    text: "text-gold"
  },
  rose: {
    bg: "bg-dark-panel border-rose-900/20 hover:border-rose-900/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-rose-900/20",
    accent: "bg-rose-950/40 text-rose-300",
    text: "text-slate-300"
  },
  violet: {
    bg: "bg-dark-panel border-violet-900/20 hover:border-violet-900/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-violet-900/20",
    accent: "bg-violet-950/40 text-violet-300",
    text: "text-slate-300"
  },
  teal: {
    bg: "bg-dark-panel border-teal-900/20 hover:border-teal-900/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]",
    border: "border-teal-900/20",
    accent: "bg-teal-950/40 text-teal-300",
    text: "text-slate-300"
  }
};

export default function WidgetWrapper({ 
  widget, 
  onUpdate, 
  onDelete, 
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging = false,
  isDragOver = false,
  isMobile = false
}: WidgetWrapperProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const colorScheme = COLOR_MAP[widget.color] || COLOR_MAP.slate;

  const handleWidthChange = (direction: "inc" | "dec") => {
    let currentWidth = widget.w;
    if (direction === "inc" && currentWidth < 4) {
      onUpdate({ ...widget, w: currentWidth + 1 });
    } else if (direction === "dec" && currentWidth > 1) {
      onUpdate({ ...widget, w: currentWidth - 1 });
    }
  };

  const handleHeightChange = (direction: "inc" | "dec") => {
    let currentHeight = widget.h;
    if (direction === "inc" && currentHeight < 3) {
      onUpdate({ ...widget, h: currentHeight + 1 });
    } else if (direction === "dec" && currentHeight > 1) {
      onUpdate({ ...widget, h: currentHeight - 1 });
    }
  };

  const handleColorChange = (color: string) => {
    onUpdate({ ...widget, color });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const element = document.getElementById(`widget-${widget.id}`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = widget.w;
    const startH = widget.h;

    // Use current physical dimensions divided by current logical dimensions
    const colWidth = rect.width / startW;
    const rowHeight = rect.height / startH;

    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Calculate new logical dimensions, clamped to limits
      const nextW = Math.max(1, Math.min(4, Math.round((rect.width + dx) / colWidth)));
      const nextH = Math.max(1, Math.min(3, Math.round((rect.height + dy) / rowHeight)));

      if (nextW !== widget.w || nextH !== widget.h) {
        onUpdate({ ...widget, w: nextW, h: nextH });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <motion.div
      layout
      id={`widget-${widget.id}`}
      onDragOver={(e) => onDragOver?.(e, widget.id)}
      onDrop={(e) => onDrop?.(e, widget.id)}
      className={`rounded-xl border p-5 backdrop-blur-md flex flex-col relative transition-all duration-300 ${colorScheme.bg} ${
        isResizing ? "ring-2 ring-gold border-gold/40 shadow-[0_0_25px_rgba(197,160,89,0.35)] z-30 scale-[1.01]" : ""
      } ${isDragging ? "opacity-30 border-dashed border-gold/40 scale-95 pointer-events-none" : ""} ${
        isDragOver ? "ring-2 ring-gold/60 border-gold/60 bg-gold/5 scale-[1.02]" : ""
      }`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        gridColumn: isMobile ? "span 1 / span 1" : `span ${widget.w} / span ${widget.w}`,
        minHeight: widget.collapsed ? "56px" : widget.h === 1 ? "180px" : widget.h === 2 ? "380px" : "560px",
        height: widget.collapsed ? "56px" : "auto"
      }}
    >
      {/* Widget Header */}
      <div className={`flex items-center justify-between pb-1.5 ${widget.collapsed ? "" : "mb-4 border-b border-white/5"}`}>
        <div className="flex items-center flex-1 min-w-0 mr-2">
          <div
            draggable
            onDragStart={(e) => onDragStart?.(e, widget.id)}
            onDragEnd={onDragEnd}
            className="text-slate-500 hover:text-gold cursor-grab active:cursor-grabbing p-1 -ml-1 mr-1.5 transition-colors shrink-0"
            title="Widget verschieben (Ziehen)"
          >
            <GripVertical size={14} />
          </div>
          <input
            type="text"
            value={widget.title}
            onChange={(e) => onUpdate({ ...widget, title: e.target.value })}
            className="bg-transparent font-serif text-sm text-white tracking-wide focus:outline-none focus:ring-1 focus:ring-gold/30 rounded px-1 w-full"
          />
        </div>
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={() => onUpdate({ ...widget, collapsed: !widget.collapsed })}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            title={widget.collapsed ? "Aufklappen" : "Einklappen"}
          >
            {widget.collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            title="Widget anpassen"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-rose-400/80 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
            title="Löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Configuration Popover */}
      {showConfig && (
        <div className="absolute top-12 right-4 z-50 bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-xl w-64 text-xs space-y-3">
          <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1.5 flex justify-between items-center">
            <span>Widget Einstellungen</span>
            <button onClick={() => setShowConfig(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>

          {/* Width adjustment */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Breite (Spalten):</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={widget.w <= 1}
                onClick={() => handleWidthChange("dec")}
                className="p-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="font-bold font-mono text-emerald-400">{widget.w} / 4</span>
              <button
                disabled={widget.w >= 4}
                onClick={() => handleWidthChange("inc")}
                className="p-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Height adjustment */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-mono">Höhe (Zellen):</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={widget.h <= 1}
                onClick={() => handleHeightChange("dec")}
                className="p-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="font-bold font-mono text-emerald-400">{widget.h} / 3</span>
              <button
                disabled={widget.h >= 3}
                onClick={() => handleHeightChange("inc")}
                className="p-1 bg-slate-900 border border-slate-800 rounded text-slate-300 disabled:opacity-40"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Color Presets (Notion Style) */}
          <div className="space-y-1">
            <span className="text-slate-400 font-mono block">Design-Farbe:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(COLOR_MAP).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    color === "slate" ? "bg-slate-800 border-slate-600" :
                    color === "blue" ? "bg-blue-600 border-blue-400" :
                    color === "emerald" ? "bg-emerald-600 border-emerald-400" :
                    color === "amber" ? "bg-amber-600 border-amber-400" :
                    color === "rose" ? "bg-rose-600 border-rose-400" :
                    color === "violet" ? "bg-violet-600 border-violet-400" :
                    "bg-teal-600 border-teal-400"
                  } ${widget.color === color ? "scale-125 ring-2 ring-white/40" : "hover:scale-110"}`}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Widget Content */}
      {!widget.collapsed && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      )}

      {/* Resizing Handle */}
      {!widget.collapsed && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 group/handle z-20"
          title="Größe durch Ziehen mit der Maus anpassen"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`text-slate-500/60 group-hover/handle:text-gold transition-colors ${
              isResizing ? "text-gold" : ""
            }`}
          >
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="4" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="8" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
