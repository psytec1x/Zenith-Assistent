import React, { useState } from "react";
import { Task } from "../types";
import { Plus, Check, Trash2, Calendar, AlertTriangle, Sparkles, Mic } from "lucide-react";

interface TodoWidgetProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export default function TodoWidget({ tasks, onAddTask, onToggleTask, onDeleteTask }: TodoWidgetProps) {
  const [inputText, setInputText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Web Speech for voice command
  let recognition: any = null;
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.lang = "de-DE";
  }

  const handleSpeechInput = () => {
    if (!recognition) {
      alert("Spracherkennung wird in diesem Browser nicht unterstützt.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Automatically trigger NLP parse on speech result
        parseAndAddTask(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  };

  const parseAndAddTask = async (textToParse: string) => {
    const trimmed = textToParse.trim();
    if (!trimmed) return;
    setParsing(true);

    try {
      const res = await fetch("/api/parse-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newTask: Task = {
        id: "task-" + Date.now(),
        title: data.title || trimmed,
        date: data.date || new Date().toISOString().split("T")[0],
        time: data.time || "12:00",
        priority: data.priority || "medium",
        category: data.category || "Persönlich",
        completed: false,
        notes: data.notes || ""
      };

      onAddTask(newTask);
      setInputText("");
    } catch (err) {
      console.error("NLP Task parsing failed, falling back to simple local parser", err);
      // fallback
      const newTask: Task = {
        id: "task-" + Date.now(),
        title: trimmed,
        date: new Date().toISOString().split("T")[0],
        time: "12:00",
        priority: "medium",
        category: "Allgemein",
        completed: false
      };
      onAddTask(newTask);
      setInputText("");
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parseAndAddTask(inputText);
  };

  return (
    <div className="flex flex-col h-full text-xs font-sans space-y-3">
      {/* Search/Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-1.5">
        <button
          type="button"
          onClick={handleSpeechInput}
          className={`p-2 rounded-lg border transition-all ${
            isListening
              ? "bg-rose-950/40 border-rose-700 text-rose-400 animate-pulse"
              : "bg-black/40 border-white/5 text-gray-400 hover:text-white"
          }`}
          title="Gesprochene Aufgabe aufnehmen"
        >
          <Mic size={14} />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="z.B. Meeting mit Max morgen um 14 Uhr dringend..."
          className="flex-1 bg-black/40 border border-white/5 focus:border-gold/30 rounded-lg px-3 py-1.5 text-slate-200 placeholder-gray-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || parsing}
          className="p-2 bg-gold hover:bg-[#b08e4d] disabled:bg-gold/20 text-black rounded-lg disabled:text-[#8B7344] transition-colors flex items-center justify-center shrink-0 font-semibold"
        >
          {parsing ? <Sparkles size={14} className="animate-spin text-black" /> : <Plus size={14} />}
        </button>
      </form>

      {/* NLP Helper Tag */}
      <div className="text-[10px] text-gray-500 flex items-center space-x-1 font-mono">
        <Sparkles size={10} className="text-gold" />
        <span>Tipp: Schreibe frei in Alltagssprache. Die KI versteht Tag, Uhrzeit & Wichtigkeit!</span>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] p-1.5 bg-black/30 rounded-lg custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-600 py-6 font-mono">Keine Aufgaben für heute.</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                task.completed
                  ? "bg-black/20 border-white/5 text-slate-600 line-through"
                  : "bg-dark-panel border border-white/5 hover:border-gold/20 text-slate-200"
              }`}
            >
              <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    task.completed
                      ? "bg-gold border-gold text-black"
                      : "border-white/10 hover:border-gold/50"
                  }`}
                >
                  {task.completed && <Check size={12} strokeWidth={3} />}
                </button>

                <div className="min-w-0">
                  <div className="font-semibold text-xs leading-snug truncate">{task.title}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] font-mono items-center text-slate-500">
                    <span className="flex items-center space-x-0.5">
                      <Calendar size={10} className="text-gold/60" />
                      <span>{task.date} um {task.time}</span>
                    </span>
                    <span className="px-1.5 py-0.2 bg-white/5 rounded-md border border-white/10 text-slate-400">
                      {task.category}
                    </span>
                    {task.priority === "high" && (
                      <span className="flex items-center space-x-0.5 text-rose-400 bg-rose-950/20 border border-rose-900/30 px-1 rounded-md">
                        <AlertTriangle size={8} />
                        <span>Dringend</span>
                      </span>
                    )}
                  </div>
                  {task.notes && (
                    <div className="text-[10px] text-slate-400/80 mt-1 italic leading-relaxed whitespace-pre-wrap font-sans">
                      {task.notes}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors shrink-0"
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
